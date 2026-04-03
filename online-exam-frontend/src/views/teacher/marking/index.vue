<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">待阅卷列表</span>
          </div>
          <div class="header-right">
            <el-select v-model="queryParams.subject" placeholder="所有科目" style="width: 120px; margin-right: 15px;" clearable @change="handleSearch">
              <el-option v-for="item in subjectOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-select
              v-model="queryParams.examName"
              placeholder="选择或搜索试卷"
              style="width: 200px; margin-right: 15px;"
              clearable
              filterable
              @change="handleSearch"
            >
              <el-option v-for="name in examOptions" :key="name" :label="name" :value="name" />
            </el-select>
            <el-input
              v-model="queryParams.studentName"
              placeholder="搜索学生姓名"
              prefix-icon="User"
              style="width: 150px; margin-right: 15px;"
              clearable
              @input="handleSearch"
            />
            <el-button type="primary" link icon="Refresh" @click="handleRefresh">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="paginatedList" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="examName" label="试卷名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="subject" label="科目" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.subjectName || getSubjectName(row.subject) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="studentName" label="学生姓名" width="120" align="center" />
        <el-table-column prop="className" label="班级" width="200" align="center" />
        <el-table-column prop="submitTime" label="提交时间" width="180" align="center" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleMark(row)">开始阅卷</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="tableData.length === 0 && !loading" description="所有试卷已批改完成" />

      <div class="pagination-container" v-if="total > 0">
        <span class="total-text">共 {{ total }} 条</span>
        <el-pagination
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          background
          layout="total, prev, pager, next, sizes, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="人工阅卷" width="900px" destroy-on-close>
      <div v-if="currentPaper" class="marking-box">
        <div class="info-bar">
          <el-tag>{{ currentPaper.examName }}</el-tag>
          <span class="stud">{{ currentPaper.studentName }} ({{ currentPaper.className }})</span>
        </div>

        <el-empty v-if="currentAnswers.length === 0" description="当前试卷没有待批改的主观题" />

        <div v-for="(item, index) in currentAnswers" :key="item.answerId" class="question-box">
          <div class="q-title-row">
            <span class="q-index">{{ index + 1 }}.</span>
            <span class="q-type">[{{ getTypeName(item.type) }}]</span>
            <RichContent class="q-title" :html="item.title" />
            <span class="q-score">（{{ item.maxScore }}分）</span>
          </div>
          <div class="q-answer">
            <div class="label">学生作答：</div>
            <div class="content plain-text">{{ formatAnswer(item.myAnswer) }}</div>
          </div>
          <div class="q-answer">
            <div class="label">参考答案：</div>
            <div class="content">
              <RichContent :html="item.correctAnswer" />
            </div>
          </div>
          <div class="q-answer" v-if="item.analysis">
            <div class="label">题目解析：</div>
            <div class="content">
              <RichContent :html="item.analysis" />
            </div>
          </div>
          <div class="q-score-input">
            <span>打分：</span>
            <el-input-number v-model="scoreForm[item.answerId].score" :min="0" :max="item.maxScore" />
          </div>
          <div class="q-comment-input">
            <span>评语：</span>
            <el-input v-model="scoreForm[item.answerId].comment" type="textarea" :rows="2" placeholder="请输入评语（可选）" />
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" :disabled="currentAnswers.length === 0" @click="submitMark">提交分数</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import RichContent from '@/components/RichContent.vue'
import { getExamRecordDetail, getExamRecordList, submitExamRecordMark } from '@/api/examRecord'
import { getSubjectList } from '@/api/subject'
import { ElMessage } from '@/utils/element-plus'
import { buildSubjectNameMap, getSubjectDisplayName, normalizeSubjectOptions } from '@/utils/subject'

const subjectiveQuestionTypes = ['text', 'fill', 'application']

