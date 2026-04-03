import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import test from 'node:test'
import { signCaptchaToken } from '../../config/jwt.js'
import { authService } from './auth.service.js'
import { authRepository } from './auth.repository.js'
import { monitorSseHub } from '../monitor/monitor.sse.js'

const createCtx = () => ({
  ip: '127.0.0.1',
  get(header) {
    if (header === 'user-agent') {
      return 'Mozilla/5.0 (Macintosh) Chrome/123.0'
    }

    return ''
  }
})

test('authService.login 会按角色广播监控事件', async (t) => {
  await t.test('学生登录成功后广播 student_login 事件', async () => {
    const originalCompare = bcrypt.compare
    const originalFindUserByUsername = authRepository.findUserByUsername
    const originalCreateRefreshToken = authRepository.createRefreshToken
    const originalUpdateUser = authRepository.updateUser
    const originalCreateLoginLog = authRepository.createLoginLog
    const originalBroadcastChange = monitorSseHub.broadcastChange

    let broadcastPayload = null

    bcrypt.compare = async () => true
    authRepository.findUserByUsername = async () => ({
      id: 22n,
      username: 'student01',
      passwordHash: 'hashed-password',
      realName: '张三',
      avatar: '',
      status: 1,
      classId: 1n,
      class: { className: '一班' },
      lastLoginTime: null,
      userRoles: [{ role: { roleCode: 'student' } }]
    })
    authRepository.createRefreshToken = async () => {}
    authRepository.updateUser = async () => {}
    authRepository.createLoginLog = async () => {}
    monitorSseHub.broadcastChange = (payload) => {
      broadcastPayload = payload
    }

    try {
      const result = await authService.login({
        username: 'student01',
        password: '123456',
        code: 'abcd',
        captchaToken: signCaptchaToken({ code: 'abcd' })
      }, createCtx())

      assert.equal(result.userInfo.id, 22n)
      assert.equal(broadcastPayload?.type, 'student_login')
      assert.equal(broadcastPayload?.paperId, null)
      assert.equal(broadcastPayload?.studentId, '22')
      assert.match(broadcastPayload?.timestamp || '', /^\d{4}-\d{2}-\d{2}T/)
    } finally {
      bcrypt.compare = originalCompare
      authRepository.findUserByUsername = originalFindUserByUsername
      authRepository.createRefreshToken = originalCreateRefreshToken
      authRepository.updateUser = originalUpdateUser
      authRepository.createLoginLog = originalCreateLoginLog
      monitorSseHub.broadcastChange = originalBroadcastChange
    }
  })

  await t.test('非学生登录成功后不广播 student_login 事件', async () => {
    const originalCompare = bcrypt.compare
    const originalFindUserByUsername = authRepository.findUserByUsername
    const originalCreateRefreshToken = authRepository.createRefreshToken
    const originalUpdateUser = authRepository.updateUser
    const originalCreateLoginLog = authRepository.createLoginLog
    const originalBroadcastChange = monitorSseHub.broadcastChange

    let broadcastCalled = false

    bcrypt.compare = async () => true
    authRepository.findUserByUsername = async () => ({
      id: 33n,
      username: 'teacher01',
      passwordHash: 'hashed-password',
      realName: '李老师',
      avatar: '',
      status: 1,
      classId: null,
      class: null,
      lastLoginTime: null,
      userRoles: [{ role: { roleCode: 'teacher' } }]
    })
    authRepository.createRefreshToken = async () => {}
    authRepository.updateUser = async () => {}
    authRepository.createLoginLog = async () => {}
    monitorSseHub.broadcastChange = () => {
      broadcastCalled = true
    }

    try {
      await authService.login({
        username: 'teacher01',
        password: '123456',
        code: 'abcd',
        captchaToken: signCaptchaToken({ code: 'abcd' })
      }, createCtx())

      assert.equal(broadcastCalled, false)
    } finally {
      bcrypt.compare = originalCompare
      authRepository.findUserByUsername = originalFindUserByUsername
      authRepository.createRefreshToken = originalCreateRefreshToken
      authRepository.updateUser = originalUpdateUser
      authRepository.createLoginLog = originalCreateLoginLog
      monitorSseHub.broadcastChange = originalBroadcastChange
    }
  })
})
