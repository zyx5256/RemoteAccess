<template>
  <div class="app-container">
    <FileManager />
  </div>
</template>

<script setup>
import FileManager from './views/FileManager.vue'
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

#app {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

.app-container {
  min-height: 100%;
  width: 100%;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* Element Plus MessageBox 全局样式覆盖 */
:root {
  --el-color-primary: #333 !important;
  --el-color-primary-light-3: #666 !important;
  --el-color-primary-light-5: #999 !important;
  --el-color-primary-light-7: #c8c8c8 !important;
  --el-color-primary-light-8: #e0e0e0 !important;
  --el-color-primary-light-9: #f5f5f5 !important;
  --el-color-primary-dark-2: #1a1a1a !important;
}

/* MessageBox 样式覆盖 */
.el-message-box {
  --el-messagebox-title-color: #333;
  --el-messagebox-width: 420px;
  --el-messagebox-border-radius: 8px;
  --el-messagebox-font-size: 14px;
  --el-messagebox-content-font-size: 14px;
}

/* 确认对话框按钮样式 */
.custom-confirm-button {
  background-color: #333 !important;
  border-color: #333 !important;
  color: #fff !important;
  font-weight: 700 !important;
}

.custom-confirm-button:hover {
  background-color: #666 !important;
  border-color: #666 !important;
  color: #fff !important;
}

.custom-confirm-button:active {
  background-color: #1a1a1a !important;
  border-color: #1a1a1a !important;
  color: #fff !important;
}

.custom-cancel-button {
  background-color: #fff !important;
  border-color: #333 !important;
  color: #333 !important;
  font-weight: 700 !important;
}

.custom-cancel-button:hover {
  background-color: #f5f5f5 !important;
  border-color: #333 !important;
  color: #333 !important;
}

.custom-cancel-button:active {
  background-color: #e6e6e6 !important;
  border-color: #333 !important;
  color: #333 !important;
}

.el-message-box.custom-message-box {
  border-radius: 8px;
  overflow: hidden;
  padding: 0 !important;
  margin: 0 !important;

  .el-message-box__header {
    padding: 12px 20px !important;
    border-bottom: 1px solid #e4e4e4;
    margin: 0 !important;
    background-color: #fafafa;
    height: 20px !important;
    line-height: 20px !important;
    box-sizing: content-box !important;
  }

  .el-message-box__headerbtn {
    top: 12px !important;
    right: 4px !important;
    transform: none !important;
    padding: 0 !important;
    margin: 0 !important;
    height: 20px !important;
    line-height: 20px !important;

    .el-message-box__close {
      font-weight: bold !important;
      font-size: 16px !important;
      color: #333 !important;
      transition: color 0.3s ease !important;
      height: 20px !important;
      line-height: 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 20px !important;

      &:hover {
        color: #666 !important;
      }

      &:active {
        color: #1a1a1a !important;
      }
    }
  }

  .el-message-box__title {
    display: flex !important;
    align-items: center !important;
    font-size: 16px !important;
    font-weight: 700 !important;
    color: #333 !important;
    line-height: 20px !important;
    gap: 8px !important;
    margin: 0 !important;
    padding: 0 !important;
    height: 20px !important;
    position: relative;
  }

  .el-message-box__title::before {
    content: '';
    display: inline-block;
    vertical-align: middle;
    width: 20px;
    height: 20px;
    margin-right: 8px;
    background: url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="%23333"/><rect x="9" y="5" width="2" height="7" rx="1" fill="white"/><rect x="9" y="14" width="2" height="2" rx="1" fill="white"/></svg>')
      no-repeat center center;
    background-size: contain;
  }

  .el-message-box__status {
    position: static !important;
    font-size: 20px !important;
    color: #e6a23c !important;
    margin-right: 0 !important;
    line-height: 20px !important;
    height: 20px !important;
    display: none !important;
  }

  .el-message-box__content {
    padding: 20px !important;
    color: #333 !important;
    font-size: 14px !important;
    margin: 0 !important;
  }

  .el-message-box__btns {
    padding: 10px 20px 20px !important;
    margin: 0 !important;
  }

  .el-button {
    font-weight: 700;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.3s;
  }

  .el-button--primary {
    --el-button-text-color: #fff;
    --el-button-bg-color: #333;
    --el-button-border-color: #333;
    --el-button-hover-text-color: #fff;
    --el-button-hover-bg-color: #4a4a4a;
    --el-button-hover-border-color: #4a4a4a;
    --el-button-active-bg-color: #1a1a1a;
    --el-button-active-border-color: #1a1a1a;
    font-weight: 700;
  }

  .el-button--default {
    --el-button-text-color: #333;
    --el-button-bg-color: #fff;
    --el-button-border-color: #dcdfe6;
    --el-button-hover-text-color: #333;
    --el-button-hover-bg-color: #f5f5f5;
    --el-button-hover-border-color: #dcdfe6;
    font-weight: 800 !important;
  }
}

/* MessageBox 样式覆盖 */
:deep(.el-message-box__header) {
  padding: 20px;
  border-bottom: 1px solid #e4e4e4;
  display: flex;
  align-items: center;
}

:deep(.el-message-box__title) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-message-box__status) {
  font-size: 24px;
  color: #e6a23c;
}

/* Element Plus MessageBox 样式覆盖 */
:deep(.el-message-box.custom-message-box) {
  .el-message-box__btns {
    .el-button {
      font-weight: 700 !important;
      padding: 8px 16px !important;
      border-radius: 6px !important;
      font-size: 14px !important;
      transition: all 0.3s !important;
    }

    .el-button--primary {
      background-color: #333 !important;
      border-color: #333 !important;
      color: #fff !important;

      &:hover,
      &:focus {
        background-color: #4a4a4a !important;
        border-color: #4a4a4a !important;
        color: #fff !important;
      }

      &:active {
        background-color: #1a1a1a !important;
        border-color: #1a1a1a !important;
        color: #fff !important;
      }
    }

    .el-button--default {
      background-color: #fff !important;
      border-color: #dcdfe6 !important;
      color: #333 !important;

      &:hover,
      &:focus {
        color: #333 !important;
        border-color: #dcdfe6 !important;
        background-color: #f5f5f5 !important;
      }
    }
  }

  .el-message-box__header {
    padding: 15px;
    padding-bottom: 10px;
  }

  .el-message-box__title {
    display: flex;
    align-items: center;
  }

  .el-message-box__status {
    position: static;
    font-size: 21px;
    color: #e6a23c;
    margin-right: 8px;
  }

  .el-message-box__content {
    padding: 10px 15px;
  }

  .el-message-box__btns {
    padding: 5px 15px 10px;
  }

  .el-message-box__message {
    padding-left: 0;
    font-size: 14px;
  }
}

.el-message-box__header .el-message-box__title {
  font-size: 20px !important;
  font-weight: 900 !important;
  letter-spacing: 0.5px;
}
</style>
