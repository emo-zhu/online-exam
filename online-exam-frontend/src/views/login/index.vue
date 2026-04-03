<template>
  <div class="login-container">
    <div class="login-content-wrapper">
        <div class="login-box">
            <div class="title-container">
                <el-icon class="logo-icon"><Monitor /></el-icon>
                <h2 class="title">在线考试系统</h2>
            </div>
          <div v-if="!isRegister">
              <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
                <el-form-item prop="username">
                  <el-input
                    v-model="loginForm.username"
                    placeholder="请输入用户名"
                    :prefix-icon="User"
                  />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="请输入密码"
                    :prefix-icon="Lock"
                    show-password
                    @keyup.enter="handleLogin"
                  />
                </el-form-item>
                <el-form-item prop="code">
                  <div style="display: flex; width: 100%; gap: 10px;">
                    <el-input
                      v-model="loginForm.code"
                      placeholder="验证码"
                      :prefix-icon="Key"
                      @keyup.enter="handleLogin"
                    />
                    <div class="captcha-box" @click="fetchCaptcha">
                      <span style="font-weight: bold; font-style: italic; letter-spacing: 5px; color: #409EFF;">{{ captchaCode || '----' }}</span>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">
                    登录
                  </el-button>
                </el-form-item>
                <div class="footer-links">
                    没有账号？<el-link type="primary" @click="toggleMode">立即注册</el-link>
                </div>
              </el-form>
          </div>

          <div v-else>
               <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef">
                <el-form-item prop="username">
                  <el-input
                    v-model="registerForm.username"
                    placeholder="请输入用户名"
                    :prefix-icon="User"
                  />
                </el-form-item>
                 <el-form-item prop="role">
                   <el-select
                     v-model="registerForm.role"
                     placeholder="请选择角色"
                     style="width: 100%"
                     popper-class="dark-select-dropdown"
                   >
                       <el-option label="学生" value="student" />
                       <el-option label="教师" value="teacher" />
                   </el-select>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="registerForm.password"
                    type="password"
                    placeholder="设置密码"
                    :prefix-icon="Lock"
                    show-password
                  />
                </el-form-item>
                 <el-form-item prop="confirmPassword">
                  <el-input
                    v-model="registerForm.confirmPassword"
                    type="password"
                    placeholder="确认密码"
                    :prefix-icon="Lock"
                    show-password
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="success" class="login-btn" @click="handleRegister" :loading="loading">
                    注册
                  </el-button>
                </el-form-item>
                <div class="footer-links">
                    已有账号？<el-link type="primary" @click="toggleMode">立即登录</el-link>
                </div>
              </el-form>
          </div>
        </div>

        <div class="account-tips">
            <h3 class="tips-title">演示账号</h3>
            <p class="tips-desc">如需快速体验系统，可使用以下内置账号登录。</p>
            <div class="tips-item">
                <div class="role-badge admin">管理员</div>
                <div class="account-info">
                    <p>账号：<span>admin</span></p>
                    <p>密码：<span>123456</span></p>
                </div>
            </div>
            <div class="tips-item">
                <div class="role-badge teacher">教 师</div>
                <div class="account-info">
                    <p>账号：<span>teacher</span></p>
                    <p>密码：<span>123456</span></p>
                </div>
            </div>
             <div class="tips-item">
                <div class="role-badge student">学 生</div>
                <div class="account-info">
                    <p>账号：<span>student</span></p>
                    <p>密码：<span>123456</span></p>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from '@/utils/element-plus'
import { getCaptcha, register as registerApi } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isRegister = ref(false)
const captchaCode = ref('')

const loginFormRef = ref()
const loginForm = reactive({
  username: '',
  password: '',
  code: '',
  captchaToken: ''
})

const registerFormRef = ref()
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: 'student'
})

