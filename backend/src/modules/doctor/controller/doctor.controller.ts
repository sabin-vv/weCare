import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { MulterFiles } from '../../auth/types/auth.types'
import { IDoctorService } from '../interfaces/doctor.service.interface'

const normalizeMulterFiles = (files: unknown): MulterFiles => {
    if (!files) return {}

    if (Array.isArray(files)) {
        return (files as Express.Multer.File[]).reduce<MulterFiles>((acc, file) => {
            const key = file.fieldname
            if (!acc[key]) acc[key] = []
            acc[key].push(file)
            return acc
        }, {})
    }

    return files as MulterFiles
}

@injectable()
export class DoctorController {
    constructor(@inject(TOKENS.IDoctorService) private doctorService: IDoctorService) {}

    registerDoctor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.doctorService.registerDoctor(req.body, normalizeMulterFiles(req.files))
            res.status(HTTP_STATUS.CREATED).json({ success: true, data: result })
        } catch (error) {
            next(error)
        }
    }
}
