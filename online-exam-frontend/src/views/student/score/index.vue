<template>
  <div class="app-container">
    <el-card shadow="hover" class="premium-card">
      <template #header>
        <div class="card-header">
          <div class="left">
             <span>我的成绩</span>
          </div>
          <div class="right">
             <el-button type="primary" link icon="Refresh" @click="refreshData">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="myScores" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="examName" label="考试名称" min-width="200" />
        <el-table-column prop="subject" label="科目" width="150" align="center">
            <template #default="{ row }">
                <el-tag :type="getSubjectType(row.subject)">{{ row.subjectName || formatSubject(row.subject) }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="120" align="center">
            <template #default="{ row }">
                <span :class="getScoreClass(row.score)">{{ row.score }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
             <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                    {{ row.status === 1 ? '合格' : '不及格' }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="交卷时间" width="180" align="center" />
        <el-table-column label="操作" width="150" align="center">
            <template #default="{ row }">
                <el-button type="primary" link icon="View" @click="handleViewAnalysis(row)">查看解析</el-button>
            </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="myScores.length === 0 && !loading" description="暂无成绩记录" />
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getStudentScoreList } from '@/api/examRecord'
import { getSubjectList } from '@/api/subject'
import { ElMessage } from '@/utils/element-plus'
import { buildSubjectNameMap, getSubjectDisplayName, normalizeSubjectOptions } from '@/utils/subject'

const router = useRouter()
const loading = ref(false)
const sourceList = ref([])
const subjectOptions = ref([])
const subjectNameMap = computed(() => buildSubjectNameMap(subjectOptions.value))

const myScores = computed(() => {
    return [...sourceList.value].sort((a, b) => new Date(b.submitTime || 0) - new Date(a.submitTime || 0))
})

const fetchSubjectOptions = async () => {
    const { data } = await getSubjectList()
    subjectOptions.value = normalizeSubjectOptions(data || [])
}

const formatSubject = (sub, subjectName = '') => {
    return getSubjectDisplayName(sub, subjectNameMap.value, subjectName)
}

const getSubjectType = (sub) => {
    const index = subjectOptions.value.findIndex((item) => item.value === sub)
    const types = ['', 'success', 'warning', 'danger', 'info']
    return index >= 0 ? types[index % types.length] : 'info'
}

const getScoreClass = (score) => {
    if (score >= 90) return 'score-excellent'
    if (score < 60) return 'score-fail'
    return 'score-normal'
}

const fetchData = async (showSuccess = false) => {
    loading.value = true
    try {
        const { data } = await getStudentScoreList()
        sourceList.value = data || []
        if (showSuccess) {
            ElMessage.success('刷新成功')
        }
    } finally {
        loading.value = false
    }
}

const refreshData = () => {
    fetchData(true)
}

const handleViewAnalysis = (row) => {
    router.push(`/student/analysis/${row.recordId}`)
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
  font-weight: bold;
  font-size: 16px;
}

.score-excellent { color: #67C23A; font-weight: bold; font-size: 16px; }
.score-normal { font-weight: bold; font-size: 16px; }
.score-fail { color: #F56C6C; font-weight: bold; font-size: 16px; }
</style>
