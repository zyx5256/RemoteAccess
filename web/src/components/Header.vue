<template>
  <el-header>
    <div class="header-content">
      <el-dropdown v-if="true" trigger="hover" placement="bottom-start" :hide-on-click="false">
        <div
          class="title-section"
          :class="{ clickable: isConnected || showUploadProgress }"
          @mouseenter="hovering = true"
          @mouseleave="hovering = false"
          style="cursor: pointer"
          @click="$emit('toggle-upload-progress')"
        >
          <transition name="icon-fade" mode="out-in">
            <component :is="hovering ? Upload : VueIcon" class="title-icon" />
          </transition>
          <h2>云空间</h2>
        </div>
        <template #dropdown>
          <div class="upload-dropdown-list">
            <div v-if="!uploadFiles || uploadFiles.length === 0" class="empty-upload-list">
              暂无上传文件
            </div>
            <div v-else>
              <div v-for="file in uploadFiles" :key="file.uid" class="upload-dropdown-item">
                <el-icon v-if="file.status === 'success'" class="success"
                  ><CircleCheckFilled
                /></el-icon>
                <el-icon v-else-if="file.status === 'error'" class="error"
                  ><CircleCloseFilled
                /></el-icon>
                <el-icon v-else class="uploading"><Loading /></el-icon>
                <span class="filename">{{ file.name }}</span>
                <span class="upload-size"
                  ><span class="size-cell">{{
                    formatSize((file.size * file.percentage) / 100)
                  }}</span>
                  / <span class="size-cell">{{ formatSize(file.size) }}</span></span
                >
              </div>
            </div>
          </div>
        </template>
      </el-dropdown>
      <div
        v-else
        class="title-section"
        @mouseenter="hovering = true"
        @mouseleave="hovering = false"
        style="cursor: pointer"
      >
        <transition name="icon-fade" mode="out-in">
          <component :is="hovering ? Upload : VueIcon" class="title-icon" />
        </transition>
        <h2>云空间</h2>
      </div>
      <div class="connection-status">
        <el-tag
          class="connection-info"
          :type="isConnected ? 'success' : 'danger'"
          @click="onTagClick"
          :style="!isConnected ? 'cursor:pointer;' : ''"
        >
          {{ isConnected ? '已连接' : '连接断开' }}
        </el-tag>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { ref } from 'vue'
import VueIcon from './icons/VueIcon.vue'
import { Upload, CircleCheckFilled, CircleCloseFilled, Loading } from '@element-plus/icons-vue'
import { ElDropdown, ElIcon } from 'element-plus'

defineOptions({
  name: 'FileManagerHeader',
})

const props = defineProps({
  host: {
    type: String,
    required: true,
  },
  isConnected: {
    type: Boolean,
    required: true,
  },
  showUploadProgress: {
    type: Boolean,
    default: false,
  },
  uploadFiles: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['reconnect', 'toggle-upload-progress'])

const hovering = ref(false)

function handleReconnectClick() {
  emit('reconnect')
}

function onTagClick(e) {
  if (!props.isConnected) {
    e.stopPropagation()
    handleReconnectClick()
  }
}

function formatSize(size) {
  if (!size || isNaN(size)) return '0 B'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return Math.floor(size / 1024) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + ' MB'
  return (size / 1024 / 1024 / 1024).toFixed(1) + ' GB'
}
</script>

<style scoped>
.header-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.connection-info {
  margin: 0;
  font-weight: 500;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0;
  width: 100%;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-section h2 {
  font-weight: 600;
  margin: 0;
}

.title-icon {
  width: 24px;
  height: 24px;
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.title-section.clickable {
  cursor: pointer;
  color: #333;
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.icon-fade-enter-to,
.icon-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.upload-dropdown-list {
  min-width: 220px;
  max-height: 320px;
  overflow-y: auto;
  padding: 8px 0;
}
.upload-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 16px;
  font-size: 13px;
}
.upload-dropdown-item .filename {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upload-dropdown-item .upload-size {
  margin-left: 8px;
  color: #888;
  font-size: 12px;
  min-width: 90px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.upload-dropdown-item .success {
  color: var(--el-color-success) !important;
}
.upload-dropdown-item .error {
  color: var(--el-color-error) !important;
}
.upload-dropdown-item .uploading {
  color: var(--el-color-primary) !important;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.empty-upload-list {
  color: #aaa;
  text-align: center;
  padding: 16px 0;
  font-size: 13px;
}
.size-cell {
  font-variant-numeric: tabular-nums;
  font-family:
    'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
}
</style>
