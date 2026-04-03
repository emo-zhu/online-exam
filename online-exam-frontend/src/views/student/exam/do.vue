<template>
  <div class="exam-do-container" v-loading="loading">
    <div class="exam-header" v-if="examData">
      <div class="left-info">
        <span class="exam-title">{{ examData.paperName }}</span>
        <span class="student-info">考生：{{ userStore.userInfo.name || '用户' }}</span>
      </div>
      <div class="right-timer">
        <el-icon><Timer /></el-icon>
        <span class="time-text">{{ remainingTimeFormatted }}</span>
        <el-button type="primary" size="default" :loading="submitLoading" @click="handleSubmit">交卷</el-button>
      </div>
    </div>

    <div class="exam-body" v-if="examData">
      <div class="exam-card">
        <div class="card-title">答题卡</div>
        <div class="card-content">
          <div v-for="group in groupedQuestions" :key="group.type" class="question-group">
            <div class="group-title">{{ group.label }}</div>
            <div class="number-grid">
              <div
                v-for="item in group.questions"
                :key="item.id"
                class="number-item"
                :class="{ active: currentQIndex === item.originalIndex, answered: isAnswered(item.id) }"
                @click="jumpTo(item.originalIndex)"
              >
                {{ item.originalIndex + 1 }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="exam-main">
        <div class="question-area" v-if="currentQuestion">
          <div class="q-header">
            <span class="q-type-tag">{{ getTypeName(currentQuestion.type) }}</span>
            <div class="q-title-wrap">
              <span class="q-index">{{ currentQIndex + 1 }}.</span>
              <RichContent class="q-content" :html="currentQuestion.title" />
              <span class="q-score">（{{ currentQuestion.score }}分）</span>
            </div>
          </div>

          <div class="q-options">
            <div v-if="currentQuestion.type === 'judge'" class="option-group" role="radiogroup">
              <div
                v-for="opt in formatOptions(currentQuestion.options)"
                :key="opt.key"
                class="option-item"
                :class="{ 'is-checked': isOptionChecked(currentQuestion, opt.key) }"
                role="radio"
                :aria-checked="isOptionChecked(currentQuestion, opt.key)"
                tabindex="0"
                @click="selectSingleOption(currentQuestion.id, opt.key)"
                @keydown.enter.prevent="selectSingleOption(currentQuestion.id, opt.key)"
                @keydown.space.prevent="selectSingleOption(currentQuestion.id, opt.key)"
              >
                <div class="option-content">
                  <span class="opt-key">{{ opt.key }}</span>
                  <RichContent class="opt-val" :html="opt.value" />
                </div>
              </div>
            </div>

            <div v-if="currentQuestion.type === 'select'" class="option-group" role="group">
              <div
                v-for="opt in formatOptions(currentQuestion.options)"
                :key="opt.key"
                class="option-item"
                :class="{ 'is-checked': isOptionChecked(currentQuestion, opt.key) }"
                role="checkbox"
                :aria-checked="isOptionChecked(currentQuestion, opt.key)"
                tabindex="0"
                @click="toggleMultiOption(currentQuestion.id, opt.key)"
                @keydown.enter.prevent="toggleMultiOption(currentQuestion.id, opt.key)"
                @keydown.space.prevent="toggleMultiOption(currentQuestion.id, opt.key)"
              >
                <div class="option-content">
                  <span class="opt-key">{{ opt.key }}</span>
                  <RichContent class="opt-val" :html="opt.value" />
                </div>
              </div>
            </div>

            <el-input
              v-if="['text', 'fill', 'application'].includes(currentQuestion.type)"
              v-model="answers[currentQuestion.id]"
              type="textarea"
              :rows="6"
              placeholder="请输入答案..."
            />
          </div>
        </div>

        <div class="exam-footer-actions">
          <el-button @click="prevQ" :disabled="currentQIndex === 0">上一题</el-button>
          <el-button type="primary" @click="nextQ" :disabled="currentQIndex === allQuestions.length - 1">下一题</el-button>
        </div>
      </div>
    </div>

    <el-empty v-else description="试卷加载失败或不存在" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RichContent from '@/components/RichContent.vue'
import { useUserStore } from '@/stores/user'
import { autosaveStudentExamRecord, startStudentExam, submitStudentExam } from '@/api/examRecord'
import { Timer } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from '@/utils/element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const submitLoading = ref(false)
const autosaveLoading = ref(false)
const examData = ref(null)
const allQuestions = ref([])
const currentQIndex = ref(0)
const answers = reactive({})
const timer = ref(null)
const autosaveTimer = ref(null)
const timeLeft = ref(0)
const cheatCount = ref(0)
const recordId = ref(null)
const hasSubmitted = ref(false)
const MAX_CHEAT_COUNT = 3
const AUTOSAVE_INTERVAL = 15000

const currentQuestion = computed(() => allQuestions.value[currentQIndex.value])

const remainingTimeFormatted = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const getTypeName = (type) => {
  const map = {
    judge: '单选题',
    select: '多选题',
    fill: '填空题',
    text: '简答题',
    application: '应用题'
  }
  return map[type] || '题目'
}

const formatOptions = (optionsObj) => {
  if (!optionsObj) return []
  return Object.keys(optionsObj).map(key => ({ key, value: optionsObj[key] }))
}

const groupedQuestions = computed(() => {
  const groups = {}
  const typeOrder = ['judge', 'select', 'fill', 'text', 'application']
  const typeLabel = {
    judge: '单选题',
    select: '多选题',
    fill: '填空题',
    text: '简答题',
    application: '应用题'
  }

  allQuestions.value.forEach((q, index) => {
    if (!groups[q.type]) {
      groups[q.type] = []
    }
    groups[q.type].push({ ...q, originalIndex: index })
  })

  return typeOrder.filter(type => groups[type]).map(type => ({
    type,
    label: typeLabel[type],
    questions: groups[type]
  }))
})

const isAnswered = (qid) => {
  const val = answers[qid]
  if (Array.isArray(val)) return val.length > 0
  return val !== undefined && val !== '' && val !== null
}

const isOptionChecked = (question, key) => {
  const value = answers[question.id]
  if (question.type === 'select') {
    return Array.isArray(value) && value.includes(key)
  }
  return value === key
}

const selectSingleOption = (questionId, key) => {
  answers[questionId] = key
}

const toggleMultiOption = (questionId, key) => {
  const currentValue = Array.isArray(answers[questionId]) ? [...answers[questionId]] : []
  const index = currentValue.indexOf(key)

  if (index >= 0) {
    currentValue.splice(index, 1)
  } else {
    currentValue.push(key)
  }

  answers[questionId] = currentValue
}

const resetAnswers = () => {
  Object.keys(answers).forEach(key => {
    delete answers[key]
  })
}

const initAnswerState = () => {
  resetAnswers()
  allQuestions.value.forEach(q => {
    answers[q.id] = q.type === 'select' ? [] : ''
  })
}

const restoreSavedAnswers = (savedAnswers = []) => {
  savedAnswers.forEach(item => {
    const question = allQuestions.value.find(q => q.id === item.paperQuestionId)
    if (!question) {
      return
    }

    answers[item.paperQuestionId] = question.type === 'select'
      ? [...(Array.isArray(item.answer) ? item.answer : [])]
      : (item.answer || '')
  })
}

const applyExamPayload = (data) => {
  examData.value = data
  recordId.value = data.recordId || null
  allQuestions.value = data.questionList || []
  currentQIndex.value = 0
  timeLeft.value = Math.max(Number(data.remainingSeconds || 0), 0)
  cheatCount.value = Number(data.cheatCount || 0)
  initAnswerState()
  restoreSavedAnswers(data.savedAnswers || [])
}

const clearTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const clearAutosaveTimer = () => {
  if (autosaveTimer.value) {
    clearInterval(autosaveTimer.value)
    autosaveTimer.value = null
  }
}

const startTimer = () => {
  clearTimer()

  timer.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
      return
    }

    clearTimer()
    autoSubmit()
  }, 1000)
}

