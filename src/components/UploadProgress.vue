<template>
  <el-dialog
    :model-value="dialogVisible"
    @update:model-value="$emit('update:dialogVisible', $event)"
    title="上传列表"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="500px"
  >
    <div class="upload-list">
      <div v-for="file in files" :key="file.uid" class="upload-item">
        <div class="upload-info">
          <el-icon><Document /></el-icon>
          <span class="filename">{{ file.name }}</span>
          <span class="upload-status">
            <template v-if="file.size">
              {{ formatSize((file.size * file.percentage) / 100) }} / {{ formatSize(file.size) }}
            </template>
          </span>
        </div>
        <div style="display: flex; align-items: center">
          <el-progress
            :percentage="Math.floor(file.percentage)"
            :status="file.status === 'error' ? 'exception' : 'success'"
            style="width: 90%; display: inline-block"
            :stroke-width="5"
          />
          <span
            v-if="file.status === 'success'"
            style="margin-left: 12px; min-width: 32px; text-align: right; margin-top: 4px"
          >
            <el-icon class="success"><CircleCheckFilled /></el-icon>
          </span>
          <span
            v-else-if="file.status === 'error'"
            style="margin-left: 12px; min-width: 32px; text-align: right; margin-top: 4px"
          >
            <el-icon class="error"><CircleCloseFilled /></el-icon>
          </span>
          <span
            v-else
            style="
              margin-left: 12px;
              min-width: 32px;
              text-align: right;
              cursor: pointer;
              margin-top: 4px;
            "
            @click="interruptUpload(file)"
          >
            <el-icon class="error"><CircleCloseFilled /></el-icon>
          </span>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" :disabled="isUploading">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Document, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'

defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  isUploading: {
    type: Boolean,
    default: false,
  },
  dialogVisible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:dialogVisible', 'interrupt-upload'])

function handleClose() {
  emit('update:dialogVisible', false)
}

function formatSize(size) {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return Math.floor(size / 1024) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + ' MB'
  return (size / 1024 / 1024 / 1024).toFixed(1) + ' GB'
}

function interruptUpload(file) {
  emit('interrupt-upload', file)
}
</script>

<style scoped>
.upload-list {
  max-height: 400px;
  overflow-y: auto;
}

.upload-item {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.upload-item:last-child {
  border-bottom: none;
}

.upload-info {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 0px;
}

.filename {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 20px;
  font-size: 13px;
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 4px;
  color: inherit;
  font-size: 13px;
}

.upload-status .success {
  color: var(--el-color-success) !important;
}

.upload-status .error {
  color: var(--el-color-error);
}

:deep(.el-progress) {
  margin-top: 0;
  margin-right: 0px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

/* 隐藏 el-progress 的 success 图标（对勾和百分比） */
:deep(.el-progress__text) {
  display: none !important;
}

:deep(.success svg) {
  color: var(--el-color-success) !important;
  fill: var(--el-color-success) !important;
}

:deep(.error svg) {
  color: var(--el-color-error) !important;
  fill: var(--el-color-error) !important;
}
</style>
