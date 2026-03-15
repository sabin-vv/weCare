import { useState } from 'react'
import toast from 'react-hot-toast'

import FileUplodBox from '../../components/FileUploadBox'
import ProfessionalButtons from '../../components/ProfessionalButtons'
import ProgressBar from '../../components/ProgressBar'
import VerificationCard from '../../components/VerificationCard'
import { caregiverStepThreeSchema } from '../../schemas/caregiverStepThreeSchema'
import { caregiverRegister } from '../../services/auth.service'
import type { caregiverStepThreeProps } from '../../types/auth.types'

import styles from './CaregiverStepThree.module.css'

import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import ImageCropper from '@/shared/components/ImageCropper/ImageCropper'
import { getErrorMessage } from '@/utils/getErrorMessage'

const CaregiverStepThree = ({
    nextStep,
    prevStep,
    documents,
    registerData,
    setRegisterData,
}: caregiverStepThreeProps) => {
    const [imageCrop, setImageCrop] = useState<string | null>(null)

    const handleSubmit = async () => {
        const result = caregiverStepThreeSchema.safeParse({ documents })
        if (!result.success) {
            const message = result.error.issues[0].message
            toast.error(message)
            return
        }
        try {
            const formData = new FormData()
            formData.append('name', registerData.basicInfo.name)
            formData.append('email', registerData.basicInfo.email)
            formData.append('mobile', registerData.basicInfo.mobile)
            formData.append('password', registerData.basicInfo.password)
            formData.append('confirmPassword', registerData.basicInfo.confirmPassword)

            formData.append('govId', documents.govId!)
            formData.append('profileImage', documents.profileImage!)

            formData.append('certificateNumber', documents.certificate.number)
            formData.append('certificateImage', documents.certificate.document!)
            formData.append('licenseNumber', documents.licence.number)
            formData.append('licenseImage', documents.licence.document!)

            for (const [key, value] of formData.entries()) {
                console.log(key, value)
            }
            const response = await caregiverRegister(formData)
            if (!response.success) {
                toast.error(response.message)
                return
            }
            toast.success(response.message)
            localStorage.removeItem('caregiverRegister')
            nextStep()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error))
        }
    }

    return (
        <FormWrapper
            maxWidth="720px"
            title="Verify Your Identity"
            description="Please upload clear copies of the following documents to continue."
        >
            <ProgressBar title="Professional information" percentage={75} step={2} totalSteps={4} />

            <div className={styles.cardGrid}>
                <VerificationCard
                    title="Government ID"
                    description="Upload a clear photo of your Passport, Driver's License, or National ID Card."
                >
                    <FileUplodBox
                        accept="image/jpeg,image/png,image,jpeg,application/pdf"
                        file={documents.govId}
                        onFileSelect={(file) => {
                            setRegisterData((prev) => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    govId: file,
                                },
                            }))
                        }}
                    />
                </VerificationCard>
                <VerificationCard
                    title="Profile Photo"
                    description="Upload a clear, front-facing photo of yourself for your professional profile."
                >
                    <FileUplodBox
                        accept="image/jpg,image/jpeg,image/png"
                        file={documents.profileImage}
                        onFileSelect={(file) => {
                            const imageUrl = URL.createObjectURL(file)
                            setImageCrop(imageUrl)
                        }}
                    />
                </VerificationCard>
                <VerificationCard
                    title="Professional Certificate"
                    description="Verification of your professional credentials is required for all caregivers."
                >
                    <input
                        type="text"
                        placeholder="Enter certificate number"
                        value={documents.certificate.number}
                        className={styles.documentInput}
                        onChange={(e) => {
                            setRegisterData((prev) => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    certificate: {
                                        ...prev.documents.certificate,
                                        number: e.target.value,
                                    },
                                },
                            }))
                        }}
                    />
                    <FileUplodBox
                        accept="image/jpeg,image/png,image,jpeg,application/pdf"
                        file={documents.certificate.document}
                        onFileSelect={(file) => {
                            setRegisterData((prev) => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    certificate: {
                                        ...prev.documents.certificate,
                                        document: file,
                                    },
                                },
                            }))
                        }}
                    />
                </VerificationCard>
                <VerificationCard
                    title="Nursing License"
                    description="Verification of your active nursing license is required for all registered nurses."
                >
                    <input
                        type="text"
                        placeholder="Enter license number"
                        value={documents.licence.number}
                        className={styles.documentInput}
                        onChange={(e) => {
                            setRegisterData((prev) => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    licence: {
                                        ...prev.documents.licence,
                                        number: e.target.value,
                                    },
                                },
                            }))
                        }}
                    />
                    <FileUplodBox
                        accept="image/jpeg,image/png,image,jpeg,application/pdf"
                        file={documents.licence.document}
                        onFileSelect={(file) => {
                            setRegisterData((prev) => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    licence: {
                                        ...prev.documents.licence,
                                        document: file,
                                    },
                                },
                            }))
                        }}
                    />
                </VerificationCard>
            </div>
            <ProfessionalButtons onBack={prevStep} onNext={handleSubmit} backLabel="Back" nextLabel="Register" />
            {imageCrop && (
                <ImageCropper
                    image={imageCrop}
                    onCropComplete={(file) => {
                        setRegisterData((prev) => ({
                            ...prev,
                            documents: {
                                ...prev.documents,
                                profileImage: file,
                            },
                        }))
                        setImageCrop(null)
                    }}
                    onClose={() => setImageCrop(null)}
                />
            )}
        </FormWrapper>
    )
}

export default CaregiverStepThree
