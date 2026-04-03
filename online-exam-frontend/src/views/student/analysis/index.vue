<template>
  <div class="analysis-container" v-loading="loading">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="left">
            <span class="title">试卷解析：{{ examTitle }}</span>
            <el-tag type="info" class="ml-2">考生：{{ studentName }}</el-tag>
          </div>
          <el-button @click="$router.back()">返回列表</el-button>
        </div>
      </template>

      <div class="score-summary" :class="getScoreClass(totalScore)">
        <div class="score-val">{{ totalScore }} <span class="unit">分</span></div>
        <div class="score-label">最终得分 / 总分 {{ fullScore }}</div>
      </div>

      <el-divider />

      <div class="question-list" v-if="questions.length > 0">
        <div v-for="(q, index) in questions" :key="q.id" class="question-item">
          <div class="q-header">
            <el-tag :type="getTypeTag(q.type)" size="small" class="mr-2">{{ getTypeName(q.type) }}</el-tag>
            <span class="q-index">{{ index + 1 }}.</span>
            <RichContent class="q-title" :html="q.title" />
            <span class="q-score">({{ q.score }}分)</span>
          </div>

          <div class="q-options" v-if="['judge', 'select'].includes(q.type)">
            <div
              v-for="opt in formatOptions(q.options)"
              :key="opt.key"
              class="option-item"
              :class="{
                correct: isOptionCorrect(q, opt.key),
                wrong: isOptionWrong(q, opt.key),
                missed: isOptionMissed(q, opt.key)
              }"
            >
              <span class="opt-key">{{ opt.key }}</span>
              <RichContent class="opt-val" :html="opt.value" />
              <el-icon v-if="isOptionCorrect(q, opt.key)" class="status-icon"><Select /></el-icon>
              <el-icon v-if="isOptionWrong(q, opt.key)" class="status-icon"><CloseBold /></el-icon>
            </div>
          </div>

          <div class="analysis-box">
            <div class="row">
              <span class="label">我的答案：</span>
              <span class="value" :class="isAnswerCorrect(q) ? 'text-success' : 'text-danger'">
                {{ formatUserAnswer(q) }}
                <span v-if="isAnswerCorrect(q)">(正确)</span>
                <span v-else>(错误)</span>
              </span>
            </div>
            <div class="row">
              <span class="label">正确答案：</span>
              <div v-if="['text', 'fill', 'application'].includes(q.type)" class="value text-success font-bold rich-answer">
                <RichContent :html="q.answer" />
              </div>
              <span v-else class="value text-success font-bold">{{ formatCorrectAnswer(q) }}</span>
            </div>
            <div class="row analysis-text" v-if="q.analysis">
              <span class="label">解析：</span>
              <div class="value rich-answer">
                <RichContent :html="q.analysis" />
              </div>
            </div>
            <div class="row analysis-text" v-else>
              <span class="label">解析：</span>
              <span class="value text-gray">暂无详细解析</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="无法加载试卷内容" />
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import RichContent from '@/components/RichContent.vue'
import { getStudentAnalysisDetail } from '@/api/examRecord'
import { ElMessage } from '@/utils/element-plus'

const route = useRoute()

const loading = ref(true)
const examTitle = ref('')
const studentName = ref('')
const totalScore = ref(0)
const fullScore = ref(100)
const questions = ref([])

const initData = async () => {
  loading.value = true
  try {
    const { data } = await getStudentAnalysisDetail(route.params.id)
    examTitle.value = data.examTitle || ''
    studentName.value = data.studentName || ''
    totalScore.value = Number(data.totalScore) || 0
    fullScore.value = Number(data.fullScore) || 0
    questions.value = data.questions || []
  } catch (error) {
    questions.value = []
    if (!error?.response) {
      ElMessage.error(error.message || '解析加载失败')
    }
  } finally {
    loading.value = false
  }
}

