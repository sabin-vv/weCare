import { zodResolver } from '@hookform/resolvers/zod'
import { IndianRupee, Upload, X } from 'lucide-react'
import { useState, useEffect, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import type { AllowedContentType } from '../../auth/api/auth.api.types'
import { getPlatformSettings, presignUpload, updatePlatformSettings, uploadToS3 } from '../api/admin.api'
import PageCard from '../components/PageCard'
import { platformSettingsSchema, type PlatformSettingsForm } from '../validator/admin.validator'

import styles from './AdminSettings.module.css'

import Button from '@/shared/components/Button/Button'
import InputField from '@/shared/components/InputField/InputField'
import PageHeader from '@/shared/components/PageHeader/PageHeader'

const AdminSettings = () => {
    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<PlatformSettingsForm>({
        resolver: zodResolver(platformSettingsSchema),
        defaultValues: {
            platformName: '',
            contactEmail: '',
            address: '',
            platformFee: 0,
            subscriptionFee: 0,
            billingCycle: 'monthly',
        },
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [feeInput, setFeeInput] = useState<string>('0')
    const [subscriptionFeeInput, setSubscriptionFeeInput] = useState<string>('0')
    const [fullLogo, setFullLogo] = useState<string | null>(null)
    const [iconLogo, setIconLogo] = useState<string | null>(null)
    const [uploading, setUploading] = useState<'fullLogo' | 'iconLogo' | null>(null)

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await getPlatformSettings()
                setValue('platformName', data.platformName)
                setValue('contactEmail', data.contactEmail)
                setValue('address', data.address)
                setValue('platformFee', data.platformFee)
                setValue('subscriptionFee', data.subscriptionFee || 0)
                setValue('billingCycle', data.billingCycle || 'monthly')

                setFeeInput(data.platformFee.toString())
                setSubscriptionFeeInput((data.subscriptionFee || 0).toString())
                setFullLogo(data.platformLogo || null)
                setIconLogo(data.platformIcon || null)
            } catch (error) {
                console.error('Failed to load settings:', error)
            } finally {
                setLoading(false)
            }
        }
        loadSettings()
    }, [setValue])

    const handleFee = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '')
        if (!/^\d*$/.test(value)) return

        const formatted = Number(value).toLocaleString('en-IN')
        setFeeInput(formatted)
        setValue('platformFee', Number(value), { shouldValidate: true })
    }

    const handleSubscriptionFee = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '')
        if (!/^\d*$/.test(value)) return

        const formatted = Number(value).toLocaleString('en-IN')
        setSubscriptionFeeInput(formatted)
        setValue('subscriptionFee', Number(value), { shouldValidate: true })
    }

    const handleLogoUpload = async (type: 'fullLogo' | 'iconLogo', file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        setUploading(type)
        try {
            const folder = type === 'fullLogo' ? 'settings/full-logo' : 'settings/icon-logo'
            const presignRes = await presignUpload({
                fileName: file.name,
                contentType: file.type as AllowedContentType,
                folder,
                size: file.size,
            })

            await uploadToS3(presignRes.uploadUrl, file)

            if (type === 'fullLogo') {
                setFullLogo(presignRes.key)
            } else {
                setIconLogo(presignRes.key)
            }
        } catch (error) {
            console.error('Failed to upload logo:', error)
            toast.error('Failed to upload logo')
        } finally {
            setUploading(null)
        }
    }

    const handleLogoChange = (type: 'fullLogo' | 'iconLogo') => (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleLogoUpload(type, file)
        }
    }

    const removeLogo = (type: 'fullLogo' | 'iconLogo') => {
        if (type === 'fullLogo') {
            setFullLogo(null)
        } else {
            setIconLogo(null)
        }
    }

    const onSubmit = async (data: PlatformSettingsForm) => {
        setSaving(true)
        try {
            const settingsWithLogos = {
                ...data,
                platformLogo: fullLogo || undefined,
                platformIcon: iconLogo || undefined,
            }
            await updatePlatformSettings(settingsWithLogos)
            toast.success('Settings saved successfully')
        } catch (err) {
            console.error(err)
            toast.error('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <PageHeader title="Admin Settings" subtitle="View and update your application settings" />
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <PageCard title="General Settings">
                    <div className={styles.infoWrapper}>
                        <InputField
                            label="Platform Name"
                            {...register('platformName')}
                            errors={errors.platformName?.message}
                        />
                        <InputField
                            label="Admin contact email"
                            type="email"
                            {...register('contactEmail')}
                            errors={errors.contactEmail?.message}
                        />
                    </div>
                    <div className={styles.addressFeeWrapper}>
                        <InputField label="Address" {...register('address')} errors={errors.address?.message} />
                        <InputField
                            icon={<IndianRupee />}
                            value={feeInput}
                            onChange={handleFee}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            label="Platform Fee"
                            errors={errors.platformFee?.message}
                        />
                    </div>
                </PageCard>
                <PageCard title="Subscription Settings">
                    <div className={styles.infoWrapper}>
                        <InputField
                            icon={<IndianRupee />}
                            value={subscriptionFeeInput}
                            onChange={handleSubscriptionFee}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            label="Subscription Fee"
                            errors={errors.subscriptionFee?.message}
                        />
                    </div>
                    <div className={styles.billingCycleWrapper}>
                        <span className={styles.billingCycleLabel}>Billing Cycle</span>
                        <div className={styles.radioGroup}>
                            <label className={styles.radioLabel}>
                                <input type="radio" value="monthly" {...register('billingCycle')} />
                                <span>Monthly</span>
                            </label>
                            <label className={styles.radioLabel}>
                                <input type="radio" value="yearly" {...register('billingCycle')} />
                                <span>Yearly</span>
                            </label>
                        </div>
                    </div>
                </PageCard>
                <PageCard title="Platform Branding">
                    <div className={styles.logoContainer}>
                        <div className={styles.logoWrapper}>
                            <span className={styles.logoTitle}>Full Logo</span>
                            <label htmlFor="fullLogo" className={styles.logoLabel}>
                                {fullLogo ? (
                                    <div className={styles.logoPreview}>
                                        <img src={`${import.meta.env.VITE_S3_BASE_URL}${fullLogo}`} alt="Full logo" />
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                removeLogo('fullLogo')
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.logoPlaceholder}>
                                        {uploading === 'fullLogo' ? (
                                            <>
                                                <Upload size={24} className={styles.spinning} />
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={24} />
                                                <span>Click to upload</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </label>
                            <input
                                type="file"
                                id="fullLogo"
                                accept="image/*"
                                onChange={handleLogoChange('fullLogo')}
                                className={styles.fileInput}
                            />
                        </div>
                        <div className={styles.logoWrapper}>
                            <span className={styles.logoTitle}>Icon Logo</span>
                            <label htmlFor="iconLogo" className={styles.logoLabel}>
                                {iconLogo ? (
                                    <div className={styles.logoPreview}>
                                        <img src={`${import.meta.env.VITE_S3_BASE_URL}${iconLogo}`} alt="Icon logo" />
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                removeLogo('iconLogo')
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.logoPlaceholder}>
                                        {uploading === 'iconLogo' ? (
                                            <>
                                                <Upload size={24} className={styles.spinning} />
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={24} />
                                                <span>Click to upload</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </label>
                            <input
                                type="file"
                                id="iconLogo"
                                accept="image/*"
                                onChange={handleLogoChange('iconLogo')}
                                className={styles.fileInput}
                            />
                        </div>
                    </div>
                </PageCard>
                <div className={styles.saveButton}>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default AdminSettings
