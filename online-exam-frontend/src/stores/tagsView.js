import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTagsViewStore = defineStore('tagsView', () => {
    const visitedViews = ref([])

    const getViewTitle = (view) => view?.meta?.title || ''

    const addView = (view) => {
        const title = getViewTitle(view)
        if (!title || visitedViews.value.some(v => v.path === view.path)) return

        // 如有需要，可在这里限制标题长度，或直接使用路由标题
        visitedViews.value.push(Object.assign({}, view, {
            title
        }))
    }

    const delView = (view) => {
        return new Promise(resolve => {
            const i = visitedViews.value.findIndex(v => v.path === view.path)
            if (i > -1) {
                visitedViews.value.splice(i, 1)
            }
            resolve([...visitedViews.value])
        })
    }

    const delOthersViews = (view) => {
        return new Promise(resolve => {
            visitedViews.value = visitedViews.value.filter(v => {
                return v.meta.affix || v.path === view.path
            })
            resolve([...visitedViews.value])
        })
    }

    const delAllViews = () => {
        return new Promise(resolve => {
            visitedViews.value = visitedViews.value.filter(tag => tag.meta.affix)
            resolve([...visitedViews.value])
        })
    }

    const pruneViewsWithoutTitle = () => {
        visitedViews.value = visitedViews.value.filter(view => getViewTitle(view))
    }

    // 保持固定标签（如首页）
    const addFixedView = (view) => {
        const title = getViewTitle(view)
        if (!title || visitedViews.value.some(v => v.path === view.path)) return
        visitedViews.value.unshift(Object.assign({}, view, {
            title
        }))
    }

    return {
        visitedViews,
        addView,
        delView,
        addFixedView,
        delOthersViews,
        delAllViews,
        pruneViewsWithoutTitle
    }
}, {
    persist: false // 标签栏通常不需要持久化，可按需开启
})
