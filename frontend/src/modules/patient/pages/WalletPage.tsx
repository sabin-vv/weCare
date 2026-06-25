import { useEffect, useState } from 'react'

import { getWallet } from '../api/patient.api'
import type { Transactions } from '../types/patient.types'

import styles from './WalletPage.module.css'

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
                        <h1 className={styles.balanceAmount}>₹ {balance.toLocaleString()}</h1>

                        <Button className={styles.addMoneyBtn}>+ Add Money</Button>
                    </div>
                </div>

                <div className={styles.transactionSection}>
                    <div className={styles.transactionHeader}>
                        <h4>Transaction History</h4>

                        <button className={styles.viewAllBtn}></button>
                    </div>

                    <div className={styles.transactionList}>
                        {transactions.length > 0 ? (
                            transactions.map((transaction, index) => (
                                <div key={index} className={styles.transactionCard}>
                                    <div className={styles.transactionLeft}>
                                        <span
                                            className={`${styles.typeBadge} ${transaction.type === 'credit' ? styles.creditBadge : styles.debitBadge}`}
                                        >
                                            {transaction.type === 'credit' ? (
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <line x1="12" y1="19" x2="12" y2="5" />
                                                    <polyline points="5 12 12 5 19 12" />
                                                </svg>
                                            ) : (
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <line x1="12" y1="5" x2="12" y2="19" />
                                                    <polyline points="19 12 12 19 5 12" />
                                                </svg>
                                            )}
                                            {transaction.type}
                                        </span>

                                        <div className={styles.transactionMeta}>
                                            {transaction.description ? (
                                                <span className={styles.transactionDesc}>
                                                    {transaction.description}
                                                </span>
                                            ) : null}
                                            <span className={styles.transactionDate}>
                                                {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <span className={transaction.type === 'credit' ? styles.credit : styles.debit}>
                                        {transaction.type === 'credit' ? '+' : '-'}₹
                                        {transaction.amount.toLocaleString()}
                                    </span>
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
    )
}

export default WalletPage
