import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getToken, getRefreshToken, setToken, setRefreshToken, clearAuthStorage } from '@/utils/auth'
import { resetRouterV4, constantRoutes } from '@/router/index'
import { usePermissionStore } from './permission'
import { useTagsViewStore } from './tagsView'
import { getCurrentUser, login as loginApi, logout as logoutApi } from '@/api/auth'

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const normalizeUserInfo = (user = {}) => ({
    ...user,
    name: user.realName || user.username || '用户',
    avatar: user.avatar || defaultAvatar,
    roles: user.roles || []
})

export const useUserStore = defineStore('user', () => {
    const token = ref(getToken())
    const refreshToken = ref(getRefreshToken())
    const userInfo = ref({})
    const roles = ref([])

    const setAuthData = ({ token: nextToken = '', refreshToken: nextRefreshToken = '' } = {}) => {
        token.value = nextToken || ''
        refreshToken.value = nextRefreshToken || refreshToken.value || ''

        if (nextToken) {
            setToken(nextToken)
        }
        if (nextRefreshToken) {
            setRefreshToken(nextRefreshToken)
        }
    }

    const clearUserState = () => {
        token.value = ''
        refreshToken.value = ''
        roles.value = []
        userInfo.value = {}
        clearAuthStorage()

        const permissionStore = usePermissionStore()
        permissionStore.setHasAddedRoutes(false)

        const tagsViewStore = useTagsViewStore()
        tagsViewStore.delAllViews()

        try {
            resetRouterV4()
        } catch (e) {
            console.error('Reset router failed', e)
        }

        permissionStore.routes = constantRoutes
        permissionStore.addRoutes = []
    }

    const login = async (loginForm) => {
        const { data } = await loginApi(loginForm)
        setAuthData({ token: data.token, refreshToken: data.refreshToken || '' })

        const nextUserInfo = normalizeUserInfo(data.userInfo)
        userInfo.value = nextUserInfo
        roles.value = nextUserInfo.roles

        return nextUserInfo
    }

    const logout = async () => {
        try {
            if (token.value) {
                await logoutApi(refreshToken.value ? { refreshToken: refreshToken.value } : {})
            }
        } catch (error) {
            console.error('Logout request failed', error)
        } finally {
            clearUserState()
        }
    }

    const getInfo = async () => {
        const { data } = await getCurrentUser()
        const nextUserInfo = normalizeUserInfo(data)
        userInfo.value = nextUserInfo
        roles.value = nextUserInfo.roles
        return nextUserInfo
    }

    return {
        token,
        refreshToken,
        roles,
        userInfo,
        setAuthData,
        clearUserState,
        login,
        getInfo,
        logout
    }
}, {
    persist: true
})
