import { success } from '../../common/response/index.js'
import { noticeService } from './notice.service.js'

export const noticeController = {
  async list(ctx) {
    const data = await noticeService.listNotices(ctx.request.query)
    success(ctx, data)
  },

  async create(ctx) {
    const data = await noticeService.createNotice(ctx.request.body, ctx.state.user)
    success(ctx, data)
  },

  async update(ctx) {
    const data = await noticeService.updateNotice(ctx.params.id, ctx.request.body)
    success(ctx, data)
  },

  async remove(ctx) {
    await noticeService.deleteNotice(ctx.params.id)
    success(ctx, null)
  }
}
