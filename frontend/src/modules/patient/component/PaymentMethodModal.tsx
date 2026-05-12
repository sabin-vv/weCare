import { CreditCard, Wallet } from 'lucide-react'

import type { PaymentMethodModalProps } from '../types/patient.types'

import styles from './PaymentMethodModal.module.css'

import Modal from '@/shared/components/Modal/Modal'

const PaymentMethodModal = ({
    isOpen,
    onClose,
    amount,
    onSelectRazorpay,
    onSelectWallet,
    walletBalance,
}: PaymentMethodModalProps) => {
    const hasInsufficientBalance = walletBalance !== undefined && walletBalance < amount

    const content = (
        <div className={styles.content}>
            <p className={styles.amountLabel}>
                Amount to pay: <span className={styles.amount}>₹{amount}</span>
            </p>

            <div className={styles.options}>
                <button className={styles.option} onClick={onSelectRazorpay}>
                    <div className={styles.optionIcon}>
                        <CreditCard size={24} />
                    </div>
                    <div className={styles.optionInfo}>
                        <span className={styles.optionTitle}>Pay with Razorpay</span>
                        <span className={styles.optionDesc}>Credit/Debit Card, UPI, Net Banking</span>
                    </div>
                </button>

                <button
                    className={`${styles.option} ${hasInsufficientBalance ? styles.disabled : ''}`}
                    onClick={hasInsufficientBalance ? undefined : onSelectWallet}
                    disabled={hasInsufficientBalance}
                >
                    <div className={styles.optionIcon}>
                        <Wallet size={24} />
                    </div>
                    <div className={styles.optionInfo}>
                        <span className={styles.optionTitle}>Pay with Wallet</span>
                        <span className={styles.optionDesc}>
                            Balance: ₹{walletBalance ?? 0}
                            {hasInsufficientBalance && <span className={styles.insufficient}> - Insufficient</span>}
                        </span>
                    </div>
                </button>
            </div>
        </div>
    )

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Payment Method" size="sm">
            {content}
        </Modal>
    )
}

export default PaymentMethodModal
