import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'

import { updateDoctorProfile } from '../api/doctor.api'
import { getDoctorProfile } from '../api/doctor.api'
import type { DoctorSettingsFormState } from '../types/doctor.types'

import styles from './DoctorSettingsForm.module.css'
import DoctorPersonalInfoSection from './settings/DoctorPersonalInfoSection'
import DoctorRegistrationSection from './settings/DoctorRegistrationSection'
import DoctorSecuritySection from './settings/DoctorSecuritySection'
import DoctorSettingsActions from './settings/DoctorSettingsActions'
import DoctorSettingsProfileCard from './settings/DoctorSettingsProfileCard'

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
import ChangePasswordForm from '@/shared/components/ChangePasswordForm'
import ImageCropper from '@/shared/components/ImageCropper/ImageCropper'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Modal from '@/shared/components/Modal/Modal'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const createFormState = (
    user?: {
        name?: string
        specialization?: string
        email?: string
        mobile?: string
    } | null,
): DoctorSettingsFormState => ({
    name: user?.name || '',
    mobile: user?.mobile || '',
    consultationFee: '',
    email: user?.email || '',
    medicalCertificateNumber: '',
    medicalCouncilRegistrationNumber: '',
    isActive: true,
})

const DoctorSettingsForm = () => {
    const { user, setAuth } = useAuth()
    const initialState = useMemo(() => createFormState(user), [user])
    const [formState, setFormState] = useState<DoctorSettingsFormState>(initialState)
    const [savedState, setSavedState] = useState<DoctorSettingsFormState>(initialState)
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    const [showEmailOtpModal, setShowEmailOtpModal] = useState(false)
    const [pendingEmail, setPendingEmail] = useState('')
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
    const [otpSent, setOtpSent] = useState(false)

    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    const [imageCrop, setImageCrop] = useState<string | null>(null)
    const [isUploadingImage, setIsUploadingImage] = useState(false)

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
        const loadDoctorProfile = async () => {
            try {
                const profile = await getDoctorProfile()

                const formStateData = {
                    name: profile.name,
                    mobile: profile.mobile,
                    email: profile.email,

                    consultationFee: String(profile.consultationFee || 0),
                    medicalCertificateNumber: profile.medicalCertificateNumber,
                    medicalCertificateImage: profile.medicalCertificateImage,
                    medicalCouncilRegistrationNumber: profile.medicalCouncilRegistrationNumber,
                    medicalCouncilImage: profile.medicalCouncilImage,
                    specialization: profile.specialization,

                    isActive: profile.isActive,
                }
                setFormState(formStateData)
                setSavedState(formStateData)
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
            const updatedProfile = await updateDoctorProfile({
                name: formState.name,
                consultationFee: Number(formState.consultationFee),

                email: formState.email,
                isActive: formState.isActive,
            })

            if (user) {
                setAuth({
                    ...user,
                    name: formState.name,
                    email: formState.email,
                })
            }

            const formStateData: DoctorSettingsFormState = {
                name: updatedProfile.name,
                mobile: updatedProfile.mobile,
                consultationFee: String(updatedProfile.consultationFee || 0),

                email: updatedProfile.email,
                medicalCertificateNumber: updatedProfile.medicalCertificateNumber,
                medicalCouncilRegistrationNumber: updatedProfile.medicalCouncilRegistrationNumber,
                isActive: updatedProfile.isActive,
            }
            setSavedState(formStateData)
            setFormState(formStateData)
            setIsEditingPersonalInfo(false)
            toast.success('Doctor settings updated successfully')
        } catch {
            toast.error('Failed to update doctor settings')
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

    const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                setImageCrop(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCropComplete = async (croppedFile: File) => {
        setImageCrop(null)
        setIsUploadingImage(true)
        const toastId = toast.loading('Uploading profile image...')

        try {
            const presignRes = await presignUpload({
                fileName: croppedFile.name,
                contentType: croppedFile.type as 'image/png' | 'image/jpeg',
                folder: 'documents/doctorProfile',
                size: croppedFile.size,
            })

            await uploadToS3(presignRes.uploadUrl, croppedFile)

            await updateDoctorProfile({
                ...formState,
                consultationFee: Number(formState.consultationFee),
                profileImage: presignRes.key,
            })

            const profile = await getCurrentUser()
            if (user) {
                setAuth({
                    ...user,
                    profileImage: profile.data.profileImage,
                })
            }

            toast.success('Profile image updated successfully', { id: toastId })
        } catch (error) {
            toast.error(getErrorMessage(error), { id: toastId })
        } finally {
            setIsUploadingImage(false)
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
        <MainWrapper title="Account Settings" subtitle="Manage your profile and account preferences.">
            <div className={styles.stack}>
                <DoctorSettingsProfileCard
                    savedState={savedState}
                    profileImageUrl={profileImageUrl}
                    isActive={formState.isActive}
                    onToggleStatus={handleToggleStatus}
                    onImageSelect={handleImageSelect}
                    isUploadingImage={isUploadingImage}
                />

                <DoctorPersonalInfoSection
                    formState={formState}
                    isEditing={isEditingPersonalInfo}
                    onToggleEditing={() => setIsEditingPersonalInfo((current) => !current)}
                    onFieldChange={handleFieldChange}
                />

                <DoctorRegistrationSection formState={formState} />

                <DoctorSecuritySection onResetPassword={handleResetPassword} />

                <DoctorSettingsActions
                    hasChanges={hasChanges}
                    isSaving={isSaving}
                    isLoadingProfile={isLoadingProfile}
                    onDiscard={handleDiscard}
                    onSave={handleSave}
                />
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

export default DoctorSettingsForm
