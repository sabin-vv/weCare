import { AppointmentResponseDTO } from '../mapper/appointment.mapper'
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

export interface IAppointmentService {
    createAppointment(
        dto: CreateAppointmentDTO & { patientId: string },
    ): Promise<{ order: RazorpayOrder; paymentId: string }>

    getPatientAppointments(patientId: string): Promise<AppointmentResponseDTO[]>

    getDoctorAppointments(doctorId: string): Promise<AppointmentResponseDTO[]>
}
