import UploadIcon from '@/shared/icons/UploadIcon'
import styles from './FileUploadBox.module.css'
import type React from 'react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
    file?: File | null
    accept?: string
    onFileSelect: (file: File) => void
}

const FileUploadBox = ({ file, accept, onFileSelect }: Props) => {
    const [preview, setPreview] = useState<string | null>(null)

    useEffect(() => {
        if (!file) {
            setPreview(null)
            return
        }
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file)
            setPreview(url)
            return () => URL.revokeObjectURL(url)
        }
    }, [file])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (accept && !accept.split(',').includes(file.type)) {
            toast.error('Please choose a valid file')
            return
        }
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error('File size must be less than 5MB')

            return
        }

        onFileSelect?.(file)
    }
    return (
        <label className={styles.box}>
            <input type="file" hidden accept={accept} onChange={handleChange} />
            {file ? (
                file.type.startsWith('image/') ? (
                    <img src={preview!} className={styles.previewImage} />
                ) : (
                    <p className={styles.fileName}>📄 {file.name}</p>
                )
            ) : (
                <>
                    <UploadIcon />
                    <h3>Drag & Drop or Click to Upload</h3>
                    <p>PNG, JPG, JPEG{accept?.includes('pdf') ? ', PDF' : ''} (Max 5MB)</p>
                </>
            )}
        </label>
    )
}

export default FileUploadBox
