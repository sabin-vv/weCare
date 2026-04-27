import { IndianRupee, Pencil } from 'lucide-react'

import type { DoctorPersonalInfoSectionProps } from '../../types/doctor.types'
import styles from '../DoctorSettingsForm.module.css'

import InputField from '@/shared/components/InputField/InputField'
import { Section } from '@/shared/components/Section/Section'

const DoctorPersonalInfoSection = ({
    formState,
    isEditing,
    onToggleEditing,
    onFieldChange,
}: DoctorPersonalInfoSectionProps) => {
    return (
        <Section
            title="Personal Information"
            actions={
                <button
                    type="button"
                    className={`${styles.editButton} ${isEditing ? styles.editButtonActive : ''}`}
                    onClick={onToggleEditing}
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
                        value={formState.name}
                        onChange={onFieldChange('name')}
                        disabled={!isEditing}
                    />
                </div>

                <div className={styles.fieldShell}>
                    <InputField
                        id="doctor-fee"
                        label="Fee"
                        value={formState.consultationFee}
                        onChange={onFieldChange('consultationFee')}
                        icon={<IndianRupee size={16} />}
                        disabled={!isEditing}
                    />
                </div>

                <div className={`${styles.fieldShell} ${styles.fullRow}`}>
                    <div className={styles.formGrid}>
                        <div className={styles.fieldShell}>
                            <InputField
                                id="doctor-phone"
                                label="Phone Number"
                                value={formState.mobile}
                                onChange={onFieldChange('mobile')}
                                disabled={!isEditing}
                            />
                        </div>
                        <InputField
                            id="doctor-email"
                            label="Email Address"
                            value={formState.email}
                            onChange={onFieldChange('email')}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </div>
        </Section>
    )
}

export default DoctorPersonalInfoSection