const loading = ref(false)

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    {
        required: true,
        message: '请确认密码',
        trigger: 'blur'
    },
    {
        validator: (rule, value, callback) => {
            if (value !== registerForm.password) {
                callback(new Error('两次输入密码不一致'))
            } else {
                callback()
            }
        },
        trigger: 'blur'
    }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const fetchCaptcha = async () => {
    try {
        const { data } = await getCaptcha()
        captchaCode.value = data.code
        loginForm.captchaToken = data.captchaToken || ''
        loginForm.code = ''
    } catch (error) {
        captchaCode.value = ''
        loginForm.captchaToken = ''
        loginForm.code = ''
    }
}

const toggleMode = () => {
    isRegister.value = !isRegister.value
    if (loginFormRef.value) loginFormRef.value.resetFields()
    if (registerFormRef.value) registerFormRef.value.resetFields()
    if (!isRegister.value) {
        fetchCaptcha()
    }
}

const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await userStore.login(loginForm)
      ElMessage.success('登录成功')
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } catch (error) {
      await fetchCaptcha()
    } finally {
      loading.value = false
    }
  })
}

const handleRegister = () => {
    registerFormRef.value.validate(async (valid) => {
        if (!valid) return

        loading.value = true
        try {
            await registerApi({
                username: registerForm.username,
                password: registerForm.password,
                role: registerForm.role
            })
            ElMessage.success('注册成功，请登录')
            isRegister.value = false
            loginForm.username = registerForm.username
            loginForm.password = registerForm.password
            loginForm.code = ''
            await fetchCaptcha()
        } finally {
            loading.value = false
        }
    })
}

