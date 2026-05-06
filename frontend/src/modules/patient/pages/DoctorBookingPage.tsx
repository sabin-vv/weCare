import { BadgeCheck, UserRound, Loader2, X } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getDoctors } from '../api/patient.api'
import type { Specialist } from '../types/patient.types'

import styles from './DoctorBookingPage.module.css'

import { env } from '@/config/env'
import PatientLayout from '@/layout/PatientLayout'
import Button from '@/shared/components/Button/Button'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import SelectField from '@/shared/components/SelectField/SelectField'

const DoctorBookingPage = () => {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [selectedSpecialty, setSelectedSpecialty] = useState('')
    const [specialtyOptions, setSpecialtyOptions] = useState<{ label: string; value: string }[]>([])
    const [doctors, setDoctors] = useState<Specialist[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [totalCount, setTotalCount] = useState<number>(0)

    const fetchDoctors = useCallback(
        async (pageNum: number) => {
            setIsLoading(true)
            try {
                const response = await getDoctors({
                    search: query,
                    specialty: selectedSpecialty,
                    page: pageNum,
                    limit: 8,
                })

                setDoctors(response.data)
                setTotalPages(response.totalPages)
                setTotalCount(response.totalCount)

                if (!specialtyOptions.length) {
                    setSpecialtyOptions([
                        { label: 'All Specialties', value: '' },
                        ...response.specialties.map((s: string) => ({
                            label: s,
                            value: s,
                        })),
                    ])
                }
            } catch (error) {
                console.error('Failed to fetch doctors:', error)
            } finally {
                setIsLoading(false)
            }
        },
        [query, selectedSpecialty],
    )

    useEffect(() => {
        fetchDoctors(page)
    }, [page, fetchDoctors])

    useEffect(() => {
        setPage(1)
    }, [query, selectedSpecialty])

    const clearFilters = () => {
        setQuery('')
        setSelectedSpecialty('')
        setPage(1)
    }

    const hasFilters = query || selectedSpecialty

    return (
        <PatientLayout>
            <section className={styles.panel}>
                <div className={styles.sectionTop}>
                    <div>
                        <h1 className={styles.title}>Available Specialists</h1>
                        <p className={styles.subtitle}>
                            Book a consultation with our verified healthcare professionals.
                        </p>
                    </div>

                    <div className={styles.filters}>
                        {hasFilters && (
                            <button type="button" className={styles.clearButton} onClick={clearFilters}>
                                Clear All
                                <X size={16} />
                            </button>
                        )}
                        <SelectField
                            label=""
                            id="specialty"
                            options={specialtyOptions}
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                        />
                        <SearchField value={query} onSearch={setQuery} placeholder="Search doctor or specialty" />
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

                            <Button type="button" onClick={() => navigate(`/doctors/${doctor.id}`)}>
                                Book Appointment
                            </Button>
                        </article>
                    ))}
                </div>
                {doctors.length > 0 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        limit={8}
                        onPageChange={(newPage) => setPage(newPage)}
                    />
                )}

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
            </section>
        </PatientLayout>
    )
}

export default DoctorBookingPage
