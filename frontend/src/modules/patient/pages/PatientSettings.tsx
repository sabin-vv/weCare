import { Camera, Pencil } from 'lucide-react'
import { useEffect, useState, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'

import styles from './PatientSettings.module.css'

import {
    changePassword,
    getCurrentUser,
    presignUpload,
    sendOtp,
    uploadToS3,
    verifyOtp,
} from '@/modules/auth/api/auth.api'
import OtpVerification from '@/modules/auth/components/OtpVerification'
import { OtpPurpose } from '@/modules/auth/types/auth.types'
import DoctorSecuritySection from '@/modules/doctor/form/settings/DoctorSecuritySection'
import DoctorSettingsActions from '@/modules/doctor/form/settings/DoctorSettingsActions'
import { getPatientProfile, updatePatientProfile } from '@/modules/patient/api/patient.api'
import type { PatientProfileData } from '@/modules/patient/types/patient.types'
import ChangePasswordForm from '@/shared/components/ChangePasswordForm'
import ImageCropper from '@/shared/components/ImageCropper/ImageCropper'
import InputField from '@/shared/components/InputField/InputField'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Modal from '@/shared/components/Modal/Modal'
import { Section } from '@/shared/components/Section/Section'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

type PatientSettingsForm = {
    name: string
    email: string
    mobile: string
    dateOfBirth: string
    gender: string
}

const emptyForm: PatientSettingsForm = {
    name: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    gender: '',
}

const PatientSettings = () => {
    const { user, setAuth } = useAuth()
    const [patientProfile, setPatientProfile] = useState<PatientProfileData | null>(null)

    const [isEditing, setIsEditing] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)

    const [isSaving, setIsSaving] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [imageCrop, setImageCrop] = useState<string | null>(null)
    const [isUploadingImage, setIsUploadingImage] = useState(false)

    const [showEmailOtpModal, setShowEmailOtpModal] = useState(false)
    const [pendingEmail, setPendingEmail] = useState('')
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
    const [otpSent, setOtpSent] = useState(false)

    const [isLoadingProfile, setIsLoadingProfile] = useState(false)
    const [savedState, setSavedState] = useState<PatientSettingsForm>(emptyForm)
    const [form, setForm] = useState<PatientSettingsForm>(emptyForm)

    useEffect(() => {
        const loadPatientProfile = async () => {
            setIsLoadingProfile(true)
            try {
                const profile = await getPatientProfile()
                setPatientProfile(profile)

                const initialForm: PatientSettingsForm = {
                    name: profile.name,
                    email: profile.email,
                    mobile: profile.mobile,
                    dateOfBirth: profile.dateOfBirth.split('T')[0] || '',
                    gender: profile.gender,
                }

                setForm(initialForm)
                setSavedState(initialForm)
            } catch (error) {
                toast.error(getErrorMessage(error))
            } finally {
                setIsLoadingProfile(false)
            }
        }

        loadPatientProfile()
    }, [])

    useEffect(() => {
        const hasChanges = JSON.stringify(form) !== JSON.stringify(savedState)
        setHasChanges(hasChanges)
    }, [form, savedState])

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

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleToggleEditing = () => {
        setIsEditing(!isEditing)
    }

    const handleSave = () => {
        const emailChanged = form.email !== savedState.email

        if (emailChanged) {
            toast('Please verify your new email')
            setPendingEmail(form.email)
            setShowEmailOtpModal(true)
            return
        }

        saveProfile()
    }

    const saveProfile = async () => {
        setIsSaving(true)
        try {
            const updatedProfile = await updatePatientProfile({
                name: form.name,
                email: form.email,
                mobile: form.mobile,
            })

            const updatedForm: PatientSettingsForm = {
                name: updatedProfile.name,
                email: updatedProfile.email,
                mobile: updatedProfile.mobile,
                dateOfBirth: updatedProfile.dateOfBirth.split('T')[0] || '',
                gender: updatedProfile.gender,
            }

            setPatientProfile(updatedProfile)
            setForm(updatedForm)
            setSavedState(updatedForm)
            setIsEditing(false)

            if (user) {
                setAuth({
                    ...user,
                    name: updatedProfile.name,
                    email: updatedProfile.email,
                    mobile: updatedProfile.mobile,
                })
            }

            toast.success('Patient profile updated successfully')
        } catch (error) {
            toast.error(getErrorMessage(error))
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

    const handleDiscard = () => {
        setForm({ ...savedState })
        setHasChanges(false)
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

    const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) {
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setImageCrop(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleCropComplete = async (croppedFile: File) => {
        setImageCrop(null)
        setIsUploadingImage(true)
        const toastId = toast.loading('Uploading profile image...')

        try {
            const presignRes = await presignUpload({
                fileName: croppedFile.name,
                contentType: croppedFile.type as 'image/png' | 'image/jpeg',
                folder: 'documents/patientProfile',
                size: croppedFile.size,
            })

            await uploadToS3(presignRes.uploadUrl, croppedFile)

            const updatedProfile = await updatePatientProfile({
                profileImage: presignRes.key,
            })

            setPatientProfile(updatedProfile)

            const currentUser = await getCurrentUser()
            if (user) {
                setAuth({
                    ...user,
                    profileImage: currentUser.data.profileImage,
                })
            }

            toast.success('Profile image updated successfully', { id: toastId })
        } catch (error) {
            toast.error(getErrorMessage(error), { id: toastId })
        } finally {
            setIsUploadingImage(false)
        }
    }

    const profileImageSrc = patientProfile?.profileImage || user?.profileImage
    const resolvedProfileImage =
        profileImageSrc && !profileImageSrc.startsWith('http')
            ? `${import.meta.env.VITE_S3_BASE_URL}${profileImageSrc}`
            : profileImageSrc

    return (
        <MainWrapper>
            <h2 className={styles.title}>Settings</h2>
            <div className={styles.profileCard}>
                <div className={styles.left}>
                    <div className={styles.avatarWrap}>
                        <input
                            type="file"
                            id="patientProfileImageInput"
                            accept="image/*"
                            hidden
                            onChange={handleImageSelect}
                        />

                        {resolvedProfileImage ? (
                            <img
                                src={resolvedProfileImage}
                                className={styles.avatar}
                                alt={form.name || 'Patient profile'}
                            />
                        ) : (
                            <div className={styles.avatarFallback}>
                                {(form.name || user?.name || 'P').charAt(0).toUpperCase()}
                            </div>
                        )}

                        <label
                            htmlFor="patientProfileImageInput"
                            className={`${styles.avatarBadge} ${isUploadingImage ? styles.uploading : ''}`}
                        >
                            <Camera size={14} />
                        </label>
                    </div>
                    <div>
                        <h3 className={styles.name}>{savedState.name || user?.name}</h3>

                        <p className={styles.conditions}>
                            Conditions:{' '}
                            {patientProfile?.conditions?.length
                                ? patientProfile.conditions.join(', ')
                                : 'No conditions'}
                        </p>
                    </div>
                </div>

                <div className={styles.right}>
                    <span className={styles.label}>Patient ID</span>
                    <p className={styles.patientId}>
                        {patientProfile?.patientId ? `#${patientProfile.patientId}` : '--'}
                    </p>
                </div>
            </div>

            <Section
                title="Profile Information"
                actions={
                    <button
                        type="button"
                        className={`${styles.editButton} ${isEditing ? styles.editButtonActive : ''}`}
                        onClick={handleToggleEditing}
                        aria-label="Toggle personal information editing"
                    >
                        <Pencil size={16} />
                    </button>
                }
            >
                <div className={styles.grid}>
                    <InputField
                        name="name"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                    <InputField
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                    <InputField
                        name="mobile"
                        placeholder="Phone Number"
                        value={form.mobile}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                    <InputField
                        name="dateOfBirth"
                        type="date"
                        placeholder="Date of Birth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        disabled
                    />
                    <InputField
                        name="gender"
                        placeholder="gender"
                        value={form.gender}
                        onChange={handleChange}
                        disabled
                    />
                </div>
            </Section>
            <DoctorSecuritySection onResetPassword={handleResetPassword} />

            <DoctorSettingsActions
                hasChanges={hasChanges}
                isSaving={isSaving}
                isLoadingProfile={isLoadingProfile}
                onDiscard={handleDiscard}
                onSave={handleSave}
            />

            <ChangePasswordForm
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSubmit={handleChangePassword}
                isLoading={isChangingPassword}
            />

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

            {imageCrop && (
                <ImageCropper
                    image={imageCrop}
                    onCropComplete={handleCropComplete}
                    onClose={() => setImageCrop(null)}
                />
            )}
        </MainWrapper>
    )
}

export default PatientSettings
