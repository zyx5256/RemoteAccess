// 文件相关 API

import { useSSH } from '../hooks/useSSH'
const { setDisconnected } = useSSH()

function handleNetworkError(error) {
  console.log('handleNetworkError called', error)
  if (
    error.status === 0 ||
    error.status === 500 ||
    error.status === 502 ||
    error.status === 503 ||
    error.status === 504 ||
    (error.message && error.message.includes('Failed to fetch'))
  ) {
    setDisconnected && setDisconnected()
  }
}

export async function fetchFileList(apiBase, path) {
  try {
    const response = await fetch(`${apiBase}/files?path=${encodeURIComponent(path)}`)
    if (!response.ok) {
      const error = new Error(`请求失败，状态码：${response.status} ${response.statusText}`)
      error.status = response.status
      error.statusText = response.statusText
      throw error
    }
    return response.json()
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function uploadFile(apiBase, path, file) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${apiBase}/upload?path=${encodeURIComponent(path)}`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      const error = new Error(`上传失败，状态码：${response.status} ${response.statusText}`)
      error.status = response.status
      error.statusText = response.statusText
      throw error
    }
    return response.json()
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function downloadFile(apiBase, filePath) {
  try {
    const response = await fetch(`${apiBase}/download/${encodeURIComponent(filePath)}`)
    if (!response.ok) {
      const error = new Error('下载失败')
      error.status = response.status
      error.statusText = response.statusText
      throw error
    }
    return response.blob()
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function deleteFile(apiBase, filePath) {
  try {
    const response = await fetch(`${apiBase}/files/${encodeURIComponent(filePath)}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const error = new Error(`删除失败，状态码：${response.status} ${response.statusText}`)
      error.status = response.status
      error.statusText = response.statusText
      throw error
    }
    return response.json()
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function createDir(apiBase, parentPath, dirname) {
  try {
    const response = await fetch(`${apiBase}/mkdir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: parentPath, dirname }),
    })
    if (!response.ok) {
      const error = new Error(`新建目录失败，状态码：${response.status} ${response.statusText}`)
      error.status = response.status
      error.statusText = response.statusText
      throw error
    }
    return response.json()
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}
