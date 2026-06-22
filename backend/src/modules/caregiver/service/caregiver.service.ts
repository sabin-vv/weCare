import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IActivityLogService } from '../../activityLog/interfaces/activityLog.service.interface'
import { IAlertService } from '../../alert/interfaces/alert.service.interface'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { ICaregiverActivityService } from '../../caregiverActivity/interfaces/caregiverActivity.service.interface'
import { IMedicationRepository } from '../../medication/interfaces/medication.repository.interface'
import { IMedicationLogRepository } from '../../medication/interfaces/medicationLog.repository.interface'
import { MedicationScheduleDTO } from '../../medication/types/medication.type'
import { INotificationService } from '../../notification/interfaces/notification.service.interface'
import { CreateNotificationPayload } from '../../notification/types/notification.types'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { SymptomLogModel } from '../../symptom/models/symptomLog.model'
import { IVitalRepository } from '../../vital/interfaces/vital.repository.interface'
import { VitalPlanItem, VitalScheduleDTO } from '../../vital/types/vital.types'
import { ICaregiverRepository, PatientSummary } from '../interfaces/caregiver.repository.interface'
import { ICaregiverService } from '../interfaces/caregiver.service.interface'
import {
    toCaregiverEntity,
    toCaregiverProfileEntity,
    toCaregiverProfileResponse,
    toCaregiverProfileResponseFromAggregation,
} from '../mapper/caregiver.mapper'
import { CaregiverProfileResponse, CaregiverVitalLogResponse, SymptomLogDTO } from '../types/caregiver.types'
import { CreateCaregiverProfileDTO } from '../validator/caregiver.schema'
import { LogMedicationDTO, LogSymptomDTO, LogVitalReadingDTO } from '../validator/caregiverLogging.schema'
import { UpdateCaregiverSettingsDTO } from '../validator/updateCaregiverSettings.schema'

