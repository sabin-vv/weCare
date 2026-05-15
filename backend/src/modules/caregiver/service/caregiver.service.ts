import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { IMedicationRepository } from '../../medication/interfaces/medication.repository.interface'
import { IMedicationLogRepository } from '../../medication/interfaces/medicationLog.repository.interface'
import { MedicationScheduleDTO } from '../../medication/types/medication.type'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { SymptomLogModel } from '../../symptom/models/symptomLog.model'
import { IVitalRepository } from '../../vital/interfaces/vital.repository.interface'
import { VitalDocument, VitalPlanItem } from '../../vital/types/vital.types'
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
    ) {}

    async createProfile(userId: string, dto: CreateCaregiverProfileDTO): Promise<Partial<CaregiverProfileResponse>> {
        const existingCaregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (existingCaregiver) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Caregiver profile already exists')
        }

        const caregiverData = toCaregiverEntity(new Types.ObjectId(userId), dto, {})
        const caregiver = await this._caregiverRepo.create(caregiverData)
        await this._userRepo.update(userId, { isProfileComplete: true })

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
            phoneNumber: dto.phoneNumber,
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

        if (patient.caregiverId?.toString() !== caregiver.userId.toString()) {
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

        if (patient.caregiverId?.toString() !== caregiver.userId.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not assigned to this patient')
        }

        const plans = await this._vitalRepo.findVitalPlansByPatientIdAndStatus(patient._id.toString(), 'active')
        const items: VitalPlanItem[] = []
        for (const plan of plans) {
            items.push(...plan.vitals)
        }
        return items
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

        if (schedule.caregiverId.toString() !== caregiver.userId.toString()) {
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
            medicationId: schedule._id,
            status: dto.status,
            takenTime: administeredAt,
            route: normalizedRoute,
            observations: dto.observations ?? '',
        })

        return this._toMedicationScheduleDTO(updated)
    }

    async logVitalReading(
        caregiverId: Types.ObjectId,
        patientId: string,
        dto: LogVitalReadingDTO,
    ): Promise<CaregiverVitalLogResponse> {
        const { caregiver, patient } = await this._getAssignedCaregiverAndPatient(caregiverId, patientId)
        const schedule = await this._vitalRepo.findLoggableVitalScheduleByPatientAndType(patient._id, dto.vitalType)

        if (schedule && schedule.caregiverId?.toString() !== caregiver.userId.toString()) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not assigned to this vital schedule')
        }

        const recordedAtBase = schedule?.scheduleTime ?? new Date()
        const recordedAt = this._mergeTimeIntoDate(recordedAtBase, dto.recordedAt)
        const recordedValue = this._buildRecordedVitalValue(dto)

        let updatedScheduleId: string | undefined
        if (schedule) {
            const updatedSchedule = await this._vitalRepo.updateVitalSchedule(schedule._id.toString(), {
                status: 'recorded',
                recordedAt,
                recordedBy: caregiver.userId,
                recordedValue,
                recordedNotes: dto.notes,
            })

            if (!updatedSchedule) {
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update vital schedule')
            }

            updatedScheduleId = updatedSchedule._id.toString()
        }

        const vitalType = this._mapPlanVitalTypeToVitalType(dto.vitalType)
        const vital = await this._vitalRepo.create({
            patientId: patient._id,
            type: vitalType,
            value: recordedValue.value,
            systolic: recordedValue.systolic,
            diastolic: recordedValue.diastolic,
            unit: recordedValue.unit || this._getVitalUnit(dto.vitalType),
            recordedAt,
            recordedBy: caregiver.userId,
        } as Partial<VitalDocument>)

        return {
            vitalId: vital._id.toString(),
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

        if (patient.caregiverId?.toString() !== caregiver.userId.toString()) {
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

    private _mapPlanVitalTypeToVitalType(vitalType: LogVitalReadingDTO['vitalType']): VitalDocument['type'] {
        if (vitalType === 'oxygen_saturation') return 'spo2'
        return vitalType
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
            case 'temperature':
                return '°F'
            case 'oxygen_saturation':
                return '%'
            default:
                return ''
        }
    }
}
