import { z } from '../../common/middleware/validate.js'

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
  code: z.string().trim().min(1),
  captchaToken: z.string().min(1)
})

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(6).max(20),
  role: z.enum(['teacher', 'student']),
  realName: z.string().trim().min(1).max(50).optional(),
  classId: z.union([z.string(), z.number(), z.bigint()]).optional().nullable()
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
})

export const logoutSchema = z.object({
  refreshToken: z.string().min(1).optional()
}).optional().transform((value) => value ?? {})

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6).max(20)
})
