import { z } from '../../common/middleware/validate.js'

const idSchema = z.object({
  id: z.string().regex(/^\d+$/)
})

const userIdValueSchema = z.union([z.string(), z.number(), z.bigint()])

export const userListQuerySchema = z.object({
  pageNum: z.string().optional(),
  pageSize: z.string().optional(),
  realName: z.string().optional(),
  role: z.enum(['admin', 'teacher', 'student']).optional(),
  classId: z.string().regex(/^\d+$/).optional()
})

export const createUserSchema = z.object({
  username: z.string().trim().min(3).max(50),
  realName: z.string().trim().min(1).max(50),
  role: z.enum(['admin', 'teacher', 'student']),
  classId: z.union([z.string(), z.number(), z.bigint()]).optional().nullable(),
  password: z.string().min(6).max(20).optional()
})

export const updateUserSchema = z.object({
  realName: z.string().trim().min(1).max(50).optional(),
  role: z.enum(['admin', 'teacher', 'student']).optional(),
  classId: z.union([z.string(), z.number(), z.bigint()]).optional().nullable(),
  status: z.number().int().min(0).max(1).optional()
})

export const updateUserStatusSchema = z.object({
  status: z.number().int().min(0).max(1)
})

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6).max(20).optional()
})

export const batchDeleteUsersSchema = z.object({
  ids: z.array(userIdValueSchema).min(1)
})

export const userExportQuerySchema = userListQuerySchema
export const userIdParamsSchema = idSchema
