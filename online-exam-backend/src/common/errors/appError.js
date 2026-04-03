export class AppError extends Error {
  constructor(message, { code, status = 200, data = null } = {}) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.data = data
  }
}
