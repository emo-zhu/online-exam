<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { createSubject, deleteSubject, getSubjectList, updateSubject } from '@/api/subject'

const loading = ref(false)
const tableData = ref([])
const queryParams = reactive({
  keyword: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增学科')
const formRef = ref()
const form = reactive({
  id: undefined,
  subjectCode: '',
  subjectName: '',
  sortOrder: 0
})

const rules = {
  subjectCode: [
    { required: true, message: '请输入学科编码', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_-]*$/, message: '学科编码需以小写字母开头，可包含数字、下划线和短横线', trigger: 'blur' }
  ],
  subjectName: [{ required: true, message: '请输入学科名称', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序值', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getSubjectList({ keyword: queryParams.keyword || undefined })
    tableData.value = data || []
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  fetchData()
}

const handleAdd = () => {
  dialogTitle.value = '新增学科'
  dialogVisible.value = true
  Object.assign(form, {
    id: undefined,
    subjectCode: '',
    subjectName: '',
    sortOrder: 0
  })
  formRef.value?.clearValidate()
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑学科'
  dialogVisible.value = true
  Object.assign(form, {
    id: row.id,
    subjectCode: row.subjectCode,
    subjectName: row.subjectName,
    sortOrder: Number(row.sortOrder) || 0
  })
  formRef.value?.clearValidate()
}

const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  const payload = {
    subjectCode: form.subjectCode,
    subjectName: form.subjectName,
    sortOrder: Number(form.sortOrder) || 0
  }

  if (form.id) {
    await updateSubject(form.id, payload)
    ElMessage.success('修改成功')
  } else {
    await createSubject(payload)
    ElMessage.success('新增成功')
  }

  dialogVisible.value = false
  fetchData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除学科“${row.subjectName}”吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    await deleteSubject(row.id)
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
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
          <span class="label">学科搜索</span>
          <el-input
            v-model="queryParams.keyword"
            placeholder="输入学科编码或名称"
            clearable
            style="width: 220px"
            @keyup.enter="handleQuery"
          />
        </div>
        <div class="filter-buttons">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button type="primary" @click="handleAdd">新增学科</el-button>
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="subjectName" label="学科名称" min-width="160" align="center" />
        <el-table-column prop="subjectCode" label="学科编码" min-width="180" align="center">
          <template #default="scope">
            <el-tag effect="plain">{{ scope.row.subjectCode }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="100" align="center" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="padding-right: 20px;">
        <el-form-item label="学科名称" prop="subjectName">
          <el-input v-model="form.subjectName" placeholder="请输入学科名称" />
        </el-form-item>
        <el-form-item label="学科编码" prop="subjectCode">
          <el-input v-model="form.subjectCode" placeholder="例如：math、biology" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" style="width: 100%" />
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
</style>