onMounted(() => {
    fetchCaptcha()
})
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2d3a4b; 
  background-image: radial-gradient(circle at center, #37485c 0%, #2d3a4b 100%);
  overflow: hidden; // 移除滚动条

  .login-box {
    width: 520px;
    padding: 30px;
    border-radius: 10px;
    
    // 通过覆盖组件变量强制调整颜色
    --el-input-bg-color: #283443;
    --el-fill-color-blank: #283443;
    --el-input-text-color: #ffffff;
    --el-text-color-regular: #ffffff;
    --el-input-border-color: rgba(255, 255, 255, 0.1);
    --el-input-hover-border-color: rgba(255, 255, 255, 0.3);
    --el-input-focus-border-color: #409eff;
    --el-mask-color: rgba(0, 0, 0, 0.8);

    .title-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 30px;
        
        .logo-icon {
            font-size: 48px;
            color: #409eff;
            margin-bottom: 10px;
            animation: float 3s ease-in-out infinite;
        }

        .title {
            margin: 0;
            color: #fff;
            font-weight: 700;
            font-size: 24px;
            letter-spacing: 2px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
    }
    
    .login-btn {
      width: 100%;
      height: 46px;
      font-size: 16px;
      margin-top: 10px;
      border-radius: 4px;
      background: linear-gradient(90deg, #3a8ee6, #005c97);
      border: none;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      
      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 6px 8px rgba(0,0,0,0.3);
      }
    }

    // 表单项样式覆盖
    :deep(.el-form-item) {
        margin-bottom: 25px;
    }
    
    // 输入框样式深度覆盖 - 仅处理布局和特殊阴影，颜色交给变量
    :deep(.el-input__wrapper), :deep(.el-select .el-input__wrapper) {
        box-shadow: none !important; // 移除默认阴影
        border: 1px solid rgba(255, 255, 255, 0.1); // 回退到之前的固定颜色
        padding-left: 15px;
        height: 46px; 
        
        input {
            &::placeholder {
                color: #5d6776;
            }
        }
        
        .el-input__prefix-inner {
            color: #889aa4;
            font-size: 18px;
        }
    }

    // 聚焦时的样式
    :deep(.el-input__wrapper.is-focus) {
         border-color: #409eff;
         box-shadow: 0 0 0 1px #409eff !important;
         
         .el-input__prefix-inner {
             color: #409eff;
         }
    }
    
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
    }
    
    // 自动填充背景处理
    :deep(input:-webkit-autofill) {
         -webkit-box-shadow: 0 0 0 1000px #283443 inset !important;
         -webkit-text-fill-color: #fff !important;
    }

    .footer-links {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 25px;
        color: #ddd; // 浅灰色文字，在深色背景下更清晰
        font-size: 14px;
        letter-spacing: 1px;
        
        .el-link {
            font-size: 15px;
            font-weight: 600;
            margin-left: 8px;
            color: #409eff;
            transition: all 0.3s;
            // 确保链接自身也垂直居中
            display: inline-flex;
            align-items: center;
            vertical-align: middle; // 兼容性兜底
            
            &:hover {
                color: #79bbff;
                transform: scale(1.05);
            }
        }
    }
    
    .captcha-box {
        background: #fff;
        width: 120px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        height: 46px; // 强制高度匹配
    }
  }

  // 右侧说明区域样式
  .account-tips {
      width: 300px;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(5px);
      border-radius: 10px;
      padding: 30px 20px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      
      // 关键修改：绝对定位到右侧
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%); // 垂直居中
      margin-left: 40px; // 间距
      
      .tips-title {
          color: #fff;
          margin-top: 0;
          margin-bottom: 12px;
          text-align: center;
          font-size: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 15px;
      }

      .tips-desc {
          margin: 0 0 20px;
          color: #cfd6df;
          font-size: 13px;
          line-height: 1.6;
          text-align: center;
      }
      
      .tips-item {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          background: rgba(255,255,255,0.03);
          padding: 15px;
          border-radius: 8px;
          transition: transform 0.3s;
          
          &:hover {
              transform: translateX(5px);
              background: rgba(255,255,255,0.05);
          }
          
          .role-badge {
              padding: 5px 10px;
              border-radius: 4px;
              color: #fff;
              font-size: 12px;
              font-weight: bold;
              margin-right: 15px;
              min-width: 60px;
              text-align: center;
              
              &.admin { background-color: #f56c6c; }
              &.teacher { background-color: #e6a23c; }
              &.student { background-color: #67c23a; }
          }
          
          .account-info {
              p {
                  margin: 2px 0;
                  color: #ccc;
                  font-size: 13px;
                  
                  span {
                      color: #fff;
                      font-weight: bold;
                      margin-left: 5px;
                      font-family: monospace;
                  }
              }
          }
      }
  }

  // 响应式处理
  @media (max-width: 1000px) {
      .login-content-wrapper {
          width: auto !important; // 宽度自适应
          display: flex;
          flex-direction: column;
          align-items: center;
      }

      .account-tips {
          position: static; // 取消绝对定位
          transform: none;
          margin-left: 0;
          margin-top: 30px;
          width: 520px; // 与登录框同宽
      }
  }
}

.login-content-wrapper {
    position: relative; // 作为定位基准
    width: 520px; // 锁定宽度，确保居中是以此为基准
}
</style>

<style lang="scss">
/* 全局覆盖下拉框样式 - 使用变量覆盖法 */
.dark-select-dropdown {
    // 下拉框整体背景
    --el-bg-color-overlay: #2d3a4b;
    // 边框颜色
    --el-border-color-light: rgba(255, 255, 255, 0.1);
    // 悬停背景色
    --el-fill-color-light: #3d4e63;
    // 选中项文字颜色
    --el-color-primary: #409eff;
    // 普通文字颜色
    --el-text-color-regular: #ffffff;
    
    // 强制背景和边框
    background-color: var(--el-bg-color-overlay) !important;
    border: 1px solid var(--el-border-color-light) !important;
    
    .el-select-dropdown__item {
        color: var(--el-text-color-regular);
    }
    
    // 选中状态
    .el-select-dropdown__item.selected {
        color: var(--el-color-primary);
        font-weight: bold;
        background-color: rgba(64, 158, 255, 0.1); // 保持选中背景淡蓝
    }
    
    // 箭头颜色修正
    .el-popper__arrow::before {
        background-color: var(--el-bg-color-overlay) !important;
        border: 1px solid var(--el-border-color-light) !important;
    }
}
</style>
