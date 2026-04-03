import { randomUUID } from 'crypto'

export const requestId = async (ctx, next) => {
  ctx.state.requestId = ctx.get('x-request-id') || randomUUID()
  ctx.set('x-request-id', ctx.state.requestId)
  await next()
}
