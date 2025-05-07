import { ElMessage, ElMessageBox } from 'element-plus'
import { downloadFile, deleteFile, createDir } from '../api/file.js'
import { buildApiUrl } from '../utils/urlHelper'

export function useFileActions(sshConfig, selectedFiles, navigateTo, currentPath) {
  // 批量下载
  const handleBatchDownload = async () => {
    const filesToDownload = selectedFiles.value.filter((file) => !file.isDirectory)
    if (filesToDownload.length === 0) {
      ElMessage.warning('请选择要下载的文件')
      return
    }
    for (const file of filesToDownload) {
      try {
        const blob = await downloadFile(buildApiUrl(sshConfig.host, ''), file.path)
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        ElMessage.error(error.message)
      }
    }
  }

  // 批量删除（支持文件和目录）
  const handleBatchDelete = async () => {
    const filesToDelete = selectedFiles.value
    if (filesToDelete.length === 0) {
      ElMessage.warning('请选择要删除的文件或文件夹')
      return
    }
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${filesToDelete.length} 个文件/文件夹吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'custom-message-box',
          buttonSize: 'default',
          confirmButtonClass: 'el-button--primary custom-confirm-button',
          cancelButtonClass: 'el-button--default custom-cancel-button',
        },
      )
      for (const file of filesToDelete) {
        await deleteFile(buildApiUrl(sshConfig.host, ''), file.path)
      }
      ElMessage.success('删除成功')
      navigateTo(currentPath.value)
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
      }
    }
  }

  // 新建目录
  const handleCreateDir = async () => {
    try {
      const { value } = await ElMessageBox.prompt('请输入新目录名称', '新建目录', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.+$/, // 非空
        inputErrorMessage: '目录名不能为空',
        customClass: 'custom-message-box',
        buttonSize: 'default',
        confirmButtonClass: 'el-button--primary custom-confirm-button',
        cancelButtonClass: 'el-button--default custom-cancel-button',
      })
      await createDir(buildApiUrl(sshConfig.host, ''), currentPath.value, value)
      ElMessage.success('目录创建成功')
      await navigateTo(currentPath.value)
    } catch (e) {
      if (e !== 'cancel') ElMessage.error(e.message || '目录创建失败')
    }
  }

  return {
    handleBatchDownload,
    handleBatchDelete,
    handleCreateDir,
  }
}
