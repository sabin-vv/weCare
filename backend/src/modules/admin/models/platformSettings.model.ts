import { model, Schema } from 'mongoose'

import { PlatformSettingsDocument } from '../types/admin.types'

const platFormSettingsSchema = new Schema<PlatformSettingsDocument>(
    {
        platformName: {
            type: String,
            required: true,
        },
        contactEmail: {
            type: String,
            required: true,
        },
        address: {
            type: String,
        },
        platformFee: {
            type: Number,
            default: 0,
        },
        platformLogo: {
            type: String,
        },
        platformIcon: {
            type: String,
        },
    },
    { timestamps: true },
)

export const platFoemSettingsModel = model<PlatformSettingsDocument>('PlatformSettings', platFormSettingsSchema)
