import mongoose from 'mongoose'

import { env } from './env'

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(env.MONGO_URI!, {
            serverSelectionTimeoutMS: 1000,
        })
    } catch (error: unknown) {
        console.error(`database connection failed : ${error}`)
        process.exit(1)
    }
}
