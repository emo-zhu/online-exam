const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

export const randomString = (length = 18) => Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')

export const randomCaptchaCode = (length = 4) => Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
