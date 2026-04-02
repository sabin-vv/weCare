import type { FormNavigationButtonsProps } from '../types/auth.types'

import styles from './FormNavigationButtons.module.css'

import Button from '@/shared/components/Button/Button'

const FormNavigationButtons = ({
    onBack,
    onNext,
    nextLabel = 'Next',
    backLabel = 'Back',
    isNextDisabled,
    isLoading,
}: FormNavigationButtonsProps) => {
    return (
        <div className={styles.buttonWrapper}>
            {onBack && (
                <Button type="button" variant="secondary" onClick={onBack}>
                    {backLabel}
                </Button>
            )}

            <Button type="button" onClick={onNext} disabled={isNextDisabled || isLoading}>
                {isLoading ? 'Please wait...' : nextLabel}
            </Button>
        </div>
    )
}

export default FormNavigationButtons