const buildSubmitPayload = (forcedSubmit = 0) => ({
  answers: allQuestions.value.map(question => ({
    paperQuestionId: question.id,
    answer: question.type === 'select'
      ? [...(answers[question.id] || [])]
      : (answers[question.id] || '')
  })),
  cheatCount: cheatCount.value,
  forcedSubmit
})

const buildAutosavePayload = () => ({
  answers: allQuestions.value.map(question => ({
    paperQuestionId: question.id,
    answer: question.type === 'select'
      ? [...(answers[question.id] || [])]
      : (answers[question.id] || '')
  })),
  cheatCount: cheatCount.value
})

const autosaveExam = async ({ silent = true, immediate = false } = {}) => {
  if (!recordId.value || hasSubmitted.value || submitLoading.value || autosaveLoading.value) {
    return null
  }

  if (!immediate && timeLeft.value <= 0) {
    return null
  }

  autosaveLoading.value = true
  try {
    const { data } = await autosaveStudentExamRecord(recordId.value, buildAutosavePayload(), { silent })
    if (!hasSubmitted.value && Number.isFinite(Number(data.remainingSeconds))) {
      timeLeft.value = Math.max(Number(data.remainingSeconds), 0)
    }
    return data
  } catch {
    return null
  } finally {
    autosaveLoading.value = false
  }
}

