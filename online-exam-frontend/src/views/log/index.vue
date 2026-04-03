<template>
  <div class="app-container">
    <el-card shadow="hover" class="premium-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">登录日志</span>
          </div>
          <div class="header-right">
            <el-input
              v-model="queryParams.username"
              placeholder="请输入用户名"
              prefix-icon="Search"
              style="width: 200px; margin-right: 15px;"
              clearable
              @input="handleSearch"
            />
            <el-select v-model="queryParams.status" placeholder="登录状态" style="width: 120px; margin-right: 15px;" clearable @change="handleSearch">
              <el-option label="成功" value="1" />
              <el-option label="失败" value="0" />
            </el-select>
            <el-button type="danger" icon="Delete" plain @click="handleClear">清空日志</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        stripe
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column prop="username" label="用户" min-width="150" header-align="center" align="left">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="24" icon="UserFilled" class="mr-2" />
              <span>{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" min-width="140" align="center" />
        <el-table-column prop="location" label="登录地点" min-width="120" align="center" />
        <el-table-column prop="browser" label="浏览器" min-width="120" align="center" />
        <el-table-column prop="os" label="操作系统" min-width="120" align="center" />
        <el-table-column prop="status" label="登录状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="light">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="操作信息" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="loginTime" label="登录时间" min-width="180" align="center" />
      </el-table>

      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          background
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>

      <div v-if="total === 0 && !loading" class="empty-state">
        <el-empty description="暂无符合条件的日志记录" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { clearLoginLogs, getLoginLogList } from '@/api/log'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  username: '',
  status: ''
})

const buildQueryParams = () => {
  const params = {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize
  }

  if (queryParams.username) {
    params.username = queryParams.username
  }

  if (queryParams.status !== '') {
    params.status = queryParams.status
  }

  return params
}

const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getLoginLogList(buildQueryParams())
    tableData.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.pageNum = 1
  fetchData()
}

const handlePageChange = (page) => {
  queryParams.pageNum = page
  fetchData()
}

const handleSizeChange = (size) => {
  queryParams.pageNum = 1
  queryParams.pageSize = size
  fetchData()
}

const handleClear = () => {
  ElMessageBox.confirm('确定要清空所有登录日志吗？此操作无法撤销。', '警告', {
    confirmButtonText: '确定清空',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await clearLoginLogs()
    ElMessage.success('日志已清空')
    queryParams.pageNum = 1
    fetchData()
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .header-right {
    display: flex;
    align-items: center;
  }
}

.user-info {
  display: flex;
  align-items: center;
  padding-left: 20px;

  .mr-2 {
    margin-right: 8px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
