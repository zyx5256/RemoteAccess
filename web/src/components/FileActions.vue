<template>
  <div class="actions-section">
    <el-upload
      v-if="uploadVisible"
      ref="uploadRef"
      :key="currentPath"
      class="upload-demo"
      :action="uploadAction"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :before-upload="handleBeforeUpload"
      :on-progress="handleUploadProgress"
      :show-file-list="false"
      :multiple="true"
      :headers="{ Accept: 'application/json' }"
      name="file"
      style="display: none"
    />
    <el-button type="primary" @click="handleUploadClick">上传文件</el-button>
    <el-button type="primary" @click="handleCreateDir">新建目录</el-button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, inject, ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const isConnected = inject('isConnected', ref(true))
const uploadRef = ref(null)

const props = defineProps({
  uploadVisible: Boolean,
  currentPath: String,
  hasSelectedFiles: Boolean,
  uploadAction: String,
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'upload-success',
  'upload-error',
  'before-upload',
  'upload-progress',
  'batch-download',
  'batch-delete',
  'create-dir',
  'update:modelValue',
  'update:isUploading',
])

const uploadFiles = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isUploading = computed(() => {
  return uploadFiles.value.some((file) => file.status === 'uploading')
})

// Watch isUploading changes and emit updates
watch(isUploading, (newValue) => {
  emit('update:isUploading', newValue)
})

function handleUploadClick() {
  if (!isConnected.value) {
    ElMessage.error('未连接到服务器')
    return
  }
  // 手动触发 el-upload 的 input
  const input = uploadRef.value?.$el?.querySelector('input[type="file"]')
  if (input) input.click()
}

function handleCreateDir() {
  if (!isConnected.value) {
    ElMessage.error('未连接到服务器')
    return
  }
  emit('create-dir')
}

function handleBeforeUpload(file) {
  if (!uploadFiles.value.find((f) => f.uid === file.uid)) {
    const newFile = {
      uid: file.uid,
      name: file.name,
      size: file.size,
      status: 'uploading',
      percentage: 0,
    }
    uploadFiles.value.push(newFile)
  }
  emit('before-upload', file)
}

function handleUploadProgress(event, file) {
  const files = [...uploadFiles.value]
  const targetFile = files.find((f) => f.uid === file.uid)
  if (targetFile) {
    targetFile.status = 'uploading'
    targetFile.percentage = event.percent
    uploadFiles.value = files
  }
  emit('upload-progress', event, file)
}

function handleUploadSuccess(res, file) {
  const files = [...uploadFiles.value]
  const targetFile = files.find((f) => f.uid === file.uid)
  if (targetFile) {
    targetFile.status = 'success'
    targetFile.percentage = 100
    uploadFiles.value = files
  }
  emit('upload-success', res, file)
}

function handleUploadError(err, file) {
  const files = [...uploadFiles.value]
  const targetFile = files.find((f) => f.uid === file.uid)
  if (targetFile) {
    targetFile.status = 'error'
    uploadFiles.value = files
  }
  emit('upload-error', err, file)
}
</script>

<style scoped>
.actions-section {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
}

.actions-section .el-button {
  margin: 0 !important;
}

.actions-section .el-upload {
  margin: 0 !important;
}
</style>
