<template>
  <div class="main-content">
    <PathNavigation
      :pathParts="pathParts"
      :getPathUpTo="getPathUpTo"
      :uploadVisible="uploadVisible"
      :currentPath="currentPath"
      :hasSelectedFiles="hasSelectedFiles"
      :uploadAction="uploadAction"
      v-model="uploadFiles"
      @navigate="$emit('navigate', $event)"
      @upload-success="handleUploadSuccess"
      @upload-error="handleUploadError"
      @before-upload="handleBeforeUpload"
      @upload-progress="handleUploadProgress"
      @batch-download="$emit('batch-download')"
      @batch-delete="$emit('batch-delete')"
      @create-dir="$emit('create-dir')"
      @update:isUploading="$emit('update:isUploading', $event)"
    />

    <transition name="fade">
      <FileTable
        :fileList="fileList"
        :rowClassName="rowClassName"
        @selection-change="$emit('selection-change', $event)"
        @row-click="$emit('row-click', $event)"
        @file-click="$emit('file-click', $event)"
        :lastUploadedFile="lastUploadedFile"
      />
    </transition>

    <transition name="fade">
      <div class="table-actions-bottom-card" v-if="hasSelectedFiles">
        <div class="table-actions-bottom">
          <el-button type="primary" @click="$emit('batch-download')">下载文件</el-button>
          <el-button type="danger" class="custom-danger-btn" @click="$emit('batch-delete')"
            >删除文件</el-button
          >
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import PathNavigation from './PathNavigation.vue'
import FileTable from './FileTable.vue'
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
  fileList: {
    type: Array,
    required: true,
  },
  rowClassName: {
    type: Function,
    required: true,
  },
  lastUploadedFile: {
    type: String,
    default: '',
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
  'selection-change',
  'row-click',
  'file-click',
  'update:modelValue',
  'update:isUploading',
])

const uploadFiles = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function handleUploadSuccess(res, file) {
  emit('upload-success', res, file)
}

function handleUploadError(err, file) {
  emit('upload-error', err, file)
}

function handleBeforeUpload(file) {
  emit('before-upload', file)
}

function handleUploadProgress(event, file) {
  emit('upload-progress', event, file)
}
</script>

<style scoped>
.main-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px 20px 20px;
  box-sizing: border-box;
}

.table-actions-bottom-card {
  background: rgb(243, 244, 247);
  border-radius: 0 0 8px 8px;
  padding: 8px 16px 8px 16px;
  margin-top: 0;
  width: 100%;
  box-sizing: border-box;
}

.table-actions-bottom {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.table-actions-bottom .el-button {
  margin: 0 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
