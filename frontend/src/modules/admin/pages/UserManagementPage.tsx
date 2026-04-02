import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { adminService } from '../api/admin.api'
import type { UserProfile } from '../types/admin.types'

import styles from './UserManagementPage.module.css'

import Pagination from '@/shared/components/Pagination/Pagination'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/dataTable.types'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

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
            setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u)))
            toast.success(`User ${!currentStatus ? 'enabled' : 'blocked'} successfully`)
            fetchUsers()
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

    const columns: Column<UserProfile>[] = [
        {
            header: 'Name',
            key: 'name',
            render: (user) => (
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {user.profileImage ? (
                            <img src={getFileUrl(user.profileImage)} alt={user.name} className={styles.avatar} />
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
            ),
        },
        {
            header: 'Role',
            key: 'role',
            render: (user) => (
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
            ),
        },
        {
            header: 'Status',
            key: 'isActive',
            render: (user) => (
                <div className={styles.statusBadge}>
                    <div className={`${styles.dot} ${user.isActive ? styles.dotActive : styles.dotInactive}`}></div>
                    {user.isActive ? 'Active' : 'Inactive'}
                </div>
            ),
        },
        {
            header: 'Date Joined',
            key: 'createdAt',
            render: (user) => formatDate(user.createdAt),
        },
        {
            header: 'Account Status',
            key: '_id' as keyof UserProfile,
            render: (user) => (
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
            ),
        },
    ]

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

            <DataTable data={users} columns={columns} isLoading={loading} keyExtractor={(u) => u._id}>
                {!loading && users.length > 0 && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalCount={pagination.totalCount}
                        limit={pagination.limit}
                        onPageChange={(page) => fetchUsers(page, activeRole, search)}
                    />
                )}
            </DataTable>
        </div>
    )
}

export default UserManagementPage
