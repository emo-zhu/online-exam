# 监控页 SSE 实时刷新 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让考试监控页在学生登录、正常交卷、发送警告、强制交卷后通过 SSE 自动刷新，而不是依赖固定轮询。

**Architecture:** 后端在 monitor 模块内增加一个轻量 SSE broadcaster 和 `/api/v1/monitor/stream` 订阅接口；监控页建立带 Bearer Token 的 SSE 长连接，收到事件后继续调用现有 `refreshData()` 拉取最新快照。SSE 是主通道，现有 10 秒轮询只在 SSE 断线时兜底，从而把改动限制在监控页和几个已知事件源上。

**Tech Stack:** Koa、Vue 3、Element Plus、原生 `fetch` + `ReadableStream`、Node.js 内置 `node:test`

---

> **Workspace note:** 当前工作区不是 git repository，所以本计划用“验证检查点”代替提交步骤；如果后续初始化了 git，请在每个任务完成后立即提交一次。

## File map

### Backend
- Create: `online-exam-backend/src/modules/monitor/monitor.sse.js`
  - 维护在线 SSE 客户端、心跳、事件序列化、广播方法。
- Create: `online-exam-backend/src/modules/monitor/monitor.sse.test.js`
  - 覆盖事件序列化、注册连接、广播、清理连接。
- Create: `online-exam-backend/src/modules/monitor/monitor.stream.test.js`
  - 用 mock `ctx` 验证 controller 是否正确设置 SSE 响应头和清理回调。
- Modify: `online-exam-backend/src/modules/monitor/monitor.controller.js`
  - 新增 `stream(ctx)` SSE 入口。
- Modify: `online-exam-backend/src/modules/monitor/monitor.router.js`
  - 新增 `GET /stream` 路由。
- Modify: `online-exam-backend/src/modules/monitor/monitor.service.js`
  - 在 `warnStudent()` / `forceSubmitStudent()` 成功后广播监控事件。
- Modify: `online-exam-backend/src/modules/examRecord/examRecord.service.js`
  - 在 `submitStudentExam()` 成功后广播学生交卷事件。
- Modify: `online-exam-backend/src/modules/auth/auth.service.js`
  - 在学生登录成功后广播登录事件。

### Frontend
- Create: `online-exam-frontend/src/utils/sse.js`
  - 封装带 token 的 SSE 流读取、消息拆包、事件解析。
- Create: `online-exam-frontend/src/utils/sse.test.js`
  - 覆盖消息拆包与 JSON 事件解析。
- Modify: `online-exam-frontend/src/views/monitor/index.vue`
  - 接入 SSE 连接、连接状态展示、断线重连、轮询降级。

## Task 1: 后端 SSE broadcaster 核心

**Files:**
- Create: `online-exam-backend/src/modules/monitor/monitor.sse.js`
- Test: `online-exam-backend/src/modules/monitor/monitor.sse.test.js`

- [ ] **Step 1: 写一个失败的 broadcaster 测试**

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { MonitorSseHub, createMonitorChangeEvent, toSseChunk } from './monitor.sse.js'

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
```

- [ ] **Step 2: 运行测试，确认它先失败**

Run:
```bash
node --test online-exam-backend/src/modules/monitor/monitor.sse.test.js
```

Expected:
```text
ERR_MODULE_NOT_FOUND: Cannot find module '.../monitor.sse.js'
```

- [ ] **Step 3: 写最小 broadcaster 实现**

```js
const SSE_HEADERS = Object.freeze({
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no'
})

const normalizeEventId = (value) => {
  if (value === null || value === undefined) {
    return null
  }
  return String(value)
}

