import { useState } from 'react'

import FormLayout from '../../../layouts/FormLayout'
import CaregiverStepFour from '../forms/caregiver/CaregiverStepFour'
import CaregiverStepOne from '../forms/caregiver/CaregiverStepOne'
import CaregiverStepThree from '../forms/caregiver/CaregiverStepThree'
import CaregiverStepTwo from '../forms/caregiver/CaregiverStepTwo'
import type { caregiverRegisterState } from '../types/auth.types'

const CaregiverRegisterPage = () => {
    const [step, setStep] = useState<number>(1)
    const [registerData, setRegisterData] = useState<caregiverRegisterState>({
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
            licence: {
                number: '',
                document: null,
            },
            certificate: {
                number: '',
                document: null,
            },
        },
    })

    const nextStep = () => {
        setStep((prev) => prev + 1)
    }
    const prevStep = () => {
        setStep((prev) => prev - 1)
    }
    return (
        <FormLayout>
            {step === 1 && (
                <CaregiverStepOne nextStep={nextStep} formData={registerData.basicInfo} setFormData={setRegisterData} />
            )}

            {step === 2 && (
                <CaregiverStepTwo email={registerData.basicInfo.email} nextStep={nextStep} prevStep={prevStep} />
            )}
            {step === 3 && (
                <CaregiverStepThree
                    documents={registerData.documents}
                    registerData={registerData}
                    setRegisterData={setRegisterData}
                    nextStep={nextStep}
                    prevStep={prevStep}
                />
            )}
            {step === 4 && <CaregiverStepFour />}
        </FormLayout>
    )
}

export default CaregiverRegisterPage
