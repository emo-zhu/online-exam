import { success } from '../../common/response/index.js'
import { scoreService } from './score.service.js'

export const scoreController = {
  async list(ctx) {
    const data = await scoreService.listScores(ctx.request.query)
    success(ctx, data)
  },

  async stats(ctx) {
    const data = await scoreService.getScoreStats(ctx.request.query)
    success(ctx, data)
  },

  async export(ctx) {
    const { filename, buffer } = await scoreService.exportScores(ctx.request.query)
    ctx.status = 200
    ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    ctx.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)
    ctx.body = buffer
  }
}
