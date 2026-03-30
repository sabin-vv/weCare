import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { adminService } from '../services/adminService'

import styles from './UserManagementPage.module.css'

import { getErrorMessage } from '@/utils/getErrorMessage'

interface UserProfile {
    _id: string
    name: string
    email: string
    role: 'doctor' | 'caregiver' | 'patient'
    isActive: boolean
    createdAt: string
    profileImage?: string
}

const UserManagementPage = () => {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeRole, setActiveRole] = useState('all')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 1,
    })

    const fetchUsers = async (page = 1, role = 'all', searchQuery = '') => {
        setLoading(true)
        try {
            const data = await adminService.getUsers(role, searchQuery, page, pagination.limit)
            setUsers(data.users)
            setPagination(data.pagination)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
        try {
            await adminService.toggleUserStatus(userId, !currentStatus)
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u)),
            )
            toast.success(`User ${!currentStatus ? 'enabled' : 'blocked'} successfully`)
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(1, activeRole, search)
        }, 500)
        return () => clearTimeout(timer)
    }, [search, activeRole])

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>User Management</h1>

            <div className={styles.searchSection}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search users by name, email or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className={styles.tabs}>
                {['all', 'doctor', 'caregiver', 'patient'].map((role) => (
                    <button
                        key={role}
                        className={`${styles.tab} ${activeRole === role ? styles.tabActive : ''}`}
                        onClick={() => setActiveRole(role)}
                    >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                        {role !== 'all' ? 's' : ' Users'}
                    </button>
                ))}
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Name</th>
                            <th className={styles.th}>Role</th>
                            <th className={styles.th}>Status</th>
                            <th className={styles.th}>Date Joined</th>
                            <th className={styles.th}>Account Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '100px' }}>
                                    <div style={{ color: '#64748b' }}>Loading users...</div>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '100px' }}>
                                    <div style={{ color: '#94a3b8' }}>No users found matching your criteria.</div>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatar}>
                                                {user.profileImage ? (
                                                    <img
                                                        src={user.profileImage}
                                                        alt={user.name}
                                                        className={styles.avatar}
                                                    />
                                                ) : (
                                                    getInitials(user.name)
                                                )}
                                            </div>
                                            <div>
                                                <span className={styles.userName}>
                                                    {user.role === 'doctor' ? `Dr. ${user.name}` : user.name}
                                                </span>
                                                <span className={styles.userEmail}>{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <span
                                            className={`${styles.roleBadge} ${
                                                user.role === 'doctor'
                                                    ? styles.doctorBadge
                                                    : user.role === 'caregiver'
                                                      ? styles.caregiverBadge
                                                      : styles.patientBadge
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.statusBadge}>
                                            <div
                                                className={`${styles.dot} ${
                                                    user.isActive ? styles.dotActive : styles.dotInactive
                                                }`}
                                            ></div>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </td>
                                    <td className={styles.td}>{formatDate(user.createdAt)}</td>
                                    <td className={styles.td}>
                                        <div className={styles.toggleContainer}>
                                            <label className={styles.toggle}>
                                                <input
                                                    type="checkbox"
                                                    checked={user.isActive}
                                                    onChange={() => handleStatusToggle(user._id, user.isActive)}
                                                />
                                                <span className={styles.slider}></span>
                                            </label>
                                            <span
                                                style={{
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    color: user.isActive ? '#3b82f6' : '#94a3b8',
                                                }}
                                            >
                                                {user.isActive ? 'Enabled' : 'Blocked'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {!loading && users.length > 0 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                            {pagination.totalCount} total users
                        </div>
                        <div className={styles.paginationControls}>
                            <button
                                className={styles.pageBtn}
                                onClick={() => fetchUsers(pagination.page - 1, activeRole, search)}
                                disabled={pagination.page === 1}
                            >
                                &lt;
                            </button>
                            {Array.from({ length: pagination.totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    className={`${styles.pageBtn} ${
                                        pagination.page === i + 1 ? styles.pageBtnActive : ''
                                    }`}
                                    onClick={() => fetchUsers(i + 1, activeRole, search)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className={styles.pageBtn}
                                onClick={() => fetchUsers(pagination.page + 1, activeRole, search)}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserManagementPage
