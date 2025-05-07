import axios from 'axios'

const API_BASE_URL = '/api'

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
})

// 文件服务
export const fileService = {
  // 获取文件列表
  async getFileList() {
    try {
      const response = await api.get('/files')
      return response.data
    } catch (error) {
      throw new Error('获取文件列表失败')
    }
  },

  // 上传文件
  async uploadFile(file, onProgress) {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress && onProgress(percentCompleted)
        },
      })
      return response.data
    } catch (error) {
      throw new Error('文件上传失败')
    }
  },

  // 下载文件
  async downloadFile(fileId) {
    try {
      const response = await api.get(`/download/${fileId}`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      throw new Error('文件下载失败')
    }
  },

  // 删除文件
  async deleteFile(fileId) {
    try {
      const response = await api.delete(`/files/${fileId}`)
      return response.data
    } catch (error) {
      throw new Error('文件删除失败')
    }
  },
}

export default fileService
