import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getWallet } from '../api/patient.api'
import type { Transactions } from '../types/patient.types'

import styles from './WalletPage.module.css'

import PatientLayout from '@/layout/PatientLayout'
import Button from '@/shared/components/Button/Button'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'

const WalletPage = () => {
    const [balance, setBalance] = useState<number>(0)
    const [transactions, setTransactions] = useState<Transactions[]>([])

    useEffect(() => {
        const getWalletDetails = async () => {
            const res = await getWallet()
            setBalance(res.data.balance)
            setTransactions(res.data.transactions)
        }

        getWalletDetails()
    }, [])

    return (
        <PatientLayout>
            <MainWrapper title="My Wallet" subtitle="Manage payment and transaction history">
                <div className={styles.walletPage}>
                    <div className={styles.walletCard}>
                        <div className={styles.walletTop}>
                            <div>
                                <p className={styles.walletLabel}>WeCare Wallet</p>
                                <h2 className={styles.balanceTitle}>Available Balance</h2>
                            </div>

                            <div className={styles.walletIcon}>💳</div>
                        </div>

                        <div className={styles.walletBottom}>
                            <h1 className={styles.balanceAmount}>₹{balance}</h1>

                            <Button className={styles.addMoneyBtn}>+ Add Money</Button>
                        </div>
                    </div>

                    <div className={styles.transactionSection}>
                        <div className={styles.transactionHeader}>
                            <h4>Transaction History</h4>

                            <button className={styles.viewAllBtn}>
                                View All <ArrowRight size={18} />
                            </button>
                        </div>

                        <div className={styles.transactionList}>
                            {transactions.length > 0 ? (
                                transactions.map((transaction, index) => (
                                    <div key={index} className={styles.transactionCard}>
                                        <div>
                                            <p className={styles.transactionType}>{transaction.type}</p>

                                            <span className={styles.transactionDate}>
                                                {new Date(transaction.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h4 className={transaction.type === 'credit' ? styles.credit : styles.debit}>
                                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                                        </h4>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>No transactions available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </MainWrapper>
        </PatientLayout>
    )
}

export default WalletPage
