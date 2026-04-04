import styles from './PageHeader.module.css'

interface PageHeaderProps {
    title: string
    subtitle: string
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
    return (
        <div className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
        </div>
    )
}

export default PageHeader
