import styles from './Footer.module.css'

const Footer = () => {
    return (
        <footer className={styles.footerContainer}>
            <div className={styles.top}>
                <strong>WeCare</strong>
                <p>Empowering chronic care management...</p>
            </div>
            <p className={styles.bottom}>© 2026 WeCare. All rights reserved.</p>
        </footer>
    )
}
export default Footer
