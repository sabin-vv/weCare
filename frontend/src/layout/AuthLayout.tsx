import type { ReactNode } from 'react'

import Footer from '../shared/components/Footer/Footer'

import styles from './AuthLayout.module.css'

import Header from '@/modules/auth/components/Header'

interface LayoutProps {
    children: ReactNode
}

const AuthLayout = ({ children }: LayoutProps) => {
    return (
        <div className={styles.pageLayout}>
            <Header />
            {children}
            <Footer />
        </div>
    )
}
export default AuthLayout
