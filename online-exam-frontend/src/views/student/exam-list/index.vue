<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的考试</span>
          <div class="filter">
            <el-radio-group v-model="activeTab" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="not_started">未开始</el-radio-button>
              <el-radio-button label="ongoing">进行中</el-radio-button>
              <el-radio-button label="ended">已结束</el-radio-button>
              <el-radio-button label="submitted">已交卷</el-radio-button>
              <el-radio-button label="marked">已出分</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <el-table v-if="examList.length > 0" :data="examList" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="试卷名称" min-width="220" />
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="duration" label="时长(分钟)" width="120" align="center" />
        <el-table-column prop="statusText" label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.statusTagType">
              {{ scope.row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="交卷时间" width="180" align="center" />
        <el-table-column label="操作" width="160" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              :disabled="scope.row.status !== 'ongoing'"
              @click="handleEnterExam(scope.row)"
            >
              {{ scope.row.actionText }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无考试安排" />
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getStudentExamList } from '@/api/examRecord'

const router = useRouter()
const activeTab = ref('all')
const loading = ref(false)
const sourceList = ref([])

const examList = computed(() => {
  const list = [...sourceList.value].sort((a, b) => {
    const timeA = new Date(a.startTime || 0).getTime()
    const timeB = new Date(b.startTime || 0).getTime()
    return (Number.isNaN(timeA) ? 0 : timeA) - (Number.isNaN(timeB) ? 0 : timeB)
  })

  if (activeTab.value === 'all') {
    return list
  }

  return list.filter((exam) => exam.status === activeTab.value)
})

const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getStudentExamList()
    sourceList.value = data || []
  } finally {
    loading.value = false
  }
}

const handleEnterExam = (exam) => {
  if (exam.status !== 'ongoing') {
    return
  }

  router.push(`/do-exam/${exam.id}`)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
