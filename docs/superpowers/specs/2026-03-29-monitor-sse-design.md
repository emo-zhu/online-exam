# 2026-03-29 监控页 SSE 实时刷新设计

## 背景
当前考试监控页 [online-exam-frontend/src/views/monitor/index.vue](online-exam-frontend/src/views/monitor/index.vue) 已支持 10 秒轮询刷新，但仍属于“近实时”。用户当前目标是只把监控页升级为真正实时刷新，不要求同步改造考生端交互。

后端现有监控数据来源已经完备：
- 活动考试列表：`GET /api/v1/monitor/active-exams`
- 某考试考生状态：`GET /api/v1/monitor/exams/:paperId/students`
- 监控日志：`GET /api/v1/monitor/logs`
- 监考动作：警告、强制交卷
- 相关状态变化来源还包括登录成功、学生正常交卷

因此本次设计不重做监控数据模型，只补“服务端推送变化通知 + 前端收到通知后拉取最新快照”的实时链路。

## 目标
1. 监控页在以下场景中无需手动刷新即可自动更新：
   - 学生登录成功
   - 学生正常交卷
   - 监考老师发送警告
   - 监考老师强制交卷
2. 实时链路只服务监控页，不改考生端页面交互。
3. 保持现有 REST 查询接口为数据真源，SSE 只负责通知，不直接承载完整业务数据。
4. 在 SSE 断线或异常时，页面仍能依赖现有轮询兜底。

## 非目标
1. 不实现 WebSocket 双向通信。
2. 不实现“每次切屏都立即推送”。
3. 不实现“每次答题变更都实时推送进度”。
4. 不把完整学生列表或日志明细直接塞入 SSE 消息体。

## 方案对比

### 方案 A：SSE 推送变更通知 + 前端拉快照（推荐）
后端提供一个 SSE 订阅端点，监控页通过 SSE 长连接订阅事件。后端在关键监控事件成功后广播轻量通知，前端收到通知后复用现有 `refreshData()` 拉取最新活动考试、考生状态和日志。

**优点：**
- 单向推送，和监控页看板场景天然匹配
- 比 WebSocket 改动更小，浏览器端更简单
- 继续复用现有 REST 接口和页面状态整理逻辑
- 推送层只通知“变了”，避免推送数据与数据库状态脱节

**缺点：**
- 真正的数据更新仍依赖后续 HTTP 请求
- 若事件很密集，仍可能触发较频繁刷新，需要在前端做并发抑制

### 方案 B：WebSocket 直接推送监控数据
后端维护 WebSocket 连接，并直接推送监控列表或日志数据。

**优点：**
- 协议能力更强，后续扩展双向能力方便

**缺点：**
- 当前需求只需服务端推送，属于过度设计
- 连接管理、鉴权、重连成本都更高
- 需要设计更多数据同步细节

### 方案 C：继续增强轮询
保留 HTTP 轮询，只优化频率和体验。

**优点：**
- 最省改动

**缺点：**
- 不能满足“真正实时”的目标
- 状态变化仍有天然延迟

**结论：** 采用方案 A。

## 总体设计

### 实时模型
- SSE 连接只负责广播“监控数据发生变化”事件。
- 事件 payload 保持轻量，前端不直接渲染事件内容。
- 前端收到事件后，统一调用现有 `refreshData()` 获取最新快照。
- 若 SSE 断线，前端进入自动重连；重连失败期间继续使用轮询兜底。

### 为什么采用“通知 + 拉取”而不是“直接推送完整数据”
- 当前后端已有稳定的聚合查询逻辑，例如 [online-exam-backend/src/modules/monitor/monitor.service.js](online-exam-backend/src/modules/monitor/monitor.service.js) 中对考试状态、日志、考生状态的映射。
- 若将完整快照塞入 SSE，需要在更多位置重复组装相同数据，增加一致性风险。
- 采用“通知 + 拉取”，可以把实时能力限制在边缘层，不扰动现有核心业务服务。

