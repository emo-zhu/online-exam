import { success } from '../../common/response/index.js'
import { paperService } from './paper.service.js'

export const paperController = {
  async list(ctx) {
    const data = await paperService.listPapers(ctx.request.query)
    success(ctx, data)
  },

  async detail(ctx) {
    const data = await paperService.getPaperDetail(ctx.params.id)
    success(ctx, data)
  },

  async create(ctx) {
    const data = await paperService.createPaper(ctx.request.body, ctx.state.user)
    success(ctx, data)
  },

  async update(ctx) {
    const data = await paperService.updatePaper(ctx.params.id, ctx.request.body)
    success(ctx, data)
  },

  async updateStatus(ctx) {
    const data = await paperService.updatePaperStatus(ctx.params.id, ctx.request.body)
    success(ctx, data)
  },

  async remove(ctx) {
    await paperService.deletePaper(ctx.params.id)
    success(ctx, null)
  }
}
