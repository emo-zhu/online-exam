<template>
  <div class="count-down">
    <el-icon class="timer-icon"><Timer /></el-icon>
    <span>{{ showTime }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Timer } from '@element-plus/icons-vue'

const props = defineProps({
  target: {
    type: [Date, Number, String],
    required: true
  }
})

const emit = defineEmits(['end'])

const timeLeft = ref(0)
let timer = null

const formatTime = (time) => {
  if (time <= 0) return '00:00:00'
  
  const hours = Math.floor(time / (1000 * 60 * 60))
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((time % (1000 * 60)) / 1000)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const showTime = computed(() => formatTime(timeLeft.value))

const tick = () => {
  const targetTime = new Date(props.target).getTime()
  const now = new Date().getTime()
  const diff = targetTime - now
  
  if (diff <= 0) {
    timeLeft.value = 0
    emit('end')
    clearInterval(timer)
  } else {
    timeLeft.value = diff
  }
}

watch(() => props.target, () => {
    tick()
    clearInterval(timer)
    timer = setInterval(tick, 1000)
})

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped lang="scss">
.count-down {
  display: inline-flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #F56C6C;
  
  .timer-icon {
      margin-right: 5px;
      font-size: 18px;
  }
}
</style>
