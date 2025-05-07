<template>
  <div class="ssh-login-bg">
    <div class="ssh-login-card">
      <div class="ssh-login-logo">
        <VueIcon style="width: 48px; height: 48px" />
      </div>
      <h2 class="ssh-login-title">进入云空间</h2>
      <el-form :model="form" label-width="0" :disabled="isConnecting" class="ssh-login-form">
        <el-form-item>
          <el-input v-model="form.host" placeholder="IP address" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.username" placeholder="Username" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Password"
            show-password
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="isConnecting"
            :disabled="isConnecting"
            @click="handleConnect"
            >登陆</el-button
          >
        </el-form-item>
      </el-form>
      <div v-if="isConnecting" class="connecting-box">
        <el-icon class="loading-icon"><i class="el-icon-loading"></i></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { buildApiUrl } from '../utils/urlHelper'
import VueIcon from './icons/VueIcon.vue'

const emit = defineEmits(['connected'])

const dialogVisible = ref(true)
const form = reactive({
  host: '',
  username: '',
  password: '',
})
const isConnecting = ref(false)

const handleConnect = async () => {
  if (!form.host || !form.username || !form.password) {
    ElMessage.warning('请填写完整的连接信息')
    return
  }
  isConnecting.value = true
  try {
    // 发送连接请求到后端
    const response = await fetch(buildApiUrl(form.host, '/ssh/connect'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '连接失败')
    }

    const data = await response.json()
    if (data.success) {
      dialogVisible.value = false
      emit('connected', { ...form }, data.currentPath)
    } else {
      throw new Error(data.message || '连接失败')
    }
  } catch (error) {
    console.error('Connection error:', error)
    ElMessage.error(error.message || '连接失败')
  } finally {
    isConnecting.value = false
  }
}
</script>

<style scoped>
.ssh-login-bg {
  min-height: 100vh;
  width: 100vw;
  background: #f6f8fa;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8vh;
}
.ssh-login-card {
  background: #fff;
  border: 1px solid #d8dee4;
  border-radius: 8px;
  box-shadow: 0 4px 32px rgba(149, 157, 165, 0.15);
  padding: 32px 32px 18px 32px;
  width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ssh-login-logo {
  margin-bottom: 16px;
  color: #24292f;
}
.ssh-login-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #24292f;
  text-align: center;
}
.ssh-login-form {
  width: 100%;
}
.connecting-box {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0 0 0;
  gap: 8px;
}
.loading-icon {
  font-size: 22px;
  color: #409eff;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