## 后端设计

### 1. 新增 monitor SSE broadcaster
在 monitor 模块内新增一个轻量连接管理器，例如 `monitor.sse.js`，职责：
- 保存所有在线监控页连接
- 支持注册、注销连接
- 定时发送心跳消息，避免空闲连接被中间层断开
- 向所有订阅端广播监控变更事件

连接实体最少需要保存：
- 唯一连接 ID
- Koa `ctx.res`
- 连接建立时间
- 当前用户信息（用于排查问题，可选）

### 2. 新增订阅接口
在 [online-exam-backend/src/modules/monitor/monitor.router.js](online-exam-backend/src/modules/monitor/monitor.router.js) 新增 SSE 接口，例如：
- `GET /api/v1/monitor/stream`

约束：
- 继续走现有鉴权中间件与 `roleGuard(['admin', 'teacher'])`
- 响应头需设置 `Content-Type: text/event-stream`
- 禁用缓存
- 建立连接后立即发送一次握手事件，便于前端识别“已连通”
- 请求断开时清理连接，避免泄漏

### 3. 广播事件来源
第一版只接以下成功路径：

#### 3.1 发送警告成功后广播
位置：
- [online-exam-backend/src/modules/monitor/monitor.service.js](online-exam-backend/src/modules/monitor/monitor.service.js)
- `warnStudent()`

广播用途：
- 让监控页刷新日志

#### 3.2 强制交卷成功后广播
位置：
- `monitor.service.js`
- `forceSubmitStudent()`

广播用途：
- 刷新考生状态
- 刷新监控日志

#### 3.3 学生正常交卷成功后广播
位置：
- [online-exam-backend/src/modules/examRecord/examRecord.service.js](online-exam-backend/src/modules/examRecord/examRecord.service.js)
- `submitStudentExam()`

广播用途：
- 刷新考生状态

#### 3.4 登录成功后广播
位置：
- [online-exam-backend/src/modules/auth/auth.service.js](online-exam-backend/src/modules/auth/auth.service.js)
- `login()`

广播用途：
- 当前监控页“考试中”判断依赖最近登录日志，因此登录成功后需要通知监控页刷新

### 4. 事件格式
统一事件名：`monitor_changed`

数据体示例：

```json
{
  "type": "student_login",
  "paperId": null,
  "studentId": 12,
  "timestamp": "2026-03-29T12:00:00.000Z"
}
```

字段约定：
- `type`: `student_login | student_submit | teacher_warn | teacher_force_submit | heartbeat | connected`
- `paperId`: 与特定考试绑定时传值，不确定时允许为 `null`
- `studentId`: 与具体考生关联时传值，否则可空
- `timestamp`: ISO 时间字符串

注意：
- `student_login` 很可能无法立即映射到某一场考试，因此允许 `paperId` 为空，由前端按“可能影响当前监控页”处理。
- `connected` 与 `heartbeat` 仅用于连接维护，不触发业务刷新。

## 前端设计

### 1. 连接管理
在 [online-exam-frontend/src/views/monitor/index.vue](online-exam-frontend/src/views/monitor/index.vue) 内新增 SSE 生命周期管理：
- 页面挂载时建立 `EventSource`
- 页面卸载时关闭连接
- 断线时自动重连

由于原生 `EventSource` 不支持自定义 `Authorization` 请求头，而当前项目鉴权依赖 Bearer Token（见 [online-exam-backend/src/common/middleware/authMiddleware.js](online-exam-backend/src/common/middleware/authMiddleware.js)），本方案前端改用 `fetch` + `ReadableStream` 手动消费 SSE，而不是直接使用原生 `EventSource`。这样可以继续复用现有 token 存储与请求鉴权方式（见 [online-exam-frontend/src/utils/auth.js](online-exam-frontend/src/utils/auth.js)）。

