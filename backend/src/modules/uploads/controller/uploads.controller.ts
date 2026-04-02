import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { Request, Response } from 'express'
import path from 'path'
import { injectable } from 'tsyringe'

import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import type { UploadsPresignDTO } from '../validator/presignUpload.schema'

@injectable()
export class UploadsController {
    presignUpload = async (req: Request, res: Response) => {
        const { fileName, contentType, folder, size } = req.body as UploadsPresignDTO

        if (!env.AWS_BUCKET_NAME) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'AWS_BUCKET_NAME is required')

        if (typeof size === 'number' && size > 5 * 1024 * 1024) {
            throw new AppError(400, 'File is too large (max 5MB)')
        }

        const originalBaseName = path.basename(fileName)
        const safeBaseName = originalBaseName.replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(0, 120)

        const key = `${folder}/${randomUUID()}-${safeBaseName}`

        const credentials =
            env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
                ? { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }
                : undefined

        const s3 = new S3Client({
            region: env.AWS_REGION,
            credentials,
        })

        const command = new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        })

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 })

        res.status(HTTP_STATUS.OK).json({
            success: true,
            uploadUrl,
            key,
        })
    }
}