const startAutosaveTimer = () => {
  clearAutosaveTimer()
  autosaveTimer.value = setInterval(() => {
    autosaveExam({ silent: true })
  }, AUTOSAVE_INTERVAL)
}

const submitExam = async (forcedSubmit = 0) => {
  if (!examData.value || submitLoading.value || hasSubmitted.value) {
    return
  }

  submitLoading.value = true
  try {
    const { data } = await submitStudentExam(examData.value.id, buildSubmitPayload(forcedSubmit))
    hasSubmitted.value = true
    clearTimer()
    clearAutosaveTimer()

    const hasPendingMark = Number(data.status) === 1
    const title = forcedSubmit ? '已自动交卷' : '交卷成功'
    const detailText = hasPendingMark
      ? `客观题得分：${data.objectiveScore} 分，主观题待老师阅卷后公布最终成绩。`
      : `本次考试得分：${data.score} 分。`

    await ElMessageBox.alert(detailText, title, {
      confirmButtonText: '查看成绩'
    })
    router.push('/student/score')
  } finally {
    submitLoading.value = false
  }
}

const initExam = async () => {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const { data } = await startStudentExam(id)
    applyExamPayload(data)
    startTimer()
    startAutosaveTimer()
  } catch (error) {
    examData.value = null
    allQuestions.value = []
    if (!error?.config?.silent) {
      ElMessage.error(error.response?.data?.message || error.message || '试卷加载失败')
    }
    router.push('/student/exam')
  } finally {
    loading.value = false
  }
}

const jumpTo = (index) => {
  currentQIndex.value = index
}

const prevQ = () => {
  if (currentQIndex.value > 0) currentQIndex.value--
}

const nextQ = () => {
  if (currentQIndex.value < allQuestions.value.length - 1) currentQIndex.value++
}

const handleSubmit = () => {
  const total = allQuestions.value.length
  const answeredCount = allQuestions.value.filter(q => isAnswered(q.id)).length
  const unAnswered = total - answeredCount

  let msg = '确认提交试卷吗？'
  if (unAnswered > 0) {
    msg = `还有 ${unAnswered} 道题未作答，${msg}`
  }

  ElMessageBox.confirm(msg, '交卷提示', {
    type: 'warning',
    confirmButtonText: '确认交卷',
    cancelButtonText: '继续答题'
  }).then(() => {
    submitExam(0)
  }).catch(() => {})
}