export const toSseChunk = (event, data) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`

export const createMonitorChangeEvent = (type, { paperId = null, studentId = null } = {}) => ({
  type,
  paperId: normalizeEventId(paperId),
  studentId: normalizeEventId(studentId),
  timestamp: new Date().toISOString()
})

export class MonitorSseHub {
  constructor({ heartbeatInterval = 15_000 } = {}) {
    this.clients = new Map()
    this.heartbeatInterval = heartbeatInterval
    this.heartbeatTimer = null
  }

  subscribe({ res, userId = null }) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    this.clients.set(id, { id, res, userId })
    this.ensureHeartbeat()
    this.writeClient(id, 'connected', {
      type: 'connected',
      timestamp: new Date().toISOString()
    })

    return () => {
      this.clients.delete(id)
      if (this.clients.size === 0 && this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer)
        this.heartbeatTimer = null
      }
    }
  }

  broadcastChange(payload) {
    this.broadcast('monitor_changed', payload)
  }

  broadcast(event, payload) {
    for (const client of this.clients.values()) {
      if (client.res.writableEnded) {
        this.clients.delete(client.id)
        continue
      }

      try {
        client.res.write(toSseChunk(event, payload))
      } catch {
        this.clients.delete(client.id)
      }
    }
  }

  writeClient(id, event, payload) {
    const client = this.clients.get(id)
    if (!client || client.res.writableEnded) {
      this.clients.delete(id)
      return
    }

    client.res.write(toSseChunk(event, payload))
  }

  ensureHeartbeat() {
    if (this.heartbeatTimer || this.clients.size === 0) {
      return
    }

    this.heartbeatTimer = setInterval(() => {
      this.broadcast('heartbeat', {
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      })
    }, this.heartbeatInterval)
  }
}

export const monitorSseHub = new MonitorSseHub()
export { SSE_HEADERS }
```

- [ ] **Step 4: 把测试断言改成稳定版本并重新跑通**

把测试里的 connected 断言替换成这段，避免依赖动态时间戳全文匹配：

```js
  assert.match(res.chunks[0], /event: connected/)
  assert.match(res.chunks[0], /"type":"connected"/)
```

Run:
```bash
node --test online-exam-backend/src/modules/monitor/monitor.sse.test.js
```

Expected:
```text
# tests 2
# pass 2
# fail 0
```

## Task 2: 暴露 `/api/v1/monitor/stream` SSE 接口

**Files:**
- Create: `online-exam-backend/src/modules/monitor/monitor.stream.test.js`
- Modify: `online-exam-backend/src/modules/monitor/monitor.controller.js`
- Modify: `online-exam-backend/src/modules/monitor/monitor.router.js`
- Reference: `online-exam-backend/src/modules/monitor/monitor.sse.js`

- [ ] **Step 1: 先写 controller 层失败测试**

```js
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
```

- [ ] **Step 2: 运行测试，确认现在失败**

Run:
```bash
node --test online-exam-backend/src/modules/monitor/monitor.stream.test.js
```

Expected:
```text
TypeError: monitorController.stream is not a function
```

- [ ] **Step 3: 实现 stream controller 和路由**

在 `online-exam-backend/src/modules/monitor/monitor.controller.js` 增加：

```js
import { SSE_HEADERS, monitorSseHub } from './monitor.sse.js'

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
```

在 `online-exam-backend/src/modules/monitor/monitor.router.js` 增加路由，放在其他 monitor GET 路由前面：

```js
monitorRouter.get('/stream', monitorController.stream)
```

- [ ] **Step 4: 重新运行 controller 测试**

Run:
```bash
node --test online-exam-backend/src/modules/monitor/monitor.stream.test.js
```

Expected:
```text
# tests 1
# pass 1
# fail 0
```

- [ ] **Step 5: 用 curl 做一次接口冒烟检查**

先启动后端：
```bash
npm --prefix "/Users/emozhu/Desktop/NewWorkspaceFront/online-exam-backend" run dev
```

再用教师或管理员 token 建流：
```bash
curl -N -H "Authorization: Bearer <教师token>" http://localhost:3000/api/v1/monitor/stream
```

Expected first output:
```text
event: connected
data: {"type":"connected","timestamp":"..."}
```

## Task 3: 从现有业务成功路径广播监控事件

**Files:**
- Modify: `online-exam-backend/src/modules/monitor/monitor.service.js`
- Modify: `online-exam-backend/src/modules/examRecord/examRecord.service.js`
- Modify: `online-exam-backend/src/modules/auth/auth.service.js`
- Reference: `online-exam-backend/src/modules/monitor/monitor.sse.js`

- [ ] **Step 1: 先做一次失败的业务冒烟**

保持 Task 2 的 `curl -N` 长连接打开，然后分别触发一次“发送警告 / 强制交卷 / 学生登录 / 学生正常交卷”。

