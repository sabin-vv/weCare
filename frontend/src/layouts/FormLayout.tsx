import type { FC, ReactNode } from 'react'

import Footer from '../features/auth/components/Footer'

import styles from './FormLayout.module.css'

import Header from '@/features/auth/components/Header'

interface LayoutProps {
    children: ReactNode
}

const FormLayout: FC<LayoutProps> = ({ children }) => {
    return (
        <div className={styles.pageLayout}>
            <Header />
            {children}
            <Footer />
        </div>
    )
}
export default FormLayout
