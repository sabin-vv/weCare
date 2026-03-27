import { model, Schema } from 'mongoose'

import { UserRole } from '../types/auth.types'
import { UserDocument } from '../types/auth.types'

const userSchema: Schema<UserDocument> = new Schema<UserDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            required: true,
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    { timestamps: true },
)

export const UserModel = model<UserDocument>('User', userSchema)
