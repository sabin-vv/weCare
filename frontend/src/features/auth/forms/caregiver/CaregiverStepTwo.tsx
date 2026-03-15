import EmailVerify from '../../components/EmailVerify'
import ProgressBar from '../../components/ProgressBar'
import type { EmailVerifyProps } from '../../types/auth.types'

import FormWrapper from '@/shared/components/FormWrapper/FormWrapper'

const CaregiverStepTwo = ({ email, prevStep, nextStep }: EmailVerifyProps) => {
    return (
        <FormWrapper title="Verify Your Email Address">
            <ProgressBar step={2} totalSteps={4} percentage={50} title="email varification" />
            <EmailVerify email={email} nextStep={nextStep} prevStep={prevStep} />
        </FormWrapper>
    )
}

export default CaregiverStepTwo
