import express from "express";
import { Client } from "ssh2";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";

// 清理临时文件函数
const cleanupTempFiles = () => {
  const uploadsDir = path.join(process.cwd(), "uploads");

  // 确保uploads目录存在
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    return;
  }

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error("Error reading uploads directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(uploadsDir, file);
      // 获取文件状态
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error getting file stats:", err);
          return;
        }

        // 删除超过1小时的文件
        const now = new Date().getTime();
        const fileAge = now - stats.mtime.getTime();
        if (fileAge > 3600000) {
          // 1小时 = 3600000毫秒
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Error deleting temp file:", err);
            } else {
              console.log("Deleted old temp file:", file);
            }
          });
        }
      });
    });
  });
};

const app = express();
app.use(cors());
app.use(express.json());

// 配置 multer
const upload = multer({ dest: "uploads/" });

let sshClient = null;
let sftpClient = null;

// 启动时清理临时文件
cleanupTempFiles();

// 每小时清理一次临时文件
setInterval(cleanupTempFiles, 3600000);

// 创建SSH连接
app.post("/api/ssh/connect", async (req, res) => {
  const { host, username, password } = req.body;
  if (!host || !username || !password) {
    return res.status(400).json({ success: false, message: "参数不完整" });
  }
  console.log(
    "Attempting SSH connection to:",
    host,
    "with username:",
    username
  );

  if (sshClient) {
    console.log("Closing existing SSH connection");
    sshClient.end();
  }

  sshClient = new Client();

  let responded = false;
  function safeJson(obj, status = 200) {
    if (!responded && !res.headersSent) {
      responded = true;
      res.status(status).json(obj);
    }
  }

  sshClient
    .on("ready", () => {
      console.log("SSH connection established");
      sshClient.sftp((err, sftp) => {
        if (err) {
          console.error("SFTP connection failed:", err.message);
          safeJson({ success: false, message: "SFTP连接失败: " + err.message }, 500);
          return;
        }
        console.log("SFTP connection established");
        sftpClient = sftp;

        // SFTP连接建立后，优先检测Windows盘符，不依赖realpath('.')
        const winDrives = [
          'C:', 'D:', 'E:', 'F:', 'G:', 'H:', 'I:', 'J:'
        ];
        let checked = 0;
        let availableDrives = [];
        function checkNextDrive() {
          if (checked >= winDrives.length) {
            if (availableDrives.length > 0) {
              safeJson({
                success: true,
                currentPath: '此电脑',
                files: availableDrives.map(drive => ({
                  name: drive,
                  size: null,
                  updateTime: null,
                  isDirectory: true,
                  path: drive
                }))
              });
            } else {
              // fallback: 非Windows或无盘符可用，尝试home目录
              const username = req.body.username || process.env.USER || process.env.USERNAME;
              const homePaths = [
                `/home/${username}`,
                `/Users/${username}`
              ];
              (function tryHome(i) {
                if (i >= homePaths.length) {
                  // 都不存在，fallback到'.'目录
                  safeJson({ success: true, currentPath: '.' });
                  return;
                }
                sftp.opendir(homePaths[i], (err, handle) => {
                  if (!err && handle) {
                    sftp.readdir(homePaths[i], (err, list) => {
                      if (!err && Array.isArray(list)) {
                        safeJson({
                          success: true,
                          currentPath: homePaths[i],
                          files: list.map(item => ({
                            name: item.filename,
                            size: item.attrs.size,
                            updateTime: new Date(item.attrs.mtime * 1000).toLocaleString(),
                            isDirectory: item.attrs.isDirectory(),
                            path: path.posix.join(homePaths[i], item.filename)
                          }))
                        });
                      } else {
                        safeJson({ success: true, currentPath: homePaths[i] });
                      }
                    });
                  } else {
                    tryHome(i + 1);
                  }
                });
              })(0);
            }
            return;
          }
          const drive = winDrives[checked++];
          sftp.opendir(drive, (err, handle) => {
            if (!err && handle) {
              availableDrives.push(drive);
            }
            checkNextDrive();
          });
        }
        checkNextDrive();
      });
    })
    .on("error", (err) => {
      console.error("SSH connection error:", err.message);
      safeJson({ success: false, message: err.message }, 500);
    })
    .connect({
      host,
      username,
      password,
      port: 22, // 默认SSH端口
      readyTimeout: 10000, // 10秒超时
    });
});

