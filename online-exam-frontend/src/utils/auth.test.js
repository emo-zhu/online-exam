import assert from 'node:assert/strict'
import test from 'node:test'
import { clearAuthStorage, getRefreshToken, getToken, handleAuthExpired, setAuthExpiredHandler, setRefreshToken, setToken } from './auth.js'

const createStorage = () => {
  const store = new Map()
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null
    },
    setItem(key, value) {
      store.set(key, String(value))
    },
    removeItem(key) {
      store.delete(key)
    }
  }
}

test('handleAuthExpired 会清理登录态并跳转到登录页', async () => {
  const originalLocalStorage = globalThis.localStorage
  const originalWindow = globalThis.window

  let redirectedTo = ''
  let handlerCalled = false

  globalThis.localStorage = createStorage()
  globalThis.window = {
    location: {
      pathname: '/monitor/index',
      search: '?tab=realtime',
      hash: '#top',
      replace(url) {
        redirectedTo = url
      }
    }
  }

  setToken('token-1')
  setRefreshToken('refresh-1')
  setAuthExpiredHandler(async () => {
    handlerCalled = true
  })

  try {
    await handleAuthExpired()

    assert.equal(getToken(), null)
    assert.equal(getRefreshToken(), null)
    assert.equal(handlerCalled, true)
    assert.equal(redirectedTo, '/login?redirect=%2Fmonitor%2Findex%3Ftab%3Drealtime%23top')
  } finally {
    clearAuthStorage()
    setAuthExpiredHandler(null)
    globalThis.localStorage = originalLocalStorage
    globalThis.window = originalWindow
  }
})

test('handleAuthExpired 在登录页不会重复跳转', async () => {
  const originalLocalStorage = globalThis.localStorage
  const originalWindow = globalThis.window

  let redirected = false

  globalThis.localStorage = createStorage()
  globalThis.window = {
    location: {
      pathname: '/login',
      search: '',
      hash: '',
      replace() {
        redirected = true
      }
    }
  }

  setAuthExpiredHandler(null)

  try {
    await handleAuthExpired()
    assert.equal(redirected, false)
  } finally {
    globalThis.localStorage = originalLocalStorage
    globalThis.window = originalWindow
  }
})
