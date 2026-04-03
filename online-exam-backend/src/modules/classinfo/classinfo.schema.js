import { z } from '../../common/middleware/validate.js'

const idSchema = z.object({
  id: z.string().regex(/^\d+$/)
})

export const classListQuerySchema = z.object({
  pageNum: z.string().optional(),
  pageSize: z.string().optional(),
  className: z.string().optional()
})

export const createClassSchema = z.object({
  className: z.string().trim().min(1).max(100)
})

export const updateClassSchema = z.object({
  className: z.string().trim().min(1).max(100)
})

export const classIdParamsSchema = idSchema
