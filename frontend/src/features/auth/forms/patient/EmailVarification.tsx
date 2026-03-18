import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import EmailVerify from '../../components/EmailVerify'
import { patientRegister } from '../../services/auth.service'
import type { PatientRegisterData } from '../../types/auth.types'

import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import { getErrorMessage } from '@/utils/getErrorMessage'

const EmailVarification = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState<PatientRegisterData | null>(null)

    useEffect(() => {
        const savedData = localStorage.getItem('patientRegisterData')
        if (savedData) {
            setFormData(JSON.parse(savedData))
        } else {
            navigate('/api/patients/register')
        }
    }, [navigate])

    const handleCompleteRegistration = async () => {
        if (!formData) return
        try {
            const result = await patientRegister(formData)
            if (result.success) {
                localStorage.removeItem('patientRegisterData')
                toast.success('Registration completed successfully')
                navigate('/api/auth/login')
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    if (!formData) return null

    return (
        <FormWrapper title="Verify Email Address">
            <EmailVerify
                email={formData.email}
                prevStep={() => navigate('/api/patients/register')}
                nextStep={handleCompleteRegistration}
            />
        </FormWrapper>
    )
}

export default EmailVarification
