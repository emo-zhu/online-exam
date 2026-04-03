import bcrypt from 'bcryptjs'
import { authRepository } from './auth.repository.js'
import { signAccessToken, signCaptchaToken, signRefreshToken, verifyCaptchaToken, verifyRefreshToken } from '../../config/jwt.js'
import { env } from '../../config/env.js'
import { AppError } from '../../common/errors/appError.js'
import { ERROR_CODES } from '../../common/constants/errorCodes.js'
import { parseClientInfo } from '../../common/utils/client.js'
import { parseDurationToMs } from '../../common/utils/duration.js'
import { toNullableBigIntId } from '../../common/utils/ids.js'
import { randomCaptchaCode } from '../../common/utils/random.js'
import { formatDateTime } from '../../common/utils/datetime.js'
import { createMonitorChangeEvent, monitorSseHub } from '../monitor/monitor.sse.js'

const buildUserInfo = (user) => ({
  id: user.id,
  username: user.username,
  realName: user.realName,
  avatar: user.avatar || '',
  roles: user.userRoles.map((item) => item.role.roleCode),
  classId: user.classId,
  className: user.class?.className || '',
  lastLoginTime: formatDateTime(user.lastLoginTime)
})

const normalizeCaptchaCode = (value = '') => String(value).trim().toLowerCase()

const validateCaptcha = (payload) => {
  let decoded

  try {
    decoded = verifyCaptchaToken(payload.captchaToken)
  } catch {
    throw new AppError('验证码已失效，请刷新后重试', { code: ERROR_CODES.BAD_REQUEST, status: 400 })
  }

  const actualCode = normalizeCaptchaCode(decoded.code)
  const submittedCode = normalizeCaptchaCode(payload.code)

  if (!actualCode || actualCode !== submittedCode) {
    throw new AppError('验证码错误', { code: ERROR_CODES.BAD_REQUEST, status: 400 })
  }
}

const persistRefreshToken = async (user) => {
  const refreshToken = signRefreshToken({ userId: user.id.toString(), username: user.username })
  const decoded = verifyRefreshToken(refreshToken)
  const expiresAt = new Date(decoded.exp * 1000)

  await authRepository.createRefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt
  })

  return refreshToken
}

export const authService = {
  async getCaptcha() {
    const code = randomCaptchaCode(4)
    const expiresIn = Math.floor(parseDurationToMs('5m') / 1000)
    return {
      code,
      captchaToken: signCaptchaToken({ code }),
      expiresIn
    }
  },

  async login(payload, ctx) {
    validateCaptcha(payload)

    const user = await authRepository.findUserByUsername(payload.username)
    const clientInfo = parseClientInfo(ctx)

    if (!user) {
      await authRepository.createLoginLog({
        usernameSnapshot: payload.username,
        status: 0,
        message: '用户不存在',
        loginTime: new Date(),
        ...clientInfo
      })
      throw new AppError('用户名或密码错误', { code: ERROR_CODES.BAD_REQUEST, status: 400 })
    }

    if (user.status !== 1) {
      await authRepository.createLoginLog({
        userId: user.id,
        usernameSnapshot: user.username,
        status: 0,
        message: '账号已停用',
        loginTime: new Date(),
        ...clientInfo
      })
      throw new AppError('用户已停用', { code: ERROR_CODES.FORBIDDEN, status: 403 })
    }

    const matched = await bcrypt.compare(payload.password, user.passwordHash)
    if (!matched) {
      await authRepository.createLoginLog({
        userId: user.id,
        usernameSnapshot: user.username,
        status: 0,
        message: '密码错误',
        loginTime: new Date(),
        ...clientInfo
      })
      throw new AppError('用户名或密码错误', { code: ERROR_CODES.BAD_REQUEST, status: 400 })
    }

    const token = signAccessToken({ userId: user.id.toString(), username: user.username })
    const refreshToken = await persistRefreshToken(user)
    await authRepository.updateUser(user.id, { lastLoginTime: new Date() })
    await authRepository.createLoginLog({
      userId: user.id,
      usernameSnapshot: user.username,
      status: 1,
      message: '登录成功',
      loginTime: new Date(),
      ...clientInfo
    })

    if (user.userRoles.some((item) => item.role.roleCode === 'student')) {
      monitorSseHub.broadcastChange(createMonitorChangeEvent('student_login', {
        studentId: user.id
      }))
    }

    return {
      token,
      refreshToken,
      expiresIn: Math.floor(parseDurationToMs(env.jwtAccessExpiresIn) / 1000),
      userInfo: buildUserInfo(user)
    }
  },

  async register(payload) {
    const existingUser = await authRepository.findUserByUsername(payload.username)
    if (existingUser) {
      throw new AppError('用户名已存在', { code: ERROR_CODES.CONFLICT, status: 409 })
    }

    const role = await authRepository.findRoleByCode(payload.role)
    if (!role) {
      throw new AppError('角色不存在', { code: ERROR_CODES.VALIDATION_ERROR, status: 400 })
    }

    const passwordHash = await bcrypt.hash(payload.password, 10)
    const user = await authRepository.createUser({
      username: payload.username,
      passwordHash,
      realName: payload.realName || payload.username,
      status: 1,
      classId: payload.role === 'student' ? toNullableBigIntId(payload.classId, 'classId') : null
    })

    await authRepository.replaceUserRoles(user.id, [role.id])
    const createdUser = await authRepository.findUserById(user.id)

    return buildUserInfo(createdUser)
  },

  async getCurrentUser(userId) {
    const user = await authRepository.findUserById(userId)
    if (!user) {
      throw new AppError('用户不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    return buildUserInfo(user)
  },

  async logout(refreshToken, currentUserId) {
    if (refreshToken) {
      const tokenRecord = await authRepository.findRefreshToken(refreshToken)
      if (tokenRecord && tokenRecord.userId === currentUserId && tokenRecord.revokedAt === null) {
        await authRepository.revokeRefreshToken(refreshToken)
      }
      return
    }

    await authRepository.revokeUserRefreshTokens(currentUserId)
  },

  async refreshAccessToken(refreshToken) {
    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      throw new AppError('refresh token 无效', { code: ERROR_CODES.UNAUTHORIZED, status: 401 })
    }

    const tokenRecord = await authRepository.findRefreshToken(refreshToken)
    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      throw new AppError('refresh token 无效', { code: ERROR_CODES.UNAUTHORIZED, status: 401 })
    }

    const token = signAccessToken({ userId: payload.userId, username: payload.username })
    return {
      token,
      refreshToken,
      expiresIn: Math.floor(parseDurationToMs('2h') / 1000)
    }
  },

  async changePassword(userId, payload) {
    const user = await authRepository.findUserById(userId)
    if (!user) {
      throw new AppError('用户不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const matched = await bcrypt.compare(payload.oldPassword, user.passwordHash)
    if (!matched) {
      throw new AppError('旧密码不正确', { code: ERROR_CODES.BAD_REQUEST, status: 400 })
    }

    const passwordHash = await bcrypt.hash(payload.newPassword, 10)
    await authRepository.updateUser(user.id, { passwordHash })
    await authRepository.revokeUserRefreshTokens(user.id)
  },

  formatAuthUser(user) {
    return {
      ...buildUserInfo(user),
      lastLoginTime: formatDateTime(user.lastLoginTime)
    }
  }
}
