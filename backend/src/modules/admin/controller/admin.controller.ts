import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { IAdminService } from '../interfaces/admin.service.interface'
import { AdminVerificationStatus } from '../types/admin.types'

type AuthenticatedRequest = Request & { user?: { userId: string; role: string } }

const getSingleParam = (value: string | string[] | undefined, name: string): string => {
    const v = Array.isArray(value) ? value[0] : value
    if (!v) throw new Error(`${name} is missing`)
    return v
}

@injectable()
export class AdminController {
    constructor(@inject(TOKENS.IAdminService) private adminService: IAdminService) {}

    getPendingDoctors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page ?? 1)
            const limit = Number(req.query.limit ?? 10)
            const search = String(req.query.search ?? '')

            const result = await this.adminService.getPendingDoctors(page, limit, search)
            res.status(HTTP_STATUS.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    verifyDoctor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = getSingleParam(req.params.doctorId, 'doctorId')
            const { status } = req.body as { status: AdminVerificationStatus }
            const adminId = (req as AuthenticatedRequest).user?.userId
            if (!adminId) throw new Error('Admin id missing from token')

            const result = await this.adminService.verifyDoctor(doctorId, status, adminId)
            res.status(HTTP_STATUS.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    verifySpecialization = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = getSingleParam(req.params.doctorId, 'doctorId')
            const specIndex = getSingleParam(req.params.specIndex, 'specIndex')
            const { verified } = req.body as { verified: boolean }
            const adminId = (req as AuthenticatedRequest).user?.userId
            if (!adminId) throw new Error('Admin id missing from token')

            const result = await this.adminService.verifySpecialization(doctorId, Number(specIndex), verified, adminId)
            res.status(HTTP_STATUS.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    getPendingCaregivers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page ?? 1)
            const limit = Number(req.query.limit ?? 10)
            const search = String(req.query.search ?? '')

            const result = await this.adminService.getPendingCaregivers(page, limit, search)
            res.status(HTTP_STATUS.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    verifyCaregiver = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const caregiverId = getSingleParam(req.params.caregiverId, 'caregiverId')
            const { status } = req.body as { status: AdminVerificationStatus }
            const adminId = (req as AuthenticatedRequest).user?.userId
            if (!adminId) throw new Error('Admin id missing from token')

            const result = await this.adminService.verifyCaregiver(caregiverId, status, adminId)
            res.status(HTTP_STATUS.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    getPendingCount = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.adminService.getPendingCount()
            res.status(HTTP_STATUS.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const role = String(req.query.role ?? 'all')
            const search = String(req.query.search ?? '')
            const page = Number(req.query.page ?? 1)
            const limit = Number(req.query.limit ?? 10)

            const result = await this.adminService.getUsers(role, search, page, limit)
            res.status(HTTP_STATUS.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = getSingleParam(req.params.userId, 'userId')
            const { isActive } = req.body as { isActive: boolean }

            const result = await this.adminService.toggleUserStatus(userId, isActive)
            res.status(HTTP_STATUS.OK).json(result)
        } catch (error) {
            next(error)
        }
    }
}