// 断开SSH连接
app.post("/api/ssh/disconnect", (req, res) => {
  console.log("Disconnecting SSH");
  if (sshClient) {
    sshClient.end();
    sshClient = null;
    sftpClient = null;
  }
  res.json({ success: true });
});

// 获取文件列表
app.get("/api/files", (req, res) => {
  if (!sftpClient) {
    console.log("No SFTP connection available");
    res.status(400).json({ success: false, message: "未连接到服务器" });
    return;
  }

  let currentPath = req.query.path || ".";
  // 保证currentPath为绝对路径
  sftpClient.realpath(currentPath, (err, absPath) => {
    if (err) {
      console.error("Error resolving realpath:", err.message);
      absPath = currentPath; // fallback
    }
    console.log("Fetching file list for path:", absPath);
    sftpClient.readdir(absPath, (err, list) => {
      if (err) {
        console.error("Error reading directory:", err.message);
        res.status(500).json({ success: false, message: err.message });
        return;
      }
      // 过滤掉隐藏文件（以.或$开头的文件）
      const files = list
        .filter(
          (item) =>
            !item.filename.startsWith(".") && !item.filename.startsWith("$")
        )
        .map((item) => ({
          name: item.filename,
          size: item.attrs.size,
          updateTime: new Date(item.attrs.mtime * 1000).toLocaleString(),
          isDirectory: item.attrs.isDirectory(),
          path: /^[a-zA-Z]:/.test(item.filename)
            ? item.filename
            : path.posix.join(absPath, item.filename),
        }))
        .sort((a, b) => {
          // 首先按类型排序（目录在前）
          if (a.isDirectory !== b.isDirectory) {
            return b.isDirectory ? 1 : -1;
          }
          // 然后按文件名排序（不区分大小写）
          return a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });
        });
      console.log("File list fetched successfully");
      res.json({
        files,
        currentPath: absPath, // 返回绝对路径
      });
    });
  });
});

// 获取当前路径
app.get("/api/current-path", (req, res) => {
  if (!sftpClient) {
    console.log("No SFTP connection available");
    res.status(400).json({ success: false, message: "未连接到服务器" });
    return;
  }

  const currentPath = req.query.path || ".";
  res.json({ currentPath });
});

