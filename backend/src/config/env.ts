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
}

export default env
