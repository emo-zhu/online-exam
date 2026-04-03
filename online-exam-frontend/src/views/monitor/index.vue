<template>
  <div class="app-container">
    <el-card shadow="never" class="monitor-overview-card mb-4" :body-style="{ padding: '24px' }">
      <div class="monitor-header">
        <div class="left-panel">
          <div class="exam-selector-wrapper">
            <span class="label">当前监控考试</span>
            <el-select v-model="currentExamId" placeholder="请选择考试" class="modern-select" @change="handleExamChange">
              <el-option v-for="exam in examOptions" :key="exam.id" :label="exam.title" :value="exam.id" />
            </el-select>
          </div>
          <el-tag v-if="currentExam" type="success" effect="dark" round class="status-tag">
            <span class="dot"></span>进行中
          </el-tag>
        </div>
        <div class="right-panel">
          <el-tooltip content="刷新数据" placement="top">
            <el-button type="primary" icon="Refresh" circle class="refresh-btn" :loading="loading" @click="refreshData(true)" />
          </el-tooltip>
          <el-tag size="small" effect="plain" :type="streamStatusType">{{ streamStatusText }}</el-tag>
          <span class="refresh-text" v-if="lastUpdateTime">更新于 {{ lastUpdateTime }}</span>
        </div>
      </div>

      <transition name="el-zoom-in-top">
        <el-row v-if="currentExam" :gutter="20" class="mt-4">
          <el-col :span="6">
            <div class="stat-card blue-gradient">
              <div class="stat-icon"><el-icon><User /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ currentExam.totalStudents }}</div>
                <div class="stat-label">应考人数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card green-gradient">
              <div class="stat-icon"><el-icon><Monitor /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.online }}</div>
                <div class="stat-label">实考人数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card orange-gradient">
              <div class="stat-icon"><el-icon><EditPen /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.ing }}</div>
                <div class="stat-label">答题中</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card purple-gradient">
              <div class="stat-icon"><el-icon><Checked /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.submitted }}</div>
                <div class="stat-label">已交卷</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </transition>
    </el-card>

    <div v-if="currentExam" class="monitor-content fade-in-up">
      <div class="modern-tabs-container">
        <el-tabs v-model="activeTab" class="modern-tabs">
          <el-tab-pane label="实时监控" name="realtime">
            <div class="table-header mb-2">
              <span class="title">考生实时状态</span>
              <div class="filter-actions">
                <el-select
                  v-model="filterClass"
                  placeholder="全部班级"
                  style="width: 160px; margin-right: 15px;"
                  clearable
                  @change="handleFilterChange"
                >
                  <el-option v-for="className in classOptions" :key="className" :label="className" :value="className" />
                </el-select>
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索姓名"
                  prefix-icon="Search"
                  style="width: 180px"
                  clearable
                  @input="handleFilterChange"
                />
                <el-checkbox v-model="onlyAbnormal" border style="margin-left: 10px; height: 32px;" @change="handleFilterChange">
                  <span style="font-size: 13px;">仅看异常</span>
                </el-checkbox>
              </div>
            </div>

            <el-table :data="paginatedList" v-loading="loading" style="width: 100%" stripe>
              <el-table-column prop="studentName" label="姓名" width="120" align="center" fixed />
              <el-table-column prop="className" label="班级" width="120" align="center" />
              <el-table-column prop="ip" label="登录IP" width="140" align="center" show-overflow-tooltip />
              <el-table-column prop="loginTime" label="登录时间" width="180" align="center" />
              <el-table-column label="答题进度" min-width="200">
                <template #default="{ row }">
                  <div class="progress-wrapper">
                    <el-progress
                      :percentage="row.progress"
                      :status="row.status === 'submitted' ? 'success' : ''"
                      :format="percentage => `${percentage}%`"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="切屏次数" width="120" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.cheatCount > 0 ? 'danger' : 'info'" :effect="row.cheatCount > 0 ? 'light' : 'plain'" round>
                    {{ row.cheatCount }} 次
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="110" align="center">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">{{ row.statusText }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220" align="center" fixed="right">
                <template #default="{ row }">
                  <div v-if="row.status === 'ing'" class="action-buttons">
                    <el-button type="danger" link icon="SwitchButton" @click="handleForceSubmit(row)">强制交卷</el-button>
                    <el-button type="warning" link icon="Warning" @click="handleWarn(row)">警告</el-button>
                  </div>
                  <span v-else class="text-gray">{{ row.status === 'submitted' ? '已交卷' : '未开始' }}</span>
                </template>
              </el-table-column>
            </el-table>

            <el-empty v-if="!loading && filteredList.length === 0" description="当前考试暂无匹配的考生记录" />

            <div class="pagination-container tab-pagination" v-if="filteredList.length > 0">
              <span class="total-text">共 {{ filteredList.length }} 人</span>
              <el-pagination
                :current-page="currentPage"
                :page-size="pageSize"
                :total="filteredList.length"
                :page-sizes="[10, 20, 50, 100]"
                background
                layout="total, prev, pager, next, sizes, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="监控日志" name="logs">
            <el-table :data="monitorLogs" v-loading="logsLoading" style="width: 100%" stripe>
              <el-table-column prop="time" label="时间" width="180" />
              <el-table-column prop="studentName" label="考生姓名" width="120" />
              <el-table-column prop="operatorName" label="操作人" width="120" />
              <el-table-column prop="type" label="操作类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getLogTagType(row.type)">{{ getLogTypeName(row.type) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="content" label="详细内容" />
              <el-table-column prop="result" label="结果" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.result === '成功' ? 'success' : 'danger'">{{ row.result }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!logsLoading && monitorLogs.length === 0" class="empty-logs">
              <el-empty description="暂无监控日志" image-size="100" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty description="当前暂无进行中的考试可供监控" image-size="200" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { forceSubmitMonitorStudent, getActiveMonitorExams, getMonitorExamStudents, getMonitorLogs, sendMonitorWarn } from '@/api/monitor'
import { getToken, handleAuthExpired } from '@/utils/auth'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { openSseStream } from '@/utils/sse'

const AUTO_REFRESH_INTERVAL = 10000
const STREAM_RECONNECT_DELAY = 3000
const STREAM_URL = `${import.meta.env.VITE_API_URL || '/api'}/v1/monitor/stream`

const isSameId = (left, right) => String(left) === String(right)
const formatNow = () => {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const examOptions = ref([])
const studentStatusList = ref([])
const monitorLogs = ref([])
const currentExamId = ref(null)
const loading = ref(false)
const logsLoading = ref(false)
const lastUpdateTime = ref('')
const searchKeyword = ref('')
const filterClass = ref('')
const onlyAbnormal = ref(false)
const activeTab = ref('realtime')
const currentPage = ref(1)
const pageSize = ref(10)
const refreshTimer = ref(null)
const refreshing = ref(false)
const streamStatus = ref('connecting')
const streamAbortController = ref(null)
const streamReconnectTimer = ref(null)
let streamStopped = false

const currentExam = computed(() => {
  return examOptions.value.find(item => isSameId(item.id, currentExamId.value)) || null
})

const stats = computed(() => {
  const list = studentStatusList.value
  return {
    online: list.filter(item => item.status !== 'unstart').length,
    ing: list.filter(item => item.status === 'ing').length,
    submitted: list.filter(item => item.status === 'submitted').length
  }
})

const streamStatusText = computed(() => ({
  connecting: '实时连接中',
  connected: '实时已连接',
  reconnecting: '实时重连中',
  polling: '轮询兜底中'
}[streamStatus.value] || '准备中'))

const streamStatusType = computed(() => ({
  connecting: 'primary',
  connected: 'success',
  reconnecting: 'warning',
  polling: 'warning'
}[streamStatus.value] || 'info'))

const classOptions = computed(() => {
  return Array.from(new Set(studentStatusList.value.map(item => item.className).filter(Boolean)))
})

const filteredList = computed(() => {
  const keyword = searchKeyword.value.trim()
  let list = [...studentStatusList.value]

  if (filterClass.value) {
    list = list.filter(item => item.className === filterClass.value)
  }

  if (keyword) {
    list = list.filter(item => item.studentName?.includes(keyword))
  }

  if (onlyAbnormal.value) {
    list = list.filter(item => Number(item.cheatCount || 0) > 0)
  }

  return list
})

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const getStatusType = (status) => {
  if (status === 'ing') return 'primary'
  if (status === 'submitted') return 'success'
  return 'info'
}

const getLogTypeName = (type) => ({ warn: '发送警告', force_submit: '强制交卷' }[type] || type)
const getLogTagType = (type) => ({ warn: 'warning', force_submit: 'danger' }[type] || 'info')

const clearRefreshTimer = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
}

const startRefreshTimer = () => {
  clearRefreshTimer()

  if (!currentExamId.value) {
    return
  }

  refreshTimer.value = setInterval(() => {
    refreshData(false, { silent: true })
  }, AUTO_REFRESH_INTERVAL)
}

const clearStreamReconnectTimer = () => {
  if (streamReconnectTimer.value) {
    clearTimeout(streamReconnectTimer.value)
    streamReconnectTimer.value = null
  }
}

const scheduleStreamReconnect = () => {
  clearStreamReconnectTimer()

  if (streamStopped) {
    return
  }

  streamStatus.value = 'reconnecting'
  startRefreshTimer()
  streamReconnectTimer.value = setTimeout(() => {
    connectStream()
  }, STREAM_RECONNECT_DELAY)
}

const stopStream = () => {
  streamStopped = true
  clearStreamReconnectTimer()

  if (streamAbortController.value) {
    streamAbortController.value.abort()
    streamAbortController.value = null
  }
}

const handleStreamEvent = async ({ event, data }) => {
  if (event === 'connected') {
    streamStatus.value = 'connected'
    clearRefreshTimer()
    await refreshData(false, { silent: true })
    return
  }

  if (event !== 'monitor_changed') {
    return
  }

  if (data?.paperId && currentExamId.value && !isSameId(data.paperId, currentExamId.value)) {
    return
  }

  await refreshData(false, { silent: true })
}

const connectStream = async () => {
  const token = getToken()
  if (!token) {
    streamStatus.value = 'polling'
    startRefreshTimer()
    return
  }

  clearStreamReconnectTimer()

  if (streamAbortController.value) {
    streamAbortController.value.abort()
  }

  const controller = new AbortController()
  streamAbortController.value = controller
  streamStatus.value = 'connecting'

  try {
    await openSseStream({
      url: STREAM_URL,
      token,
      signal: controller.signal,
      onOpen() {
        streamStatus.value = 'connected'
        clearRefreshTimer()
      },
      onEvent: handleStreamEvent
    })

    if (!streamStopped && !controller.signal.aborted) {
      scheduleStreamReconnect()
    }
  } catch (error) {
    if (streamStopped || controller.signal.aborted) {
      return
    }

    if (error?.status === 401) {
      await handleAuthExpired()
      return
    }

    streamStatus.value = 'polling'
    startRefreshTimer()
    scheduleStreamReconnect()
  } finally {
    if (streamAbortController.value === controller) {
      streamAbortController.value = null
    }
  }
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  currentPage.value = 1
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const loadMonitorLogs = async ({ silent = false } = {}) => {
  if (!currentExamId.value) {
    monitorLogs.value = []
    return
  }

  logsLoading.value = true
  try {
    const { data } = await getMonitorLogs({
      paperId: currentExamId.value,
      pageSize: 100
    }, {
      silent
    })
    monitorLogs.value = data || []
  } finally {
    logsLoading.value = false
  }
}

const loadExamStudents = async ({ silent = false } = {}) => {
  if (!currentExamId.value) {
    studentStatusList.value = []
    return
  }

  loading.value = true
  try {
    const { data } = await getMonitorExamStudents(currentExamId.value, {
      silent
    })
    studentStatusList.value = data || []
  } finally {
    loading.value = false
  }
}

const refreshData = async (showSuccess = false, { silent = false } = {}) => {
  if (refreshing.value) {
    return
  }

  refreshing.value = true
  try {
    await fetchActiveExams({ silent })
    if (!currentExamId.value) {
      lastUpdateTime.value = ''
      return
    }

    await Promise.all([
      loadExamStudents({ silent }),
      loadMonitorLogs({ silent })
    ])
    lastUpdateTime.value = formatNow()
    if (showSuccess) {
      ElMessage.success('数据已更新')
    }
  } finally {
    refreshing.value = false
  }
}

const syncCurrentExam = () => {
  if (examOptions.value.length === 0) {
    currentExamId.value = null
    studentStatusList.value = []
    monitorLogs.value = []
    lastUpdateTime.value = ''
    clearRefreshTimer()
    return
  }

  const exists = examOptions.value.some(item => isSameId(item.id, currentExamId.value))
  if (!exists) {
    currentExamId.value = examOptions.value[0].id
  }
}

const fetchActiveExams = async ({ silent = false } = {}) => {
  const { data } = await getActiveMonitorExams({ silent })
  examOptions.value = data || []
  syncCurrentExam()
}

const handleExamChange = async () => {
  currentPage.value = 1
  await refreshData()

  if (streamStatus.value === 'connected') {
    clearRefreshTimer()
    return
  }

  startRefreshTimer()
}

const handleWarn = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入警告内容', '发送警告', {
      confirmButtonText: '发送',
      cancelButtonText: '取消',
      inputPattern: /\S/,
      inputErrorMessage: '警告内容不能为空'
    })

    await sendMonitorWarn(currentExamId.value, {
      studentId: row.studentId,
      content: value.trim()
    })
    ElMessage.success(`已向考生 ${row.studentName} 发送警告`)
    await loadMonitorLogs()
    lastUpdateTime.value = formatNow()
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return
    }
  }
}

