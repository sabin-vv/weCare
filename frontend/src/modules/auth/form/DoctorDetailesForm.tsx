import { useState } from 'react'
import toast from 'react-hot-toast'

import FileUploadBox from '../components/FileUploadBox'
import FormNavigationButtons from '../components/FormNavigationButtons '
import ProgressBar from '../components/ProgressBar'
import Card from '@/shared/components/Card/Card'

import styles from './DoctorDetailsForm.module.css'

import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import ImageCropper from '@/shared/components/ImageCropper/ImageCropper'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { DoctorDetailsFormProps } from '../types/auth.types'
import { doctorDetailesSchema } from '../validator/register.schema'
import { doctorRegister } from '../api/auth.api'

const DoctorDetailsForm = ({
    prevStep,
    nextStep,
    documents,
    specializations,
    registerData,
    setRegisterData,
}: DoctorDetailsFormProps) => {
    const [imageCrop, setImageCrop] = useState<string | null>(null)
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
        try {
            const formData = new FormData()
            formData.append('name', registerData.basicInfo.name)
            formData.append('email', registerData.basicInfo.email)
            formData.append('mobile', registerData.basicInfo.mobile)
            formData.append('password', registerData.basicInfo.password)
            formData.append('confirmPassword', registerData.basicInfo.confirmPassword)

            formData.append('govId', documents.govId!)
            formData.append('profileImage', documents.profileImage!)

            formData.append('medicalCertificateNumber', documents.medicalCertificate.number)
            formData.append('medicalCertificateImage', documents.medicalCertificate.document!)
            formData.append('medicalCouncilRegisterNumber', documents.councilRegistration.number)
            formData.append('medicalCouncilImage', documents.councilRegistration.document!)

            formData.append(
                'specializations',
                JSON.stringify(
                    specializations.map((s) => ({
                        name: s.name,
                    })),
                ),
            )
            specializations.forEach((spec, index) => {
                if (spec.document) formData.append(`specializationDocument${index}`, spec.document)
            })

            const response = await doctorRegister(formData)
            toast.success(response.message || 'Registration submitted successfully')
            nextStep()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error))
            return
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
                    <input
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
                        className={styles.documentInput}
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
                    <input
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
                        className={styles.documentInput}
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
                            <input
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
