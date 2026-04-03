<template>
  <div class="app-container">
    <el-card shadow="never" class="monitor-overview-card mb-4" :body-style="{ padding: '24px' }">
        <div class="filter-header">
            <div class="left">
                <div class="exam-selector-wrapper">
                    <span class="label">选择考试</span>
                    <el-select v-model="queryParams.examId" placeholder="请选择考试查看详情" class="modern-select" @change="handleExamChange">
                        <el-option v-for="exam in examOptions" :key="exam.id" :label="exam.paperName" :value="exam.id" />
                    </el-select>
                </div>
            </div>
            <div class="right">
                <el-input
                    v-model="queryParams.keyword"
                    placeholder="搜索姓名/班级"
                    prefix-icon="Search"
                    style="width: 220px; margin-right: 15px;"
                    clearable
                    @input="handleSearch"
                />
                <el-button type="success" icon="Download" @click="handleExport" class="export-btn">导出成绩单</el-button>
            </div>
        </div>
    </el-card>

    <el-row :gutter="20" class="mb-4" v-if="queryParams.examId && statsData">
        <el-col :span="6">
            <div class="stat-overview-card blue-gradient">
                <div class="val">{{ statsData.avgScore }}</div>
                <div class="lbl">平均分</div>
            </div>
        </el-col>
        <el-col :span="6">
            <div class="stat-overview-card green-gradient">
                <div class="val">{{ statsData.passRate }}%</div>
                <div class="lbl">及格率</div>
            </div>
        </el-col>
        <el-col :span="6">
            <div class="stat-overview-card purple-gradient">
                <div class="val">{{ statsData.maxScore }}</div>
                <div class="lbl">最高分</div>
            </div>
        </el-col>
        <el-col :span="6">
            <div class="stat-overview-card orange-gradient">
                <div class="val">{{ statsData.minScore }}</div>
                <div class="lbl">最低分</div>
            </div>
        </el-col>
    </el-row>

    <el-row :gutter="20" class="mb-4" v-if="queryParams.examId && statsData">
        <el-col :span="12">
            <el-card shadow="never" class="chart-card">
                <template #header>
                    <div class="chart-header">
                        <span class="title">成绩分布（柱状图）</span>
                    </div>
                </template>
                <div ref="barChartRef" style="height: 300px;"></div>
            </el-card>
        </el-col>
        <el-col :span="12">
            <el-card shadow="never" class="chart-card">
                <template #header>
                    <div class="chart-header">
                        <span class="title">各等级占比（饼图）</span>
                    </div>
                </template>
                <div ref="pieChartRef" style="height: 300px;"></div>
            </el-card>
        </el-col>
    </el-row>

    <el-card shadow="never" class="detail-card">
        <template #header>
            <div class="table-header">
                <span style="font-size: 16px; font-weight: 600;">详细成绩列表</span>
                <el-tag type="info" effect="plain" round v-if="total > 0">共 {{ total }} 条记录</el-tag>
            </div>
        </template>

        <el-table :data="scoreList" stripe style="width: 100%" v-loading="loading">
            <el-table-column type="index" label="排名" width="80" align="center">
                <template #default="{ $index }">
                    <span class="rank-badge" :class="'rank-' + calcIndex($index)" v-if="calcIndex($index) <= 3">{{ calcIndex($index) }}</span>
                    <span v-else>{{ calcIndex($index) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="studentName" label="姓名" align="center" />
            <el-table-column prop="className" label="班级" align="center" />
            <el-table-column prop="score" label="成绩" sortable align="center">
                <template #default="{ row }">
                    <span :class="getScoreClass(row.score)">{{ row.score }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="passStatus" label="状态" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.passStatus === 1 ? 'success' : 'danger'">
                        {{ row.passStatus === 1 ? '合格' : '不合格' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="submitTime" label="交卷时间" width="180" align="center" />
        </el-table>

        <el-empty v-if="!loading && queryParams.examId && total === 0" description="当前考试暂无已出分记录" />

        <div class="pagination-container" v-if="total > 0">
            <span class="total-text">共 {{ total }} 条</span>
            <el-pagination
                background
                :current-page="currentPage"
                :page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, prev, pager, next, sizes, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, onUnmounted } from 'vue'
import { use as useECharts, init as initEChart } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ElMessage } from '@/utils/element-plus'
import { getPaperList } from '@/api/paper'
import { exportScoreList, getScoreList, getScoreStats } from '@/api/score'

useECharts([BarChart, PieChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const queryParams = reactive({
    examId: null,
    keyword: ''
})
const loading = ref(false)
const examOptions = ref([])
const scoreList = ref([])
const statsData = ref(null)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const barChartRef = ref(null)
const pieChartRef = ref(null)
let barChart = null
let pieChart = null
let searchTimer = null

const isSameId = (left, right) => String(left) === String(right)

const currentExamTitle = computed(() => {
    return examOptions.value.find(item => isSameId(item.id, queryParams.examId))?.paperName || '成绩单'
})

const getScoreClass = (score) => {
    if (score >= 90) return 'score-excellent'
    if (score < 60) return 'score-fail'
    return ''
}

const buildListQuery = () => ({
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    paperId: queryParams.examId,
    keyword: queryParams.keyword.trim() || undefined
})

const buildStatsQuery = () => ({
    paperId: queryParams.examId,
    keyword: queryParams.keyword.trim() || undefined
})

const disposeCharts = () => {
    if (barChart) {
        barChart.dispose()
        barChart = null
    }
    if (pieChart) {
        pieChart.dispose()
        pieChart = null
    }
}

const handleResize = () => {
    barChart?.resize()
    pieChart?.resize()
}

const renderCharts = () => {
    if (!statsData.value || !barChartRef.value || !pieChartRef.value) {
        disposeCharts()
        return
    }

    disposeCharts()
    const dist = statsData.value.distribution

    barChart = initEChart(barChartRef.value)
    barChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['不及格(<60)', '及格(60-79)', '良好(80-89)', '优秀(90+)'] },
        yAxis: { type: 'value' },
        series: [{
            data: [dist.poor, dist.average, dist.good, dist.excellent],
            type: 'bar',
            itemStyle: {
                color: (params) => {
                    const colors = ['#F56C6C', '#E6A23C', '#409EFF', '#67C23A']
                    return colors[params.dataIndex] || '#409EFF'
                }
            },
            label: { show: true, position: 'top' }
        }]
    })

    pieChart = initEChart(pieChartRef.value)
    pieChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: '0' },
        series: [{
            name: '成绩占比',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            data: [
                { value: dist.excellent, name: '优秀', itemStyle: { color: '#67C23A' } },
                { value: dist.good, name: '良好', itemStyle: { color: '#409EFF' } },
                { value: dist.average, name: '及格', itemStyle: { color: '#E6A23C' } },
                { value: dist.poor, name: '不及格', itemStyle: { color: '#F56C6C' } }
            ]
        }]
    })
}

