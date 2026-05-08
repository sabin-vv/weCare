import { AppointmentDocument } from '../types/appointment.types'

export interface IAppointmentRepository {
    create(data: Partial<AppointmentDocument>): Promise<AppointmentDocument>

    findById(id: string): Promise<AppointmentDocument | null>

    update(id: string, data: Partial<AppointmentDocument>): Promise<AppointmentDocument | null>

    delete(id: string): Promise<AppointmentDocument | null>

    findByPatientId(patientId: string): Promise<AppointmentDocument[]>

    findByDoctorId(doctorId: string): Promise<AppointmentDocument[]>

    findActiveAppointments(doctorId: string, date: string): Promise<AppointmentDocument[]>

    findActiveByPatientAndDoctor(patientId: string, doctorId: string): Promise<AppointmentDocument | null>

    findFutureCancellableAppointments(doctorId: string, fromDate: Date): Promise<AppointmentDocument[]>

    findPendingPatientIdsByDoctor(doctorId: string): Promise<string[]>

    findCurrentAppointmentsByDoctorAndPatientIds(doctorId: string, patientIds: string[]): Promise<AppointmentDocument[]>

    cancelAppointment(id: string): Promise<AppointmentDocument | null>
}
