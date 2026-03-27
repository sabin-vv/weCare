import dotenv from 'dotenv'

dotenv.config()

export const env = {
    PORT: process.env.PORT || '5000',
    MONGO_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weCare',
    JWT_SECRET: process.env.JWT_SECRET || '',
    EMAIL_USER: process.env.EMAIL_USER || 'vvsabin@gmail.com',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'uinkkccprbykwpdf',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
    JWT_ACCESS_EXPIRES: '15m',
    JWT_REFRESH_EXPIRES: '7d',
    NODE_ENV: process.env.NODE_ENV,
}
