import { useEffect, useState } from 'react'
import { OtpPurpose, type DoctorRegisterState } from '../types/auth.types'
import AuthLayout from '@/layout/AuthLayout'
import BasicInfoForm from '../form/BasicInfoForm'
import OtpVerification from '../components/OtpVerification'
import DoctorDetailsForm from '../form/DoctorDetailesForm'
import RegistrationSuccessForm from '../form/RegistrationSuccessForm'
import { sendOtp, verifyOtp } from '../api/auth.api'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/utils/getErrorMessage'

const DoctorRegisterPage = () => {
    const [loading, setLoading] = useState(false)
    const [registerData, setRegisterData] = useState<DoctorRegisterState>({
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
            medicalCertificate: {
                number: '',
                document: null,
            },
            councilRegistration: {
                number: '',
                document: null,
            },
        },
        specializations: [{ name: '', document: null }],
    })
    const [step, setSteps] = useState<number>(1)

    const nextStep = () => {
        setSteps((prev) => prev + 1)
    }
    const prevStep = () => {
        setSteps((prev) => prev - 1)
    }

    const handleBasicInfoSubmit = async (data: DoctorRegisterState['basicInfo']) => {
        setLoading(true)
        try {
            setRegisterData((prev) => ({
                ...prev,
                basicInfo: data,
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
            await verifyOtp(registerData.basicInfo.email, otp)
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
                    basicInfo: JSON.parse(saved),
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
                    defaultValues={registerData.basicInfo}
                    onSubmit={handleBasicInfoSubmit}
                    loading={loading}
                    role="doctor"
                    title="Doctor Registration"
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
                <DoctorDetailsForm
                    prevStep={prevStep}
                    nextStep={nextStep}
                    documents={registerData.documents}
                    specializations={registerData.specializations}
                    registerData={registerData}
                    setRegisterData={setRegisterData}
                />
            )}
            {step === 4 && <RegistrationSuccessForm />}
        </AuthLayout>
    )
}

export default DoctorRegisterPage
