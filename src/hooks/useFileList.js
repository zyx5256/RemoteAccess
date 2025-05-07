import { ref, computed } from 'vue'
import { fetchFileList } from '../api/file.js'
import { ElMessage } from 'element-plus'

export function useFileList(apiBase, uploadRef) {
  const fileList = ref([])
  const currentPath = ref('.')
  const selectedFiles = ref([])
  const lastUploadedFile = ref('')

  // 计算是否有选中的文件
  const hasSelectedFiles = computed(() => selectedFiles.value.length > 0)

  // 计算当前路径的各个部分
  const pathParts = computed(() => currentPath.value.split('/').filter(Boolean))

  // 获取到指定索引的路径
  const getPathUpTo = (index) => {
    return '/' + pathParts.value.slice(0, index + 1).join('/')
  }

  // 获取文件列表
  const navigateTo = async (path) => {
    try {
      const data = await fetchFileList(apiBase, path)
      fileList.value = data.files
      currentPath.value = data.currentPath || '/Users/zyx'
      if (uploadRef && uploadRef.value) {
        uploadRef.value.clearFiles()
      }
    } catch (error) {
      ElMessage.error(error.message || '导航失败')
    }
  }

  // 处理表格选择变化
  const handleSelectionChange = (selection) => {
    selectedFiles.value = selection
  }

  // 处理行点击
  const handleRowClick = (row, column) => {
    if (column.type === 'selection') return
    const index = selectedFiles.value.findIndex((file) => file === row)
    if (index === -1) {
      selectedFiles.value.push(row)
      // 这里的 toggleRowSelection 由 FileTable 组件内部处理
    } else {
      selectedFiles.value.splice(index, 1)
    }
  }

  // 处理文件/目录点击
  const handleFileClick = (file) => {
    if (file.isDirectory) {
      navigateTo(file.path)
    }
  }

  // 设置高亮文件名
  const setLastUploadedFile = (filename) => {
    lastUploadedFile.value = filename
    setTimeout(() => {
      lastUploadedFile.value = ''
    }, 3000)
  }

  return {
    fileList,
    currentPath,
    selectedFiles,
    lastUploadedFile,
    hasSelectedFiles,
    pathParts,
    getPathUpTo,
    navigateTo,
    handleSelectionChange,
    handleRowClick,
    handleFileClick,
    setLastUploadedFile,
  }
}
