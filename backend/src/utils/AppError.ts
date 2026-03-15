export class AppError extends Error {
    statusCode: number
    constructor(statusCode: number, messageOrError: string | unknown) {
        const msg =
            typeof messageOrError === 'string'
                ? messageOrError
                : messageOrError instanceof Error
                  ? messageOrError.message
                  : String(messageOrError)

        super(msg)
        this.statusCode = statusCode

        Object.setPrototypeOf(this, AppError.prototype)
    }
}
