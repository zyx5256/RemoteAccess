<template>
  <transition name="fade">
    <el-table
      ref="tableRef"
      :data="fileList"
      style="width: 100%; margin-bottom: 0"
      max-height="calc(100vh - 220px)"
      @selection-change="$emit('selection-change', $event)"
      @row-click="onRowClick"
      :row-class-name="getRowClassName"
    >
      <el-table-column type="selection" width="30" />
      <el-table-column prop="name" label="文件名" min-width="300" show-overflow-tooltip>
        <template #default="scope">
          <div class="file-name-container">
            <div
              v-if="scope.row.isDirectory"
              class="folder-name"
              @click.stop="$emit('file-click', scope.row)"
            >
              <el-icon><Folder /></el-icon>
              <span class="file-name-text">{{ scope.row.name }}</span>
            </div>
            <div v-else class="file-name">
              <el-icon><Document /></el-icon>
              <span class="file-name-text">{{ scope.row.name }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小" width="120">
        <template #default="scope">
          <span class="size-cell">{{
            scope.row.isDirectory ? '-' : formatFileSize(scope.row.size)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="修改时间" width="200">
        <template #default="scope">
          <span class="date-cell">{{ formatDate(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
    </el-table>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { Folder, Document } from '@element-plus/icons-vue'

const tableRef = ref()
const props = defineProps({
  fileList: Array,
  rowClassName: Function,
  lastUploadedFile: String,
})
defineEmits(['selection-change', 'row-click', 'file-click'])

function onRowClick(row, column) {
  // 如果点击的是选择框列，不做处理
  if (column.type === 'selection') return
  // 切换当前行的选中状态
  if (tableRef.value) {
    tableRef.value.toggleRowSelection(row)
  }
  // 继续向上传递事件
  // $emit('row-click', row, column) // 这里不 emit，因父组件已不需要
}

function formatFileSize(size) {
  if (size < 1024) {
    return Math.floor(size) + ' B'
  } else if (size < 1024 * 1024) {
    return Math.floor(size / 1024) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(1) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const pad = (n) => n.toString().padStart(2, '0')
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hour = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${year}/${month}/${day}, ${hour}:${min}`
}

// 高亮行判断
function getRowClassName({ row }) {
  return row.name === props.lastUploadedFile ? 'highlight-row' : ''
}
</script>

<style scoped>
.file-name-container {
  display: flex;
  align-items: center;
  min-width: 0;
}
.folder-name {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-width: 0;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1.5px solid transparent;
  box-sizing: border-box;
}
.folder-name:hover {
  background: none !important;
  border: 1.5px solid #222 !important;
  box-sizing: border-box;
}
.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 4px 8px;
}
.file-name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  max-width: 600px;
  font-weight: 500;
}
.date-cell {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  font-family:
    'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
}

:deep(.el-table__row),
:deep(.el-table__cell) {
  height: 40px; /* 表格行高 */
  padding-top: 0;
  padding-bottom: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.highlight-row) {
  position: relative;
  z-index: 1;
}

:deep(.highlight-row td) {
  border-color: transparent !important;
}

:deep(.highlight-row)::after {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  bottom: -1px;
  pointer-events: none;
  z-index: 2;
  animation: highlight-fade 2s ease-out;
}

@keyframes highlight-fade {
  0% {
    outline: 2px solid var(--el-color-success-light-5);
    outline-offset: -2px;
  }
  100% {
    outline: 2px solid transparent;
    outline-offset: -2px;
  }
}

.size-cell {
  font-variant-numeric: tabular-nums !important;
  font-family:
    'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace !important;
}
</style>