Expected before wiring:
```text
只有 connected / heartbeat，没有 monitor_changed 业务事件
```

- [ ] **Step 2: 在 monitor.service.js 的警告与强制交卷成功后广播事件**

在文件顶部增加：

```js
import { createMonitorChangeEvent, monitorSseHub } from './monitor.sse.js'
```

在 `warnStudent()` 成功创建日志后追加：

```js
    monitorSseHub.broadcastChange(createMonitorChangeEvent('teacher_warn', {
      paperId,
      studentId
    }))
```

在 `forceSubmitStudent()` 成功创建日志后追加：

```js
    monitorSseHub.broadcastChange(createMonitorChangeEvent('teacher_force_submit', {
      paperId,
      studentId
    }))
```

- [ ] **Step 3: 在 examRecord.service.js 的正常交卷成功后广播事件**

在文件顶部增加：

```js
import { createMonitorChangeEvent, monitorSseHub } from '../monitor/monitor.sse.js'
```

在 `submitStudentExam()` 里 `saveSubmittedRecord()` 成功之后、`return` 之前加入：

```js
    monitorSseHub.broadcastChange(createMonitorChangeEvent('student_submit', {
      paperId: savedRecord.paperId,
      studentId: savedRecord.studentId
    }))
```

如果 `savedRecord` 当前没有 `studentId`，先把 repository 返回对象里的 `studentId` 保留下来，不要新加额外查询。

- [ ] **Step 4: 在 auth.service.js 的学生登录成功后广播事件**

在文件顶部增加：

```js
import { createMonitorChangeEvent, monitorSseHub } from '../monitor/monitor.sse.js'
```

在 `login()` 成功写入登录日志后、返回 token 之前追加：

```js
    const isStudent = user.userRoles.some((item) => item.role.roleCode === 'student')
    if (isStudent) {
      monitorSseHub.broadcastChange(createMonitorChangeEvent('student_login', {
        studentId: user.id
      }))
    }
```

- [ ] **Step 5: 重新跑业务冒烟，确认能看到业务事件**

保持 `curl -N` 打开，再触发 4 种业务动作。

Expected:
```text
event: monitor_changed
data: {"type":"teacher_warn","paperId":"11","studentId":"25","timestamp":"..."}

event: monitor_changed
data: {"type":"student_login","paperId":null,"studentId":"25","timestamp":"..."}
```

## Task 4: 前端可带 token 的 SSE 流工具

**Files:**
- Create: `online-exam-frontend/src/utils/sse.js`
- Test: `online-exam-frontend/src/utils/sse.test.js`

- [ ] **Step 1: 写一个失败的前端 SSE 工具测试**

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { parseSseBlock, splitSseBuffer } from './sse.js'

test('splitSseBuffer 能拆出完整 block 并保留残余内容', () => {
  const { blocks, rest } = splitSseBuffer('event: connected\ndata: {"type":"connected"}\n\nevent: heart')

  assert.equal(blocks.length, 1)
  assert.equal(rest, 'event: heart')
})

test('parseSseBlock 能解析 event 名和 JSON data', () => {
  const parsed = parseSseBlock('event: monitor_changed\ndata: {"type":"student_submit","paperId":"11"}')

  assert.deepEqual(parsed, {
    event: 'monitor_changed',
    data: {
      type: 'student_submit',
      paperId: '11'
    }
  })
})
```

- [ ] **Step 2: 运行测试，确认它先失败**

Run:
```bash
node --test online-exam-frontend/src/utils/sse.test.js
```

Expected:
```text
ERR_MODULE_NOT_FOUND: Cannot find module '.../sse.js'
```

- [ ] **Step 3: 写最小 SSE 工具实现**

```js
export const splitSseBuffer = (buffer) => {
  const parts = buffer.split('\n\n')
  return {
    blocks: parts.slice(0, -1),
    rest: parts.at(-1) || ''
  }
}

export const parseSseBlock = (block) => {
  let event = 'message'
  const dataLines = []

  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) {
      continue
    }

    if (line.startsWith('event:')) {
      event = line.slice('event:'.length).trim()
      continue
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trim())
    }
  }

  if (dataLines.length === 0) {
    return null
  }

  return {
    event,
    data: JSON.parse(dataLines.join('\n'))
  }
}

