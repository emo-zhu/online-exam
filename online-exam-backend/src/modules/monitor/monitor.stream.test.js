import assert from 'node:assert/strict'
import test from 'node:test'
import { monitorController } from './monitor.controller.js'
import { monitorSseHub, SSE_HEADERS } from './monitor.sse.js'

test('stream 会设置 SSE 响应头并在请求结束时清理订阅', async () => {
  const listeners = {}
  let unsubscribeCalled = false
  const originalSubscribe = monitorSseHub.subscribe

  monitorSseHub.subscribe = ({ res, userId }) => {
    assert.equal(userId, '5')
    assert.ok(res)
    return () => {
      unsubscribeCalled = true
    }
  }

  const ctx = {
    state: { user: { id: 5n } },
    req: {
      setTimeout() {},
      on(event, handler) {
        listeners[event] = handler
      }
    },
    res: {
      flushHeaders() {}
    },
    set(headers) {
      this.headers = headers
    },
    status: 0,
    respond: true
  }

  await monitorController.stream(ctx)

  assert.equal(ctx.status, 200)
  assert.equal(ctx.respond, false)
  assert.deepEqual(ctx.headers, SSE_HEADERS)
  assert.equal(typeof listeners.close, 'function')

  listeners.close()
  assert.equal(unsubscribeCalled, true)
  monitorSseHub.subscribe = originalSubscribe
})
