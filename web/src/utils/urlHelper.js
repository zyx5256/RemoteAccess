// 判断是否是本地地址
const isLocalHost = (host) => {
  return host === 'localhost' || host === '127.0.0.1'
}

// 获取API请求的基础URL
export const getApiBaseUrl = (host) => {
  if (!host || isLocalHost(host)) {
    // 本地开发环境，使用 Vite 代理
    return '/api'
  }
  // 远程服务器，直接访问
  return `http://${host}/api`
}

// 构建完整的API URL
export const buildApiUrl = (host, path) => {
  const baseUrl = getApiBaseUrl(host)
  return `${baseUrl}${path}`
}
