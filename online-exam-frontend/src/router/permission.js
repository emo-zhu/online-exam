import router from './index'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { getToken } from '@/utils/auth'
import { ElMessage } from '@/utils/element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { asyncRoutes } from '@/router'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/404']

router.beforeEach(async (to, from, next) => {
    NProgress.start()

    const hasToken = getToken()
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    if (hasToken) {
        if (to.path === '/login') {
            next({ path: '/' })
            NProgress.done()
        } else {
            if (permissionStore.hasAddedRoutes) {
                next()
            } else {
                try {
                    const hasRoles = userStore.roles && userStore.roles.length > 0
                    const roles = hasRoles ? userStore.roles : (await userStore.getInfo()).roles
                    const accessRoutes = await permissionStore.generateRoutes(roles, asyncRoutes)

                    accessRoutes.forEach(route => {
                        router.addRoute(route)
                    })

                    permissionStore.setHasAddedRoutes(true)
                    next({ ...to, replace: true })
                } catch (error) {
                    await userStore.logout()
                    ElMessage.error(error.message || '加载用户信息失败')
                    next(`/login?redirect=${to.path}`)
                    NProgress.done()
                }
            }
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1) {
            next()
        } else {
            next(`/login?redirect=${to.path}`)
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    NProgress.done()
})
