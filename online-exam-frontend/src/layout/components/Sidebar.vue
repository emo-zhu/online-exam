<template>
  <div class="sidebar-container" :class="{ 'is-collapsed': !appStore.sidebar.opened }">
    <div class="logo">
      <img src="" alt="Logo" v-if="false" />
      <span v-if="appStore.sidebar.opened" class="title">基于Vue3 + Node.js 的<br>在线考试系统</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      :collapse="!appStore.sidebar.opened"
      router
    >
      <template v-for="route in permissionStore.routes">
        <!-- 忽略 hidden 路由 -->
        <template v-if="!route.hidden">
           <!-- 情况1: 只有一个子路由，且该子路由无子路由 -> 渲染该子路由 -->
           <el-menu-item
              v-if="!route.alwaysShow && hasOneShowingChild(route.children, route) && (route.children && route.children.length > 0 && (!route.children[0].children || route.children[0].children.length === 0))"
              :key="`single-${route.path}`"
              :index="resolvePath(route.children[0].path, route.path)"
           >
              <el-icon v-if="route.children[0].meta && route.children[0].meta.icon">
                  <component :is="route.children[0].meta.icon" />
              </el-icon>
              <template #title>{{ route.children[0].meta.title }}</template>
           </el-menu-item>

           <!-- 情况2: 没有子路由 (例如 'Certificate' 这种可能没有 children 的情况) -> 渲染路由本身 -->
            <el-menu-item
              v-else-if="!route.children || route.children.length === 0"
              :key="`root-${route.path}`"
              :index="route.path"
            >
              <el-icon v-if="route.meta && route.meta.icon">
                  <component :is="route.meta.icon" />
              </el-icon>
              <template #title>{{ route.meta.title }}</template>
            </el-menu-item>

           <!-- 情况3: 有多个子路由，显示为 SubMenu -->
           <el-sub-menu v-else :key="`group-${route.path}`" :index="route.path">
               <template #title>
                   <el-icon v-if="route.meta && route.meta.icon">
                       <component :is="route.meta.icon" />
                   </el-icon>
                   <span v-else-if="route.children && route.children[0].meta && route.children[0].meta.icon">
                        <!-- Fallback icon -->
                       <component :is="route.children[0].meta.icon" />
                   </span>
                   <span>{{ route.meta?.title || route.children[0]?.meta?.title }}</span>
               </template>

               <template v-for="child in route.children">
                   <el-menu-item v-if="!child.hidden" :key="child.path" :index="resolvePath(child.path, route.path)">
                       {{ child.meta?.title }}
                   </el-menu-item>
               </template>
           </el-sub-menu>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'


const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const activeMenu = computed(() => {
  return route.path
})

const hasOneShowingChild = (children = [], parent) => {
  const showingChildren = children.filter(item => {
    if (item.hidden) {
      return false
    } else {
      return true
    }
  })

  // 如果只有一个子路由需要显示，就直接渲染这个子路由（作为根菜单）
  // 但要注意首页这类通常只有一个子路由的情况
  if (showingChildren.length === 1) {
    return true
  }

  if (showingChildren.length === 0) {
    return true
  }

  return false
}

const resolvePath = (routePath, basePath) => {
   // 简单的路径拼接
   if (routePath.startsWith('/')) {
       return routePath
   }
   if (basePath === '/') {
       return '/' + routePath
   }
   return basePath + '/' + routePath
}
</script>

<style scoped lang="scss">
.sidebar-container {
  height: 100%;
  background-color: #304156;
  transition: width 0.3s;
  width: 210px;
  overflow-x: hidden;
  
  &.is-collapsed {
    width: 64px;
    
    .logo span {
      display: none;
    }
  }

  .logo {
    height: 60px; // 略微增加高度
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    background-color: #2b3649;
    padding: 0 10px; // 增加内边距
    
    .title {
        font-size: 14px; // 缩小字号
        line-height: 1.4;
        text-align: center;
        width: 100%;
        word-break: break-word; // 允许换行
    }
  }
  
  :deep(.el-menu) {
    border-right: none;
  }
}
</style>