const getTypeName = (type) => ({
  judge: '单选题',
  select: '多选题',
  fill: '填空题',
  text: '简答题',
  application: '应用题'
}[type] || '题目')
const getTypeTag = (type) => ({
  judge: 'primary',
  select: 'warning',
  fill: 'info',
  text: 'success',
  application: 'primary'
}[type] || '')
const formatOptions = (opt) => Object.keys(opt || {}).map(k => ({ key: k, value: opt[k] }))

const getScoreClass = (s) => s >= 60 ? 'pass' : 'fail'

const getUserAns = (question) => question.myAnswer

const formatAnswer = (answer) => {
  if (Array.isArray(answer)) return answer.join(', ')
  return answer || '未作答'
}

const formatUserAnswer = (question) => {
  return formatAnswer(getUserAns(question))
}

const formatCorrectAnswer = (q) => {
  if (q.type === 'select') {
    return formatAnswer(q.answers)
  }
  return formatAnswer(q.answer)
}

const isAnswerCorrect = (q) => Number(q.isCorrect) === 1

const isOptionCorrect = (q, key) => {
  if (q.type === 'select') {
    return Array.isArray(q.answers) && q.answers.includes(key)
  }
  return q.answer === key
}

const isOptionWrong = (q, key) => {
  const userAnswer = getUserAns(q)
  const userSelected = Array.isArray(userAnswer) ? userAnswer.includes(key) : userAnswer === key
  return userSelected && !isOptionCorrect(q, key)
}

const isOptionMissed = (q, key) => {
  if (q.type !== 'select') {
    return false
  }
  const userAnswer = getUserAns(q)
  return isOptionCorrect(q, key) && (!Array.isArray(userAnswer) || !userAnswer.includes(key))
}

onMounted(() => {
  initData()
})
</script>

<style scoped lang="scss">
.analysis-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-weight: bold;
    font-size: 16px;
  }

  .ml-2 {
    margin-left: 10px;
  }
}

.score-summary {
  text-align: center;
  padding: 20px;
  background: #fdf6ec;
  border-radius: 8px;

  &.pass {
    background: #f0f9eb;

    .score-val {
      color: #67c23a;
    }
  }

  &.fail {
    background: #fef0f0;

    .score-val {
      color: #f56c6c;
    }
  }

  .score-val {
    font-size: 48px;
    font-weight: bold;
    line-height: 1;
  }

  .unit {
    font-size: 16px;
    margin-left: 5px;
  }

  .score-label {
    color: #909399;
    margin-top: 10px;
  }
}

.question-item {
  margin-top: 30px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
}

.q-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;

  .mr-2 {
    margin-right: 8px;
  }

  .q-title {
    flex: 1;
    min-width: 0;
  }

  .q-score {
    color: #999;
    font-size: 14px;
    white-space: nowrap;
  }
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 15px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 10px;

  &.correct {
    background-color: #f0f9eb;
    border-color: #67c23a;
    color: #67c23a;
  }

  &.wrong {
    background-color: #fef0f0;
    border-color: #f56c6c;
    color: #f56c6c;
  }

  .opt-key {
    font-weight: bold;
    width: 30px;
    flex-shrink: 0;
  }

  .opt-val {
    flex: 1;
    min-width: 0;
  }

  .status-icon {
    font-size: 18px;
    font-weight: bold;
    margin-left: 10px;
  }
}

.analysis-box {
  margin-top: 20px;
  background: #f9fafc;
  padding: 15px;
  border-radius: 6px;

  .row {
    margin-bottom: 8px;
    display: flex;
    align-items: flex-start;
  }

  .label {
    font-weight: bold;
    color: #606266;
    width: 80px;
    flex-shrink: 0;
  }

  .value {
    flex: 1;
    min-width: 0;
  }

  .text-success {
    color: #67c23a;
  }

  .text-danger {
    color: #f56c6c;
  }

  .font-bold {
    font-weight: bold;
  }

  .text-gray {
    color: #999;
  }
}

.rich-answer {
  font-weight: normal;
}
</style>
