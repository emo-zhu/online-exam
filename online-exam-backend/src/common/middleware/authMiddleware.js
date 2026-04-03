import { AppError } from '../errors/appError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'
import { verifyAccessToken } from '../../config/jwt.js'
import { prisma } from '../../config/prisma.js'

export const authMiddleware = async (ctx, next) => {
  if (!ctx.path.startsWith('/api/v1')) {
    await next()
    return
  }

  const publicPaths = new Set([
    '/api/v1/health',
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/refresh-token',
    '/api/v1/auth/captcha'
  ])

  if (publicPaths.has(ctx.path) || ctx.path.startsWith('/api/v1/questions/content-images/')) {
    await next()
    return
  }

  const authorization = ctx.get('authorization')
  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError('未登录或 token 无效', { code: ERROR_CODES.UNAUTHORIZED, status: 401 })
  }

  const token = authorization.slice(7)
  let payload
  try {
    payload = verifyAccessToken(token)
  } catch {
    throw new AppError('未登录或 token 无效', { code: ERROR_CODES.UNAUTHORIZED, status: 401 })
  }

  const user = await prisma.sysUser.findUnique({
    where: { id: BigInt(payload.userId) },
    include: { userRoles: { include: { role: true } } }
  })

  if (!user || user.status !== 1) {
    throw new AppError('用户不存在或已停用', { code: ERROR_CODES.UNAUTHORIZED, status: 401 })
  }

  ctx.state.user = {
    id: user.id,
    username: user.username,
    realName: user.realName,
    classId: user.classId,
    roles: user.userRoles.map((item) => item.role.roleCode)
  }

  await next()
}
