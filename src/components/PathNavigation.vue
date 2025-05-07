<template>
  <div class="path-navigation">
    <div class="navigation-content">
      <div class="navigation-section">
        <PathBreadcrumb
          :pathParts="pathParts"
          :getPathUpTo="getPathUpTo"
          @navigate="(path) => $emit('navigate', path)"
        />
      </div>

      <div class="actions-section">
        <FileActions
          :uploadVisible="uploadVisible"
          :currentPath="currentPath"
          :hasSelectedFiles="hasSelectedFiles"
          :uploadAction="uploadAction"
          v-model="uploadFiles"
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
          @before-upload="handleBeforeUpload"
          @upload-progress="handleUploadProgress"
          @batch-download="$emit('batch-download')"
          @batch-delete="$emit('batch-delete')"
          @create-dir="$emit('create-dir')"
          @update:isUploading="$emit('update:isUploading', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import PathBreadcrumb from './PathBreadcrumb.vue'
import FileActions from './FileActions.vue'
import { computed } from 'vue'

const props = defineProps({
  pathParts: {
    type: Array,
    required: true,
  },
  getPathUpTo: {
    type: Function,
    required: true,
  },
  uploadVisible: {
    type: Boolean,
    required: true,
  },
  currentPath: {
    type: String,
    required: true,
  },
  hasSelectedFiles: {
    type: Boolean,
    required: true,
  },
  uploadAction: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'navigate',
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

function handleUploadSuccess(res, file, fileList) {
  emit('upload-success', res, file, fileList)
}

function handleUploadError(err, file, fileList) {
  emit('upload-error', err, file, fileList)
}

function handleBeforeUpload(file) {
  emit('before-upload', file)
}

function handleUploadProgress(event, file) {
  emit('upload-progress', event, file)
}
</script>

<style scoped>
.path-navigation {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.navigation-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.navigation-section {
  flex: 1;
  min-width: 0;
}

.actions-section {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
}

.actions-section .el-button {
  margin: 0;
  border-radius: 6px;
  font-weight: 700;
}

.actions-section .el-upload {
  margin: 0;
}
</style>
