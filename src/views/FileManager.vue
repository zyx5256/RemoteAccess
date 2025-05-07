<template>
  <div class="file-manager">
    <SSHConfig v-if="showSSHConfig" @connected="handleSSHConnectedWrapper" />
    <template v-else>
      <el-container class="manager-container">
        <FileManagerHeader
          :host="sshConfig.host"
          :isConnected="isConnected"
          :showUploadProgress="hasUploadFiles"
          :uploadFiles="uploadFiles"
          @disconnect="handleDisconnectWrapper"
          @reconnect="handleReconnect"
          @toggle-upload-progress="uploadProgressVisible = !uploadProgressVisible"
        />
        <el-main>
          <MainContent
            :pathParts="pathParts"
            :getPathUpTo="getPathUpTo"
            :uploadVisible="uploadVisibleFromUseUpload"
            :currentPath="currentPath"
            :hasSelectedFiles="hasSelectedFiles && isConnected"
            :uploadAction="uploadActionFromUseUpload"
            :fileList="fileList"
            :rowClassName="getRowClassName"
            :lastUploadedFile="lastUploadedFile"
            v-model="uploadFiles"
            @navigate="navigateTo"
            @upload-success="handleUploadSuccessFromUseUpload"
            @upload-error="handleUploadErrorFromUseUpload"
            @before-upload="beforeUploadFromUseUpload"
            @upload-progress="handleProgressFromUseUpload"
            @batch-download="handleBatchDownload"
            @batch-delete="handleBatchDelete"
            @create-dir="handleCreateDir"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            @file-click="handleFileClick"
            @update:isUploading="isUploading = $event"
            :disabled="!isConnected"
          />
        </el-main>
      </el-container>
      <UploadProgress
        v-model:dialogVisible="uploadProgressVisible"
        :files="uploadFiles"
        :isUploading="isUploading"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, provide } from 'vue'
import SSHConfig from '../components/SSHConfig.vue'
import FileManagerHeader from '../components/Header.vue'
import MainContent from '../components/MainContent.vue'
import UploadProgress from '../components/UploadProgress.vue'
import { buildApiUrl } from '../utils/urlHelper'
import { useFileList } from '../hooks/useFileList.js'
import { useUpload } from '../hooks/useUpload.js'
import { useSSH } from '../hooks/useSSH.js'
import { useFileActions } from '../hooks/useFileActions.js'

const showSSHConfig = ref(false)
const uploadProgressVisible = ref(false)
const uploadFiles = ref([])
const isUploading = ref(false)
const hasUploadFiles = computed(() => uploadFiles.value.length > 0)

const sshConfig = reactive({
  host: '',
  username: '',
  password: '',
})
let lastSSHConfig = { host: '', username: '', password: '' }
const uploadRef = ref(null)
const apiBase = computed(() => buildApiUrl(sshConfig.host, ''))
const {
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
} = useFileList(apiBase.value, uploadRef)

// 替换上传相关状态和方法
const {
  uploadVisible: uploadVisibleFromUseUpload,
  beforeUpload: beforeUploadFromUseUpload,
  handleProgress: handleProgressFromUseUpload,
  handleUploadSuccess: handleUploadSuccessFromUseUpload,
  handleUploadError: handleUploadErrorFromUseUpload,
  uploadAction: uploadActionFromUseUpload,
} = useUpload(sshConfig, currentPath, navigateTo, setLastUploadedFile)

// 文件操作相关 hooks
const { handleBatchDownload, handleBatchDelete, handleCreateDir } = useFileActions(
  sshConfig,
  selectedFiles,
  navigateTo,
  currentPath,
)

// SSH 相关 hooks
const { isConnected, sshConfig: sshSshConfig, handleSSHConnected, handleDisconnect } = useSSH()

// 监听 sshConfig 变化
watch(
  sshSshConfig,
  (newValue) => {
    Object.assign(sshConfig, newValue)
  },
  { deep: true },
)

// 获取行的类名
const getRowClassName = ({ row }) => {
  console.log('getRowClassName called for:', row.name, 'lastUploadedFile:', lastUploadedFile.value)
  return row.name === lastUploadedFile.value ? 'highlight-row' : ''
}

// 初始化时恢复历史
onMounted(() => {
  const saved = localStorage.getItem('uploadFilesHistory')
  if (saved) {
    try {
      uploadFiles.value = JSON.parse(saved)
    } catch (e) {
      console.warn(e)
    }
  }
  if (!isConnected.value) showSSHConfig.value = true
})

// 监听变化自动保存
watch(
  uploadFiles,
  (val) => {
    const limited = val.slice(-100)
    localStorage.setItem('uploadFilesHistory', JSON.stringify(limited))
  },
  { deep: true },
)

function handleSSHConnectedWrapper(config, initialPath, setCurrentPath) {
  handleSSHConnected(config, initialPath, setCurrentPath)
  showSSHConfig.value = false
  lastSSHConfig = { ...config }
  navigateTo('.')
}

function handleDisconnectWrapper() {
  handleDisconnect()
  sshConfig.host = ''
  sshConfig.username = ''
  sshConfig.password = ''
}

function handleReconnect() {
  if (isConnected.value) {
    uploadProgressVisible.value = !uploadProgressVisible.value
  } else if (lastSSHConfig.host && lastSSHConfig.username && lastSSHConfig.password) {
    handleSSHConnected(lastSSHConfig, currentPath.value, null, navigateTo)
  } else {
    showSSHConfig.value = true
  }
}

provide('isConnected', isConnected)
</script>

<style scoped>
/* 只保留页面结构相关的样式 */
.file-manager {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.manager-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.el-main {
  padding: 20px 0;
  background-color: #f5f7fa;
  flex: 1;
  overflow-y: auto;
}
.main-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px 20px 20px;
  box-sizing: border-box;
}
</style>
