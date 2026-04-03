<template>
  <div class="exam-layout">
    <router-view />
  </div>
</template>

<script setup>
// 考试专用布局，通常是全屏、无侧边栏
</script>

<style scoped>
.exam-layout {
  height: 100vh;
  width: 100vw;
  background-color: #f5f7fa;
}
</style>
