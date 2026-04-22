import { z } from 'zod'

export const createAppointmentSchema = z.object({
    doctorId: z.string().min(1, 'Doctor ID is required'),
    appointmentDate: z.string().min(1, 'Appointment date is required'),
    slotStart: z.string().min(1, 'Slot start time is required'),
})

export const verifyPaymentSchema = z.object({
    razorpayOrderId: z.string().min(1, 'Order ID is required'),
    razorpayPaymentId: z.string().min(1, 'Payment ID is required'),
    razorpaySignature: z.string().min(1, 'Signature is required'),
})
