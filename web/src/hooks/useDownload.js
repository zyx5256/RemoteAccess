import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { downloadFile } from '../api/file'
import { buildApiUrl } from '../utils/urlHelper'

export function useDownload(sshConfig) {
  const downloadFiles = ref([])
  const isDownloading = ref(false)

  const addDownloadTask = (file) => {
    const task = {
      id: Date.now() + Math.random(),
      name: file.name,
      path: file.path,
      size: file.size,
      status: 'pending',
      progress: 0,
    }
    downloadFiles.value.push(task)
    return task
  }

  const updateTaskProgress = (taskId, progress) => {
    const task = downloadFiles.value.find(t => t.id === taskId)
    if (task) {
      task.progress = progress
    }
  }

  const updateTaskStatus = (taskId, status) => {
    const task = downloadFiles.value.find(t => t.id === taskId)
    if (task) {
      task.status = status
      if (status === 'success') {
        task.progress = 100
      }
    }
  }

  const handleDownload = async (file) => {
    const task = addDownloadTask(file)
    task.status = 'downloading'
    isDownloading.value = true

    try {
      const response = await fetch(buildApiUrl(sshConfig.host, '') + '/download/' + encodeURIComponent(file.path))
      if (!response.ok) throw new Error('下载失败')

      // 获取总大小
      const total = Number(response.headers.get('content-length')) || file.size || 0
      let loaded = 0
      const reader = response.body.getReader()
      const chunks = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        loaded += value.length
        // 实时更新进度
        task.progress = total ? Math.floor((loaded / total) * 100) : 0
        task.size = total
      }

      const blob = new Blob(chunks)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      task.status = 'success'
      task.progress = 100
      task.size = blob.size
      ElMessage.success(`文件 ${file.name} 下载成功`)
    } catch (error) {
      task.status = 'error'
      task.progress = 0
      ElMessage.error(error.message || '下载失败')
    } finally {
      isDownloading.value = false
    }
  }

  const handleBatchDownload = async (files) => {
    if (files.length === 0) {
      ElMessage.warning('请选择要下载的文件')
      return
    }

    for (const file of files) {
      await handleDownload(file)
    }
  }

  return {
    downloadFiles,
    isDownloading,
    handleDownload,
    handleBatchDownload
  }
} 