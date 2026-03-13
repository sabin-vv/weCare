import { Schema, model } from 'mongoose'
import { IUser } from '../../../interfaces/user.auth'

const userModel: Schema<IUser> = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },
        role: {
            type: String,
            enum: ['doctor', 'caregiver', 'admin', 'patient'],
        },
        isActive: {
            type: Boolean,
            required: true,
        },
    },
    { timestamps: true },
)

const User = model('User', userModel)

export default User
