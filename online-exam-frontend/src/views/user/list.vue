<template>
  <div class="app-container">
    <el-card shadow="hover" class="premium-card">
      <div class="filter-container">
        <div class="filter-item">
          <span class="label">真实姓名</span>
          <el-input
            v-model="queryParams.realName"
            placeholder="输入姓名"
            clearable
            style="width: 180px"
            @keyup.enter="handleQuery"
          />
        </div>
        <div class="filter-item">
          <span class="label">角色</span>
          <el-select
            v-model="queryParams.role"
            placeholder="所有角色"
            clearable
            style="width: 120px"
          >
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="label">班级</span>
          <el-select
            v-model="queryParams.classId"
            placeholder="选择或搜索班级"
            clearable
            filterable
            style="width: 180px"
          >
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="item.className"
              :value="item.id"
            />
          </el-select>
        </div>
        <div class="filter-buttons">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button type="primary" @click="handleAdd">新增</el-button>
          <el-button type="primary" @click="handleImport">导入</el-button>
          <el-button type="success" @click="handleExport">导出</el-button>
          <el-button type="danger" plain :disabled="!ids.length" @click="handleBatchDelete">批量删除</el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" :index="indexMethod" label="序号" width="80" align="center" />
        <el-table-column prop="username" label="用户名" align="center" min-width="120" />
        <el-table-column prop="realName" label="真实姓名" align="center" min-width="100" />
        <el-table-column prop="roleName" label="角色名称" align="center" width="100" />
        <el-table-column prop="className" label="班级" align="center" min-width="120" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" align="center" width="180" />
        <el-table-column label="操作" align="center" width="280">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="warning" @click="handleResetPwd(scope.row)">重置密码</el-button>
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="750px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="padding: 20px 10px 0 10px">
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" :disabled="form.id !== undefined" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="form.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="身份选择" prop="role">
              <el-select v-model="form.role" placeholder="请选择身份" style="width: 100%">
                <el-option label="学生" value="student" />
                <el-option label="教师" value="teacher" />
                <el-option label="管理员" value="admin" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.role === 'student'">
            <el-form-item label="班级" prop="classId">
              <el-select v-model="form.classId" placeholder="请选择班级" clearable style="width: 100%">
                <el-option
                  v-for="item in classOptions"
                  :key="item.id"
                  :label="item.className"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="Excel批量导入" v-model="importDialogVisible" width="800px" append-to-body>
      <div style="text-align: center; margin-bottom: 20px;">
        <el-button type="info" plain icon="Download" @click="handleDownloadTemplate">下载导入模板</el-button>
      </div>
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :before-upload="beforeUpload"
        :show-file-list="false"
        accept=".xlsx"
        v-loading="uploadLoading"
        element-loading-text="正在导入..."
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xlsx 文件，且不超过 5MB
          </div>
        </template>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { getClassList } from '@/api/class'
import { batchDeleteUsers, createUser, deleteUser, exportUsers, getUserList, importUsers, resetUserPassword, updateUser, updateUserStatus } from '@/api/user'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])
const ids = ref([])
const shownPageNum = ref(1)
const classOptions = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  realName: '',
  role: '',
  classId: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = reactive({
  id: undefined,
  username: '',
  realName: '',
  role: 'student',
  classId: ''
})
const formRef = ref(null)

const importDialogVisible = ref(false)
const uploadLoading = ref(false)

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const buildUserQueryParams = () => {
  const params = {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize
  }

  if (queryParams.realName) {
    params.realName = queryParams.realName
  }

  if (queryParams.role) {
    params.role = queryParams.role
  }

  if (queryParams.classId) {
    params.classId = queryParams.classId
  }

  return params
}

const fetchClassOptions = async () => {
  const { data } = await getClassList({ pageNum: 1, pageSize: 100 })
  classOptions.value = data.list || []
}

const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getUserList(buildUserQueryParams())
    tableData.value = data.list
    total.value = data.total
    shownPageNum.value = data.pageNum
    ids.value = []
  } finally {
    loading.value = false
  }
}

const indexMethod = (index) => {
  return (shownPageNum.value - 1) * queryParams.pageSize + index + 1
}

