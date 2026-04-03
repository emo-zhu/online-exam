<template>
  <div class="dashboard-container">
    <!-- 管理员 & 教师视图 -->
    <div v-if="checkPermission(['admin', 'teacher'])">
        <!-- 顶部数据统计卡片 -->
        <el-row :gutter="20">
            <el-col :span="6">
                <el-card shadow="hover" class="data-card">
                    <template #header>
                        <div class="card-header">
                            <span>总用户数</span>
                            <el-tag type="success">实时</el-tag>
                        </div>
                    </template>
                    <div class="card-content">
                        <el-statistic :value="userCount" />
                        <div class="card-desc">
                            <span>当前注册用户</span>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="data-card">
                    <template #header>
                        <div class="card-header">
                            <span>试卷总数</span>
                            <el-tag type="primary">试卷</el-tag>
                        </div>
                    </template>
                    <div class="card-content">
                        <el-statistic :value="examCount" />
                        <div class="card-desc">
                            <span>累计创建试卷</span>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="data-card">
                    <template #header>
                        <div class="card-header">
                            <span>题库总量</span>
                            <el-tag type="warning">题库</el-tag>
                        </div>
                    </template>
                    <div class="card-content">
                        <el-statistic :value="questionCount" />
                        <div class="card-desc">
                            <span>累计题目</span>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="data-card">
                    <template #header>
                        <div class="card-header">
                            <span>今日考试</span>
                            <el-tag type="danger">进行中</el-tag>
                        </div>
                    </template>
                    <div class="card-content">
                        <el-statistic :value="activeExamCount" />
                        <div class="card-desc">
                            <span>正在进行中</span>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 快捷入口 & 最近动态 -->
        <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="16">
                <el-card shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>近期考试安排</span>
                            <el-button link type="primary" @click="$router.push('/exam/index')">查看全部</el-button>
                        </div>
                    </template>
                    <el-table :data="recentExams" style="width: 100%" stripe>
                        <el-table-column prop="paperName" label="考试名称" show-overflow-tooltip />
                        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
                        <el-table-column prop="duration" label="时长(分)" width="100" align="center" />
                        <el-table-column prop="status" label="状态" width="100" align="center">
                            <template #default="scope">
                                <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.status === 1 ? '已发布' : '草稿' }}</el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card shadow="hover">
                    <template #header>
                        <span>快捷操作</span>
                    </template>
                    <div class="quick-actions">
                        <el-button type="primary" icon="Plus" plain class="action-btn" @click="$router.push('/exam/create')">发布考试</el-button>
                        <el-button type="success" icon="Edit" plain class="action-btn" @click="$router.push('/question-manage/list')">添加试题</el-button>
                        <el-button type="warning" icon="User" plain class="action-btn" @click="$router.push('/user/index')">用户管理</el-button>
                        <el-button type="info" icon="DataLine" plain class="action-btn" @click="$router.push('/monitor/index')">考试监控</el-button>
                    </div>
                </el-card>
                
                 <el-card shadow="hover" style="margin-top: 20px;">
                    <template #header>
                         <div class="card-header">
                            <span>系统公告</span>
                            <el-button link type="primary" @click="$router.push('/notice')">更多</el-button>
                        </div>
                    </template>
                     <ul class="notice-list">
                         <li v-for="notice in recentNotices" :key="notice.id" @click="handleViewNotice(notice)">
                             <el-tag size="small" :type="getNoticeTagType(notice.type)">{{ getNoticeTypeName(notice.type) }}</el-tag> 
                             <span class="notice-title">{{ notice.title }}</span>
                         </li>
                         <li v-if="recentNotices.length === 0" style="text-align: center; color: #999;">暂无公告</li>
                     </ul>
                </el-card>
            </el-col>
        </el-row>
    </div>

    <!-- 学生视图 -->
    <div v-else>
        <el-row :gutter="20">
            <el-col :span="16">
                 <!-- 欢迎 Banner -->
                <el-card class="welcome-card" shadow="hover">
                    <div class="welcome-content">
                        <h3>欢迎回来</h3>
                        <p>请查看待参加考试与个人学习数据，合理安排考试与复习。</p>
                    </div>
                    <div class="welcome-img">
                        <el-icon :size="80" color="#409eff"><Reading /></el-icon>
                    </div>
                </el-card>
                
                <!-- 待办考试 -->
                <el-card shadow="hover" style="margin-top: 20px;">
                    <template #header>
                        <div class="card-header">
                            <span>待参加考试</span>
                            <el-button link type="primary" @click="$router.push('/student/exam')">去考试</el-button>
                        </div>
                    </template>
                    <div v-if="todoExams.length > 0">
                        <div v-for="exam in todoExams" :key="exam.id" class="exam-item">
                            <div class="exam-info">
                                <h4>{{ exam.title }}</h4>
                                <p>开始时间：{{ exam.startTime }} | 时长：{{ exam.duration }}分钟</p>
                            </div>
                            <el-button type="primary" size="small" :disabled="exam.status !== 'ongoing'" @click="$router.push(`/do-exam/${exam.id}`)">
                                {{ exam.actionText }}
                            </el-button>
                        </div>
                    </div>
                    <el-empty v-else description="暂无待参加的考试" />
                </el-card>
            </el-col>
            
            <el-col :span="8">
                 <!-- 个人数据 -->
                 <el-card shadow="hover">
                    <template #header>
                        <span>我的数据</span>
                    </template>
                    <div class="student-stats">
                        <div class="stat-item">
                            <div class="val">{{ studentStats.examCount }}</div>
                            <div class="label">已考场次</div>
                        </div>
                         <div class="stat-item">
                            <div class="val">{{ studentStats.avgScore }}</div>
                            <div class="label">平均分</div>
                        </div>
                         <div class="stat-item">
                            <div class="val">{{ studentStats.wrongCount }}</div>
                            <div class="label">错题数</div>
                        </div>
                    </div>
                </el-card>

                <el-card shadow="hover" style="margin-top: 20px;">
                     <template #header>
                        <span>快捷入口</span>
                    </template>
                     <div class="quick-links">
                        <el-button type="success" icon="Medal" @click="$router.push('/student/score')" style="width: 100%; margin: 5px 0;">查看成绩</el-button>
                        <el-button type="danger" icon="Notebook" @click="$router.push('/student/wrong-book')" style="width: 100%; margin: 5px 0;">我的错题本</el-button>
                     </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { getUserList } from '@/api/user'
