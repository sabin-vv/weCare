import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { sendOtp, verifyOtp } from '../api/auth.api'
import OtpVerification from '../components/OtpVerification'
import BasicInfoForm from '../form/BasicInfoForm'
import CaregiverDetailsForm from '../form/CaregiverDetailsForm'
import RegistrationSuccessForm from '../form/RegistrationSuccessForm'
import { OtpPurpose } from '../types/auth.types'
import type { CaregiverRegisterState } from '../types/caregiver.types'

import AuthLayout from '@/layout/AuthLayout'
import { getErrorMessage } from '@/utils/getErrorMessage'

const CaregiverRegisterPage = () => {
    const [loading, setLoading] = useState(false)
    const [registerData, setRegisterData] = useState<CaregiverRegisterState>({
        basicInfo: {
            name: '',
            email: '',
            mobile: '',
            password: '',
            confirmPassword: '',
        },
        documents: {
            govId: null,
            profileImage: null,
            certificate: {
                number: '',
                document: null,
            },
            license: {
                number: '',
                document: null,
            },
        },
    })
    const [step, setSteps] = useState<number>(1)

    const nextStep = () => {
        setSteps((prev) => prev + 1)
    }
    const prevStep = () => {
        setSteps((prev) => prev - 1)
    }

    const handleBasicInfoSubmit = async (data: CaregiverRegisterState['basicInfo']) => {
        setLoading(true)
        try {
            setRegisterData((prev) => ({
                ...prev,
                basicInfo: data,
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
            await verifyOtp(registerData.basicInfo.email, otp)
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
                    basicInfo: JSON.parse(saved),
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
                    defaultValues={registerData.basicInfo}
                    onSubmit={handleBasicInfoSubmit}
                    loading={loading}
                    role="caregiver"
                    title="Caregiver Registration"
                    description="Enter your basic details to continue."
                />
            )}

            {step === 2 && (
                <OtpVerification
                    email={registerData.basicInfo.email}
                    onVerify={handleVerifyOtp}
                    onResend={async () => {
                        await sendOtp(registerData.basicInfo.email, OtpPurpose.REGISTER)
                    }}
                    onBack={prevStep}
                    loading={loading}
                />
            )}

            {step === 3 && (
                <CaregiverDetailsForm
                    prevStep={prevStep}
                    nextStep={nextStep}
                    documents={registerData.documents}
                    registerData={registerData}
                    setRegisterData={setRegisterData}
                />
            )}
            {step === 4 && <RegistrationSuccessForm />}
        </AuthLayout>
    )
}

export default CaregiverRegisterPage
