import { Document, Model } from 'mongoose'

export abstract class BaseRepository<T extends Document> {
    constructor(protected model: Model<T>) {}

    async create(data: Partial<T>): Promise<T> {
        return this.model.create(data)
    }

    async findById(id: string): Promise<T | null> {
        return this.model.findById(id)
    }

    async findOne(filter: Record<string, any>): Promise<T | null> {
        return this.model.findOne(filter)
    }

    async findAll(filter: Record<string, any>): Promise<T[]> {
        return this.model.find(filter)
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, data, { new: true })
    }

    async delete(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id)
    }
}
