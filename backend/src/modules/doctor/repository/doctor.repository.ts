import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { UserModel } from '../../auth/models/user.model'
import { IDoctorRepository } from '../interfaces/doctor.repository.interface'
import { DoctorModel } from '../models/doctor.model'
import { DoctorDocument, DoctorSearchFilter, PopulatedDoctorDocument } from '../types/doctor.types'

@injectable()
export class DoctorRepository extends BaseRepository<DoctorDocument> implements IDoctorRepository {
    constructor() {
        super(DoctorModel)
    }
    async findByUserId(userId: Types.ObjectId) {
        return this.model.findOne({ userId })
    }

    async findByIdWithUser(id: string) {
        return this.model.findById(id).populate('userId', 'name')
    }
    async updateByUserId(userId: Types.ObjectId, data: Partial<DoctorDocument>): Promise<DoctorDocument> {
        const doctor = await this.model.findOneAndUpdate({ userId }, data, { returnDocument: 'after' })

        if (!doctor) {
            throw new Error('Doctor profile not found for update')
        }

        return doctor
    }
    async search(filter: DoctorSearchFilter, options: { page: number; limit: number }) {
        const skip = (options.page - 1) * options.limit

        const baseFilter: Record<string, unknown> = {
            isActive: filter.isActive,
            ...(filter.verificationStatus && { verificationStatus: filter.verificationStatus }),
        }
        const searchOrConditions: Array<Record<string, unknown>> = []

        if (filter['specializations.name']) {
            baseFilter['specializations.name'] = filter['specializations.name']
        }

        if (filter.$or) {
            const nameSearchConditions = filter.$or.filter((cond) => 'userId.name' in cond)

            if (nameSearchConditions.length > 0) {
                const nameRegexes = nameSearchConditions.map((cond) => cond['userId.name'])
                const userFilters = nameRegexes.map((regex) => ({
                    name: { $regex: regex?.$regex, $options: regex?.$options || 'i' },
                }))

                const users = await UserModel.find({ $or: userFilters }).select('_id')
                const userIdFilter = users.map((u) => u._id)

                if (userIdFilter.length > 0) {
                    searchOrConditions.push({ userId: { $in: userIdFilter } })
                }
            }

            const specialtySearchConditions = filter.$or.filter((cond) => 'specializations.name' in cond)

            if (specialtySearchConditions.length > 0) {
                const specialtyRegexes = specialtySearchConditions.map(
                    (cond) => cond['specializations.name'] as { $regex: string; $options: string },
                )
                searchOrConditions.push({
                    'specializations.name': {
                        $regex: specialtyRegexes[0]?.$regex,
                        $options: specialtyRegexes[0]?.$options || 'i',
                    },
                })
            }
        }

        if (baseFilter['specializations.name'] && searchOrConditions.length > 0) {
            baseFilter.$and = [
                { 'specializations.name': baseFilter['specializations.name'] },
                { $or: searchOrConditions },
            ]
            delete baseFilter['specializations.name']
        } else if (searchOrConditions.length > 0) {
            baseFilter.$or = searchOrConditions
        }

        const [doctors, total] = await Promise.all([
            this.model.find(baseFilter).populate('userId', 'name').skip(skip).limit(options.limit),
            this.model.countDocuments(baseFilter),
        ])

        return { doctors: doctors as unknown as PopulatedDoctorDocument[], total }
    }

    async getSpecialties(): Promise<string[]> {
        const result = await this.model.distinct('specializations.name', { isActive: true })
        return result.filter((s): s is string => !!s)
    }
}
