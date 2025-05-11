<template>
  <div class="download-list">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="上传列表" name="upload">
        <UploadProgress :files="uploadFiles" :isUploading="isUploading" />
      </el-tab-pane>
      <el-tab-pane label="下载列表" name="download">
        <div class="download-items">
          <div v-for="item in downloadFiles" :key="item.id" class="download-item">
            <div class="file-info">
              <span class="filename">{{ item.name }}</span>
              <span class="status" :class="item.status">{{ getStatusText(item.status) }}</span>
            </div>
            <div class="progress-info">
              <el-progress 
                :percentage="item.progress" 
                :status="getProgressStatus(item.status)"
              />
              <span class="size">{{ formatSize(item.size) }}</span>
            </div>
          </div>
          <div v-if="downloadFiles.length === 0" class="empty-tip">
            暂无下载任务
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UploadProgress from './UploadProgress.vue'

const props = defineProps({
  uploadFiles: {
    type: Array,
    default: () => []
  },
  isUploading: {
    type: Boolean,
    default: false
  },
  downloadFiles: {
    type: Array,
    default: () => []
  }
})

const activeTab = ref('upload')

const getStatusText = (status) => {
  const statusMap = {
    'pending': '等待中',
    'downloading': '下载中',
    'success': '已完成',
    'error': '失败'
  }
  return statusMap[status] || status
}

const getProgressStatus = (status) => {
  if (status === 'error') return 'exception'
  if (status === 'success') return 'success'
  return ''
}

const formatSize = (size) => {
  if (!size) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}
</script>

<style scoped>
.download-list {
  padding: 10px;
}

.download-items {
  max-height: 300px;
  overflow-y: auto;
}

.download-item {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.file-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.filename {
  font-weight: 500;
  color: #303133;
}

.status {
  font-size: 12px;
}

.status.downloading {
  color: #409eff;
}

.status.success {
  color: #67c23a;
}

.status.error {
  color: #f56c6c;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.size {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}
</style> 