import { Link } from 'react-router-dom'

import styles from './Footer.module.css'

const Footer = () => {
    return (
        <footer className={styles.footerContainer}>
            <div className={styles.inner}>
                <div className={styles.top}>
                    <div className={styles.brandBlock}>
                        <div className={styles.brand}>
                            We<span>Care</span>
                        </div>

                        <p className={styles.tagline}>
                            Smart healthcare platform connecting patients, doctors, and caregivers for seamless
                            treatment and monitoring.
                        </p>

                        <div className={styles.trustBadges}>
                            <span className={styles.badge}>Secure</span>
                            <span className={styles.badge}>Verified</span>
                            <span className={styles.badge}>24/7 Care</span>
                        </div>
                    </div>

                    <div className={styles.linksSection}>
                        <div>
                            <h4>Platform</h4>
                            <Link to="/">Home</Link>
                            <Link to="/about">About</Link>
                            <Link to="/contact">Contact</Link>
                        </div>

                        <div>
                            <h4>Services</h4>
                            <Link to="/doctors">Find Doctors</Link>
                            <Link to="/caregivers">Caregivers</Link>
                            <Link to="/appointments">Appointments</Link>
                        </div>

                        <div>
                            <h4>Account</h4>
                            <Link to="/auth/login">Login</Link>
                            <Link to="/auth/patients/register">Register</Link>
                            <Link to="/auth/forgot-password">Forgot Password</Link>
                        </div>

                        <div>
                            <h4>Contact</h4>
                            <p className={styles.contactItem}>Email: support@wecare.com</p>
                            <p className={styles.contactItem}>Phone: +91 9876543210</p>
                            <p className={styles.contactItem}>Location: Kerala, India</p>
                        </div>
                    </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.bottomBar}>
                    <span className={styles.copyright}>© {new Date().getFullYear()} WeCare. All rights reserved.</span>

                    <div className={styles.bottomLinks}>
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms</Link>
                        <Link to="/support">Support</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
