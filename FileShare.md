# 搭建个人云盘

## 前言
### 收益
可以通过手机/平板/笔记本等移动终端设备（以下简称MT），随时随地访问家里电脑（以下简称PC），与他人一起查看/上传/下载共享文件。
### 局限/代价
家里电脑必须常开（可解决，TODO）

## 搭建流程
整体的搭建流程涉及 PC --> 家庭网络 --> MT。下面逐步讲解。

### PC配置
一、安装Python. 
1. Windows: [下载地址](https://www.python.org/downloads/)，安装
2. MacOS: 
	1. 安装`Homebrew`。遇到比如安装速度慢之类的问题，直接问DeepSeek就行
	```bash
	/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
	```
	2. 安装`Python`
	```bash
	brew install python
	```
	二、安装TailScale
1. [下载地址](https://tailscale.com/download). 安装完成后打开，根据提示登陆、连接即可。
2. 登陆TailScale的Admin Console页面，如果设备列表里显示绿色Connected，则说明连接成功。
3. 在设备列表里，Address那一列有个小箭头，点开，复制一下`ts.net`后缀的那个网址，后面会用到。

### MT配置
一、同上，安装TailScale
1. [下载地址](https://tailscale.com/download). 下载完成后打开，根据提示登陆、连接即可。
2. 登陆TailScale的Admin Console页面，如果设备列表里显示绿色Connected，则说明连接成功。

### 【异地使用】家庭网络配置
这里有两种方案。小白推荐选择方案一。
#### 公共配置
不管选择哪个方案，都需要修改防火墙配置。
1. 给电脑防火墙添加准入规则。
	1. 设置->网络和Internet->高级网络设置->Windows防火墙->高级设置。
	2. 新建规则->端口->TCP->特定本地端口，选一个0～65536之间的5位数填入，这里以49000为例，一直点下一页结束。

【推荐/可选】【网络优化】将光猫设置成桥接模式（Bridge），让路由器负责拨号上网。家里网速慢或者经常莫名其妙断网的可以试试
1. 打电话让运营商派个人过来，就说家里网络不稳定，要把光猫改成桥接模式。
2. 人过来以后，他会把光猫改成桥接，然后配置主路由器拨号上网。
3. 或者：部分运营商提供的光猫可以登陆光猫管理页面。问运营商要到自己家的上网用户名密码后，可以自己改桥接和配置主路由器。不怕麻烦的可以试试。

#### 方案一、内网穿透
无需额外配置

#### 方案二、公网接入
1. 开通公网IP.
	1. 打电话给运营商，要求开通IPv6以及公网IP.
	2. 开通IPv6后，需要在路由器控制页面把IPv6打开。登陆控制页面方法见上文。进去后随便找找就能找到在哪配置。
2. 将跟PC连接的所有上级路由器配置端口转发
	1. 首先，主路由器肯定要配置。其次，如果PC不是网线直接连的主路由器，也没有连墙上的网口，而是连了另一个路由器，那么这个路由器也要配置。一般家庭的网络结构也就这样，不会更复杂了。
	2. 给路由器添加端口转发规则。
  	1. 连接你要改的路由器对应的WIFI.
  	2. 找到路由器背面的网址（通常为 http://192.168.x.y ）和用户名密码，登陆管理页面。
  	3. 找到端口转发。
  	4. 内部IP地址填PC的IP地址（运行Windows PowerShell输入`ipconfig /all`并执行，IPv4地址（首选）那个就是），外部端口和内部端口填48000.

### PC运行
1. 运行Windows PowerShell，进入你想要共享的文件目录。
```bash
# 切换到其他磁盘分区，比如D盘：
D:

# 进入要共享的文件目录：
cd Documents/MyShareDocs
```
2. 启动文件服务。运行两个Windows PowerShell，分别执行下面两个命令：
```bash
python run_v4.py 49000
python run_v6.py 49000
```

### MT运行
1. 打开浏览器，输入一开始记下来的`ts.net`后缀的那个网址（例如`power-station.fin-salmon.ts.net`）
1. 页面刷出来之后就可以直接访问电脑文件目录了。上传、下载都可以。