const dialogVisible = ref(false)
const currentPaper = ref(null)
const currentAnswers = ref([])
const submitLoading = ref(false)
const loading = ref(false)
const total = ref(0)
const subjectOptions = ref([])
const subjectNameMap = computed(() => buildSubjectNameMap(subjectOptions.value))

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  subject: '',
  examName: '',
  studentName: ''
})

const tableData = ref([])
const scoreForm = reactive({})

const examOptions = computed(() => {
  const names = new Set(tableData.value.map(item => item.examName).filter(Boolean))
  return Array.from(names)
})

const paginatedList = computed(() => tableData.value)

const fetchSubjectOptions = async () => {
  const { data } = await getSubjectList()
  subjectOptions.value = normalizeSubjectOptions(data || [])
}

const fetchData = async (showSuccess = false) => {
  loading.value = true
  try {
    const { data } = await getExamRecordList({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      subject: queryParams.subject || undefined,
      examName: queryParams.examName || undefined,
      studentName: queryParams.studentName || undefined,
      status: '1'
    })
    tableData.value = data.list || []
    total.value = data.total || 0
    if (showSuccess) {
      ElMessage.success('已刷新')
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.pageNum = 1
  fetchData()
}

const handleRefresh = () => {
  fetchData(true)
}

const handleSizeChange = (size) => {
  queryParams.pageNum = 1
  queryParams.pageSize = size
  fetchData()
}

const handleCurrentChange = (page) => {
  queryParams.pageNum = page
  fetchData()
}

const getSubjectName = (sub, subjectName = '') => {
  return getSubjectDisplayName(sub, subjectNameMap.value, subjectName)
}

const getTypeName = (type) => ({
  judge: '单选题',
  select: '多选题',
  fill: '填空题',
  text: '简答题',
  application: '应用题'
}[type] || '题目')

const formatAnswer = (answer) => {
  if (Array.isArray(answer)) return answer.join(', ')
  return answer || '未作答'
}

const resetScoreForm = () => {
  Object.keys(scoreForm).forEach(key => {
    delete scoreForm[key]
  })
}

const handleMark = async (row) => {
  const { data } = await getExamRecordDetail(row.recordId)
  currentPaper.value = data
  currentAnswers.value = (data.answers || []).filter(item => subjectiveQuestionTypes.includes(item.type))
  resetScoreForm()
  currentAnswers.value.forEach(item => {
    scoreForm[item.answerId] = {
      score: Number(item.score) || 0,
      comment: item.comment || ''
    }
  })
  dialogVisible.value = true
}

const submitMark = async () => {
  if (!currentPaper.value) return
  if (currentAnswers.value.length === 0) {
    ElMessage.warning('当前试卷没有可提交的主观题评分')
    return
  }

  submitLoading.value = true
  try {
    await submitExamRecordMark(currentPaper.value.recordId, {
      answers: currentAnswers.value.map(item => ({
        answerId: item.answerId,
        score: Number(scoreForm[item.answerId]?.score || 0),
        comment: scoreForm[item.answerId]?.comment || ''
      }))
    })

    ElMessage.success('阅卷完成')
    dialogVisible.value = false
    await fetchData()
  } finally {
    submitLoading.value = false
  }
}

onMounted(async () => {
  await fetchSubjectOptions()
  await fetchData()
})
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 16px;
    font-weight: 600;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  .total-text {
    font-size: 14px;
    color: #606266;
    margin-right: 16px;
  }
}

.marking-box {
  .info-bar {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;

    .stud {
      font-weight: bold;
      margin-left: 10px;
    }
  }

  .question-box {
    margin-bottom: 20px;
    background: #fdfdfd;
    border: 1px solid #eee;
    padding: 15px;
    border-radius: 6px;
  }
}

.q-title-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: bold;
}

.q-title {
  flex: 1;
  min-width: 0;
}

.q-score {
  white-space: nowrap;
}

.q-answer {
  background: #f4f4f5;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;

  .label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 5px;
  }

  .content {
    line-height: 1.7;
    color: #303133;
  }
}

.plain-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.q-score-input {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  margin-bottom: 12px;
}
</style>
