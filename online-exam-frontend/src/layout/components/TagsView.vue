<template>
  <div class="tags-view-container">
    <div class="tags-view-wrapper">
      <router-link
        v-for="tag in tagsViewStore.visitedViews"
        :key="tag.path"
        :to="{ path: tag.path, query: tag.query }"
        class="tags-view-item"
        :class="isActive(tag) ? 'active' : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.title }}
        <span 
            v-if="!isAffix(tag)"
            class="close-icon"
            @click.prevent.stop="closeSelectedTag(tag)"
        >
            <el-icon><Close /></el-icon>
        </span>
      </router-link>
    </div>
    
    <!-- 右键菜单 -->
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">刷新页面</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">关闭当前</li>
      <li @click="closeOthersTags">关闭其他</li>
      <li @click="closeAllTags">关闭所有</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/stores/tagsView'
import { Close } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref({})

const isActive = (tag) => {
  return tag.path === route.path
}

const isAffix = (tag) => {
  return tag.meta && tag.meta.affix
}

const addTags = () => {
  const { name, meta } = route
  tagsViewStore.pruneViewsWithoutTitle()
  if (name && meta?.title) {
    tagsViewStore.addView(route)
  }
}

const refreshSelectedTag = (view) => {
  const { fullPath } = view
  nextTick(() => {
    router.replace({
      path: '/redirect' + fullPath
    }).catch(() => {
      // 如果没有中转页面，直接刷新当前页
      router.go(0)
    })
  })
}

const closeSelectedTag = (view) => {
  tagsViewStore.delView(view).then((visitedViews) => {
    if (isActive(view)) {
      toLastView(visitedViews, view)
    }
  })
}

const closeOthersTags = () => {
  tagsViewStore.delOthersViews(selectedTag.value).then(() => {
    if (!isActive(selectedTag.value)) {
        router.push(selectedTag.value)
    }
  })
}

const closeAllTags = () => {
  tagsViewStore.delAllViews().then((visitedViews) => {
    if (visitedViews.some(tag => tag.path === route.path)) {
      return
    }
    toLastView(visitedViews, route)
  })
}

const toLastView = (visitedViews, view) => {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.path)
  } else {
    // 默认回首页
    router.push('/')
  }
}

const openMenu = (tag, e) => {
  left.value = e.clientX
  top.value = e.clientY
  visible.value = true
  selectedTag.value = tag
}

const closeMenu = () => {
  visible.value = false
}

watch(route, () => {
  addTags()
})

watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})

onMounted(() => {
  addTags()
})
</script>

<style scoped lang="scss">
.tags-view-container {
  height: 45px; // 加大容器高度
  width: 100%;
  overflow: hidden;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  
  .tags-view-wrapper {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0 15px;
    box-sizing: border-box;
    scrollbar-width: thin;

    .tags-view-item {
      display: inline-flex;
      align-items: center;
      flex: 0 0 auto;
      white-space: nowrap;
      position: relative;
      cursor: pointer;
      height: 32px; // 加大标签高度
      line-height: 32px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 15px; // 加大内部间距
      font-size: 12px;
      margin-right: 5px; // 加大标签间距
      text-decoration: none;
      border-radius: 3px;
      
      &:hover {
        background-color: #f2f2f2;
      }

      &.active {
        background-color: #42b983; 
        color: #fff;
        border-color: #42b983;
      }
      
      .close-icon {
          margin-left: 5px;
          border-radius: 50%;
          padding: 1px;
          display: flex;
          align-items: center;
          transition: all .3s;
          
          &:hover {
              background-color: #b4bccc;
              color: #fff;
          }
          
          :deep(.el-icon) {
            font-size: 10px;
          }
      }
    }
  }

  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: fixed; // 使用固定定位，避免受父容器裁剪影响
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
    
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>
