import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { createCaregiverProfile } from '../api/caregiver.api'

import styles from './CaregiverDetailsForm.module.css'

import { getCurrentUser, presignUpload, uploadToS3 } from '@/modules/auth/api/auth.api'
import FileUploadBox from '@/modules/auth/components/FileUploadBox'
import { caregiverDetailsSchema } from '@/modules/auth/validator/register.schema'
import Button from '@/shared/components/Button/Button'
import Card from '@/shared/components/Card/Card'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import ImageCropper from '@/shared/components/ImageCropper/ImageCropper'
import InputField from '@/shared/components/InputField/InputField'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

interface CaregiverDocuments {
    govId: File | null
    profileImage: File | null
    certificate: {
        number: string
        document: File | null
    }
    license: {
        number: string
        document: File | null
    }
}

const CaregiverDetailsForm = () => {
    const { user, setAuth } = useAuth()
    const navigate = useNavigate()
    const [documents, setDocuments] = useState<CaregiverDocuments>({
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
    })
    const [imageCrop, setImageCrop] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

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

    const handleRegister = async () => {
        const result = caregiverDetailsSchema.safeParse({ documents })
        if (!result.success) {
            const message = result.error.issues[0].message
            toast.error(message)
            return
        }

        if (!user?.email) {
            toast.error('User email not found')
            return
        }

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('email', user.email)

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

            const res = await createCaregiverProfile(formData)

            const data = res

            if (!data.success) {
                throw new Error(data.message || 'Failed to submit documents')
            }

            toast.success('Documents submitted successfully')

            const profile = await getCurrentUser()
            setAuth({
                ...user,
                ...profile.data,
                isProfileComplete: true,
            })

            navigate('/caregiver/dashboard')
        } catch (error: unknown) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <FormWrapper
            maxWidth="720px"
            title="Complete Your Profile"
            description="Please upload the required documents to complete your registration."
        >
            <div className={styles.gridContainer}>
                <Card
                    title="Government ID"
                    description="Upload a clear photo of your Passport, Driver's License, or National ID Card."
                >
                    <FileUploadBox
                        accept="image/jpeg,image/png,image/jpeg,application/pdf"
                        file={documents.govId}
                        onFileSelect={(file) => {
                            setDocuments((prev) => ({
                                ...prev,
                                govId: file,
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
                            setDocuments((prev) => ({
                                ...prev,
                                certificate: {
                                    ...prev.certificate,
                                    number: e.target.value.toUpperCase(),
                                },
                            }))
                        }}
                    />
                    <FileUploadBox
                        accept="image/jpeg,image/png,image/jpeg,application/pdf"
                        file={documents.certificate.document}
                        onFileSelect={(file) => {
                            setDocuments((prev) => ({
                                ...prev,
                                certificate: {
                                    ...prev.certificate,
                                    document: file,
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
                            setDocuments((prev) => ({
                                ...prev,
                                license: {
                                    ...prev.license,
                                    number: e.target.value.toUpperCase(),
                                },
                            }))
                        }}
                    />
                    <FileUploadBox
                        accept="image/jpeg,image/png,image/jpeg,application/pdf"
                        file={documents.license.document}
                        onFileSelect={(file) => {
                            setDocuments((prev) => ({
                                ...prev,
                                license: {
                                    ...prev.license,
                                    document: file,
                                },
                            }))
                        }}
                    />
                </Card>
            </div>

            <Button type="button" onClick={handleRegister} disabled={isUploading}>
                {isUploading ? 'Submitting...' : 'Submit Documents'}
            </Button>

            {imageCrop && (
                <ImageCropper
                    image={imageCrop}
                    onCropComplete={(file) => {
                        setDocuments((prev) => ({
                            ...prev,
                            profileImage: file,
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
