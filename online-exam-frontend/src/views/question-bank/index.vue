<template>
  <div class="app-container">
    <el-card shadow="hover" class="premium-card">
        <!-- 搜索栏 -->
        <div class="filter-container">
            <div class="filter-item">
                <span class="label">知识点名称</span>
                <el-input v-model="queryParams.name" placeholder="输入名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </div>
             <div class="filter-item">
                <span class="label">所属科目</span>
                 <el-select v-model="queryParams.subject" placeholder="所有科目" clearable style="width: 150px">
                    <el-option v-for="item in subjectOptions" :key="item.value" :label="item.label" :value="item.value" />
                 </el-select>
            </div>
            <div class="filter-buttons">
                <el-button type="primary" @click="handleQuery">查询</el-button>
                <el-button type="primary" icon="Plus" @click="handleAdd">新增知识点</el-button>
            </div>
        </div>

        <!-- 表格 -->
        <el-table :data="tableData" v-loading="loading" style="width: 100%">
            <el-table-column type="index" label="序号" width="80" align="center" />
            <el-table-column prop="name" label="知识点名称" min-width="100" align="center">
                <template #default="{ row }">
                     <el-tag effect="plain">{{ row.name }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="subject" label="所属科目" width="240" align="center">
                 <template #default="{ row }">
                     {{ row.subjectName || getSubjectLabel(row.subject) }}
                 </template>
            </el-table-column>
            <el-table-column prop="desc" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="200" align="center">
                <template #default="{ row }">
                    <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                    <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" append-to-body>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="padding-right: 20px;">
             <el-form-item label="所属科目" prop="subject">
                <el-select v-model="form.subject" placeholder="请选择科目" style="width: 100%">
                    <el-option v-for="item in subjectOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
             <el-form-item label="知识点名称" prop="name">
                <el-input v-model="form.name" placeholder="例如：三角函数" />
            </el-form-item>
             <el-form-item label="描述" prop="desc">
                <el-input v-model="form.desc" type="textarea" :rows="3" placeholder="简要描述该知识点包含的内容" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitForm">确定</el-button>
            </span>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { createQuestionCategory, deleteQuestionCategory, getQuestionCategoryList, updateQuestionCategory } from '@/api/questionCategory'
import { getSubjectList } from '@/api/subject'
import { buildSubjectNameMap, getSubjectDisplayName, normalizeSubjectOptions } from '@/utils/subject'

const loading = ref(false)
const tableData = ref([])
const subjectOptions = ref([])
const subjectNameMap = computed(() => buildSubjectNameMap(subjectOptions.value))
const queryParams = reactive({
    name: '',
    subject: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const form = reactive({
    id: undefined,
    name: '',
    subject: '',
    desc: ''
})

const rules = {
    subject: [{ required: true, message: '请选择科目', trigger: 'change' }],
    name: [{ required: true, message: '请输入知识点名称', trigger: 'blur' }]
}

const fetchSubjectOptions = async () => {
    const { data } = await getSubjectList()
    subjectOptions.value = normalizeSubjectOptions(data || [])
}

const fetchData = async () => {
    loading.value = true
    try {
        const { data } = await getQuestionCategoryList({
            pageNum: 1,
            pageSize: 100,
            name: queryParams.name || undefined,
            subject: queryParams.subject || undefined
        })
        tableData.value = data.list || []
    } finally {
        loading.value = false
    }
}

const handleQuery = () => {
    fetchData()
}

const handleAdd = () => {
    dialogTitle.value = '新增知识点'
    dialogVisible.value = true
    Object.assign(form, {
        id: undefined,
        name: '',
        subject: '',
        desc: ''
    })
    formRef.value?.clearValidate()
}

const handleEdit = (row) => {
    dialogTitle.value = '编辑知识点'
    dialogVisible.value = true
    Object.assign(form, {
        id: row.id,
        name: row.name,
        subject: row.subject,
        desc: row.desc || ''
    })
    formRef.value?.clearValidate()
}

const handleDelete = (row) => {
    ElMessageBox.confirm('确认删除该知识点吗？', '警告', { type: 'warning' }).then(async () => {
        await deleteQuestionCategory(row.id)
        ElMessage.success('删除成功')
        fetchData()
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
        name: form.name,
        subject: form.subject,
        desc: form.desc
    }

    if (form.id) {
        await updateQuestionCategory(form.id, payload)
        ElMessage.success('修改成功')
    } else {
        await createQuestionCategory(payload)
        ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    fetchData()
}

const getSubjectLabel = (subject, subjectName = '') => {
    return getSubjectDisplayName(subject, subjectNameMap.value, subjectName)
}

onMounted(async () => {
    await fetchSubjectOptions()
    await fetchData()
})
</script>

<style scoped>
</style>
