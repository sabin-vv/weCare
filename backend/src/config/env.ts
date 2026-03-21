import dotenv from 'dotenv'
dotenv.config({ quiet: true })

const env = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weCare',

    email: {
        user: process.env.EMAIL_USER || 'vvsabin@gmail.com',
        password: process.env.EMAIL_PASSWORD || 'uinkkccprbykwpdf',
    },
    awsRegion: process.env.AWS_REGION || 'ap-south-1',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsBucketName: process.env.AWS_BUCKET_NAME,
    jwtSecret: process.env.JWT_SECRET || 'wecare_secret_token',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'wecare_refresh_secret_token',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}

export default env
