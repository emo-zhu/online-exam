import { AppError } from '../errors/appError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

export const toBigIntId = (value, fieldName = 'id') => {
  try {
    if (value === undefined || value === null || value === '') {
      throw new Error('empty')
    }
    return BigInt(value)
  } catch {
    throw new AppError(`${fieldName} 非法`, {
      code: ERROR_CODES.VALIDATION_ERROR,
      status: 400
    })
  }
}

export const toNullableBigIntId = (value, fieldName = 'id') => {
  if (value === undefined || value === null || value === '') {
    return null
  }
  return toBigIntId(value, fieldName)
}
