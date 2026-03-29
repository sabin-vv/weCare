import { useEffect, useState, type ChangeEvent, type DragEvent } from 'react'
import toast from 'react-hot-toast'

import styles from './FileUploadBox.module.css'

import { CloudUpload } from 'lucide-react'
import type { FileUploadBoxProps } from '../types/auth.types'

const FileUploadBox = ({ file, accept, onFileSelect }: FileUploadBoxProps) => {
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

    const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault()

        const file = e.dataTransfer.files?.[0]
        if (!file) return

        processFile(file)
    }

    const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
    }

    const processFile = (file: File) => {
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
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        processFile(file)
    }

    return (
        <label className={styles.box} onDrop={handleDrop} onDragOver={handleDragOver}>
            <input type="file" hidden accept={accept} onChange={handleChange} />
            {file ? (
                file.type.startsWith('image/') ? (
                    <img src={preview!} className={styles.previewImage} />
                ) : (
                    <p className={styles.fileName}>📄 {file.name}</p>
                )
            ) : (
                <>
                    <CloudUpload />
                    <h3>Drag & Drop or Click to Upload</h3>
                    <p>PNG, JPG, JPEG{accept?.includes('pdf') ? ', PDF' : ''} (Max 5MB)</p>
                </>
            )}
        </label>
    )
}

export default FileUploadBox
