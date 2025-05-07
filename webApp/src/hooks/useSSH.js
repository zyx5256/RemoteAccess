import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { buildApiUrl } from '../utils/urlHelper'

// 全局唯一实例
const isConnected = ref(false)

// 监听 isConnected 变化加日志
watch(isConnected, (val) => {
  console.log('[useSSH] isConnected changed:', val)
})

const sshConfig = reactive({ host: '', username: '', password: '' })

export function useSSH() {
  // 处理SSH连接成功
  const handleSSHConnected = async (config, initialPath, setCurrentPath, navigateTo) => {
    try {
      const response = await fetch(buildApiUrl(config.host, '/ssh/connect'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: config.host,
          username: config.username,
          password: config.password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '连接失败')
      }

      Object.assign(sshConfig, config)
      isConnected.value = true
      if (setCurrentPath) setCurrentPath(initialPath || '/Users/zyx')
      if (navigateTo) navigateTo(initialPath || '/Users/zyx')
      ElMessage.success('连接成功')
    } catch (error) {
      ElMessage.error('重连失败')
      isConnected.value = false
    }
  }

  // 处理断开连接
  const handleDisconnect = async () => {
    try {
      const response = await fetch(buildApiUrl(sshConfig.host, '/ssh/disconnect'), {
        method: 'POST',
      })
      if (!response.ok) throw new Error((await response.json()).message || '断开连接失败')
      isConnected.value = false
      sshConfig.host = ''
      sshConfig.username = ''
      sshConfig.password = ''
      ElMessage.success('已断开连接')
    } catch (error) {
      ElMessage.error(error.message || '断开连接失败')
    }
  }

  function setDisconnected() {
    isConnected.value = false
    console.log('[useSSH] setDisconnected called, isConnected =', isConnected.value)
  }

  return {
    isConnected,
    sshConfig,
    handleSSHConnected,
    handleDisconnect,
    setDisconnected,
  }
}
