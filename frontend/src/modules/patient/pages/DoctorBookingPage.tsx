import { BadgeCheck, UserRound, Loader2, X, Star } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getDoctors } from '../api/patient.api'
import type { Specialist } from '../types/patient.types'

import styles from './DoctorBookingPage.module.css'

import { env } from '@/config/env'
import Button from '@/shared/components/Button/Button'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import SelectField from '@/shared/components/SelectField/SelectField'

const sortOptions = [
    { label: 'Rating (High to Low)', value: 'rating-desc' },
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Name (Z-A)', value: 'name-desc' },
    { label: 'Newest First', value: 'newest-desc' },
]

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
    const [sortValue, setSortValue] = useState('rating-desc')

    const [sortBy, sortOrder] = sortValue.split('-') as ['rating' | 'name' | 'newest', 'asc' | 'desc']

    const fetchDoctors = useCallback(
        async (pageNum: number) => {
            setIsLoading(true)
            try {
                const response = await getDoctors({
                    search: query,
                    specialty: selectedSpecialty,
                    page: pageNum,
                    limit: 8,
                    sortBy,
                    sortOrder,
                })

                setDoctors(response.data)
                setTotalPages(response.totalPages)
                setTotalCount(response.totalCount)

                if (!specialtyOptions.length) {
                    setSpecialtyOptions([
                        { label: 'All Specialties', value: '' },
                        ...response.specialties.map((s: string) => ({
                            label: s[0].toUpperCase() + s.slice(1),
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
        [query, selectedSpecialty, sortBy, sortOrder],
    )

    useEffect(() => {
        fetchDoctors(page)
    }, [page, fetchDoctors])

    useEffect(() => {
        setPage(1)
    }, [query, selectedSpecialty, sortValue])

    const clearFilters = () => {
        setQuery('')
        setSelectedSpecialty('')
        setSortValue('rating-desc')
        setPage(1)
    }

    const hasFilters = query || selectedSpecialty

    return (
        <MainWrapper
            title="Available Specialists"
            subtitle=" Book a consultation with our verified healthcare professionals."
        >
            <div className={styles.sectionTop}>
                <div className={styles.filters}>
                    <div className={styles.filterLeft}>
                        <SelectField
                            label=""
                            id="specialty"
                            options={specialtyOptions}
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                        />
                        <SelectField
                            label=""
                            id="sort"
                            options={sortOptions}
                            value={sortValue}
                            onChange={(e) => setSortValue(e.target.value)}
                        />
                        {hasFilters && (
                            <button type="button" className={styles.clearButton} onClick={clearFilters}>
                                Clear All
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <div className={styles.filterRight}>
                        <SearchField value={query} onSearch={setQuery} placeholder="Search doctor or specialty" />
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {doctors.map((doctor) => (
                    <article key={doctor.id} className={styles.card}>
                        <div className={styles.cardBody}>
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
                            {doctor.averageRating && (
                                <span className={styles.rating}>
                                    {doctor.averageRating}
                                    <Star size={16} fill="#ffce12" stroke="0" /> ({doctor.reviewCount})
                                </span>
                            )}
                        </div>

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
        </MainWrapper>
    )
}

export default DoctorBookingPage