export const openSseStream = async ({ url, token, signal, onOpen, onEvent }) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store',
    signal
  })

  if (!response.ok || !response.body) {
    const error = new Error('SSE 连接失败')
    error.status = response.status
    throw error
  }

  onOpen?.()

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const { blocks, rest } = splitSseBuffer(buffer)
    buffer = rest

    for (const block of blocks) {
      const parsed = parseSseBlock(block)
      if (parsed) {
        onEvent?.(parsed)
      }
    }
  }
}
```

- [ ] **Step 4: 重新运行工具测试**

Run:
```bash
node --test online-exam-frontend/src/utils/sse.test.js
```

Expected:
```text
# tests 2
# pass 2
# fail 0
```

## Task 5: 监控页接入 SSE、状态提示和轮询降级

**Files:**
- Modify: `online-exam-frontend/src/views/monitor/index.vue`
- Create: `online-exam-frontend/src/utils/sse.js`
- Reference: `online-exam-frontend/src/utils/auth.js`

- [ ] **Step 1: 在页面顶部先加连接状态文案位置**

把右上角刷新区域改成同时显示连接状态和更新时间：

```vue
<div class="right-panel">
  <el-tooltip content="刷新数据" placement="top">
    <el-button type="primary" icon="Refresh" circle class="refresh-btn" :loading="loading || streamRefreshing" @click="refreshData(true)" />
  </el-tooltip>
  <span class="stream-status" :class="streamStatus">{{ streamStatusText }}</span>
  <span class="refresh-text" v-if="lastUpdateTime">更新于 {{ lastUpdateTime }}</span>
</div>
```

- [ ] **Step 2: 先接入页面状态、连接与重连逻辑**

在 `<script setup>` 顶部补这些导入和状态：

```js
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getToken, callAuthExpiredHandler, clearAuthStorage } from '@/utils/auth'
import { openSseStream } from '@/utils/sse'

const streamStatus = ref('connecting')
const streamRefreshing = ref(false)
const streamAbortController = ref(null)
const streamReconnectTimer = ref(null)
const streamEnabled = ref(false)

const streamStatusText = computed(() => ({
  connecting: '实时连接中',
  connected: '实时连接中',
  reconnecting: '实时连接断开，正在重连',
  fallback: '实时连接失败，已切换轮询'
}[streamStatus.value] || '实时连接中'))
```

再加清理与重连函数：

```js
const clearStreamReconnectTimer = () => {
  if (streamReconnectTimer.value) {
    clearTimeout(streamReconnectTimer.value)
    streamReconnectTimer.value = null
  }
}

const closeMonitorStream = () => {
  streamEnabled.value = false
  clearStreamReconnectTimer()
  if (streamAbortController.value) {
    streamAbortController.value.abort()
    streamAbortController.value = null
  }
}

const scheduleStreamReconnect = () => {
  clearStreamReconnectTimer()
  streamStatus.value = 'reconnecting'
  streamReconnectTimer.value = setTimeout(() => {
    connectMonitorStream()
  }, 3000)
}
```

- [ ] **Step 3: 实现收到 SSE 事件后的刷新策略和轮询兜底切换**

在页面里增加：

```js
const handleMonitorStreamEvent = async ({ event, data }) => {
  if (event === 'connected' || event === 'heartbeat') {
    return
  }

  if (event !== 'monitor_changed') {
    return
  }

  if (streamRefreshing.value || refreshing.value) {
    return
  }

  streamRefreshing.value = true
  try {
    await refreshData(false, { silent: true })
  } finally {
    streamRefreshing.value = false
  }
}

