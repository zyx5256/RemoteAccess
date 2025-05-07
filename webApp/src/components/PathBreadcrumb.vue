<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item @click="$emit('navigate', '/')">
      <el-icon><HomeFilled /></el-icon>
    </el-breadcrumb-item>
    <el-breadcrumb-item
      v-for="(part, index) in pathParts"
      :key="index"
      @click="$emit('navigate', getPathUpTo(index))"
      :class="{ 'current-path': index === pathParts.length - 1 }"
    >
      {{ part }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { HomeFilled } from '@element-plus/icons-vue'

defineProps({
  pathParts: Array,
  getPathUpTo: Function,
})
defineEmits(['navigate'])
</script>

<style scoped>
.current-path {
  /* 保留原样，兼容性 */
}

:deep(.el-breadcrumb__item:not(.current-path) .el-breadcrumb__inner),
:deep(.current-path .el-breadcrumb__inner) {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0 2.5px;
  border-radius: 6px;
  transition: background 0.2s;
  vertical-align: middle;
}

:deep(.current-path .el-breadcrumb__inner) {
  font-weight: 700 !important;
  color: var(--el-text-color-primary) !important;
}

:deep(.el-breadcrumb__item) {
  cursor: pointer;
}

:deep(.el-breadcrumb__item:hover) {
  color: var(--el-color-primary);
}

:deep(.el-breadcrumb__item:not(.current-path) .el-breadcrumb__inner:hover) {
  background: var(--el-color-primary-light-9, #f5f5f5);
}

:deep(.el-breadcrumb__item:not(.current-path)) {
  margin: 0;
}

:deep(.el-breadcrumb__inner),
:deep(.el-breadcrumb__inner *) {
  cursor: pointer !important;
}

:deep(.el-breadcrumb__inner) {
  padding: 0 0.5px;
  border: 1.5px solid transparent;
  box-sizing: border-box;
}

:deep(.el-breadcrumb__inner:hover) {
  background: none !important;
  border: 1.5px solid #222;
  box-sizing: border-box;
}

:deep(.el-breadcrumb__separator) {
  margin: 0 1px !important;
  font-size: 16px;
}
</style>
