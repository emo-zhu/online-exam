import { success } from '../../common/response/index.js'
import { monitorService } from './monitor.service.js'
import { SSE_HEADERS, monitorSseHub } from './monitor.sse.js'

export const monitorController = {
  async stream(ctx) {
    ctx.req.setTimeout(0)
    ctx.status = 200
    ctx.set(SSE_HEADERS)
    ctx.respond = false
    ctx.res.flushHeaders?.()

    const unsubscribe = monitorSseHub.subscribe({
      res: ctx.res,
      userId: String(ctx.state.user.id)
    })

    const cleanup = () => {
      unsubscribe()
    }

    ctx.req.on('close', cleanup)
    ctx.req.on('end', cleanup)
    ctx.req.on('error', cleanup)
  },

  async listActiveExams(ctx) {
    const data = await monitorService.listActiveExams()
    success(ctx, data)
  },

  async listExamStudents(ctx) {
    const data = await monitorService.listExamStudents(ctx.params.paperId)
    success(ctx, data)
  },

  async warnStudent(ctx) {
    const data = await monitorService.warnStudent(ctx.params.paperId, ctx.request.body, ctx.state.user)
    success(ctx, data)
  },

  async forceSubmitStudent(ctx) {
    const data = await monitorService.forceSubmitStudent(ctx.params.paperId, ctx.request.body, ctx.state.user)
    success(ctx, data)
  },

  async listLogs(ctx) {
    const data = await monitorService.listLogs(ctx.request.query)
    success(ctx, data)
  }
}
