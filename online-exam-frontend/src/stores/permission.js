import { defineStore } from 'pinia'
import { ref } from 'vue'
import { constantRoutes } from '@/router'

// 匹配权限逻辑
function hasPermission(roles, route) {
    if (route.meta && route.meta.roles) {
        return roles.some(role => route.meta.roles.includes(role))
    } else {
        // 未定义角色限制的路由默认所有角色可见
        return true
    }
}

// 递归过滤路由
export function filterAsyncRoutes(routes, roles) {
    const res = []

    routes.forEach(route => {
        const tmp = { ...route }
        if (hasPermission(roles, tmp)) {
            if (tmp.children) {
                tmp.children = filterAsyncRoutes(tmp.children, roles)
            }
            res.push(tmp)
        }
    })

    return res
}

export const usePermissionStore = defineStore('permission', () => {
    const routes = ref(constantRoutes)
    const addRoutes = ref([])
    const hasAddedRoutes = ref(false) // 移入状态模块

    const setHasAddedRoutes = (status) => {
        hasAddedRoutes.value = status
    }

    const generateRoutes = (roles, asyncRoutes) => {
        return new Promise(resolve => {
            let accessedRoutes
            if (roles.includes('admin')) {
                // 管理员拥有所有权限
                accessedRoutes = asyncRoutes || []
            } else {
                accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
            }

            addRoutes.value = accessedRoutes
            // 最终的路由表 = 常量路由 + 动态路由
            routes.value = constantRoutes.concat(accessedRoutes)
            resolve(accessedRoutes)
        })
    }

    return {
        routes,
        addRoutes,
        hasAddedRoutes,
        setHasAddedRoutes,
        generateRoutes
    }
})
