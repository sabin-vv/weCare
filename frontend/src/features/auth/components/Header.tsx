import { useNavigate } from 'react-router-dom'
import styles from './Header.module.css'

const Header = () => {
    const navigate = useNavigate()
    return (
        <div className={styles.headerContainer}>
            <img src="logo" alt="logo" />
            <div className={styles.buttonWrapper}>
                <button>Home</button>
                <button onClick={() => navigate('/api/auth/login')}>Login</button>
            </div>
        </div>
    )
}
export default Header