const connectMonitorStream = async () => {
  const token = getToken()
  if (!token) {
    streamStatus.value = 'fallback'
    startRefreshTimer()
    return
  }

  closeMonitorStream()
  streamEnabled.value = true
  streamStatus.value = 'connecting'
  streamAbortController.value = new AbortController()

  try {
    await openSseStream({
      url: `${import.meta.env.VITE_API_URL || '/api'}/v1/monitor/stream`,
      token,
      signal: streamAbortController.value.signal,
      onOpen: () => {
        streamStatus.value = 'connected'
        clearRefreshTimer()
      },
      onEvent: handleMonitorStreamEvent
    })

    if (streamEnabled.value) {
      streamStatus.value = 'fallback'
      startRefreshTimer()
      scheduleStreamReconnect()
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      return
    }

    if (error?.status === 401) {
      clearAuthStorage()
      await callAuthExpiredHandler()
      return
    }

    streamStatus.value = 'fallback'
    startRefreshTimer()
    scheduleStreamReconnect()
  }
}
```

- [ ] **Step 4: 调整已有轮询逻辑，只在 SSE 不可用时兜底**

把 `startRefreshTimer()` 改成只在 fallback/reconnecting 时启动：

```js
const startRefreshTimer = () => {
  clearRefreshTimer()

  if (!currentExamId.value) {
    return
  }

  if (streamStatus.value === 'connected' || streamStatus.value === 'connecting') {
    return
  }

  refreshTimer.value = setInterval(() => {
    refreshData(false, { silent: true })
  }, AUTO_REFRESH_INTERVAL)
}
```

把挂载和卸载逻辑改成：

```js
onMounted(async () => {
  await fetchActiveExams()
  if (currentExamId.value) {
    await refreshData()
    connectMonitorStream()
  }
})

onUnmounted(() => {
  closeMonitorStream()
  clearRefreshTimer()
})
```

切换考试后只刷新数据，不重启独立轮询：

```js
const handleExamChange = async () => {
  currentPage.value = 1
  await refreshData()
}
```

- [ ] **Step 5: 给连接状态补最小样式**

在 `<style scoped lang="scss">` 中补：

```scss
.stream-status {
  font-size: 13px;
  font-weight: 500;

  &.connected,
  &.connecting {
    color: #10b981;
  }

  &.reconnecting {
    color: #f59e0b;
  }

  &.fallback {
    color: #ef4444;
  }
}
```

- [ ] **Step 6: 运行前端构建验证**

Run:
```bash
npm --prefix "/Users/emozhu/Desktop/NewWorkspaceFront/online-exam-frontend" run build
```

Expected:
```text
vite build completed successfully
```

## Task 6: 联调整条实时链路

**Files:**
- Modify: `online-exam-backend/src/modules/monitor/monitor.service.js`
- Modify: `online-exam-backend/src/modules/examRecord/examRecord.service.js`
- Modify: `online-exam-backend/src/modules/auth/auth.service.js`
- Modify: `online-exam-frontend/src/views/monitor/index.vue`

- [ ] **Step 1: 启动前后端**

Run:
```bash
npm --prefix "/Users/emozhu/Desktop/NewWorkspaceFront/online-exam-backend" run dev
npm --prefix "/Users/emozhu/Desktop/NewWorkspaceFront/online-exam-frontend" run dev
```

Expected:
```text
backend listening on http://localhost:3000
frontend listening on http://localhost:5173
```

- [ ] **Step 2: 用监控页验证连接成功**

Open:
```text
http://localhost:5173/monitor/index
```

Expected:
```text
页面顶部显示“实时连接中”，刷新按钮仍可手动使用
```

- [ ] **Step 3: 验证四条业务链路都会自动刷新**

检查这四项：

```text
1. 学生登录成功后，监控页“实考人数 / 考生状态”自动变化
2. 发送警告后，监控日志自动新增一条 warn
3. 强制交卷后，状态从“考试中”变“已交卷(强制)”并出现日志
4. 学生正常交卷后，状态自动变“已交卷”
```

Expected:
```text
以上四项都无需手动点击刷新按钮
```

- [ ] **Step 4: 验证 SSE 断线降级**

操作：
```text
保持监控页打开，重启后端一次
```

Expected:
```text
监控页短暂显示“实时连接断开，正在重连”或“实时连接失败，已切换轮询”
页面不清空旧数据；后端恢复后重新连上或继续由轮询兜底
```

## Self-review checklist

- Spec coverage: 已覆盖 SSE 订阅接口、广播源、前端连接状态、断线重连、轮询兜底、手工验证。
- Placeholder scan: 计划里没有 `TODO/TBD/implement later`，每个代码步骤都给了明确代码块与命令。
- Type consistency: 所有 SSE 事件统一使用字符串化的 `paperId/studentId`，前端继续用现有 `isSameId()` 进行字符串比较，避免 BigInt/number 混用。
