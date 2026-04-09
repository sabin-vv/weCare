import { LogOutIcon } from 'lucide-react'

import styles from './LogoutButton.module.css'

import { useLogout } from '@/modules/auth/hooks/useLogout'
const handleLogout = useLogout()

const LogoutButton = () => {
    return (
        <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOutIcon />
            Logout
        </button>
    )
}
export default LogoutButton
