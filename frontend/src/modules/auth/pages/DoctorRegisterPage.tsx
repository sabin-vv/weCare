import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { sendOtp, verifyOtp } from '../api/auth.api'
import OtpVerification from '../components/OtpVerification'
import BasicInfoForm from '../form/BasicInfoForm'
import RegistrationSuccessForm from '../form/RegistrationSuccessForm'
import { OtpPurpose, type RegisterFormData } from '../types/auth.types'

import AuthLayout from '@/layout/AuthLayout'
import { getErrorMessage } from '@/utils/getErrorMessage'

const DoctorRegisterPage = () => {
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
            localStorage.setItem('doctorRegister', JSON.stringify(data))
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
            nextStep()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const saved = localStorage.getItem('doctorRegister')
        if (saved) {
            try {
                setRegisterData((prev) => ({
                    ...prev,
                    ...JSON.parse(saved),
                }))
            } catch {
                localStorage.removeItem('doctorRegister')
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
                    role="doctor"
                    title="Doctor Registration"
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

export default DoctorRegisterPage
