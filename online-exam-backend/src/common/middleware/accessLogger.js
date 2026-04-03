export const accessLogger = async (ctx, next) => {
  const start = Date.now()
  let status = ctx.status

  try {
    await next()
    status = ctx.status
  } catch (error) {
    status = error.status || 500
    throw error
  } finally {
    const duration = Date.now() - start
    console.log(`[${ctx.state.requestId}] ${ctx.method} ${ctx.path} ${status} ${duration}ms`)
  }
}
