import sanitizeHtml from 'sanitize-html'
import { AppError } from '../errors/appError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'blockquote',
  'ul',
  'ol',
  'li',
  'sub',
  'sup',
  'span',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'pre',
  'code',
  'a',
  'img'
]

const ALLOWED_ATTRIBUTES = {
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height']
}

const SANITIZE_CONFIG = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  parseStyleAttributes: false
}

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  return typeof value === 'string' ? value : String(value)
}

export const sanitizeRichText = (value) => {
  return sanitizeHtml(normalizeValue(value), SANITIZE_CONFIG)
}

export const stripRichText = (value) => {
  return sanitizeHtml(normalizeValue(value), {
    allowedTags: [],
    allowedAttributes: {}
  })
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const hasMeaningfulRichText = (value) => {
  const sanitized = sanitizeRichText(value)
  if (/<img\b/i.test(sanitized)) {
    return true
  }

  return stripRichText(sanitized).length > 0
}

export const sanitizeRequiredRichText = (value, fieldName = '内容') => {
  const sanitized = sanitizeRichText(value)
  if (!hasMeaningfulRichText(sanitized)) {
    throw new AppError(`${fieldName}不能为空`, {
      code: ERROR_CODES.VALIDATION_ERROR,
      status: 400
    })
  }

  return sanitized
}

export const sanitizeOptionalRichText = (value) => {
  const sanitized = sanitizeRichText(value)
  return hasMeaningfulRichText(sanitized) ? sanitized : ''
}
