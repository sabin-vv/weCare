import { useEffect, useState } from 'react'
import FormLayout from '../../../layouts/FormLayout'
import DoctorStepOne from '../forms/doctor/DoctorStepOne'
import DoctorStepTwo from '../forms/doctor/DoctorStepTwo'
import DoctorStepThree from '../forms/doctor/DoctorStepThree'
import DoctorStepFour from '../forms/doctor/DoctorStepFour'
import type { DoctorRegisterState } from '../types/auth.types'

const DoctorRegisterPage = () => {
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
    useEffect(() => {
        const saved = localStorage.getItem('doctorRegister')
        if (saved) {
            setRegisterData((prev) => ({
                ...prev,
                basicInfo: JSON.parse(saved),
            }))
        }
    }, [])
    return (
        <FormLayout>
            {step === 1 && (
                <DoctorStepOne nextStep={nextStep} formData={registerData.basicInfo} setFormData={setRegisterData} />
            )}
            {step === 2 && (
                <DoctorStepTwo email={registerData.basicInfo.email} prevStep={prevStep} nextStep={nextStep} />
            )}
            {step === 3 && (
                <DoctorStepThree
                    prevStep={prevStep}
                    nextStep={nextStep}
                    documents={registerData.documents}
                    specializations={registerData.specializations}
                    registerData={registerData}
                    setRegisterData={setRegisterData}
                />
            )}
            {step === 4 && <DoctorStepFour />}
        </FormLayout>
    )
}

export default DoctorRegisterPage