import { getNoticeList } from '@/api/notice'
import { getQuestionList } from '@/api/question'
import { getPaperList } from '@/api/paper'
import { getActiveMonitorExams } from '@/api/monitor'
import { getStudentExamList, getStudentScoreList, getWrongBookList } from '@/api/examRecord'
import { ElNotification } from '@/utils/element-plus'

const userStore = useUserStore()

const userCount = ref(0)
const examCount = ref(0)
const questionCount = ref(0)
const activeExamCount = ref(0)
const recentNotices = ref([])
const recentExams = ref([])
const studentExamList = ref([])
const studentScores = ref([])
const wrongBookList = ref([])

const checkPermission = (roles) => {
    const userRole = userStore.roles[0]
    return roles.includes(userRole)
}

const isAdmin = computed(() => checkPermission(['admin']))
const isAdminOrTeacher = computed(() => checkPermission(['admin', 'teacher']))
const isStudent = computed(() => checkPermission(['student']))

const getTimeValue = (value) => {
    const time = new Date(value || 0).getTime()
    return Number.isNaN(time) ? 0 : time
}

const loadUserCount = async () => {
    if (!isAdmin.value) {
        userCount.value = 0
        return
    }

    const { data } = await getUserList({ pageNum: 1, pageSize: 1 })
    userCount.value = data.total || 0
}

const loadRecentNotices = async () => {
    if (!isAdminOrTeacher.value) {
        recentNotices.value = []
        return
    }

    const { data } = await getNoticeList({ pageNum: 1, pageSize: 5 })
    recentNotices.value = data.list || []
}

const loadQuestionCount = async () => {
    if (!isAdminOrTeacher.value) {
        questionCount.value = 0
        return
    }

    const { data } = await getQuestionList({ pageNum: 1, pageSize: 1 })
    questionCount.value = data.total || 0
}

