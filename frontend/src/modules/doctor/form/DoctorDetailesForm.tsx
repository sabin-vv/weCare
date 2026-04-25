import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { getCurrentUser, presignUpload, uploadToS3 } from '../../auth/api/auth.api'
import FileUploadBox from '../../auth/components/FileUploadBox'
import { doctorDetailesSchema } from '../../auth/validator/register.schema'
import { updateProfile } from '../api/doctor.api'
import type { DoctorDocuments, Specializations } from '../types/doctor.types'

import styles from './DoctorDetailsForm.module.css'

import { env } from '@/config/env'
import Button from '@/shared/components/Button/Button'
import Card from '@/shared/components/Card/Card'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import ImageCropper from '@/shared/components/ImageCropper/ImageCropper'
import InputField from '@/shared/components/InputField/InputField'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

export interface DoctorDetailsProps {
    document?: DoctorDocuments
    specialization?: Specializations[]
}
const DoctorDetailsForm = ({ document, specialization }: DoctorDetailsProps) => {
    const { user, setAuth } = useAuth()
    const [documents, setDocuments] = useState<DoctorDocuments>({
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
    })
    const [specializations, setSpecializations] = useState<Specializations[]>([{ name: '', documentImage: null }])
    const [imageCrop, setImageCrop] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (document) {
            setDocuments((prev) => ({
                ...prev,
                govId: document.govId,
                profileImage: document.profileImage,
                medicalCertificate: {
                    number: document.medicalCertificate?.number,
                    document: document.medicalCertificate?.document,
                },
                councilRegistration: {
                    number: document.councilRegistration?.number,
                    document: document.councilRegistration?.document,
                },
            }))
        }
        if (specialization) setSpecializations(specialization)
    }, [document, specialization])

    const getStoredFileKey = (value: string) => {
        const baseUrl = env.AWS_BASE_URL.replace(/\/$/, '')
        return value.startsWith(baseUrl) ? value.slice(baseUrl.length).replace(/^\/+/, '') : value
    }

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

    const handleChange = (index: number, value: string) => {
        setSpecializations((prev) => {
            const updated = [...prev]
            updated[index] = {
                ...updated[index],
                name: value,
            }
            return updated
        })
    }
    const addSpecialization = () => {
        setSpecializations((prev) => [...prev, { name: '', documentImage: null }])
    }

    const removeSpecialization = (index: number) => {
        setSpecializations((prev) => prev.filter((_, i) => i !== index))
    }

    const handleRegister = async () => {
        const result = doctorDetailesSchema.safeParse({ specializations, documents })

        if (!result.success) {
            const message = result.error.issues[0].message
            toast.error(message)
            return
        }
        setIsUploading(true)
        try {
            const hasExistingProfile = !!user?.isProfileComplete
            const formData = new FormData()

            if (documents.govId instanceof File) {
                const govIdKey = await uploadFileToS3(documents.govId, 'documents/govId')
                formData.append('govIdImage', govIdKey)
            } else if (typeof document?.govId === 'string') {
                formData.append('govIdImage', getStoredFileKey(document.govId))
            }

            if (documents.profileImage instanceof File) {
                const profileImageKey = await uploadFileToS3(documents.profileImage, 'documents/profileImage')
                formData.append('profileImage', profileImageKey)
            } else if (typeof document?.profileImage === 'string') {
                formData.append('profileImage', getStoredFileKey(document.profileImage))
            }

            formData.append('medicalCertificateNumber', documents.medicalCertificate.number)
            if (documents.medicalCertificate.document instanceof File) {
                const certKey = await uploadFileToS3(
                    documents.medicalCertificate.document,
                    'documents/medicalCertificate',
                )
                formData.append('medicalCertificateImage', certKey)
            } else if (typeof documents.medicalCertificate.document === 'string') {
                formData.append('medicalCertificateImage', getStoredFileKey(documents.medicalCertificate.document))
            } else if (typeof document?.medicalCertificate.document === 'string') {
                formData.append('medicalCertificateImage', getStoredFileKey(document.medicalCertificate.document))
            }

            formData.append('medicalCouncilRegisterNumber', documents.councilRegistration.number)
            if (documents.councilRegistration.document instanceof File) {
                const councilKey = await uploadFileToS3(
                    documents.councilRegistration.document,
                    'documents/medicalCouncil',
                )
                formData.append('medicalCouncilImage', councilKey)
            } else if (typeof documents.councilRegistration.document === 'string') {
                formData.append('medicalCouncilImage', getStoredFileKey(documents.councilRegistration.document))
            } else if (typeof document?.councilRegistration.document === 'string') {
                formData.append('medicalCouncilImage', getStoredFileKey(document.councilRegistration.document))
            }

            const specializationKeys: (string | null)[] = []
            for (let i = 0; i < specializations.length; i++) {
                const spec = specializations[i]
                if (spec.documentImage instanceof File) {
                    const specKey = await uploadFileToS3(spec.documentImage, `documents/specializations`)
                    specializationKeys.push(specKey)
                } else if (typeof spec.documentImage === 'string') {
                    specializationKeys.push(getStoredFileKey(spec.documentImage))
                } else {
                    specializationKeys.push(null)
                }
            }

            formData.append(
                'specializations',
                JSON.stringify(
                    specializations.map((s) => ({
                        name: s.name,
                    })),
                ),
            )

            if (specializationKeys.length > 0) {
                formData.append('specializationDocumentKeys', JSON.stringify(specializationKeys))
            }

            const response = await updateProfile(formData, hasExistingProfile)
            toast.success(response.message)
            const profile = await getCurrentUser()
            setAuth({
                ...user!,
                profileImage: profile.data.profileImage,
                professionalTitle: profile.data.professionalTitle,
                verificationStatus: profile.data.verificationStatus,
                isProfileComplete: true,
            })

            navigate('/doctor/dashboard')
        } catch (error: unknown) {
            toast.error(getErrorMessage(error))
            return
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <FormWrapper
            title="Verify Your Identity"
            description="Please upload clear copies of the following documents to continue"
            maxWidth="760px"
        >
            <div className={styles.gridContainer}>
                <Card
                    title="Government Issued ID"
                    description="Upload a clear photo of your Passport, Driver's License, or National ID Card."
                    required
                >
                    <FileUploadBox
                        file={documents.govId as File}
                        accept="image/png,image/jpeg,application/pdf"
                        onFileSelect={(file) =>
                            setDocuments((prev) => ({
                                ...prev,
                                govId: file,
                            }))
                        }
                    />
                </Card>
                <Card
                    title="Profile Image"
                    description="Upload a clear, front-facing photo of yourself for your professional profile."
                    required
                >
                    <FileUploadBox
                        file={documents.profileImage}
                        accept="image/png,image/jpeg"
                        onFileSelect={(file) => {
                            const imageUrl = URL.createObjectURL(file)
                            setImageCrop(imageUrl)
                        }}
                    />
                </Card>
                <Card
                    title="Medical Certificate"
                    description="Verification of your professional certificate is required for all doctors."
                    required
                >
                    <InputField
                        type="text"
                        placeholder="Enter Medical certificate number"
                        value={documents.medicalCertificate.number}
                        onChange={(e) =>
                            setDocuments((prev) => ({
                                ...prev,
                                medicalCertificate: {
                                    ...prev.medicalCertificate,
                                    number: e.target.value.toUpperCase(),
                                },
                            }))
                        }
                    />
                    <FileUploadBox
                        file={documents.medicalCertificate.document as File}
                        accept="image/png,image/jpeg,application/pdf"
                        onFileSelect={(file) =>
                            setDocuments((prev) => ({
                                ...prev,
                                medicalCertificate: {
                                    ...prev.medicalCertificate,
                                    document: file,
                                },
                            }))
                        }
                    />
                </Card>
                <Card
                    title="Medical Council Registration"
                    description="Verification of your medical council registration is valid."
                    required
                >
                    <InputField
                        type="text"
                        placeholder="Enter Medical council Reg. number"
                        value={documents.councilRegistration.number}
                        onChange={(e) =>
                            setDocuments((prev) => ({
                                ...prev,
                                councilRegistration: {
                                    ...prev.councilRegistration,
                                    number: e.target.value.toUpperCase(),
                                },
                            }))
                        }
                    />

                    <FileUploadBox
                        file={documents.councilRegistration.document as File}
                        accept="image/png,image/jpeg,application/pdf"
                        onFileSelect={(file) =>
                            setDocuments((prev) => ({
                                ...prev,
                                councilRegistration: {
                                    ...prev.councilRegistration,
                                    document: file,
                                },
                            }))
                        }
                    />
                </Card>
            </div>

            <Card title="Specializations" required>
                <div className={styles.specializationGrid}>
                    {specializations.map((item, index) => (
                        <div key={index} className={styles.specializationCard}>
                            <div className={styles.cardHeader}>
                                <InputField
                                    type="text"
                                    placeholder="Enter your specialization"
                                    value={item.name}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                />
                                {specializations.length > 1 && (
                                    <button
                                        type="button"
                                        className={styles.removeBtn}
                                        onClick={() => removeSpecialization(index)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <FileUploadBox
                                file={item.documentImage as File}
                                accept="image/png,image/jpeg,application/pdf"
                                onFileSelect={(file) =>
                                    setSpecializations((prev) => {
                                        const updated = [...prev]
                                        updated[index] = {
                                            ...updated[index],
                                            documentImage: file,
                                        }
                                        return updated
                                    })
                                }
                            />
                        </div>
                    ))}
                </div>
            </Card>

            <button className={styles.addSpecializationButton} onClick={addSpecialization}>
                + Add Specialization
            </button>
            <div className={styles.btnWrapper}>
                <Button disabled={isUploading} onClick={handleRegister}>
                    {isUploading
                        ? 'Uploading...'
                        : user?.verificationStatus === 'rejected'
                          ? 'Update Profile'
                          : 'Complete Profile'}
                </Button>
            </div>
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

export default DoctorDetailsForm
