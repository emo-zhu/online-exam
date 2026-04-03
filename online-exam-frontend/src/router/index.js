import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layout/AdminLayout.vue'

// 通用路由 (无需权限)
export const constantRoutes = [
    {
        path: '/login',
        component: () => import('@/views/login/index.vue'),
        hidden: true,
        name: 'Login'
    },
    {
        path: '/redirect',
        component: AdminLayout,
        hidden: true,
        children: [
            {
                path: '/redirect/:path(.*)',
                component: () => import('@/views/redirect/index.vue'),
                name: 'Redirect'
            }
        ]
    },
    {
        path: '/404',
        component: () => import('@/views/error-page/404.vue'),
        hidden: true,
        name: 'Page404'
    },
    {
        path: '/',
        component: AdminLayout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                name: 'Dashboard',
                meta: { title: '仪表盘', icon: 'Odometer', roles: ['admin', 'teacher', 'student'] }
            }
        ]
    }
]

// 动态权限路由
export const asyncRoutes = [
    {
        path: '/user',
        component: AdminLayout,
        redirect: '/user/index',
        meta: { roles: ['admin'] },
        children: [
            {
                path: 'index',
                component: () => import('@/views/user/list.vue'),
                name: 'UserList',
                meta: { title: '用户管理', icon: 'User' }
            }
        ]
    },
    {
        path: '/class',
        component: AdminLayout,
        redirect: '/class/index',
        meta: { roles: ['admin'] },
        children: [
            {
                path: 'index',
                component: () => import('@/views/class/index.vue'),
                name: 'ClassManage',
                meta: { title: '班级管理', icon: 'Box' }
            }
        ]
    },
    {
        path: '/subject',
        component: AdminLayout,
        redirect: '/subject/index',
        meta: { roles: ['admin', 'teacher'] },
        children: [
            {
                path: 'index',
                component: () => import('@/views/subject/index.vue'),
                name: 'SubjectManage',
                meta: { title: '学科管理', icon: 'Reading' }
            }
        ]
    },
    {
        path: '/exam',
        component: AdminLayout,
        redirect: '/exam/index',
        alwaysShow: true,
        meta: { title: '考试管理', icon: 'Document', roles: ['admin', 'teacher'] },
        children: [
            {
                path: 'index',
                component: () => import('@/views/exam/paper-list.vue'),
                name: 'ExamList',
                meta: { title: '考试列表', icon: 'List' } // 区分一下子菜单
            },
            {
                path: 'create',
                component: () => import('@/views/exam/form.vue'),
                name: 'ExamCreate',
                meta: { title: '创建试卷', icon: 'Plus' }
            },
            {
                path: 'edit/:id',
                component: () => import('@/views/exam/form.vue'),
                name: 'ExamEdit',
                hidden: true,
                meta: { title: '编辑试卷', activeMenu: '/exam/index' }
            }
        ]
    },
    {
        path: '/question-manage',
        component: AdminLayout,
        redirect: '/question-manage/bank',
        meta: { title: '题库管理', icon: 'Collection', roles: ['admin', 'teacher'] },
        children: [
            {
                path: 'bank',
                component: () => import('@/views/question-bank/index.vue'),
                name: 'QuestionBank',
                meta: { title: '题库分类', icon: 'Files' }
            },
            {
                path: 'list',
                component: () => import('@/views/question/index.vue'),
                name: 'QuestionList',
                meta: { title: '试题列表' }
            }
        ]
    },
    {
        path: '/monitor',
        component: AdminLayout,
        redirect: '/monitor/index',
        meta: { roles: ['admin', 'teacher'] },
        children: [
            {
                path: 'index',
                component: () => import('@/views/monitor/index.vue'),
                name: 'ExamMonitor',
                meta: { title: '考试监控', icon: 'DataLine' }
            }
        ]
    },
    {
        path: '/score',
        component: AdminLayout,
        redirect: '/score/index',
        meta: { roles: ['admin', 'teacher'] },
        children: [
            {
                path: 'index',
                component: () => import('@/views/score/index.vue'),
                name: 'ScoreManage',
                meta: { title: '成绩管理', icon: 'TrendCharts' }
            }
        ]
    },

    {
        path: '/notice',
        component: AdminLayout,
        redirect: '/notice/index',
        meta: { roles: ['admin'] },
        children: [
            {
                path: 'index',
                component: () => import('@/views/notice/index.vue'),
                name: 'Notice',
                meta: { title: '公告管理', icon: 'Bell' }
            }
        ]
    },
    {
        path: '/log',
        component: AdminLayout,
        redirect: '/log/index',
        meta: { roles: ['admin'] },
        children: [
            {
                path: 'index',
                component: () => import('@/views/log/index.vue'),
                name: 'LoginLog',
                meta: { title: '登录日志', icon: 'Timer' }
            }
        ]
    },
    {
        path: '/profile',
        component: AdminLayout,
        hidden: true,
        children: [
            {
                path: '',
                component: () => import('@/views/profile/index.vue'),
                name: 'Profile',
                meta: { title: '个人中心' }
            },
            {
                path: 'password',
                component: () => import('@/views/profile/password.vue'),
                name: 'ChangePassword',
                meta: { title: '修改密码' }
            }
        ]
    },
    // 学生端路由
    {
        path: '/student',
        component: AdminLayout,
        meta: { roles: ['student'], title: '学生中心', icon: 'UserFilled' }, // 增加父级图标
        redirect: '/student/exam',
        children: [
            {
                path: 'exam',
                component: () => import('@/views/student/exam-list/index.vue'),
                name: 'StudentExamList',
                meta: { title: '我的考试', icon: 'Edit' }
            },
            {
                path: 'score',
                component: () => import('@/views/student/score/index.vue'),
                name: 'StudentScore',
                meta: { title: '我的成绩', icon: 'Medal' }
            },
            {
                path: 'wrong-book',
                component: () => import('@/views/student/wrong-book/index.vue'),
                name: 'WrongBook',
                meta: { title: '错题本', icon: 'Notebook' }
            }
        ]
    },
    // 学生查看试卷解析 (隐藏路由)
    {
        path: '/student/analysis/:id',
        component: () => import('@/views/student/analysis/index.vue'),
        name: 'ExamAnalysis',
        hidden: true, // 修正：移到一级属性
        meta: { title: '试卷解析', roles: ['student'], icon: 'DocumentChecked' }
    },
    // 教师人工阅卷
    {
        path: '/marking',
        component: AdminLayout,
        redirect: '/marking/list',
        meta: { title: '阅卷中心', icon: 'EditPen', roles: ['admin', 'teacher'] },
        children: [
            {
                path: 'list',
                component: () => import('@/views/teacher/marking/index.vue'),
                name: 'MarkingList',
                meta: { title: '待阅卷列表', icon: 'List' }
            }
        ]
    },
    // 独立路由：考试界面（全屏，不使用布局容器）
    {
        path: '/do-exam/:id',
        component: () => import('@/views/student/exam/do.vue'),
        name: 'DoExam',
        hidden: true, // 修正
        meta: { title: '在线考试', roles: ['student', 'admin', 'teacher'] }
    },
    // 404
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404',
        hidden: true
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: constantRoutes
})

// 重置路由
export function resetRouterV4() {
    const whitelist = ['Login', 'Redirect', 'Page404', 'Dashboard']
    const currentRoutes = router.getRoutes()
    currentRoutes.forEach(route => {
        // 如果路由有名字，且不在白名单中，说明是动态添加的，移除它
        if (route.name && !whitelist.includes(route.name)) {
            router.removeRoute(route.name)
        }
    })
}

export default router
