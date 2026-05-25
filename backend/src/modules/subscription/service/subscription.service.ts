import crypto from 'crypto'
import { Types } from 'mongoose'
import Razorpay from 'razorpay'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAdminRepository } from '../../admin/interfaces/admin.repository.interface'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { ICaregiverRepository } from '../../caregiver/interfaces/caregiver.repository.interface'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { IPaymentRepository } from '../../payment/interfaces/payment.repository.interface'
import { IWalletService } from '../../wallet/interfaces/wallet.service.interface'
import { ISubscriptionRepository } from '../interfaces/subscription.repository.interface'
import { ISubscriptionService, VerifySubscriptionPaymentDTO } from '../interfaces/subscription.service.interface'
import { toSubscriptionDTO } from '../mapper/subscription.mapper'
import type { CreateSubscriptionResult, SubscriptionDTO, WalletSubscriptionResult } from '../types/subscription.types'
import { CreateSubscriptionDTO } from '../validator/subscription.schema'

@injectable()
export class SubscriptionService implements ISubscriptionService {
    private razorpay: Razorpay

    constructor(
        @inject(TOKENS.ISubscriptionRepository) private _subscriptionRepo: ISubscriptionRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.ICaregiverRepository) private _caregiverRepo: ICaregiverRepository,
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IPaymentRepository) private _paymentRepo: IPaymentRepository,
        @inject(TOKENS.IWalletService) private _walletService: IWalletService,
        @inject(TOKENS.IAdminRepository) private _adminRepo: IAdminRepository,
    ) {
        this.razorpay = new Razorpay({
            key_id: env.RAZORPAY_KEY_ID,
            key_secret: env.RAZORPAY_KEY_SECRET,
        })
    }

    async getMySubscription(userId: string): Promise<SubscriptionDTO | null> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) {
            return null
        }

        const subscription = await this._subscriptionRepo.findActiveByPatient(patient._id)

        if (!subscription) {
            return null
        }

        const caregiver = await this._caregiverRepo.findByUserId(
            new Types.ObjectId(subscription.caregiverId.toString()),
        )
        const caregiverUser = caregiver ? await this._userRepo.findById(caregiver.userId.toString()) : null

        return toSubscriptionDTO(subscription, caregiver ?? undefined, caregiverUser ?? undefined)
    }

    async createSubscription(
        userId: string,
        dto: CreateSubscriptionDTO,
    ): Promise<CreateSubscriptionResult | WalletSubscriptionResult> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        const existingSubscription = await this._subscriptionRepo.findActiveByPatient(patient._id)
        if (existingSubscription) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Patient already has an active subscription')
        }

        const caregiverId = dto.caregiverId || patient.caregiverId?.toString()
        if (!caregiverId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'No caregiver assigned to this patient')
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(caregiverId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver not found')
        }

        const platformSettings = await this._adminRepo.getPlatformSettings()
        const subscriptionFee = platformSettings?.subscriptionFee || 25000
        const billingCycle = dto.billingCycle || platformSettings?.billingCycle || 'monthly'

        const amount = billingCycle === 'monthly' ? subscriptionFee : subscriptionFee * 12

        const startDate = new Date()
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + (billingCycle === 'monthly' ? 1 : 12))

        const subscription = await this._subscriptionRepo.create({
            patientId: patient._id,
            caregiverId: new Types.ObjectId(caregiverId),
            subscriptionFee: amount,
            startDate,
            endDate,
            status: 'pending_payment',
            paymentStatus: 'pending',
            billingCycle,
        })

        if (dto.paymentMethod === 'wallet') {
            const wallet = await this._walletService.debit(patient._id.toString(), amount, 'Subscription payment')
            if (!wallet) {
                throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Insufficient wallet balance')
            }

            const payment = await this._paymentRepo.create({
                patientId: patient._id,
                caregiverId: new Types.ObjectId(caregiverId),
                subscriptionId: subscription._id,
                paymentType: 'subscription',
                paymentMethod: 'wallet',
                totalAmount: amount,
                status: 'success',
                paidAt: new Date(),
            })

            await this._subscriptionRepo.updateById(subscription._id.toString(), {
                status: 'active',
                paymentStatus: 'paid',
            })

            return {
                subscriptionId: subscription._id.toString(),
                paymentId: payment._id.toString(),
                walletBalance: wallet.balance,
                subscriptionConfirmed: true,
            }
        }

        const razorpayOrder = await this.razorpay.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: `sub_${subscription._id.toString()}`,
        })
        const razorpayOrderId = razorpayOrder.id

        const payment = await this._paymentRepo.create({
            patientId: patient._id,
            caregiverId: new Types.ObjectId(caregiverId),
            subscriptionId: subscription._id,
            paymentType: 'subscription',
            paymentMethod: 'razorpay',
            totalAmount: amount,
            razorpayOrderId,
            status: 'pending',
        })

        return {
            subscriptionId: subscription._id.toString(),
            paymentId: payment._id.toString(),
            orderId: razorpayOrderId,
            amount: amount * 100,
            currency: 'INR',
            keyId: env.RAZORPAY_KEY_ID,
        }
    }

    async verifySubscriptionPayment(dto: VerifySubscriptionPaymentDTO): Promise<SubscriptionDTO> {
        const secret = env.RAZORPAY_KEY_SECRET
        const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId

        const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex')

        if (expectedSignature !== dto.razorpaySignature) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid payment signature')
        }

        const payment = await this._paymentRepo.findByOrderId(dto.razorpayOrderId)
        if (!payment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Payment not found')
        }

        if (payment.status === 'success') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Payment already verified')
        }

        await this._paymentRepo.updateById(payment._id.toString(), {
            status: 'success',
            razorpayPaymentId: dto.razorpayPaymentId,
            razorpaySignature: dto.razorpaySignature,
            paidAt: new Date(),
        })

        await this._subscriptionRepo.updateById(payment.subscriptionId!.toString(), {
            status: 'active',
            paymentStatus: 'paid',
        })

        const subscription = await this._subscriptionRepo.findById(payment.subscriptionId!.toString())
        if (!subscription) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Subscription not found')
        }

        const caregiver = await this._caregiverRepo.findByUserId(
            new Types.ObjectId(subscription.caregiverId.toString()),
        )
        const caregiverUser = caregiver ? await this._userRepo.findById(caregiver.userId.toString()) : null

        return toSubscriptionDTO(subscription, caregiver ?? undefined, caregiverUser ?? undefined)
    }

    async cancelSubscription(subscriptionId: string): Promise<void> {
        await this._subscriptionRepo.updateById(subscriptionId, { status: 'cancelled' })
        const payment = await this._paymentRepo.findBySubscriptionId(subscriptionId)
        if (payment) {
            await this._paymentRepo.updateById(payment._id.toString(), { status: 'failed' })
        }
    }
}
