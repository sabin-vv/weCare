import { AppointmentDocument } from '../types/appointment.types'

export interface IAppointmentService {
    createOrder(patientId: string, doctorId: string, appointmentDate: string, slotStart: string): Promise<any>
    verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<AppointmentDocument>
    getPatientAppointments(patientId: string): Promise<AppointmentDocument[]>
    getDoctorAppointments(doctorId: string): Promise<AppointmentDocument[]>
}
