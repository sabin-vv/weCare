import { Document } from 'mongoose'

import { UserRole } from '../modules/auth/types/auth.enum'

export interface UserDocument extends Document {
    name: string
    email: string
    mobile: string
    password: string
    role: UserRole
    isActive: boolean
}

export type MulterFiles = Record<string, Express.Multer.File[]>