前端需要封装一个最小 SSE 客户端能力，职责：
- 带 Bearer token 发起订阅请求
- 按 SSE 协议拆分事件
- 暴露 `connected / disconnected / message` 状态
- 支持页面销毁时中断连接
- 支持指数退避或固定间隔重连

### 2. 页面行为
监控页收到 SSE 事件后：
- `connected`：更新连接状态提示，不刷新数据
- `heartbeat`：仅保活，不刷新数据
- `monitor_changed`：如果当前不在刷新中，则调用现有 `refreshData(false, { silent: true })`

为了避免事件风暴导致重复请求：
- 继续复用现有 `refreshing` 防并发逻辑
- 若在刷新过程中收到新事件，本轮不立即再发起并发刷新；后续事件交给下一次消息或轮询兜底

### 3. 轮询兜底策略
保留当前 10 秒轮询，但策略调整为：
- SSE 正常连接时：轮询仍可保留低频兜底，或者暂停
- SSE 断线时：恢复轮询兜底

当前推荐：
- **SSE 正常连接时暂停主动轮询，断线后恢复轮询**

原因：
- 已有实时通知就不必重复请求
- 断线时仍能维持“近实时”可用性

### 4. UI 提示
在监控页顶部补一个轻量状态文案：
- `实时连接中`
- `实时连接断开，正在重连`
- `实时连接失败，已切换轮询`

要求：
- 不使用高频弹窗提示
- 不影响现有手动刷新按钮
- 保持中文文案一致

## 安全与稳定性

### 鉴权
- SSE 订阅接口必须复用现有认证与角色校验
- 仅 `admin` 和 `teacher` 可订阅
- 前端连接失败若因 401，应复用现有登录过期处理流程，而不是静默无限重连

### 资源清理
- 后端必须在连接断开、请求关闭、写入失败时移除订阅连接
- 心跳定时器需集中管理，避免重复创建
- 前端离开页面时必须中止流读取和重连定时器

### 一致性
- SSE 消息不作为业务真源
- 所有实际展示仍以 REST 查询结果为准
- 即使漏掉某条事件，轮询也能在后续兜底恢复正确状态

## 测试与验证

### 手工验证主链路
1. 打开监控页并确认显示“实时连接中”
2. 学生登录后，监控页状态自动变化
3. 监考发送警告后，日志表自动出现新记录
4. 监考强制交卷后，考生状态和日志同时自动更新
5. 学生正常交卷后，监控页自动变更为已交卷

### 稳定性验证
1. 关闭监控页后，后端连接数能回收
2. 重启后端后，前端可自动重连或切回轮询
3. SSE 短暂断网期间，页面不清空已有数据
4. 高频事件下不会出现多个并发刷新请求

### 构建验证
- 前端执行构建验证
- 后端至少跑启动验证，确保新增订阅接口不影响现有路由

## 实施顺序
1. 后端新增 monitor SSE broadcaster 与订阅接口
2. 前端在监控页接入 SSE 客户端与连接状态展示
3. 调整轮询逻辑：SSE 正常时暂停，断线时恢复
4. 在 `warnStudent / forceSubmitStudent / submitStudentExam / login` 成功路径广播事件
5. 完成手工联调与构建验证

## 风险与应对

### 风险 1：原生 EventSource 无法携带 Bearer Token
**应对：** 不使用原生 `EventSource`，改为 `fetch` 流式消费 SSE。

### 风险 2：登录事件无法精确关联考试
**应对：** 登录事件允许 `paperId = null`，前端收到后直接刷新当前监控页快照。

### 风险 3：事件突发导致请求频繁
**应对：** 继续使用前端 `refreshing` 防重入，并让轮询作为最终兜底，而不是主通道。

### 风险 4：连接泄漏
**应对：** 后端监听连接关闭并及时清理；前端页面卸载时强制中断流读取与重连计时器。
