import { useState } from 'react'
import toast from 'react-hot-toast'

import FileUplodBox from '../../components/FileUploadBox'
import ProfessionalButtons from '../../components/ProfessionalButtons'
import ProgressBar from '../../components/ProgressBar'
import VerificationCard from '../../components/VerificationCard'
import { doctorStepThreeSchema } from '../../schemas/doctorStepThreeSchme'
import { doctorRegister } from '../../services/auth.service'
import type { StepThreeProps } from '../../types/auth.types'

import styles from './DoctorStepThree.module.css'

import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'
import ImageCropper from '@/shared/components/ImageCropper/ImageCropper'
import { getErrorMessage } from '@/utils/getErrorMessage'

const DoctorStepThree = ({
    prevStep,
    nextStep,
    documents,
    specializations,
    registerData,
    setRegisterData,
}: StepThreeProps) => {
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
        const result = doctorStepThreeSchema.safeParse({ specializations, documents })
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

            const result = await doctorRegister(formData)

            toast.success(result.message)
            localStorage.removeItem('doctorRegister')
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
                <VerificationCard
                    title="Government Issued ID"
                    description="Upload a clear photo of your Passport, Driver's License, or National ID Card."
                >
                    <FileUplodBox
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
                </VerificationCard>
                <VerificationCard
                    title="Profile Image"
                    description="Upload a clear, front-facing photo of yourself for your professional profile."
                >
                    <FileUplodBox
                        file={documents.profileImage}
                        accept="image/png,image/jpeg"
                        onFileSelect={(file) => {
                            const imageUrl = URL.createObjectURL(file)
                            setImageCrop(imageUrl)
                        }}
                    />
                </VerificationCard>
                <VerificationCard
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
                                        number: e.target.value,
                                    },
                                },
                            }))
                        }
                        className={styles.documentInput}
                    />
                    <FileUplodBox
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
                </VerificationCard>
                <VerificationCard
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
                                        number: e.target.value,
                                    },
                                },
                            }))
                        }
                        className={styles.documentInput}
                    />

                    <FileUplodBox
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
                </VerificationCard>
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
                        <FileUplodBox
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
                <ProfessionalButtons backLabel="Back" nextLabel="Register" onBack={prevStep} onNext={handleRegister} />
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

export default DoctorStepThree
