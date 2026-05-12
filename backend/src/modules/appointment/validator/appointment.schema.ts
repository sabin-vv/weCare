import { z } from 'zod'

export const createAppointmentSchema = z.object({
    doctorId: z.string().min(1, 'Doctor ID is required'),
    appointmentDate: z.string().min(1, 'Appointment date is required'),
    paymentMethod: z.enum(['razorpay', 'wallet']),
    slotStart: z
        .string()
        .min(1, 'Slot start time is required')
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format '),
    slotEnd: z
        .string()
        .min(1, 'Slot start time is required')
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format '),
})

export const retryPaymentSchema = z.object({
    paymentMethod: z.enum(['razorpay', 'wallet']),
})

export type CreateAppointmentDTO = z.infer<typeof createAppointmentSchema>
export type RetryPaymentDTO = z.infer<typeof retryPaymentSchema>
