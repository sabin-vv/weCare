import dotenv from 'dotenv'

dotenv.config()

export const env = {
    PORT: process.env.PORT || '5000',
    MONGO_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weCare',
    JWT_SECRET: process.env.JWT_SECRET || '',
    EMAIL_USER: process.env.EMAIL_USER || 'vvsabin@gmail.com',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'uinkkccprbykwpdf',
}
