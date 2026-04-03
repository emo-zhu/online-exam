import { z } from '../../common/middleware/validate.js'

export const loginLogQuerySchema = z.object({
  pageNum: z.string().optional(),
  pageSize: z.string().optional(),
  username: z.string().optional(),
  status: z.string().regex(/^[01]$/).optional()
})