const fetchExamOptions = async () => {
    const { data } = await getPaperList({
        pageNum: 1,
        pageSize: 200,
        status: '1'
    })
    examOptions.value = data?.list || []
}

const fetchScoreData = async () => {
    if (!queryParams.examId) {
        scoreList.value = []
        statsData.value = null
        total.value = 0
        disposeCharts()
        return
    }

    loading.value = true
    try {
        const [listRes, statsRes] = await Promise.all([
            getScoreList(buildListQuery()),
            getScoreStats(buildStatsQuery())
        ])
        scoreList.value = listRes.data?.list || []
        total.value = Number(listRes.data?.total || 0)
        statsData.value = statsRes.data || null
        await nextTick()
        renderCharts()
    } finally {
        loading.value = false
    }
}

const calcIndex = (index) => {
    return (currentPage.value - 1) * pageSize.value + index + 1
}

const handleExamChange = async () => {
    currentPage.value = 1
    await fetchScoreData()
}

const handleSearch = () => {
    currentPage.value = 1
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        fetchScoreData()
    }, 300)
}

const handleSizeChange = async (size) => {
    currentPage.value = 1
    pageSize.value = size
    await fetchScoreData()
}

const handleCurrentChange = async (page) => {
    currentPage.value = page
    await fetchScoreData()
}