@injectable()
export class CaregiverService implements ICaregiverService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.ICaregiverRepository) private _caregiverRepo: ICaregiverRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.IMedicationRepository) private _medicationRepo: IMedicationRepository,
        @inject(TOKENS.IMedicationLogRepository) private _medicationLogRepo: IMedicationLogRepository,
        @inject(TOKENS.IVitalRepository) private _vitalRepo: IVitalRepository,
        @inject(TOKENS.IAlertService) private _alertService: IAlertService,
        @inject(TOKENS.ICaregiverActivityService) private _activityService: ICaregiverActivityService,
        @inject(TOKENS.INotificationService) private _notificationService: INotificationService,
        @inject(TOKENS.IActivityLogService) private _activityLogService: IActivityLogService,
    ) {}

    async createProfile(userId: string, dto: CreateCaregiverProfileDTO): Promise<Partial<CaregiverProfileResponse>> {
        const existingCaregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (existingCaregiver) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Caregiver profile already exists')
        }

        const caregiverData = toCaregiverEntity(new Types.ObjectId(userId), dto, {})
        const caregiver = await this._caregiverRepo.create(caregiverData)
        await this._userRepo.update(userId, { isProfileComplete: true })

        const user = await this._userRepo.findById(userId)
        const admins = await this._userRepo.findAll({ role: 'admin' })

        for (const admin of admins) {
            const payload: CreateNotificationPayload = {
                recipientId: admin._id.toString(),
                recipientRole: 'admin',
                type: 'caregiver_verification_request',
                title: 'New Caregiver Verification Request',
                message: `Caregiver ${user?.name ?? 'Unknown'} has submitted their profile for verification.`,
                metadata: { caregiverId: userId },
            }
            await this._notificationService.createNotification(payload).catch(() => null)
        }

        await this._activityLogService.logActivity({
            performedBy: userId,
            performedByRole: 'caregiver',
            category: 'verification',
            action: 'caregiver_profile_created',
            targetId: userId,
            targetType: 'caregiver',
            description: `Profile created for ${user?.name}`,
        })

        return toCaregiverProfileEntity(caregiver)
    }

    async getProfile(userId: string): Promise<CaregiverProfileResponse> {
        const user = await this._userRepo.findById(userId)
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        return toCaregiverProfileResponse(user, caregiver)
    }

    async updateProfile(userId: string, dto: UpdateCaregiverSettingsDTO): Promise<CaregiverProfileResponse> {
        const existingCaregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!existingCaregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        await this._userRepo.update(userId, {
            name: dto.fullName,
            email: dto.email,
            mobile: dto.phoneNumber,
        })

        const caregiver = await this._caregiverRepo.updateByUserId(new Types.ObjectId(userId), {
            isActive: dto.isActive !== undefined ? dto.isActive : existingCaregiver.isActive,
            profileImage: dto.profileImage || existingCaregiver.profileImage,
        })
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        const updatedUser = await this._userRepo.findById(userId)
        if (!updatedUser) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        return toCaregiverProfileResponse(updatedUser, caregiver)
    }

    async listCaregivers(search?: string): Promise<CaregiverProfileResponse[]> {
        const caregivers = await this._caregiverRepo.findAllActive(search)

        return caregivers.map(toCaregiverProfileResponseFromAggregation)
    }

    async getPatientMedications(caregiverId: Types.ObjectId, patientId: string): Promise<MedicationScheduleDTO[]> {
        const caregiver = await this._caregiverRepo.findById(caregiverId.toString())

        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver not found')
        }

        const patient = await this._patientRepo.findById(patientId)

        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        if (patient.caregiverId?.toString() !== caregiver._id.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not assigned to this patient')
        }

        const schedules = await this._medicationRepo.findByPatientAndCaregiver(patient._id)

        return schedules.map((schedule) => ({
            _id: schedule._id.toString(),
            medicineName: schedule.medicineName,
            dosage: schedule.dosage,
            route: schedule.route,
            scheduleTime: schedule.scheduleTime.toISOString(),
            priority: schedule.priority,
            status: schedule.status,
            administeredAt: schedule.administeredAt?.toISOString(),
            administrationNotes: schedule.administrationNotes,
        }))
    }

    async getPatientVitalPlans(caregiverId: Types.ObjectId, patientId: string): Promise<VitalPlanItem[]> {
        const caregiver = await this._caregiverRepo.findById(caregiverId.toString())
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver not found')
        }

        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        if (patient.caregiverId?.toString() !== caregiver._id.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not assigned to this patient')
        }

        const plans = await this._vitalRepo.findVitalPlansByPatientIdAndStatus(patient._id.toString(), 'active')
        const items: VitalPlanItem[] = []
        for (const plan of plans) {
            items.push(...plan.vitals)
        }
        return items
    }

    async getPatientVitalSchedules(caregiverId: Types.ObjectId, patientId: string): Promise<VitalScheduleDTO[]> {
        const caregiver = await this._caregiverRepo.findById(caregiverId.toString())
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver not found')
        }

        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        if (patient.caregiverId?.toString() !== caregiver._id.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not assigned to this patient')
        }

        const schedules = await this._vitalRepo.findVitalSchedulesByPatientId(patient._id)

        return schedules.map((schedule) => ({
            _id: schedule._id.toString(),
            vitalType: schedule.vitalType,
            scheduleTime: schedule.scheduleTime.toISOString(),
            endDate: schedule.endDate.toISOString(),
            status: schedule.status,
            recordedValue: schedule.recordedValue,
            recordedAt: schedule.recordedAt?.toISOString(),
            recordedNotes: schedule.recordedNotes,
        }))
    }

    async getMyPatients(caregiverId: Types.ObjectId): Promise<PatientSummary[]> {
        return await this._caregiverRepo.findPatientsByCaregiver(caregiverId)
    }

    async logMedication(
        caregiverId: Types.ObjectId,
        patientId: string,
        scheduleId: string,
        dto: LogMedicationDTO,
    ): Promise<MedicationScheduleDTO> {
        const { caregiver, patient } = await this._getAssignedCaregiverAndPatient(caregiverId, patientId)
        const schedule = await this._medicationRepo.findScheduleById(scheduleId)

        if (!schedule || schedule.patientId.toString() !== patient._id.toString()) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Medication schedule not found')
        }

        if (schedule.caregiverId.toString() !== caregiver._id.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not assigned to this medication schedule')
        }

        const administeredAt = this._mergeTimeIntoDate(schedule.scheduleTime, dto.takenTime)
        const normalizedRoute = this._normalizeMedicationRoute(dto.route)
        const nextStatus = dto.status === 'skipped' ? 'skipped' : 'administered'

        const updated = await this._medicationRepo.updateSchedule(scheduleId, {
            route: normalizedRoute,
            status: nextStatus,
            administeredAt: nextStatus === 'administered' ? administeredAt : undefined,
            administeredBy: nextStatus === 'administered' ? caregiver.userId : undefined,
            skippedReason: nextStatus === 'skipped' ? dto.observations : undefined,
            missedReason: dto.status === 'taken_late' ? dto.observations : undefined,
            administrationNotes: dto.observations,
        })

        if (!updated) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to save medication log')
        }

        await this._medicationLogRepo.create({
            patientId: patient._id,
            caregiverId: caregiver.userId,
            scheduleId: schedule._id,
            status: dto.status,
            takenTime: administeredAt,
            route: normalizedRoute,
            observations: dto.observations ?? '',
        })

        const medActivityType = dto.status === 'skipped' ? 'medication_missed' : 'medication_administered'
        await this._activityService.logActivity({
            caregiverId: caregiver._id,
            patientId: patient._id,
            activityType: medActivityType,
            referenceId: schedule._id,
            description: `${schedule.medicineName} - ${schedule.dosage} `,
        })

        return this._toMedicationScheduleDTO(updated)
    }

    async logVitalReading(
        caregiverId: Types.ObjectId,
        patientId: string,
        dto: LogVitalReadingDTO,
    ): Promise<CaregiverVitalLogResponse> {
        const { caregiver, patient } = await this._getAssignedCaregiverAndPatient(caregiverId, patientId)
        const schedule = dto.scheduleId
            ? await this._vitalRepo.findVitalScheduleById(dto.scheduleId)
            : await this._vitalRepo.findLoggableVitalScheduleByPatientAndType(patient._id, dto.vitalType)

        if (schedule && schedule.caregiverId?.toString() !== caregiver._id.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not assigned to this vital schedule')
        }

        const recordedAtBase = schedule?.scheduleTime ?? new Date()
        const recordedAt = this._mergeTimeIntoDate(recordedAtBase, dto.recordedAt)
        const recordedValue = this._buildRecordedVitalValue(dto)

        let updatedScheduleId: string | undefined

        const user = await this._userRepo.findById(caregiver.userId.toString())

        if (schedule) {
            const updatedSchedule = await this._vitalRepo.updateVitalSchedule(schedule._id.toString(), {
                status: 'recorded',
                recordedAt,
                recordedBy: caregiver.userId,
                recordedByRole: user?.role,
                recordedValue,
                recordedNotes: dto.notes,
            })

            if (!updatedSchedule) {
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update vital schedule')
            }

            updatedScheduleId = updatedSchedule._id.toString()

            const alertData = this._checkVitalThresholds(dto.vitalType, recordedValue)
            if (alertData) {
                await this._alertService.createAlert({
                    patientId: patient._id,
                    scheduleId: updatedSchedule._id,
                    type: 'critical_vital',
                    severity: 'critical',
                    triggerReason: alertData,
                })
            }
        }

        const vitalDesc =
            dto.vitalType === 'blood_pressure'
                ? `Blood Pressure: ${dto.systolic}/${dto.diastolic} mmHg`
                : `${dto.vitalType}: ${dto.value} ${this._getVitalUnit(dto.vitalType)}`

        await this._activityService.logActivity({
            caregiverId: caregiver._id,
            patientId: patient._id,
            activityType: 'vital_recorded',
            referenceId: schedule?._id,
            description: vitalDesc,
        })

        return {
            vitalId: updatedScheduleId ?? '',
            vitalType: dto.vitalType,
            scheduleId: updatedScheduleId,
            recordedAt: recordedAt.toISOString(),
        }
    }

    async logSymptom(caregiverId: Types.ObjectId, patientId: string, dto: LogSymptomDTO): Promise<SymptomLogDTO> {
        const { caregiver, patient } = await this._getAssignedCaregiverAndPatient(caregiverId, patientId)
        const onsetTime = this._mergeTimeIntoDate(new Date(), dto.onsetTime)

        const log = await SymptomLogModel.create({
            patientId: patient._id,
            caregiverId: caregiver.userId,
            symptom: dto.symptom,
            severity: dto.severity,
            onsetTime,
            observations: dto.observations,
        })

        if (dto.severity === 'severe' || dto.severity === 'critical') {
            await this._alertService.createAlert({
                patientId: patient._id,
                scheduleId: log._id,
                type: 'critical_symptom',
                severity: dto.severity === 'critical' ? 'critical' : 'high',
                triggerReason: `Symptom reported: ${dto.symptom} (severity: ${dto.severity})`,
            })
        }

        await this._activityService.logActivity({
            caregiverId: caregiver._id,
            patientId: patient._id,
            activityType: 'symptom_logged',
            referenceId: log._id,
            description: `${dto.symptom} (${dto.severity})`,
        })

        return {
            _id: log._id.toString(),
            symptom: log.symptom,
            severity: log.severity,
            onsetTime: log.onsetTime.toISOString(),
            observations: log.observations,
            createdAt: log.createdAt.toISOString(),
        }
    }

    private async _getAssignedCaregiverAndPatient(caregiverId: Types.ObjectId, patientId: string) {
        const caregiver = await this._caregiverRepo.findById(caregiverId.toString())
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver not found')
        }

        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient not found')
        }

        if (patient.caregiverId?.toString() !== caregiver._id.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not assigned to this patient')
        }

        return { caregiver, patient }
    }

    private _toMedicationScheduleDTO(schedule: {
        _id: Types.ObjectId
        medicineName: string
        dosage: string
        route: string
        scheduleTime: Date
        priority: 'low' | 'medium' | 'high' | 'critical'
        status: 'pending' | 'administered' | 'missed' | 'skipped' | 'cancelled'
        administeredAt?: Date
        administrationNotes?: string
    }): MedicationScheduleDTO {
        return {
            _id: schedule._id.toString(),
            medicineName: schedule.medicineName,
            dosage: schedule.dosage,
            route: schedule.route,
            scheduleTime: schedule.scheduleTime.toISOString(),
            priority: schedule.priority,
            status: schedule.status,
            administeredAt: schedule.administeredAt?.toISOString(),
            administrationNotes: schedule.administrationNotes,
        }
    }

    private _mergeTimeIntoDate(baseDate: Date, time: string): Date {
        const [hours, minutes] = time.split(':').map(Number)
        const nextDate = new Date(baseDate)
        nextDate.setHours(hours, minutes, 0, 0)
        return nextDate
    }

    private _normalizeMedicationRoute(route: string): 'oral' | 'injection' | 'IV' | 'inhalation' {
        const normalized = route.trim().toLowerCase()

        if (normalized.includes('oral')) return 'oral'
        if (normalized === 'iv' || normalized.includes('intravenous')) return 'IV'
        if (normalized.includes('inject')) return 'injection'
        if (normalized.includes('inhal')) return 'inhalation'

        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Unsupported medication route')
    }

    private _buildRecordedVitalValue(dto: LogVitalReadingDTO) {
        if (dto.vitalType === 'blood_pressure') {
            if (dto.systolic === undefined || dto.diastolic === undefined) {
                throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Blood pressure requires systolic and diastolic values')
            }

            return {
                systolic: dto.systolic,
                diastolic: dto.diastolic,
                unit: 'mmHg',
            }
        }

        if (dto.value === undefined) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'A recorded value is required for the selected vital')
        }

        return {
            value: dto.value,
            unit: this._getVitalUnit(dto.vitalType),
        }
    }

    private _getVitalUnit(vitalType: LogVitalReadingDTO['vitalType']): string {
        switch (vitalType) {
            case 'blood_pressure':
                return 'mmHg'
            case 'blood_sugar':
                return 'mg/dL'
            case 'heart_rate':
                return 'BPM'

            case 'spo2':
                return '%'
            default:
                return ''
        }
    }

    private _checkVitalThresholds(
        vitalType: LogVitalReadingDTO['vitalType'],
        recordedValue: { systolic?: number; diastolic?: number; value?: number; unit?: string },
    ): string | null {
        switch (vitalType) {
            case 'blood_pressure': {
                const sys = recordedValue.systolic
                const dia = recordedValue.diastolic
                if (sys && sys >= 170) return `Critical blood pressure: systolic ${sys} mmHg`
                if (dia && dia >= 100) return `Critical blood pressure: diastolic ${dia} mmHg`
                return null
            }
            case 'spo2': {
                const val = recordedValue.value
                if (val !== undefined && val < 90) return `Critical SpO2 level: ${val}%`
                return null
            }
            case 'heart_rate': {
                const val = recordedValue.value
                if (val !== undefined && (val < 40 || val > 140)) {
                    return `Critical heart rate: ${val} BPM`
                }
                return null
            }
            case 'blood_sugar': {
                const val = recordedValue.value
                if (val !== undefined && (val < 54 || val > 300)) {
                    return `Critical blood sugar: ${val} mg/dL`
                }
                return null
            }
            default:
                return null
        }
    }
}
