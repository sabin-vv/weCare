import { AlertCircle, BadgeCheck, Camera, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'

import { getCaregiverProfile, updateCaregiverProfile } from '../api/caregiver.api'

import styles from './CaregiverSettingsForm.module.css'

import { changePassword, sendOtp, verifyOtp } from '@/modules/auth/api/auth.api'
import OtpVerification from '@/modules/auth/components/OtpVerification'
import { OtpPurpose } from '@/modules/auth/types/auth.types'
import ChangePasswordForm from '@/shared/components/ChangePasswordForm'
import Modal from '@/shared/components/Modal/Modal'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

interface CaregiverSettingsFormState {
    fullName: string
    email: string
    phoneNumber: string
    certificateNumber: string
    licenseNumber: string
    isActive: boolean
    verificationStatus: 'pending' | 'verified' | 'rejected'
}

const createFormState = (user?: { name?: string; email?: string } | null): CaregiverSettingsFormState => ({
    fullName: user?.name || '',
    email: user?.email || '',
    phoneNumber: '',
    certificateNumber: '',
    licenseNumber: '',
    isActive: true,
    verificationStatus: 'pending',
})

const CaregiverSettingsForm = () => {
    const { user, setAuth } = useAuth()
    const initialState = useMemo(() => createFormState(user), [user])
    const [formState, setFormState] = useState<CaregiverSettingsFormState>(initialState)
    const [savedState, setSavedState] = useState<CaregiverSettingsFormState>(initialState)
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    const [showEmailOtpModal, setShowEmailOtpModal] = useState(false)
    const [pendingEmail, setPendingEmail] = useState('')
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
    const [otpSent, setOtpSent] = useState(false)

    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    useEffect(() => {
        if (!showEmailOtpModal || !pendingEmail || otpSent) return

        const send = async () => {
            try {
                await sendOtp(pendingEmail, OtpPurpose.REGISTER)
                setOtpSent(true)
            } catch (error) {
                toast.error(getErrorMessage(error))
            }
        }

        send()
    }, [showEmailOtpModal, pendingEmail, otpSent])

    useEffect(() => {
        const loadCaregiverProfile = async () => {
            try {
                const profile = await getCaregiverProfile()
                const data = profile.data || profile
                const formStateData: CaregiverSettingsFormState = {
                    fullName: data?.fullName || user?.name || '',
                    email: data?.email || user?.email || '',
                    phoneNumber: data?.phoneNumber || '',
                    certificateNumber: data?.certificateNumber || '',
                    licenseNumber: data?.licenseNumber || '',
                    isActive: data?.isActive ?? true,
                    verificationStatus: data?.verificationStatus || 'pending',
                }
                setFormState(formStateData)
                setSavedState(formStateData)
            } catch (error) {
                console.error('Failed to load caregiver settings:', error)
                setFormState({
                    fullName: user?.name || '',
                    email: user?.email || '',
                    phoneNumber: '',
                    certificateNumber: '',
                    licenseNumber: '',
                    isActive: true,
                    verificationStatus: 'pending',
                })
            } finally {
                setIsLoadingProfile(false)
            }
        }

        loadCaregiverProfile()
    }, [])

    const hasChanges = JSON.stringify(formState) !== JSON.stringify(savedState)
    const profileImageUrl = user?.profileImage ? `${import.meta.env.VITE_S3_BASE_URL}${user.profileImage}` : ''

    const handleFieldChange = (field: keyof CaregiverSettingsFormState) => (event: ChangeEvent<HTMLInputElement>) => {
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
        const emailChanged = formState.email !== savedState.email

        if (emailChanged) {
            toast('Please verify your new email')
            setPendingEmail(formState.email)
            setShowEmailOtpModal(true)
            return
        }

        await saveProfile()
    }

    const saveProfile = async () => {
        setIsSaving(true)

        try {
            const updatedProfile = await updateCaregiverProfile({
                fullName: formState.fullName,
                phoneNumber: formState.phoneNumber,
                email: formState.email,
                isActive: formState.isActive,
            })

            if (user) {
                setAuth({
                    ...user,
                    name: formState.fullName,
                    email: formState.email,
                })
            }

            const responseData = updatedProfile.data || updatedProfile
            const formStateData: CaregiverSettingsFormState = {
                fullName: responseData?.fullName || formState.fullName,
                email: responseData?.email || formState.email,
                phoneNumber: responseData?.phoneNumber || formState.phoneNumber,
                certificateNumber: responseData?.certificateNumber || formState.certificateNumber,
                licenseNumber: responseData?.licenseNumber || formState.licenseNumber,
                isActive: responseData?.isActive ?? formState.isActive,
                verificationStatus: responseData?.verificationStatus || formState.verificationStatus,
            }
            setSavedState(formStateData)
            setFormState(formStateData)
            setIsEditingPersonalInfo(false)
            toast.success('Caregiver settings updated successfully')
        } catch {
            toast.error('Failed to update caregiver settings')
        } finally {
            setIsSaving(false)
        }
    }

    const handleVerifyEmailOtp = async (otp: string) => {
        setIsVerifyingEmail(true)
        try {
            await verifyOtp(pendingEmail, otp)
            setShowEmailOtpModal(false)
            await saveProfile()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsVerifyingEmail(false)
        }
    }

    const handleResendEmailOtp = async () => {
        try {
            await sendOtp(pendingEmail, OtpPurpose.REGISTER)
            toast.success('Verification code sent')
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleResetPassword = () => {
        setShowPasswordModal(true)
    }

    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        setIsChangingPassword(true)
        try {
            await changePassword(currentPassword, newPassword)
            toast.success('Password changed successfully')
            setShowPasswordModal(false)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsChangingPassword(false)
        }
    }

    if (isLoadingProfile) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingCard}>
                    <p className={styles.loadingText}>Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.stack}>
                <div className={styles.profileCard}>
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
                            <h1 className={styles.profileName}>{savedState.fullName}</h1>
                            <p className={styles.profileEmail}>{savedState.email}</p>
                            <span
                                className={`${styles.statusBadge} ${savedState.isActive ? styles.activeBadge : styles.inactiveBadge}`}
                            >
                                {savedState.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    <div className={styles.statusToggle}>
                        <button
                            type="button"
                            className={`${styles.switch} ${formState.isActive ? styles.switchOn : ''}`}
                            onClick={handleToggleStatus}
                            aria-label="Toggle caregiver account status"
                            aria-pressed={formState.isActive}
                        >
                            <span className={styles.switchThumb} />
                        </button>
                        <span>{formState.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Personal Information</h3>
                        <button
                            className={styles.editButton}
                            onClick={() => setIsEditingPersonalInfo((current) => !current)}
                        >
                            {isEditingPersonalInfo ? 'Cancel' : 'Edit'}
                        </button>
                    </div>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Full Name</label>
                            <input
                                type="text"
                                value={formState.fullName}
                                onChange={handleFieldChange('fullName')}
                                disabled={!isEditingPersonalInfo}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <input
                                type="email"
                                value={formState.email}
                                onChange={handleFieldChange('email')}
                                disabled={!isEditingPersonalInfo}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Phone Number</label>
                            <input
                                type="tel"
                                value={formState.phoneNumber}
                                onChange={handleFieldChange('phoneNumber')}
                                disabled={!isEditingPersonalInfo}
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Professional Information</h3>
                    </div>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Certificate Number</label>
                            <input
                                type="text"
                                value={formState.certificateNumber}
                                disabled
                                className={`${styles.input} ${styles.readOnly}`}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>License Number</label>
                            <input
                                type="text"
                                value={formState.licenseNumber}
                                disabled
                                className={`${styles.input} ${styles.readOnly}`}
                            />
                        </div>
                    </div>

                    {formState.verificationStatus === 'verified' && (
                        <div className={styles.verifiedRow}>
                            <BadgeCheck size={14} />
                            <span>Verified</span>
                        </div>
                    )}

                    {formState.verificationStatus === 'pending' && (
                        <div className={styles.pendingRow}>
                            <AlertCircle size={14} />
                            <span> Pending</span>
                        </div>
                    )}

                    {formState.verificationStatus === 'rejected' && (
                        <div className={styles.rejectedRow}>
                            <XCircle size={14} />
                            <span> Rejected</span>
                        </div>
                    )}
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Account Security</h3>
                    </div>
                    <div className={styles.securityRow}>
                        <div>
                            <h3 className={styles.securityTitle}>Change Password</h3>
                            <p className={styles.securitySub}>Update your login credentials regularly</p>
                        </div>

                        <button type="button" className={styles.secondaryButton} onClick={handleResetPassword}>
                            update
                        </button>
                    </div>
                </div>

                {hasChanges && (
                    <div className={styles.actions}>
                        <button className={styles.discardButton} onClick={handleDiscard} disabled={isSaving}>
                            Discard Changes
                        </button>
                        <button className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {showEmailOtpModal && (
                <Modal
                    isOpen={showEmailOtpModal}
                    onClose={() => {
                        setShowEmailOtpModal(false)
                        setOtpSent(false)
                    }}
                    title=""
                >
                    <OtpVerification
                        email={pendingEmail}
                        onVerify={handleVerifyEmailOtp}
                        onResend={handleResendEmailOtp}
                        onBack={() => setShowEmailOtpModal(false)}
                        loading={isVerifyingEmail}
                    />
                </Modal>
            )}

            <ChangePasswordForm
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSubmit={handleChangePassword}
                isLoading={isChangingPassword}
            />
        </div>
    )
}

export default CaregiverSettingsForm
