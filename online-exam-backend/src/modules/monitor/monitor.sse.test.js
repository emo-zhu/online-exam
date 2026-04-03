import assert from 'node:assert/strict'
import test from 'node:test'
import { MonitorSseHub, createMonitorChangeEvent } from './monitor.sse.js'

const createFakeRes = () => {
  const chunks = []
  return {
    chunks,
    writableEnded: false,
    write(chunk) {
      chunks.push(chunk)
    }
  }
}

test('createMonitorChangeEvent 将 id 统一转成字符串，避免 BigInt 无法 JSON 序列化', () => {
  const event = createMonitorChangeEvent('teacher_warn', {
    paperId: 11n,
    studentId: 22n
  })

  assert.equal(event.type, 'teacher_warn')
  assert.equal(event.paperId, '11')
  assert.equal(event.studentId, '22')
  assert.match(event.timestamp, /^\d{4}-\d{2}-\d{2}T/)
})

test('subscribe 会先发 connected，再把 monitor_changed 广播给在线连接', () => {
  const hub = new MonitorSseHub({ heartbeatInterval: 60_000 })
  const res = createFakeRes()

  const unsubscribe = hub.subscribe({ res, userId: '7' })
  hub.broadcastChange(createMonitorChangeEvent('student_submit', {
    paperId: 9,
    studentId: 7
  }))

  assert.equal(res.chunks.length, 2)
  assert.match(res.chunks[0], /event: connected/)
  assert.match(res.chunks[0], /"type":"connected"/)
  assert.match(res.chunks[1], /event: monitor_changed/)
  assert.match(res.chunks[1], /"student_submit"/)

  unsubscribe()
  assert.equal(hub.clients.size, 0)
})
