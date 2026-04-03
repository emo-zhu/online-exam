import assert from 'node:assert/strict'
import test from 'node:test'
import { openSseStream, parseSseBlock, splitSseBuffer } from './sse.js'

const createStreamBody = (chunks) => ({
  getReader() {
    let index = 0

    return {
      async read() {
        if (index >= chunks.length) {
          return { done: true, value: undefined }
        }

        const value = new TextEncoder().encode(chunks[index])
        index += 1
        return { done: false, value }
      },
      releaseLock() {}
    }
  }
})

test('splitSseBuffer 会拆出完整事件块并保留尾部残片', () => {
  const [blocks, rest] = splitSseBuffer('event: ping\ndata: 1\n\nevent: pong\ndata: 2')

  assert.deepEqual(blocks, ['event: ping\ndata: 1'])
  assert.equal(rest, 'event: pong\ndata: 2')
})

test('parseSseBlock 会解析事件名和 JSON 数据', () => {
  const parsed = parseSseBlock('event: monitor_changed\ndata: {"type":"student_submit","paperId":"11"}')

  assert.deepEqual(parsed, {
    event: 'monitor_changed',
    data: {
      type: 'student_submit',
      paperId: '11'
    }
  })
})

test('openSseStream 会消费事件流并触发回调', async () => {
  const originalFetch = globalThis.fetch
  const events = []
  let opened = false
  let requestHeaders = null

  globalThis.fetch = async (_url, options) => {
    requestHeaders = options.headers

    return {
      ok: true,
      status: 200,
      body: createStreamBody([
        'event: connected\ndata: {"type":"connected"}\n\n',
        'event: monitor_changed\ndata: {"type":"teacher_warn","paperId":"11","studentId":"22"}\n\n'
      ])
    }
  }

  try {
    await assert.rejects(
      () => openSseStream({
        url: '/api/v1/monitor/stream',
        token: 'test-token',
        onOpen() {
          opened = true
        },
        onEvent(payload) {
          events.push(payload)
        }
      }),
      /实时连接已断开/
    )

    assert.equal(opened, true)
    assert.equal(requestHeaders.Authorization, 'Bearer test-token')
    assert.equal(requestHeaders.Accept, 'text/event-stream')
    assert.deepEqual(events, [
      {
        event: 'connected',
        data: {
          type: 'connected'
        }
      },
      {
        event: 'monitor_changed',
        data: {
          type: 'teacher_warn',
          paperId: '11',
          studentId: '22'
        }
      }
    ])
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('openSseStream 遇到 401 会抛出带状态码的错误', async () => {
  const originalFetch = globalThis.fetch

  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    body: null
  })

  try {
    await assert.rejects(async () => {
      await openSseStream({
        url: '/api/v1/monitor/stream',
        token: 'expired-token'
      })
    }, (error) => {
      assert.equal(error.message, '登录已失效')
      assert.equal(error.status, 401)
      return true
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
