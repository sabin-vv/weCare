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

    findPatientIdsByStatus(doctorId: string, status: string | string[]): Promise<string[]>

    findDoctorVisibleAppointmentsByDoctorAndPatientIds(
        doctorId: string,
        patientIds: string[],
    ): Promise<AppointmentDocument[]>

    findDoctorVisibleCurrentAppointment(doctorId: string, patientUserId: string): Promise<AppointmentDocument | null>

    cancelAppointment(id: string, reason: string, cancelledBy: string): Promise<AppointmentDocument | null>

    cancelFutureAppointmentsByPatient(patientId: string, reason: string, cancelledBY: string): Promise<number>
}