const handleQuery = () => {
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

const handleSelectionChange = (selection) => {
  ids.value = selection.map((item) => item.id)
}

const resetFormData = () => {
  Object.assign(form, {
    id: undefined,
    username: '',
    realName: '',
    role: 'student',
    classId: ''
  })
}

const handleAdd = () => {
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
  resetFormData()
  if (formRef.value) formRef.value.clearValidate()
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  dialogVisible.value = true
  Object.assign(form, {
    id: row.id,
    username: row.username,
    realName: row.realName,
    role: row.role || 'student',
    classId: row.classId || ''
  })
  if (formRef.value) formRef.value.clearValidate()
}

const handleImport = () => {
  importDialogVisible.value = true
}

const handleExport = async () => {
  try {
    const response = await exportUsers(buildUserQueryParams())
    const disposition = response.headers?.['content-disposition'] || ''
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
    const normalMatch = disposition.match(/filename="?([^";]+)"?/i)
    const filename = utf8Match?.[1]
      ? decodeURIComponent(utf8Match[1])
      : (normalMatch?.[1] ? decodeURIComponent(normalMatch[1]) : `用户管理数据_${Date.now()}.xlsx`)

    const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    ElMessage.success('导出成功')
  } catch {
    // 请求拦截器已统一提示
  }
}

const handleDownloadTemplate = () => {
  import('xlsx').then((XLSX) => {
    const templateData = [
      { '用户名': 'zhangsan', '真实姓名': '张三', '角色': '学生', '班级': '三年级01班' },
      { '用户名': 'laoshi', '真实姓名': '李老师', '角色': '教师', '班级': '' }
    ]
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '导入模板')
    XLSX.writeFile(wb, '用户导入模板.xlsx')
  })
}

const resolveImportRole = (value) => {
  const roleText = String(value || '').trim()
  const roleMap = {
    student: 'student',
    teacher: 'teacher',
    admin: 'admin',
    学生: 'student',
    教师: 'teacher',
    管理员: 'admin'
  }

  return roleMap[roleText] || 'student'
}

const beforeUpload = async (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx')

  if (!isExcel) {
    ElMessage.error('只能上传 xlsx 文件!')
    return false
  }

  uploadLoading.value = true
  try {
    const { data } = await importUsers(file)
    ElMessage.success(`成功导入 ${data?.successCount || 0} 条数据`)
    importDialogVisible.value = false
    queryParams.pageNum = 1
    await fetchData()
  } finally {
    uploadLoading.value = false
  }

  return false
}

const handleStatusChange = async (row) => {
  const previousStatus = row.status === 1 ? 0 : 1
  const text = row.status === 1 ? '启用' : '停用'

  try {
    await updateUserStatus(row.id, { status: row.status })
    ElMessage.success(`已成功${text}用户 "${row.realName}"`)
  } catch {
    row.status = previousStatus
  }
}

const handleResetPwd = (row) => {
  ElMessageBox.confirm(`确认重置用户 "${row.realName}" 的密码为 123456 吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    await resetUserPassword(row.id)
    ElMessage.success('重置成功')
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该用户?', '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteUser(row.id)
    if (tableData.value.length === 1 && queryParams.pageNum > 1) {
      queryParams.pageNum -= 1
    }
    await fetchData()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确认删除选中的 ${ids.value.length} 个用户?`, '提示', {
    type: 'warning'
  }).then(async () => {
    await batchDeleteUsers(ids.value)

    if (tableData.value.length === ids.value.length && queryParams.pageNum > 1) {
      queryParams.pageNum -= 1
    }

    ids.value = []
    await fetchData()
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  const payload = {
    realName: form.realName,
    role: form.role,
    classId: form.role === 'student' ? (form.classId || null) : null
  }

  if (form.id !== undefined) {
    await updateUser(form.id, payload)
    ElMessage.success('修改成功')
  } else {
    await createUser({
      username: form.username,
      ...payload
    })
    ElMessage.success('新增成功')
  }

  dialogVisible.value = false
  await fetchData()
}

onMounted(async () => {
  await fetchClassOptions()
  await fetchData()
})
</script>

<style scoped lang="scss">
/*
 空样式块，因为所有样式都已迁移到全局 main.scss
 如果需要针对本页面的特有微调，可以在此添加
*/
</style>