// 生成不冲突的文件名
const generateUniqueFilename = async (sftp, dirPath, originalFilename) => {
  const { name, ext } = path.parse(originalFilename);
  let index = 1;
  let newFilename = originalFilename;

  // 检查文件是否存在
  const fileExists = async (filepath) => {
    try {
      await new Promise((resolve, reject) => {
        sftp.stat(filepath, (err, stats) => {
          if (err) reject(err);
          else resolve(stats);
        });
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  // 如果文件存在，则添加序号直到找到不存在的文件名
  while (await fileExists(path.posix.join(dirPath, newFilename))) {
    newFilename = `${name}(${index})${ext}`;
    index++;
  }

  return newFilename;
};

// 上传文件
app.post("/api/upload", upload.single("file"), async (req, res) => {
  console.log("收到上传请求", req.method, req.url, req.headers["content-type"]);
  console.log("query.path:", req.query.path);
  console.log("req.file:", req.file);

  if (!sftpClient) {
    res.status(400).json({ success: false, message: "未连接到服务器" });
    return;
  }

  if (!req.file) {
    console.log("没有收到文件，可能是form-data字段名不对或前端没传");
    res.status(400).json({ success: false, message: "没有选择文件" });
    return;
  }

  // 处理中文文件名乱码
  let originalName = req.file.originalname;
  try {
    originalName = Buffer.from(originalName, "latin1").toString("utf8");
  } catch (e) {}

  let currentPath = req.query.path || ".";
  // 如果是.，转成绝对路径
  if (currentPath === ".") {
    currentPath = await new Promise((resolve) => {
      sftpClient.realpath(".", (err, absPath) => {
        if (err) resolve(".");
        else resolve(absPath);
      });
    });
  }

  try {
    // 生成不冲突的文件名
    const uniqueFilename = await generateUniqueFilename(
      sftpClient,
      currentPath,
      originalName
    );
    console.log("生成的唯一文件名:", uniqueFilename);

    // 统一用 posix 路径，防止 win/unix 混用
    const filePath = path.posix.join(currentPath, uniqueFilename);
    console.log("SFTP upload target path:", filePath);

    const readStream = fs.createReadStream(req.file.path);
    const writeStream = sftpClient.createWriteStream(filePath);

    writeStream.on("error", (err) => {
      console.error("Error writing file:", err.message);
      fs.unlink(req.file.path, () => {});
      res.status(500).json({ success: false, message: err.message });
    });

    writeStream.on("close", () => {
      console.log("File uploaded successfully");
      fs.unlink(req.file.path, () => {});
      res.json({
        success: true,
        message:
          uniqueFilename === originalName
            ? "上传成功"
            : `文件已重命名为 ${uniqueFilename} 并上传成功`,
        filename: uniqueFilename,
      });
    });

    readStream.pipe(writeStream);
  } catch (error) {
    console.error("Upload error:", error);
    fs.unlink(req.file.path, () => {});
    res.status(500).json({ success: false, message: error.message });
  }
});

// 下载文件
app.get("/api/download/:filename(*)", (req, res) => {
  if (!sftpClient) {
    console.log("No SFTP connection available for download");
    res.status(400).json({ success: false, message: "未连接到服务器" });
    return;
  }

  const filepath = req.params.filename;
  console.log("Downloading file:", filepath);
  const readStream = sftpClient.createReadStream(filepath);

  readStream.on("error", (err) => {
    console.error("Error downloading file:", err.message);
    res.status(500).json({ success: false, message: err.message });
  });

  const filename = path.basename(filepath);
  // 对中文文件名进行 URL 编码
  const encodedFilename = encodeURIComponent(filename);
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename*=UTF-8''${encodedFilename}`
  );
  readStream.pipe(res);
});

// 递归删除目录
function deleteDirRecursive(dirPath, callback) {
  sftpClient.readdir(dirPath, (err, list) => {
    if (err) return callback(err);
    let pending = list.length;
    if (!pending) {
      // 目录为空，直接删除
      return sftpClient.rmdir(dirPath, callback);
    }
    list.forEach((item) => {
      const fullPath = path.posix.join(dirPath, item.filename);
      if (item.attrs.isDirectory()) {
        deleteDirRecursive(fullPath, (err) => {
          if (--pending === 0) sftpClient.rmdir(dirPath, callback);
        });
      } else {
        sftpClient.unlink(fullPath, (err) => {
          if (--pending === 0) sftpClient.rmdir(dirPath, callback);
        });
      }
    });
  });
}

// 修改删除接口，支持递归删除文件夹
app.delete("/api/files/:filename(*)", (req, res) => {
  if (!sftpClient) {
    res.status(400).json({ success: false, message: "未连接到服务器" });
    return;
  }

  const filepath = req.params.filename;
  console.log("Deleting file or directory:", filepath);

  // 判断是文件还是目录
  sftpClient.stat(filepath, (err, stats) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
      return;
    }
    if (stats.isDirectory()) {
      // 递归删除目录
      deleteDirRecursive(filepath, (err) => {
        if (err) {
          res.status(500).json({ success: false, message: err.message });
        } else {
          res.json({ success: true });
        }
      });
    } else {
      // 删除文件
      sftpClient.unlink(filepath, (err) => {
        if (err) {
          res.status(500).json({ success: false, message: err.message });
        } else {
          res.json({ success: true });
        }
      });
    }
  });
});

// 新建目录
app.post("/api/mkdir", (req, res) => {
  if (!sftpClient) {
    return res.status(400).json({ success: false, message: "未连接到服务器" });
  }
  const { path: parentPath, dirname } = req.body;
  if (!parentPath || !dirname) {
    return res.status(400).json({ success: false, message: "参数缺失" });
  }
  const targetPath = path.posix.join(parentPath, dirname);
  sftpClient.mkdir(targetPath, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, message: "目录创建成功" });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
