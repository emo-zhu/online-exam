<template>
  <div class="app-container">
    <el-card shadow="never" class="password-card">
      <template #header>
        <span class="card-title">修改密码</span>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="width: 400px; margin-top: 20px;"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="form.oldPassword" type="password" show-password placeholder="请输入旧密码" />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="form.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from '@/utils/element-plus'
import { changePassword } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const formRef = ref(null)
const userStore = useUserStore()

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请再次输入新密码', trigger: 'blur' }, { validator: validateConfirmPassword, trigger: 'blur' }]
}

const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    await changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })
    ElMessage.success('密码修改成功，请重新登录')
    resetForm()
    await userStore.logout()
  } catch (error) {
    if (error?.message?.includes('两次输入密码不一致')) {
      return
    }
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.password-card {
  min-height: 500px;
}
.card-title {
  font-size: 16px;
  font-weight: bold;
}
</style>