const handleForceSubmit = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要强制收回 ${row.studentName} 的试卷吗？`, '高危操作', {
      confirmButtonText: '确定强制交卷',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await forceSubmitMonitorStudent(currentExamId.value, {
      studentId: row.studentId
    })
    ElMessage.success('强制交卷成功')
    await refreshData()
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return
    }
  }
}

onMounted(async () => {
  await fetchActiveExams()
  if (currentExamId.value) {
    await refreshData()
  }

  streamStopped = false
  await connectStream()
})

onUnmounted(() => {
  stopStream()
  clearRefreshTimer()
})
</script>

<style scoped lang="scss">
.mb-4 {
  margin-bottom: 20px;
}

.app-container {
  padding: 20px;
  background-color: #f6f8f9;
  min-height: 100vh;
}

.monitor-overview-card {
  border: none;
  border-radius: 16px;
  background: #fff;
  margin-bottom: 24px;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  .left-panel {
    display: flex;
    align-items: center;
    gap: 16px;

    .exam-selector-wrapper {
      display: flex;
      align-items: center;
      background: #f8fafc;
      padding: 4px 4px 4px 16px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;

      .label {
        font-size: 14px;
        color: #64748b;
        font-weight: 500;
        margin-right: 12px;
      }

      .modern-select {
        width: 280px;

        :deep(.el-input__wrapper), :deep(.el-select__wrapper) {
          box-shadow: none !important;
          background: transparent !important;
          padding-left: 0;

          &.is-focus,
          &:hover {
            box-shadow: none !important;
          }

          .el-input__inner,
          .el-select__selected-item {
            font-weight: 600;
            color: #1e293b;
            font-size: 15px;
          }
        }
      }
    }

    .status-tag {
      padding: 0 16px;
      height: 32px;
      line-height: 30px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      font-weight: 600;
      display: flex;
      align-items: center;

      .dot {
        width: 6px;
        height: 6px;
        background: #fff;
        border-radius: 50%;
        margin-right: 6px;
        animation: pulse 2s infinite;
      }
    }
  }

  .right-panel {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    gap: 12px;

    .refresh-btn {
      width: 36px;
      height: 36px;
      font-size: 16px;
      transition: transform 0.3s;

      &:hover {
        transform: rotate(180deg);
      }
    }

    .refresh-text {
      color: #94a3b8;
      font-size: 13px;
    }
  }
}

.blue-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
}

.green-gradient {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.orange-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.purple-gradient {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.stat-card {
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  color: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-right: 20px;
    backdrop-filter: blur(4px);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .stat-info {
    flex: 1;

    .stat-value {
      font-size: 36px;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 4px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      letter-spacing: -0.02em;
    }

    .stat-label {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
      letter-spacing: 0.02em;
    }
  }
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.modern-tabs-container {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.modern-tabs {
  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: #f1f5f9;
  }

  :deep(.el-tabs__item) {
    font-size: 15px;
    font-weight: 500;
    color: #64748b;

    &.is-active {
      color: #3b82f6;
      font-weight: 600;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: #3b82f6;
    height: 3px;
    border-radius: 3px;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  .title {
    font-size: 16px;
    font-weight: 600;
  }

  .filter-actions {
    display: flex;
    align-items: center;

    .el-input__wrapper,
    .el-select__wrapper {
      box-shadow: 0 0 0 1px #dcdfe6 inset !important;
    }
  }
}

.progress-wrapper {
  padding-right: 20px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.text-gray {
  color: #999;
  font-size: 12px;
}

.pagination-container.tab-pagination {
  margin-top: 20px;
  padding-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;

  .total-text {
    font-size: 14px;
    color: #606266;
    margin-right: 16px;
  }
}

.empty-logs {
  padding: 30px 0 10px;
}
</style>
