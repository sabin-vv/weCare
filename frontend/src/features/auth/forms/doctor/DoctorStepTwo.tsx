import FormWrapper from '../../../../shared/components/FormWrapper/FormWrapper'
import EmailVerify from '../../components/EmailVerify'
import ProgressBar from '../../components/ProgressBar'
import type { EmailVerifyProps } from '../../types/auth.types'

const DoctorStepTwo = ({ email, prevStep, nextStep }: EmailVerifyProps) => {
    return (
        <div>
            <FormWrapper title="Verify Your email Address">
                <ProgressBar percentage={50} step={2} totalSteps={4} title="verification" />
                <EmailVerify email={email} prevStep={prevStep} nextStep={nextStep} />
            </FormWrapper>
        </div>
    )
}

export default DoctorStepTwo
