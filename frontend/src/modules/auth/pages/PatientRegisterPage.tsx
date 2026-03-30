import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useNavigate } from 'react-router-dom'

import AuthLayout from '@/layout/AuthLayout'
import PatientRegisterForm from '../form/patient/PatientRegisterForm'
import OtpVerification from '../components/OtpVerification'
import { sendOtp, verifyOtp, patientRegister } from '../api/auth.api'
import type { PatientRegisterData } from '../validator/register.schema'
import { OtpPurpose } from '../types/auth.types'

const PatientRegisterPage = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<PatientRegisterData | null>(null)

    const nextStep = () => setStep((s) => s + 1)
    const prevStep = () => setStep((s) => s - 1)

    const handleBasicSubmit = async (data: PatientRegisterData) => {
        setLoading(true)
        try {
            setFormData(data)
            localStorage.setItem('patientRegisterData', JSON.stringify(data))
            await sendOtp(data.email, OtpPurpose.REGISTER)
            nextStep()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (otp: string) => {
        if (!formData) return
        setLoading(true)
        try {
            await verifyOtp(formData.email, otp)

            const res = await patientRegister(formData)
            if (res.success) {
                localStorage.removeItem('patientRegisterData')
                toast.success(res.message || 'Patient registered successfully')
                navigate('/auth/login')
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const saved = localStorage.getItem('patientRegisterData')
        if (saved) {
            try {
                setFormData(JSON.parse(saved))
            } catch {
                localStorage.removeItem('patientRegisterData')
            }
        }
    }, [])

    return (
        <AuthLayout>
            {step === 1 && <PatientRegisterForm onSubmit={handleBasicSubmit} loading={loading} />}
            {step === 2 && formData && (
                <OtpVerification
                    email={formData.email}
                    onVerify={handleVerify}
                    onResend={async () => {
                        await sendOtp(formData.email, OtpPurpose.REGISTER)
                    }}
                    onBack={prevStep}
                    loading={loading}
                />
            )}
        </AuthLayout>
    )
}

export default PatientRegisterPage