const handleCheat = async () => {
  if (!document.hidden || submitLoading.value || hasSubmitted.value) {
    return
  }

  cheatCount.value++
  await autosaveExam({ silent: true, immediate: true })
  if (cheatCount.value >= MAX_CHEAT_COUNT) {
    ElMessage.error(`您已切屏超过 ${MAX_CHEAT_COUNT} 次，系统将自动交卷。`)
    submitExam(1)
    return
  }

  ElMessageBox.alert(
    `检测到您切换了屏幕或窗口，这是第 ${cheatCount.value} 次警告。累计 ${MAX_CHEAT_COUNT} 次将自动交卷。`,
    '考试安全提示',
    {
      confirmButtonText: '我知道了',
      type: 'error',
      center: true,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      showClose: false
    }
  )
}

const autoSubmit = () => {
  ElMessage.warning('考试时间到，系统已自动交卷。')
  submitExam(1)
}

const handleBeforeUnload = () => {
  if (!recordId.value || hasSubmitted.value || submitLoading.value) {
    return
  }

  autosaveStudentExamRecord(recordId.value, buildAutosavePayload(), {
    silent: true,
    timeout: 3000
  }).catch(() => {})
}

onMounted(() => {
  initExam()
  document.addEventListener('visibilitychange', handleCheat)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  clearTimer()
  clearAutosaveTimer()
  document.removeEventListener('visibilitychange', handleCheat)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped lang="scss">
.exam-do-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.exam-header {
  height: 60px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  z-index: 10;
}

.exam-title {
  font-size: 18px;
  font-weight: bold;
  margin-right: 20px;
}

.student-info {
  font-size: 14px;
  color: #666;
}

.right-timer {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time-text {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
  min-width: 60px;
}

.exam-body {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.exam-card {
  width: 280px;
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.question-group {
  margin-bottom: 15px;
}

.group-title {
  font-size: 13px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 8px;
  padding-left: 2px;
  border-left: 3px solid #409eff;
  line-height: 1;
}

.number-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  overflow-y: auto;
  align-content: flex-start;
  padding-top: 5px;
}

.number-item {
  width: 35px;
  height: 35px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    border-color: #409eff;
    color: #409eff;
  }

  &.active {
    border-color: #409eff;
    background: #e9f5fe;
    color: #409eff;
  }

  &.answered {
    background: #409eff;
    color: #fff;
    border-color: #409eff;

    &.active {
      background: #66b1ff;
    }
  }
}

.exam-main {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.question-area {
  flex: 1;
}

.q-header {
  margin-bottom: 30px;
}

.q-type-tag {
  display: inline-flex;
  align-items: center;
  background: #409eff;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 12px;
}

.q-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 18px;
  line-height: 1.8;
}

.q-index {
  font-weight: 600;
}

.q-content {
  flex: 1;
  min-width: 0;
}

.q-score {
  color: #999;
  font-size: 14px;
  white-space: nowrap;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-item {
  margin: 0 !important;
  padding: 15px 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  width: 100%;
  transition: all 0.3s;
  display: block;
  cursor: pointer;

  &:hover {
    background-color: #f5f7fa;
    border-color: #c6e2ff;
  }

  &:focus-visible {
    outline: 2px solid #409eff;
    outline-offset: 2px;
  }

  &.is-checked {
    border-color: #409eff;
    background-color: #ecf5ff;
    font-weight: 500;
  }
}

.option-content {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: center;
  column-gap: 15px;
  width: 100%;
}

.opt-key {
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #f4f4f5;
  border-radius: 50%;
  color: #909399;
  flex-shrink: 0;
}

.option-item.is-checked .opt-key {
  background: #409eff;
  color: #fff;
}

.opt-val {
  min-width: 0;
  line-height: 24px;

  :deep(> p),
  :deep(> div) {
    display: inline;
    margin: 0;
  }
}

.exam-footer-actions {
  border-top: 1px solid #eee;
  padding-top: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}
</style>
