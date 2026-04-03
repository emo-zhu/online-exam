<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { createClass, deleteClass, getClassList, resetClassCode, updateClass } from '@/api/class'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  className: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增班级')
const formRef = ref()
const form = reactive({
  id: undefined,
  className: '',
  studentCount: 0
})

const rules = {
  className: [{ required: true, message: '请输入班级名称', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getClassList(queryParams)
    tableData.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  fetchData()
}

const handleAdd = () => {
  dialogTitle.value = '新增班级'
  dialogVisible.value = true
  form.id = undefined
  form.className = ''
  form.studentCount = 0
  if (formRef.value) formRef.value.clearValidate()
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑班级'
  dialogVisible.value = true
  form.id = row.id
  form.className = row.className
  form.studentCount = row.studentCount
  if (formRef.value) formRef.value.clearValidate()
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    if (form.id) {
      await updateClass(form.id, { className: form.className })
    } else {
      await createClass({ className: form.className })
    }

    ElMessage.success(form.id ? '修改成功' : '新增成功')
    dialogVisible.value = false
    fetchData()
  })
}

const handleDelete = (row) => {
  if (row.studentCount > 0) {
      ElMessage.warning(`无法删除班级 "${row.className}"，因为班级内还有 ${row.studentCount} 名学生。请先移除学生。`)
      return
  }

  ElMessageBox.confirm(`确认删除班级 "${row.className}" 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteClass(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}

const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
        ElMessage.success('班级码已复制')
    }).catch(() => {
        ElMessage.error('复制失败')
    })
}

const handleResetCode = (row) => {
    ElMessageBox.confirm(`确认重置班级 "${row.className}" 的班级码吗?`, '提示', {
        type: 'warning'
    }).then(async () => {
        await resetClassCode(row.id)
        ElMessage.success('重置成功')
        fetchData()
    })
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

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="app-container">
    <el-card shadow="hover" class="premium-card">
      <div class="filter-container">
        <div class="filter-item">
            <span class="label">班级</span>
            <el-input
            v-model="queryParams.className"
            placeholder="输入班级名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
            />
        </div>
        <div class="filter-buttons">
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%;"
      >
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="className" label="班级名称" align="center" min-width="150" />
        <el-table-column prop="studentCount" label="班级人数" align="center" width="100">
             <template #default="scope">
                <el-tag type="info" effect="plain" round>{{ scope.row.studentCount }} 人</el-tag>
             </template>
        </el-table-column>
        <el-table-column prop="classCode" label="班级口令" align="center" min-width="220" show-overflow-tooltip>
            <template #default="scope">
                <span style="font-family: monospace; margin-right: 8px;">{{ scope.row.classCode }}</span>
                <el-button link type="primary" size="small" icon="CopyDocument" @click="handleCopyCode(scope.row.classCode)">复制</el-button>
            </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建用户" align="center" width="150" />
        <el-table-column label="操作" width="280" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="warning" @click="handleResetCode(scope.row)">重置口令</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <span class="total-text">共 {{ total }} 条</span>
        <el-pagination
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          background
          layout="total, prev, pager, next, sizes, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="padding: 20px 20px 0 0;">
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="form.className" placeholder="请输入班级名称" />
        </el-form-item>
         <el-form-item label="班级人数" prop="studentCount">
          <el-input-number v-model="form.studentCount" :min="0" style="width: 100%;" disabled />
          <div style="font-size: 12px; color: #999; line-height: 1.5; margin-top: 4px;">人数由系统根据学生管理自动统计</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
/*
 空样式块，因为所有样式都已迁移到全局 main.scss
*/
</style>
