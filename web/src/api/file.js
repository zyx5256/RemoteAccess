// 文件相关 API

import { useSSH } from '../hooks/useSSH'
const { setDisconnected } = useSSH()

function handleNetworkError(error) {
  console.log('handleNetworkError called', error)
  setDisconnected && setDisconnected()
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
  console.log('开始下载文件:', filePath);
  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < maxRetries) {
    try {
      console.log(`尝试下载 (第${retryCount + 1}次)`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const response = await fetch(`${apiBase}/download/${encodeURIComponent(filePath)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('下载响应错误:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        const error = new Error(`下载失败: ${response.status} ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        throw error;
      }

      console.log('开始读取响应数据');
      const reader = response.body.getReader();
      const chunks = [];
      let receivedLength = 0;

      while(true) {
        const {done, value} = await reader.read();
        
        if (done) {
          console.log('数据读取完成');
          break;
        }

        chunks.push(value);
        receivedLength += value.length;
        console.log(`已接收: ${(receivedLength / 1024 / 1024).toFixed(2)}MB`);
      }

      const blob = new Blob(chunks);
      console.log('文件下载完成，大小:', blob.size);
      return blob;
    } catch (error) {
      console.error('下载出错:', error);
      lastError = error;
      retryCount++;
      
      if (retryCount === maxRetries) {
        console.error('达到最大重试次数，放弃下载');
        handleNetworkError(error);
        throw new Error(`下载失败: ${lastError.message}`);
      }
      
      const delay = 1000 * retryCount;
      console.log(`等待${delay}ms后重试`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
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

export async function zipDownload(apiBase, filePaths) {
  try {
    const response = await fetch(`${apiBase}/zip-download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: filePaths }),
    })
    if (!response.ok) throw new Error('打包下载失败')
    return response.blob()
  } catch (error) {
    throw error
  }
}
