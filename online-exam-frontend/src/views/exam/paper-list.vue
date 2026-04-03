<template>
  <div class="app-container">
    <el-card shadow="hover" class="premium-card">
        <div class="filter-container">
            <div class="filter-item">
                <span class="label">试卷名称</span>
                <el-input v-model="queryParams.paperName" placeholder="输入名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </div>
            <div class="filter-item">
                <span class="label">科目</span>
                 <el-select v-model="queryParams.subject" placeholder="所有科目" clearable style="width: 150px">
                    <el-option v-for="item in subjectOptions" :key="item.value" :label="item.label" :value="item.value" />
                 </el-select>
            </div>
            <div class="filter-buttons">
                <el-button type="primary" @click="handleQuery">查询</el-button>
                <el-button type="primary" icon="Plus" @click="handleAdd">创建试卷</el-button>
            </div>
        </div>

        <el-table :data="tableData" v-loading="loading" style="width: 100%">
            <el-table-column type="index" label="序号" width="80" align="center" />
            <el-table-column prop="paperName" label="试卷名称" min-width="150" />
            <el-table-column prop="subject" label="科目" width="190" align="center">
                 <template #default="{ row }">
                     <el-tag :type="getSubjectType(row.subject)">{{ row.subjectName || getSubjectLabel(row.subject) }}</el-tag>
                 </template>
            </el-table-column>
            <el-table-column label="适用班级" min-width="80">
                <template #default="{ row }">
                    <span v-if="row.allClasses">全部班级</span>
                    <span v-else>{{ formatClassNames(row.classList) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="totalScore" label="总分" width="100" align="center" />
            <el-table-column prop="duration" label="时长(分钟)" width="100" align="center" />
            <el-table-column prop="questionCount" label="题数" width="100" align="center" />
            <el-table-column prop="recordCount" label="参考人数" width="100" align="center" />
            <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
            <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                     <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '已发布' : '草稿' }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="250" align="center">
                <template #default="{ row }">
                    <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                    <el-button link type="success" @click="handlePublish(row)" v-if="row.status === 0">发布</el-button>
                    <el-button link type="warning" @click="handleRevoke(row)" v-else>撤回</el-button>
                    <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
                layout="prev, pager, next, sizes, jumper"
                @size-change="handleSizeChange"
                @current-change="handlePageChange"
            />
        </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from '@/utils/element-plus'
import { deletePaper, getPaperList, updatePaperStatus } from '@/api/paper'
import { getSubjectList } from '@/api/subject'
import { buildSubjectNameMap, getSubjectDisplayName, normalizeSubjectOptions } from '@/utils/subject'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const subjectOptions = ref([])
const subjectNameMap = computed(() => buildSubjectNameMap(subjectOptions.value))
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    paperName: '',
    subject: ''
})

const buildQueryParams = () => ({
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    paperName: queryParams.paperName || undefined,
    subject: queryParams.subject || undefined
})

const fetchSubjectOptions = async () => {
    const { data } = await getSubjectList()
    subjectOptions.value = normalizeSubjectOptions(data || [])
}

const fetchData = async () => {
    loading.value = true
    try {
        const { data } = await getPaperList(buildQueryParams())
        tableData.value = data.list || []
        total.value = data.total || 0
    } finally {
        loading.value = false
    }
}

const handleQuery = () => {
    queryParams.pageNum = 1
    fetchData()
}

const handleSizeChange = (size) => {
    queryParams.pageSize = size
    queryParams.pageNum = 1
    fetchData()
}

const handlePageChange = (page) => {
    queryParams.pageNum = page
    fetchData()
}

const handleAdd = () => {
    router.push('/exam/create')
}

const handleEdit = (row) => {
    router.push(`/exam/edit/${row.id}`)
}

const handleDelete = (row) => {
    ElMessageBox.confirm('确认删除该试卷吗？', '警告', { type: 'warning' }).then(async () => {
        await deletePaper(row.id)
        ElMessage.success('删除成功')
        if (tableData.value.length === 1 && queryParams.pageNum > 1) {
            queryParams.pageNum -= 1
        }
        fetchData()
    }).catch(() => {})
}

const handlePublish = async (row) => {
    await updatePaperStatus(row.id, { status: 1 })
    ElMessage.success('发布成功')
    fetchData()
}

const handleRevoke = async (row) => {
    await updatePaperStatus(row.id, { status: 0 })
    ElMessage.success('已撤回为草稿')
    fetchData()
}

const getSubjectType = (subject) => {
    const index = subjectOptions.value.findIndex((item) => item.value === subject)
    const types = ['primary', 'success', 'warning', 'danger', 'info']
    return index >= 0 ? types[index % types.length] : 'info'
}

const getSubjectLabel = (subject, subjectName = '') => {
    return getSubjectDisplayName(subject, subjectNameMap.value, subjectName)
}

const formatClassNames = (classList = []) => {
    return classList.map((item) => item.className).join('、')
}

onMounted(async () => {
    await fetchSubjectOptions()
    await fetchData()
})
</script>

<style scoped lang="scss">
</style>