const loadAdminExamData = async () => {
    if (!isAdminOrTeacher.value) {
        examCount.value = 0
        activeExamCount.value = 0
        recentExams.value = []
        return
    }

    const [{ data: paperData }, { data: activeExamData }] = await Promise.all([
        getPaperList({ pageNum: 1, pageSize: 5 }),
        getActiveMonitorExams()
    ])

    examCount.value = paperData?.total || 0
    recentExams.value = paperData?.list || []
    activeExamCount.value = (activeExamData || []).length
}

const getNoticeTypeName = (type) => ({ exam: '考试通知', maintain: '系统维护', system: '校务通知' }[type] || '公告')
const getNoticeTagType = (type) => ({ exam: 'primary', maintain: 'warning', system: 'success' }[type] || 'info')

const handleViewNotice = (notice) => {
    ElNotification({
        title: notice.title,
        message: notice.content,
        type: 'info',
        duration: 5000
    })
}

const loadStudentData = async () => {
    if (!isStudent.value) {
        studentExamList.value = []
        studentScores.value = []
        wrongBookList.value = []
        return
    }

    const [{ data: examData }, { data: scoreData }, { data: wrongBookData }] = await Promise.all([
        getStudentExamList(),
        getStudentScoreList(),
        getWrongBookList()
    ])

    studentExamList.value = examData || []
    studentScores.value = scoreData || []
    wrongBookList.value = wrongBookData || []
}

const todoExams = computed(() => {
    return [...studentExamList.value]
        .filter(exam => exam.status === 'ongoing' || exam.status === 'not_started')
        .sort((a, b) => getTimeValue(a.startTime) - getTimeValue(b.startTime))
        .slice(0, 5)
        .map(exam => ({
            id: exam.id,
            title: exam.title,
            startTime: exam.startTime,
            duration: exam.duration,
            actionText: exam.actionText,
            status: exam.status
        }))
})

const studentStats = computed(() => {
    const examCount = studentScores.value.length
    const totalScore = studentScores.value.reduce((sum, item) => sum + Number(item.score || 0), 0)

    return {
        examCount,
        avgScore: examCount > 0 ? Number((totalScore / examCount).toFixed(1)) : 0,
        wrongCount: wrongBookList.value.length
    }
})

onMounted(async () => {
    await Promise.all([
        loadUserCount(),
        loadQuestionCount(),
        loadRecentNotices(),
        loadAdminExamData(),
        loadStudentData()
    ])
})

</script>

<style scoped lang="scss">
.dashboard-container {
    padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
    text-align: center;
    .card-desc {
        margin-top: 10px;
        font-size: 12px;
        color: #909399;
    }
}

.quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    
    .action-btn {
        margin-left: 0;
        width: 48%; // 略微加宽，保证布局更协调
        margin-bottom: 5px;
    }
}

.notice-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
        margin-bottom: 12px;
        font-size: 14px;
        color: #606266;
        cursor: pointer;
        display: flex;
        align-items: center;
        
        &:hover {
            color: #409eff;
            .notice-title { text-decoration: underline; }
        }
        
        .el-tag {
            margin-right: 8px;
            flex-shrink: 0;
        }

        .notice-title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}

// 学生端样式
.welcome-card {
    background: linear-gradient(135deg, #ecf5ff 0%, #fff 100%);
    .el-card__body {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .welcome-content {
        h3 {
            font-size: 24px;
            color: #303133;
            margin-bottom: 10px;
        }
        p {
            color: #606266;
        }
    }
    
    .welcome-img {
         margin-right: 20px;
    }
}

.exam-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #EBEEF5;
    
    &:last-child {
        border-bottom: none;
    }
    
    h4 {
        margin: 0 0 5px 0;
        font-size: 16px;
    }
    p {
        margin: 0;
        color: #909399;
        font-size: 13px;
    }
}

.student-stats {
    display: flex;
    justify-content: space-around;
    text-align: center;
    
    .val {
        font-size: 24px;
        font-weight: bold;
        color: #409eff;
        margin-bottom: 5px;
    }
    .label {
        font-size: 12px;
        color: #909399;
    }
}
</style>
