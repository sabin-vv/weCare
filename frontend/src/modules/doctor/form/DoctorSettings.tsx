import { BadgeCheck, Camera, Pencil } from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'

import { getDoctorProfile } from '../api/doctor.api'
import Navbar from '../components/Navbar'
import type { DoctorProfile } from '../types/doctor.types'

import styles from './DoctorSettings.module.css'

import InputField from '@/shared/components/InputField/InputField'
import { Section } from '@/shared/components/Section/Section'
import { useAuth } from '@/shared/context/AuthContext'

type DoctorSettingsFormState = {
    fullName: string
    professionalTitle: string
    fee: string
    phoneNumber: string
    emailAddress: string
    medicalLicenseNumber: string
    medicalCouncilRegistrationNumber: string
    experienceCertificates: string
    isActive: boolean
}

const createFormState = (
    user?: {
        name?: string
        specialization?: string
        email?: string
    } | null,
): DoctorSettingsFormState => ({
    fullName: user?.name || 'Alex Rivers',
    professionalTitle: user?.specialization || 'Cardiologist',
    fee: '800',
    phoneNumber: '+1 (555) 123-4567',
    emailAddress: user?.email || 'surgery_dept@carecoord.com',
    medicalLicenseNumber: 'LIC-XXXX-3482',
    medicalCouncilRegistrationNumber: 'MC-XXXX-9284',
    experienceCertificates: '3 Uploaded',
    isActive: true,
})

