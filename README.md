# SFTP 文件管理器（Vue3 + Express）

一个现代化的多端 SFTP 文件管理器，支持批量上传、进度管理、历史持久化、断线重连、移动端访问等特性。

## 主要特性

- 批量上传文件，实时进度弹窗，上传历史本地持久化（最多 100 条）
- 支持断线重连、全局连接状态管理
- 文件表格支持多选、批量下载/删除、新建目录
- 文件大小、时间等信息美观对齐，支持多种单位格式化
- 登录页仿 GitHub 风格，支持连接前 loading
- API 错误友好提示，自动断开异常连接
- 支持内网穿透/公网/局域网多端访问
- 中文文件名上传不乱码

## 目录结构

```
├── README.md
├── server
│ ├── index.js
│ ├── package-lock.json
│ ├── package.json
│ └── src
└── web
├── eslint.config.js
├── index.html
├── jsconfig.json
├── package-lock.json
├── package.json
├── public
├── src
└── vite.config.js
```

## 快速开始

### 1. 安装依赖

分别安装前后端依赖：

```bash
cd web
npm install

cd ../server
npm install
```

### 2. 启动后端服务

```bash
cd server
npm run dev
# 或生产环境
npm start
```

> 默认监听 0.0.0.0:3000，确保端口已开放，便于内网穿透/多端访问。

### 3. 启动前端开发服务器

```bash
cd web
npm run dev
```

> 默认 Vite 端口 5173，已配置代理转发 API 请求到后端 3000 端口。

### 4. 访问页面

浏览器访问 [http://[server_IP_Address]:5173](http://[server_IP_Address]:5173)  
如需手机/iPad 访问，请确保前后端端口均已穿透或映射。

## 配置说明

- 登录页只需填写用户名和密码，host 从配置文件读取（可在 `src/config.js` 修改）。
- 上传历史保存在浏览器 localStorage，刷新/重登后自动恢复。
- 文件上传、下载、删除等操作均通过后端 API 转发到 SFTP 服务器。

## 常见问题

- **API 连接被拒绝/404**：请确认后端已启动并监听 0.0.0.0，前端代理配置正确，端口已开放。
- **中文文件名乱码**：已在后端用 Buffer 转码处理，无需额外配置。
- **内网穿透无法访问**：需前后端端口都做穿透，Vite 代理配置需指向实际后端地址。
- **上传历史过多影响性能**：已自动限制为最近 100 条。

## 技术栈

- 前端：Vue 3, Element Plus, Pinia, Axios, Vite
- 后端：Express, ssh2, multer, cors

## 贡献与许可

欢迎 PR 和 Issue。  
MIT License.

---

如需更详细的 API 文档、二次开发说明或部署脚本，可随时告知！
