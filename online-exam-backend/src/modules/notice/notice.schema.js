import { z } from '../../common/middleware/validate.js'

const idSchema = z.object({
  id: z.string().regex(/^\d+$/)
})

export const noticeListQuerySchema = z.object({
  pageNum: z.string().optional(),
  pageSize: z.string().optional(),
  title: z.string().optional()
})

export const createNoticeSchema = z.object({
  title: z.string().trim().min(1).max(200),
  type: z.enum(['exam', 'maintain', 'system']),
  content: z.string().trim().min(1)
})

export const updateNoticeSchema = createNoticeSchema
export const noticeIdParamsSchema = idSchema
