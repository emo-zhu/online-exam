import { success } from '../../common/response/index.js'
import { logService } from './log.service.js'

export const logController = {
  async list(ctx) {
    const data = await logService.listLogs(ctx.request.query)
    success(ctx, data)
  },

  async clear(ctx) {
    await logService.clearLogs()
    success(ctx, null)
  }
}
