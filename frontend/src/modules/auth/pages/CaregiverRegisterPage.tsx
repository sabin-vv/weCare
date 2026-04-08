import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { register, sendOtp, verifyOtp } from '../api/auth.api'
import OtpVerification from '../components/OtpVerification'
import BasicInfoForm from '../form/BasicInfoForm'
import RegistrationSuccessForm from '../form/RegistrationSuccessForm'
import { OtpPurpose, Role, type RegisterFormData } from '../types/auth.types'

import AuthLayout from '@/layout/AuthLayout'
import { getErrorMessage } from '@/utils/getErrorMessage'

const CaregiverRegisterPage = () => {
    const [loading, setLoading] = useState(false)
    const [registerData, setRegisterData] = useState<RegisterFormData>({
        name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
    })
    const [step, setSteps] = useState<number>(1)

    const nextStep = () => {
        setSteps((prev) => prev + 1)
    }
    const prevStep = () => {
        setSteps((prev) => prev - 1)
    }

    const handleBasicInfoSubmit = async (data: RegisterFormData) => {
        setLoading(true)
        try {
            setRegisterData((prev) => ({
                ...prev,
                ...data,
            }))
            localStorage.setItem('caregiverRegister', JSON.stringify(data))
            await sendOtp(data.email, OtpPurpose.REGISTER)
            nextStep()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (otp: string) => {
        setLoading(true)
        try {
            await verifyOtp(registerData.email, otp)

            const res = await register(registerData, Role.CAREGIVER)

            toast.success(res.message)

            nextStep()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const saved = localStorage.getItem('caregiverRegister')
        if (saved) {
            try {
                setRegisterData((prev) => ({
                    ...prev,
                    ...JSON.parse(saved),
                }))
            } catch {
                localStorage.removeItem('caregiverRegister')
            }
        }
    }, [])

    return (
        <AuthLayout>
            {step === 1 && (
                <BasicInfoForm
                    defaultValues={registerData}
                    onSubmit={handleBasicInfoSubmit}
                    loading={loading}
                    role="caregiver"
                    title="Caregiver Registration"
                    description="Enter your basic details to continue."
                />
            )}

            {step === 2 && (
                <OtpVerification
                    email={registerData.email}
                    onVerify={handleVerifyOtp}
                    onResend={async () => {
                        await sendOtp(registerData.email, OtpPurpose.REGISTER)
                    }}
                    onBack={prevStep}
                    loading={loading}
                />
            )}

            {step === 3 && <RegistrationSuccessForm />}
        </AuthLayout>
    )
}

export default CaregiverRegisterPage
