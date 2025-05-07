import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { buildApiUrl } from '../utils/urlHelper'
import { useSSH } from './useSSH'
const { setDisconnected } = useSSH()

export function useUpload(sshConfig, currentPath, navigateTo, setLastUploadedFile) {
  const uploadRef = ref(null)
  const uploadVisible = ref(true)

  // 计算上传地址
  const uploadAction = computed(() => {
    const path = currentPath.value || '/Users/zyx'
    return buildApiUrl(sshConfig.host, `/upload?path=${encodeURIComponent(path)}`)
  })

  // 上传前检查
  const beforeUpload = (file) => {
    return true
  }

  // 处理上传进度
  const handleProgress = (event, file) => {
    if (!file || !file.name) return
    // 移除 ElMessage 弹窗
    // if (event.percent < 100) {
    //   ElMessage({
    //     message: `${file.name} 上传中: ${Math.round(event.percent)}%`,
    //     type: 'info',
    //     duration: 1000,
    //   })
    // }
  }

  // 处理上传成功
  const handleUploadSuccess = async (response, file, fileList) => {
    try {
      if (typeof response === 'string') {
        response = JSON.parse(response)
      }
      if (response && response.success) {
        ElMessage.success(response.message || `文件 ${file.name} 上传成功`)
        const uploadedName = response.filename || file.name
        if (setLastUploadedFile) setLastUploadedFile(uploadedName)
        await navigateTo(currentPath.value)
      } else {
        ElMessage.error((response && response.message) || '上传失败')
      }
    } catch (error) {
      ElMessage.error('刷新文件列表失败')
    }
  }

  // 处理上传错误
  const handleUploadError = (error, file, fileList) => {
    let msg = `上传失败：${error.status} ${error.statusText || ''}`
    if (
      error &&
      (error.status === 0 ||
        error.status === 502 ||
        error.status === 503 ||
        error.status === 504 ||
        (error.message && error.message.includes('Failed to fetch')))
    ) {
      setDisconnected && setDisconnected()
    } else if (!error || !error.status) {
      msg = `上传失败`
    }
    ElMessage.error(msg)
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
    uploadVisible.value = true
  }

  return {
    uploadRef,
    uploadVisible,
    uploadAction,
    beforeUpload,
    handleProgress,
    handleUploadSuccess,
    handleUploadError,
  }
}
