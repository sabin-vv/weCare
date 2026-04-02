import { useState } from 'react'
import toast from 'react-hot-toast'

import { doctorRegister, presignUpload, uploadToS3 } from '../api/auth.api'
import FileUploadBox from '../components/FileUploadBox'
import FormNavigationButtons from '../components/FormNavigationButtons '
import ProgressBar from '../components/ProgressBar'
import type { DoctorDetailsFormProps } from '../types/auth.types'
import { doctorDetailesSchema } from '../validator/register.schema'

import styles from './DoctorDetailsForm.module.css'

import Card from '@/shared/components/Card/Card'
import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import ImageCropper from '@/shared/components/ImageCropper/ImageCropper'
import InputField from '@/shared/components/InputField/InputField'
import { getErrorMessage } from '@/utils/getErrorMessage'

const DoctorDetailsForm = ({
    prevStep,
    nextStep,
    documents,
    specializations,
    registerData,
    setRegisterData,
}: DoctorDetailsFormProps) => {
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

    const handleChange = (index: number, value: string) => {
        setRegisterData((prev) => {
            const updated = [...prev.specializations]
            updated[index].name = value
            return {
                ...prev,
                specializations: updated,
            }
        })
    }
    const addSpecialization = () => {
        setRegisterData((prev) => ({
            ...prev,
            specializations: [...prev.specializations, { name: '', document: null }],
        }))
    }

    const removeSpecialization = (index: number) => {
        setRegisterData((prev) => ({
            ...prev,
            specializations: prev.specializations.filter((_, i) => i !== index),
        }))
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
            const formData = new FormData()
            formData.append('name', registerData.basicInfo.name)
            formData.append('email', registerData.basicInfo.email)
            formData.append('mobile', registerData.basicInfo.mobile)
            formData.append('password', registerData.basicInfo.password)
            formData.append('confirmPassword', registerData.basicInfo.confirmPassword)

            if (documents.govId) {
                const govIdKey = await uploadFileToS3(documents.govId, 'documents/govId')
                formData.append('govIdImage', govIdKey)
            }

            if (documents.profileImage) {
                const profileImageKey = await uploadFileToS3(documents.profileImage, 'documents/profileImage')
                formData.append('profileImage', profileImageKey)
            }

            formData.append('medicalCertificateNumber', documents.medicalCertificate.number)
            if (documents.medicalCertificate.document) {
                const certKey = await uploadFileToS3(
                    documents.medicalCertificate.document,
                    'documents/medicalCertificate',
                )
                formData.append('medicalCertificateImage', certKey)
            }

            formData.append('medicalCouncilRegisterNumber', documents.councilRegistration.number)
            if (documents.councilRegistration.document) {
                const councilKey = await uploadFileToS3(
                    documents.councilRegistration.document,
                    'documents/medicalCouncil',
                )
                formData.append('medicalCouncilImage', councilKey)
            }

            const specializationKeys: (string | null)[] = []
            for (let i = 0; i < specializations.length; i++) {
                const spec = specializations[i]
                if (spec.document) {
                    const specKey = await uploadFileToS3(spec.document, `documents/specializations`)
                    specializationKeys.push(specKey)
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

            const response = await doctorRegister(formData)
            toast.success(response.message || 'Registration submitted successfully')
            nextStep()
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
            <ProgressBar step={3} totalSteps={4} title="Professional information" percentage={75} />
            <div className={styles.gridContainer}>
                <Card
                    title="Government Issued ID"
                    description="Upload a clear photo of your Passport, Driver's License, or National ID Card."
                >
                    <FileUploadBox
                        file={documents.govId}
                        accept="image/png,image/jpeg,application/pdf"
                        onFileSelect={(file) =>
                            setRegisterData((prev) => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    govId: file,
                                },
                            }))
                        }
                    />
                </Card>
                <Card
                    title="Profile Image"
                    description="Upload a clear, front-facing photo of yourself for your professional profile."
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
                >
                    <InputField
                        type="text"
                        placeholder="Enter Medical certificate number"
                        value={documents.medicalCertificate.number}
                        onChange={(e) =>
                            setRegisterData((prev) => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    medicalCertificate: {
                                        ...prev.documents.medicalCertificate,
                                        number: e.target.value.toUpperCase(),
                                    },
                                },
                            }))
                        }
                    />
                    <FileUploadBox
                        file={documents.medicalCertificate.document}
                        accept="image/png,image/jpeg,application/pdf"
                        onFileSelect={(file) =>
                            setRegisterData((prev) => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    medicalCertificate: {
                                        ...prev.documents.medicalCertificate,
                                        document: file,
                                    },
                                },
                            }))
                        }
                    />
                </Card>
                <Card
                    title="Medical Council Registration"
                    description="Verification of your medical council registration is valid."
                >
                    <InputField
                        type="text"
                        placeholder="Enter Medical council Reg. number"
                        value={documents.councilRegistration.number}
                        onChange={(e) =>
                            setRegisterData((prev) => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    councilRegistration: {
                                        ...prev.documents.councilRegistration,
                                        number: e.target.value.toUpperCase(),
                                    },
                                },
                            }))
                        }
                    />

                    <FileUploadBox
                        file={documents.councilRegistration.document}
                        accept="image/png,image/jpeg,application/pdf"
                        onFileSelect={(file) =>
                            setRegisterData((prev) => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    councilRegistration: {
                                        ...prev.documents.councilRegistration,
                                        document: file,
                                    },
                                },
                            }))
                        }
                    />
                </Card>
            </div>

            <h3 className={styles.sectionTitle}>Specializations</h3>
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
                            file={item.document}
                            accept="image/png,image/jpeg,application/pdf"
                            onFileSelect={(file) =>
                                setRegisterData((prev) => {
                                    const updated = [...prev.specializations]
                                    updated[index].document = file
                                    return {
                                        ...prev,
                                        specializations: updated,
                                    }
                                })
                            }
                        />
                    </div>
                ))}
            </div>

            <button className={styles.addSpecializationButton} onClick={addSpecialization}>
                + Add Specialization
            </button>
            <div className={styles.navigationButton}>
                <FormNavigationButtons
                    backLabel="Back"
                    nextLabel="Register"
                    onBack={prevStep}
                    onNext={handleRegister}
                    isLoading={isUploading}
                />
            </div>
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

export default DoctorDetailsForm
