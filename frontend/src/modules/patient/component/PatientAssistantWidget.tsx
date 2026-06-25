import { Loader2, SendHorizonal } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'

import { chatWithAssistant } from '../api/patient.api'

import styles from './PatientAssistantWidget.module.css'

import chat from '@/assets/chat.png'
import { getErrorMessage } from '@/utils/getErrorMessage'

const PatientAssistantWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [conversation, setConversation] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [conversation])

    const quickQuestions = [
        '💊 Explain Metformin',
        '🩺 What is diabetes?',
        '📅 How do I book an appointment?',
        '💳 How does wallet payment work?',
        '🥗 Give me healthy diet tips',
    ]

    const handleSubmit = async (text?: string) => {
        if (isLoading) return

        const userMessage = (text ?? message).trim()

        if (!userMessage.trim()) {
            return
        }

        setConversation((prev) => [...prev, { role: 'user', text: userMessage }])
        setMessage('')
        setIsLoading(true)

        try {
            const assistantText = await chatWithAssistant(userMessage)
            setConversation((prev) => [...prev, { role: 'assistant', text: assistantText }])
        } catch (err) {
            const message = getErrorMessage(err)
            setError(message)
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.widgetWrapper}>
            {isOpen ? (
                <div className={styles.chatPanel}>
                    <div className={styles.header}>
                        <span>WeCare Assistant</span>
                        <button className={styles.closeButton} onClick={() => setIsOpen(false)} type="button">
                            ×
                        </button>
                    </div>

                    <div className={styles.messages}>
                        {conversation.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p className={styles.hint}>
                                    Ask about Appointments, Billing, Medications, Symptoms help.
                                </p>
                                <div className={styles.quickActions}>
                                    {quickQuestions.map((question) => (
                                        <button
                                            key={question}
                                            type="button"
                                            className={styles.quickAction}
                                            onClick={() => handleSubmit(question)}
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            conversation.map((entry, index) => (
                                <div
                                    key={`${entry.role}-${index}`}
                                    className={entry.role === 'user' ? styles.userMessage : styles.assistantMessage}
                                >
                                    {entry.text}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.inputArea}>
                        <input
                            type="text"
                            placeholder="Type your question..."
                            disabled={isLoading}
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()
                                    handleSubmit()
                                }
                            }}
                            className={styles.input}
                        />
                        <button
                            className={styles.sendButton}
                            onClick={() => handleSubmit}
                            type="button"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 size={18} className={styles.spinner} /> : <SendHorizonal size={18} />}
                        </button>
                    </div>

                    {error ? <div className={styles.error}>{error}</div> : null}
                </div>
            ) : null}
            <img src={chat} alt="/logo" className={styles.launcher} onClick={() => setIsOpen((value) => !value)} />
        </div>
    )
}

export default PatientAssistantWidget