const DoctorSettings = () => {
    const { user, setAuth } = useAuth()
    const initialState = useMemo(() => createFormState(user), [user])
    const [formState, setFormState] = useState<DoctorSettingsFormState>(initialState)
    const [savedState, setSavedState] = useState<DoctorSettingsFormState>(initialState)
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    useEffect(() => {
        setFormState(initialState)
        setSavedState(initialState)
    }, [initialState])

    useEffect(() => {
        const loadDoctorProfile = async () => {
            try {
                const profile = await getDoctorProfile()
                const nextState = mapDoctorProfileToFormState(profile)
                setFormState(nextState)
                setSavedState(nextState)
            } catch {
                toast.error('Failed to load doctor settings')
            } finally {
                setIsLoadingProfile(false)
            }
        }

        loadDoctorProfile()
    }, [])

    const hasChanges = JSON.stringify(formState) !== JSON.stringify(savedState)
    const profileImageUrl = user?.profileImage ? `${import.meta.env.VITE_S3_BASE_URL}${user.profileImage}` : ''

    const handleFieldChange = (field: keyof DoctorSettingsFormState) => (event: ChangeEvent<HTMLInputElement>) => {
        setFormState((current) => ({
            ...current,
            [field]: event.target.value,
        }))
    }

    const handleToggleStatus = () => {
        setFormState((current) => ({
            ...current,
            isActive: !current.isActive,
        }))
    }

    const handleDiscard = () => {
        setFormState(savedState)
        setIsEditingPersonalInfo(false)
        toast.success('Changes discarded')
    }

    const handleSave = async () => {
        setIsSaving(true)

        try {
            await new Promise((resolve) => setTimeout(resolve, 450))

            if (user) {
                setAuth({
                    ...user,
                    name: formState.fullName,
                    email: formState.emailAddress,
                    specialization: formState.professionalTitle,
                })
            }

            setSavedState(formState)
            setIsEditingPersonalInfo(false)
            toast.success('Doctor settings updated successfully')
        } finally {
            setIsSaving(false)
        }
    }

    const handleResetPassword = () => {
        toast.success('Password reset link sent to your email')
    }

    return (
        <div className={styles.page}>
            <Navbar />

            <div className={styles.container}>
                <div className={styles.stack}>
                    <section className={styles.profileCard}>
                        <div className={styles.profileMeta}>
                            <div className={styles.avatarWrap}>
                                {profileImageUrl ? (
                                    <img src={profileImageUrl} alt={formState.fullName} className={styles.avatar} />
                                ) : (
                                    <div className={styles.avatarFallback}>
                                        {formState.fullName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className={styles.avatarBadge}>
                                    <Camera size={12} />
                                </span>
                            </div>

                            <div>
                                <h1 className={styles.doctorName}>Dr. {formState.fullName}</h1>
                                <p className={styles.doctorMetaLine}>
                                    {formState.professionalTitle} • {formState.emailAddress}
                                </p>
                            </div>
                        </div>

                        <div className={styles.statusToggle}>
                            <button
                                type="button"
                                className={`${styles.switch} ${formState.isActive ? styles.switchOn : ''}`}
                                onClick={handleToggleStatus}
                                aria-label="Toggle doctor account status"
                                aria-pressed={formState.isActive}
                            >
                                <span className={styles.switchThumb} />
                            </button>
                            <span>{formState.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                    </section>

                    <Section
                        title="Personal Information"
                        actions={
                            <button
                                type="button"
                                className={styles.editButton}
                                onClick={() => setIsEditingPersonalInfo((current) => !current)}
                                aria-label="Toggle personal information editing"
                            >
                                <Pencil size={16} />
                            </button>
                        }
                    >
                        <div className={styles.formGrid}>
                            <div className={styles.fieldShell}>
                                <InputField
                                    id="doctor-full-name"
                                    label="Full Name"
                                    value={formState.fullName}
                                    onChange={handleFieldChange('fullName')}
                                    disabled={!isEditingPersonalInfo}
                                />
                            </div>

                            <div className={styles.fieldShell}>
                                <InputField
                                    id="doctor-title"
                                    label="Professional Title"
                                    value={formState.professionalTitle}
                                    onChange={handleFieldChange('professionalTitle')}
                                    disabled={!isEditingPersonalInfo}
                                />
                            </div>

                            <div className={styles.fieldShell}>
                                <InputField
                                    id="doctor-fee"
                                    label="Fee"
                                    value={formState.fee}
                                    onChange={handleFieldChange('fee')}
                                    prefix="₹"
                                    disabled={!isEditingPersonalInfo}
                                />
                            </div>

                            <div className={`${styles.fieldShell} ${styles.fullRow}`}>
                                <div className={styles.formGrid}>
                                    <div className={styles.fieldShell}>
                                        <InputField
                                            id="doctor-phone"
                                            label="Phone Number"
                                            value={formState.phoneNumber}
                                            onChange={handleFieldChange('phoneNumber')}
                                            disabled={!isEditingPersonalInfo}
                                        />
                                    </div>

                                    <div className={`${styles.fieldShell} ${styles.fullRow}`}>
                                        <InputField
                                            id="doctor-email"
                                            label="Email Address"
                                            value={formState.emailAddress}
                                            onChange={handleFieldChange('emailAddress')}
                                            disabled={!isEditingPersonalInfo}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.divider} />

                        <p className={styles.subSectionLabel}>Professional Registration</p>

                        <div className={styles.registrationGrid}>
                            <div className={styles.registrationItem}>
                                <h3>Medical License Number</h3>
                                <p>{formState.medicalLicenseNumber}</p>
                            </div>

                            <div className={styles.registrationItem}>
                                <h3>Medical Council Registration Number</h3>
                                <p>{formState.medicalCouncilRegistrationNumber}</p>
                            </div>

                            <div className={styles.registrationItem}>
                                <h3>Experience Certificates</h3>
                                <p className={styles.highlightValue}>{formState.experienceCertificates}</p>
                            </div>
                        </div>

                        <div className={styles.verifiedRow}>
                            <BadgeCheck size={14} />
                            <span>Verified</span>
                        </div>
                    </Section>

                    <Section title="Account Security">
                        <div className={styles.securityRow}>
                            <div>
                                <h3 className={styles.securityTitle}>Change Password</h3>
                                <p className={styles.securitySub}>Update your login credentials regularly</p>
                            </div>

                            <button type="button" className={styles.secondaryButton} onClick={handleResetPassword}>
                                Reset Password
                            </button>
                        </div>
                    </Section>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.ghostButton}
                            onClick={handleDiscard}
                            disabled={!hasChanges || isSaving || isLoadingProfile}
                        >
                            Discard
                        </button>
                        <button
                            type="button"
                            className={styles.saveButton}
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving || isLoadingProfile}
                        >
                            {isSaving ? 'Saving Changes...' : 'Save All Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const mapDoctorProfileToFormState = (profile: DoctorProfile): DoctorSettingsFormState => ({
    fullName: profile.fullName,
    professionalTitle: profile.professionalTitle || 'Doctor',
    fee: String(profile.consultationFee ?? 0),
    phoneNumber: profile.phoneNumber,
    emailAddress: profile.email,
    medicalLicenseNumber: profile.medicalLicenseNumber,
    medicalCouncilRegistrationNumber: profile.medicalCouncilRegistrationNumber,
    experienceCertificates: `${profile.experienceCertificatesCount} Uploaded`,
    isActive: profile.isActive,
})

export default DoctorSettings
