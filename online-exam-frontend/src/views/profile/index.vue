<template>
  <div class="app-container">
    <el-card shadow="never" class="profile-card">
      <div class="profile-header">
        <span class="title">个人信息</span>
      </div>

      <div class="profile-content">
        <div class="info-section">
          <div class="info-item">
            <span class="label">用户名:</span>
            <span class="value">{{ user.username || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">真实姓名:</span>
            <span class="value">{{ user.realName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">角色:</span>
            <span class="value">{{ roleNames || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">班级:</span>
            <span class="value">{{ user.className || '暂未分配班级' }}</span>
          </div>
          <div class="info-item">
            <span class="label">最近登录:</span>
            <span class="value">{{ user.lastLoginTime || '-' }}</span>
          </div>
        </div>

        <div class="avatar-section">
          <div class="avatar-wrapper">
             <img :src="user.avatar" class="user-avatar" />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const roleLabelMap = {
  admin: '管理员',
  teacher: '教师',
  student: '学生'
}

const user = computed(() => userStore.userInfo || {})
const roleNames = computed(() => {
  const roles = user.value.roles || []
  return roles.map(item => roleLabelMap[item] || item).join(' / ')
})

onMounted(async () => {
  if (!userStore.userInfo?.username) {
    await userStore.getInfo()
  }
})
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;

  .profile-card {
    min-height: 500px;
    padding: 20px 40px;

    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 60px;

      .title {
        font-size: 18px;
        color: #333;
      }
    }

    .profile-content {
      display: flex;

      .info-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 40px;
        padding-right: 50px;
        border-right: 1px solid #e6e6e6;
        padding-left: 50px;

        .info-item {
          display: flex;
          align-items: center;
          font-size: 14px;

          .label {
            width: 100px;
            color: #333;
            text-align: right;
            margin-right: 40px;
          }

          .value {
            color: #666;
          }
        }
      }

      .avatar-section {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding-top: 20px;

        .avatar-wrapper {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid #f0f0f0;

          .user-avatar {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }
}
</style>
