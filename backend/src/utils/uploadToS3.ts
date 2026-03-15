import { PutObjectCommand } from '@aws-sdk/client-s3'

import env from '../config/env'
import { s3 } from '../config/s3'

export const uploadToS3 = async (file: Express.Multer.File) => {
    try {
        const name = file.originalname.replace(/\s+/g, '-')
        const key = `doctor-documents/${Date.now()}-${name}`

        await s3.send(
            new PutObjectCommand({
                Bucket: env.awsBucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        )
        return `https://${env.awsBucketName}.s3.${env.awsRegion}.amazonaws.com/${key}`
    } catch (error) {
        console.error('S3 upload error :', error)
        throw error
    }
}
