import dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config({ quiet: true })

const database = async (): Promise<void> => {
    try {
        const uri: string | undefined = process.env.MONGODB_URI
        if (!uri) {
            throw new Error('Database connection error ')
        }
        await mongoose.connect(uri)
        console.log('Database connected')
    } catch (error: unknown) {
        console.error(`database connection failed : ${error}`)
    }
}

export default database
