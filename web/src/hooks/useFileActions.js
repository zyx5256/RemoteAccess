import { ElMessage, ElMessageBox } from 'element-plus'
import { downloadFile, zipDownload, deleteFile, createDir } from '../api/file.js'
import { buildApiUrl } from '../utils/urlHelper'

export function useFileActions(sshConfig, selectedFiles, navigateTo, currentPath, handleDownload, downloadFilesRef) {
  // 批量下载
  const handleBatchDownload = async () => {
    const filesToDownload = selectedFiles.value
    if (filesToDownload.length === 0) {
      ElMessage.warning('请选择要下载的文件')
      return
    }
    for (const file of filesToDownload) {
      if (file.isDirectory) {
        // 文件夹打包下载也加入下载列表
        const task = {
          id: Date.now() + Math.random(),
          name: file.name + '.zip',
          path: file.path,
          size: file.size
          status: 'downloading',
          progress: 0,
          isZip: true
        }
        if (downloadFilesRef) downloadFilesRef.value.push(task)
        try {
          // 先提示用户已建立连接
          ElMessage.success(`已建立与服务器的下载连接，正在打包下载 ${file.name}`)
          // 模拟进度（实际 zipDownload 没有进度回调，这里简单模拟）
          let fakeProgress = 0
          const progressTimer = setInterval(() => {
            if (task.status !== 'downloading') { clearInterval(progressTimer); return }
            fakeProgress += Math.random() * 10 + 5
            if (fakeProgress > 90) fakeProgress = 90
            task.progress = Math.floor(fakeProgress)
            // 模拟下载大小，避免一直显示0B
            task.size = Math.floor(fakeProgress * 1024 * 1024 / 100)
          }, 400)
          const blob = await zipDownload(buildApiUrl(sshConfig.host, ''), [file.path])
          clearInterval(progressTimer)
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${file.name}.zip`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          if (downloadFilesRef) {
            task.status = 'success'
            task.progress = 100
            task.size = blob.size
          }
        } catch (error) {
          if (downloadFilesRef) {
            task.status = 'error'
            task.progress = 0
          }
          ElMessage.error(error.message || `打包下载 ${file.name} 失败`)
        }
      } else {
        // 单文件下载
        await handleDownload(file)
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