const getDownloadFilename = (headers) => {
    const disposition = headers?.['content-disposition'] || ''
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1])
    }

    const normalMatch = disposition.match(/filename="?([^";]+)"?/i)
    if (normalMatch?.[1]) {
        return decodeURIComponent(normalMatch[1])
    }

    return `${currentExamTitle.value}.xlsx`
}

const handleExport = async () => {
    if (!queryParams.examId) {
        ElMessage.warning('请先选择考试')
        return
    }

    try {
        const response = await exportScoreList(buildStatsQuery())
        const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = getDownloadFilename(response.headers)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
        ElMessage.success('导出成功')
    } catch {
        // 请求拦截器已统一提示
    }
}

onMounted(async () => {
    window.addEventListener('resize', handleResize)
    await fetchExamOptions()
    if (examOptions.value.length > 0) {
        queryParams.examId = examOptions.value[0].id
        await fetchScoreData()
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    clearTimeout(searchTimer)
    disposeCharts()
})
</script>

<style scoped lang="scss">
.mb-4 { margin-bottom: 24px; }
.app-container {
    padding: 20px;
    background-color: #f6f8f9;
    min-height: 100vh;
}

.monitor-overview-card {
    border: none;
    border-radius: 16px;
}

.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left {
         display: flex;
        align-items: center;

        .exam-selector-wrapper {
            display: flex;
            align-items: center;
            background: #f8fafc;
            padding: 4px 4px 4px 16px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;

            .label {
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
                margin-right: 12px;
            }

            .modern-select {
                width: 280px;
                :deep(.el-input__wrapper), :deep(.el-select__wrapper) {
                    box-shadow: none !important;
                    background: transparent !important;
                    padding-left: 0;

                    &.is-focus, &:hover {
                         box-shadow: none !important;
                    }

                    .el-input__inner, .el-select__selected-item {
                        font-weight: 600;
                        color: #1e293b;
                        font-size: 15px;
                    }
                }
            }
        }
    }

    .right {
        .export-btn {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border: none;
            padding: 8px 20px;
            font-weight: 500;
            transition: opacity 0.2s;
            &:hover { opacity: 0.9; }
        }
    }
}

.blue-gradient { background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); }
.green-gradient { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); }
.orange-gradient { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); }
.purple-gradient { background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%); }

.stat-overview-card {
    border-radius: 16px;
    padding: 24px;
    color: white;
    text-align: center;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .val {
        font-size: 36px;
        font-weight: 800;
        margin-bottom: 8px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        letter-spacing: -0.02em;
        line-height: 1.1;
    }
    .lbl {
        font-size: 14px;
        font-weight: 500;
        opacity: 0.95;
        letter-spacing: 0.02em;
    }
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.score-excellent { color: #67C23A; font-weight: bold; }
.score-fail { color: #F56C6C; font-weight: bold; }

.rank-badge {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    border-radius: 50%;
    color: white;
    font-weight: bold;
    font-size: 12px;

    &.rank-1 { background-color: #F56C6C; }
    &.rank-2 { background-color: #E6A23C; }
    &.rank-3 { background-color: #409EFF; }
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
.chart-card {
    border: none;
    border-radius: 16px;

    :deep(.el-card__header) {
        border-bottom: 1px solid #f1f5f9;
        padding: 16px 24px;
    }

    .chart-header {
        .title {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
        }
    }
}

.detail-card {
    border: none;
    border-radius: 16px;
}
</style>
