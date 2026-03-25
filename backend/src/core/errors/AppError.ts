export class AppError extends Error {
    statusCode: number
    isOperational: boolean

    constructor(statusCode: number, messageOrError: string | unknown) {
        const message =
            typeof messageOrError === 'string'
                ? messageOrError
                : messageOrError instanceof Error
                  ? messageOrError.message
                  : String(messageOrError)

        super(message)

        this.statusCode = statusCode
        this.isOperational = true

        Object.setPrototypeOf(this, AppError.prototype)

        Error.captureStackTrace(this, this.constructor)
    }
}
