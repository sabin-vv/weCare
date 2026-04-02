import { useState } from 'react'
import toast from 'react-hot-toast'

import { caregiverRegister, presignUpload, uploadToS3 } from '../api/auth.api'
import FileUploadBox from '../components/FileUploadBox'
import FormNavigationButtons from '../components/FormNavigationButtons '
import ProgressBar from '../components/ProgressBar'
import type { CaregiverDetailsFormProps } from '../types/caregiver.types'
import { caregiverDetailsSchema } from '../validator/register.schema'

import styles from './CaregiverDetailsForm.module.css'

import Card from '@/shared/components/Card/Card'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import ImageCropper from '@/shared/components/ImageCropper/ImageCropper'
import InputField from '@/shared/components/InputField/InputField'
import { getErrorMessage } from '@/utils/getErrorMessage'

const CaregiverDetailsForm = ({
    nextStep,
    prevStep,
    documents,
    registerData,
    setRegisterData,
}: CaregiverDetailsFormProps) => {
    const [imageCrop, setImageCrop] = useState<string | null>(null)

    const uploadFileToS3 = async (file: File, folder: string): Promise<string> => {
        try {
            const contentType = file.type as 'image/png' | 'image/jpeg' | 'application/pdf'
            const presignRes = await presignUpload({
                fileName: file.name,
                contentType,
                folder,
                size: file.size,
            })

            await uploadToS3(presignRes.uploadUrl, file)
            return presignRes.key
        } catch (error) {
            throw new Error(`Failed to upload ${file.name}: ${getErrorMessage(error)}`)
        }
    }

    const handleSubmit = async () => {
        const result = caregiverDetailsSchema.safeParse({ documents })
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

            if (documents.govId) {
                const govIdKey = await uploadFileToS3(documents.govId, 'documents/caregiverGovId')
                formData.append('govIdImage', govIdKey)
            }

            if (documents.profileImage) {
                const profileImageKey = await uploadFileToS3(documents.profileImage, 'documents/caregiverProfile')
                formData.append('profileImage', profileImageKey)
            }

            formData.append('certificateNumber', documents.certificate.number)
            if (documents.certificate.document) {
                const certKey = await uploadFileToS3(documents.certificate.document, 'documents/caregiverCertificate')
                formData.append('certificateImage', certKey)
            }

            formData.append('licenseNumber', documents.license.number)
            if (documents.license.document) {
                const licenseKey = await uploadFileToS3(documents.license.document, 'documents/caregiverLicense')
                formData.append('licenseImage', licenseKey)
            }

            const result = await caregiverRegister(formData)

            toast.success(result.message)
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

            <div className={styles.gridContainer}>
                <Card
                    title="Government ID"
                    description="Upload a clear photo of your Passport, Driver's License, or National ID Card."
                >
                    <FileUploadBox
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
                </Card>
                <Card
                    title="Profile Image"
                    description="Upload a clear, front-facing photo of yourself for your professional profile."
                >
                    <FileUploadBox
                        accept="image/jpg,image/jpeg,image/png"
                        file={documents.profileImage}
                        onFileSelect={(file) => {
                            const imageUrl = URL.createObjectURL(file)
                            setImageCrop(imageUrl)
                        }}
                    />
                </Card>
                <Card
                    title="Professional Certificate"
                    description="Verification of your professional credentials is required for all caregivers."
                >
                    <InputField
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
                                        number: e.target.value.toUpperCase(),
                                    },
                                },
                            }))
                        }}
                    />
                    <FileUploadBox
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
                </Card>
                <Card
                    title="Nursing License"
                    description="Verification of your active nursing license is required for all registered nurses."
                >
                    <InputField
                        type="text"
                        placeholder="Enter license number"
                        value={documents.license.number}
                        className={styles.documentInput}
                        onChange={(e) => {
                            setRegisterData((prev) => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    license: {
                                        ...prev.documents.license,
                                        number: e.target.value.toUpperCase(),
                                    },
                                },
                            }))
                        }}
                    />
                    <FileUploadBox
                        accept="image/jpeg,image/png,image,jpeg,application/pdf"
                        file={documents.license.document}
                        onFileSelect={(file) => {
                            setRegisterData((prev) => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    license: {
                                        ...prev.documents.license,
                                        document: file,
                                    },
                                },
                            }))
                        }}
                    />
                </Card>
            </div>
            <FormNavigationButtons onBack={prevStep} onNext={handleSubmit} backLabel="Back" nextLabel="Register" />
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

export default CaregiverDetailsForm
