import jwt from 'jsonwebtoken'
import { env } from './env.js'

export const signAccessToken = (payload) => jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn })

export const signRefreshToken = (payload) => jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn })

export const signCaptchaToken = (payload) => jwt.sign(payload, env.jwtAccessSecret, { expiresIn: '5m' })

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret)

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret)

export const verifyCaptchaToken = (token) => jwt.verify(token, env.jwtAccessSecret)
