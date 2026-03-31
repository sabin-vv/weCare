import { useAuth } from '@/shared/context/AuthContext'
import { useLogout } from '@/modules/auth/hooks/useLogout'

const PatientDashboard = () => {
    const { user } = useAuth()
    const handleLogout = useLogout()

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.badge}>Patient</div>
                <h1 style={styles.heading}>Welcome, {user?.name} 🩺</h1>
                <p style={styles.sub}>{user?.email}</p>
                <button style={styles.btn} onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1a3a2f 100%)',
        fontFamily: "'Inter', sans-serif",
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '48px 56px',
        textAlign: 'center',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
    },
    badge: {
        display: 'inline-block',
        background: 'linear-gradient(90deg, #10b981, #34d399)',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        padding: '6px 18px',
        borderRadius: '999px',
        marginBottom: '24px',
    },
    heading: {
        color: '#f1f5f9',
        fontSize: '28px',
        fontWeight: 700,
        margin: '0 0 8px',
    },
    sub: {
        color: '#94a3b8',
        fontSize: '15px',
        marginBottom: '32px',
    },
    btn: {
        background: 'linear-gradient(90deg, #10b981, #34d399)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        padding: '12px 32px',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    },
}

export default PatientDashboard
