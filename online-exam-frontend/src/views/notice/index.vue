<template>
  <div class="app-container">
    <el-card shadow="hover" class="premium-card">
      <div class="filter-container">
        <div class="filter-item">
            <span class="label">公告标题</span>
             <el-input
                v-model="queryParams.title"
                placeholder="请输入标题"
                style="width: 200px"
                clearable
                @keyup.enter="handleSearch"
             />
        </div>
        <div class="filter-buttons">
             <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
             <el-button type="primary" icon="Plus" @click="handleAdd">发布公告</el-button>
        </div>
      </div>

      <el-table :data="tableData" style="width: 100%" stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="80" align="center">
             <template #default="{ $index }">
                {{ (queryParams.pageNum - 1) * queryParams.pageSize + $index + 1 }}
             </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100" align="center">
             <template #default="{ row }">
                 <el-tag :type="getTypeTag(row.type)">{{ getTypeName(row.type) }}</el-tag>
             </template>
        </el-table-column>
        <el-table-column prop="publisher" label="发布人" width="120" align="center" />
        <el-table-column prop="createTime" label="发布时间" align="center" width="180" />
        <el-table-column label="操作" align="center" width="180">
           <template #default="{ row }">
              <el-button link type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
              <el-popconfirm title="确认删除该公告吗？" @confirm="handleDelete(row.id)">
                  <template #reference>
                     <el-button link type="danger" icon="Delete">删除</el-button>
                  </template>
              </el-popconfirm>
           </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="tableData.length === 0 && !loading" description="暂无公告" style="padding: 40px 0;" />

      <div class="pagination-container" v-if="total > 0">
        <span class="total-text">共 {{ total }} 条</span>
        <el-pagination
          background
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, prev, pager, next, sizes, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog
        v-model="dialogVisible"
        :title="form.id ? '编辑公告' : '发布公告'"
        width="600px"
        destroy-on-close
    >
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="标题" prop="title">
                <el-input v-model="form.title" placeholder="请输入公告标题" />
            </el-form-item>
            <el-form-item label="类型" prop="type">
                <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                    <el-option label="考试通知" value="exam" />
                    <el-option label="系统维护" value="maintain" />
                    <el-option label="校务通知" value="system" />
                </el-select>
            </el-form-item>
            <el-form-item label="内容" prop="content">
                 <el-input
                    v-model="form.content"
                    type="textarea"
                    :rows="6"
                    placeholder="请输入公告内容"
                 />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from '@/utils/element-plus'
import { createNotice, deleteNotice, getNoticeList, updateNotice } from '@/api/notice'

const loading = ref(false)
const dialogVisible = ref(false)
const tableData = ref([])
const total = ref(0)
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    title: ''
})

const formRef = ref(null)
const form = reactive({
    id: null,
    title: '',
    type: 'exam',
    content: ''
})

const rules = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    type: [{ required: true, message: '请选择类型', trigger: 'change' }],
    content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const fetchData = async () => {
    loading.value = true
    try {
        const { data } = await getNoticeList(queryParams)
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

const handleAdd = () => {
    form.id = null
    form.title = ''
    form.type = 'exam'
    form.content = ''
    dialogVisible.value = true
}

const handleEdit = (row) => {
    Object.assign(form, row)
    dialogVisible.value = true
}

const handleDelete = async (id) => {
    await deleteNotice(id)
    ElMessage.success('删除成功')
    fetchData()
}

const submitForm = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
        if (!valid) return

        const payload = {
            title: form.title,
            type: form.type,
            content: form.content
        }

        if (form.id) {
            await updateNotice(form.id, payload)
            ElMessage.success('更新成功')
        } else {
            await createNotice(payload)
            ElMessage.success('发布成功')
        }

        dialogVisible.value = false
        fetchData()
    })
}

const getTypeName = (type) => ({ exam: '考试通知', maintain: '系统维护', system: '校务通知' }[type] || '公告')
const getTypeTag = (type) => ({ exam: 'primary', maintain: 'warning', system: 'success' }[type] || 'info')

onMounted(() => {
    fetchData()
})
</script>

<style scoped lang="scss">
.filter-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;

    .filter-item {
        display: flex;
        align-items: center;
        .label {
            font-size: 14px;
            color: #606266;
            margin-right: 12px;
        }
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
</style>
