import { AppointmentResponseDTO } from '../mapper/appointment.mapper'
import { AppointmentDocument } from '../types/appointment.types'
import { CreateAppointmentDTO } from '../validator/appointment.schema'

export interface RazorpayOrder {
    id: string
    entity: string
    amount: number | string
    amount_paid: number | string
    amount_due: number | string
    currency: string
    receipt?: string
    status: string
    attempts: number
    created_at: number
}

export interface RazorpayAppointmentResponse {
    paymentMethod: 'razorpay'
    order: RazorpayOrder
    paymentId: string
}

export interface WalletAppointmentResponse {
    paymentMethod: 'wallet'
    paymentId: string
    appointmentId: string
    walletBalance: number
    appointmentConfirmed: true
}

export type CreateAppointmentResult = RazorpayAppointmentResponse | WalletAppointmentResponse

export interface IAppointmentService {
    createAppointment(dto: CreateAppointmentDTO & { patientId: string }): Promise<CreateAppointmentResult>

    getPatientAppointments(patientId: string): Promise<AppointmentResponseDTO[]>

    getDoctorAppointments(doctorId: string): Promise<AppointmentResponseDTO[]>

    cancelAppointment(
        id: string,
        reason: string,
    ): Promise<{ appointment: AppointmentDocument | null; refundAmount: number }>

    startConsultation(doctorId: string, patientId: string): Promise<void>
}
