import { BadgeCheck, ChevronDown, UserRound, Loader2 } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getDoctors } from '../api/patient.api'
import type { Specialist } from '../types/patient.types'

import styles from './DoctorBookingPage.module.css'

import { env } from '@/config/env'
import AuthLayout from '@/layout/AuthLayout'
import SearchField from '@/shared/components/SearchField/SearchField'
import SelectField from '@/shared/components/SelectField/SelectField'

const DoctorBookingPage = () => {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [selectedSpecialty, setSelectedSpecialty] = useState('')
    const [specialtyOptions, setSpecialtyOptions] = useState<{ label: string; value: string }[]>([])
    const [doctors, setDoctors] = useState<Specialist[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const fetchDoctors = useCallback(
        async (pageNum: number, isAppending: boolean) => {
            setIsLoading(true)
            try {
                const response = await getDoctors({
                    search: query,
                    specialty: selectedSpecialty,
                    page: pageNum,
                    limit: 8,
                })

                if (pageNum === 1 && !isAppending) {
                    setSpecialtyOptions([
                        { label: 'All Specialties', value: '' },
                        ...response.specialties.map((s: string) => ({ label: s, value: s })),
                    ])
                }

                setDoctors((prev) => (isAppending ? [...prev, ...response.data] : response.data))
                setHasMore(response.data.length === 8)
            } catch (error) {
                console.error('Failed to fetch doctors:', error)
            } finally {
                setIsLoading(false)
            }
        },
        [query, selectedSpecialty],
    )

    useEffect(() => {
        setPage(1)
        fetchDoctors(1, false)
    }, [query, selectedSpecialty, fetchDoctors])

    const handleLoadMore = () => {
        if (isLoading || !hasMore) return
        const nextPage = page + 1
        setPage(nextPage)
        fetchDoctors(nextPage, true)
    }

    return (
        <AuthLayout>
            <section className={styles.panel}>
                <div className={styles.sectionTop}>
                    <div>
                        <h1 className={styles.title}>Available Specialists</h1>
                        <p className={styles.subtitle}>
                            Book a consultation with our verified healthcare professionals.
                        </p>
                    </div>

                    <div className={styles.filters}>
                        <SearchField onSearch={setQuery} placeholder="Search doctor or specialty" />
                        <SelectField
                            label=""
                            id="specialty"
                            options={specialtyOptions}
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.grid}>
                    {doctors.map((doctor) => (
                        <article key={doctor.id} className={styles.card}>
                            <div
                                className={styles.avatar}
                                style={{ '--avatar-accent': doctor.accent } as React.CSSProperties}
                            >
                                {doctor.profileImage ? (
                                    <img
                                        src={
                                            doctor.profileImage.startsWith('http')
                                                ? doctor.profileImage
                                                : `${env.AWS_BASE_URL}${doctor.profileImage}`
                                        }
                                        alt={doctor.name}
                                        className={styles.profileImage}
                                    />
                                ) : doctor.accent === '#dfeefe' || doctor.accent === '#e1efff' ? (
                                    <UserRound size={30} />
                                ) : (
                                    <span>{doctor.initials}</span>
                                )}
                            </div>

                            <div className={styles.verified}>
                                <span>Verified</span>
                                <BadgeCheck size={14} />
                            </div>

                            <h2 className={styles.doctorName}>{doctor.name}</h2>
                            <p className={styles.specialty}>{doctor.specialty}</p>

                            <button 
                                type="button" 
                                className={styles.bookButton}
                                onClick={() => navigate(`/appointments/doctor/${doctor.id}`)}
                            >
                                Book Appointment
                            </button>
                        </article>
                    ))}
                </div>

                {isLoading && !doctors.length && (
                    <div className={styles.loadingState}>
                        <Loader2 className={styles.spinner} />
                        <p>Loading specialists...</p>
                    </div>
                )}

                {!isLoading && doctors.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No specialists found matching your search.</p>
                    </div>
                )}

                {hasMore && (
                    <div className={styles.moreWrap}>
                        <button
                            type="button"
                            className={styles.moreButton}
                            onClick={handleLoadMore}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Show More Specialists'}
                            {!isLoading && <ChevronDown size={16} />}
                        </button>
                    </div>
                )}
            </section>
        </AuthLayout>
    )
}

export default DoctorBookingPage
