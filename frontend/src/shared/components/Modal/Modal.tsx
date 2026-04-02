import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import styles from './Modal.module.css'
import type { ModalProps } from './Modal.types'

const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) {
            modalRef.current?.focus()
        }
    }, [isOpen])

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            window.addEventListener('keydown', handleEsc)
        }

        return () => {
            window.removeEventListener('keydown', handleEsc)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div
                ref={modalRef}
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h3 id="modal-title" className={styles.title}>
                        {title}
                    </h3>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
                        &times;
                    </button>
                </div>
                <div className={styles.content}>{children}</div>
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </div>,
        document.body,
    )
}

export default Modal
