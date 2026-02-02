# 部署指南

本游戏是纯静态网站（HTML + CSS + JS），可以部署到任何静态网站托管平台。

## ✅ 手机端支持

已完全支持移动端：
- 响应式布局，自动适配屏幕尺寸
- 触摸事件优化，无300ms延迟
- 禁用双指缩放，避免误操作
- iOS Safari全屏支持

## 🚀 部署方法

### 方法1：GitHub Pages（推荐，完全免费）

1. **创建GitHub仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M master
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin master
   ```

2. **启用GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 `master` 分支
   - 点击 Save

3. **访问**
   - 网址：`https://你的用户名.github.io/仓库名/`
   - 5分钟后生效

---

### 方法2：Vercel（最简单，自动部署）

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **部署**
   ```bash
   vercel
   ```

3. **跟随提示操作**
   - 登录Vercel账号
   - 回车确认项目名称
   - 部署完成后会给你一个网址

**优点**：
- 全球CDN加速
- 自动HTTPS
- 每次git push自动部署

---

### 方法3：Netlify（功能强大）

1. **安装Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **部署**
   ```bash
   netlify deploy
   ```

3. **选择发布目录**
   - 输入：`.`（当前目录）
   - 生产部署：`netlify deploy --prod`

**优点**：
- 表单处理
- 无服务器函数
- 访问分析

---

### 方法4：Cloudflare Pages（速度最快）

1. **登录 Cloudflare**
   - 访问 [pages.cloudflare.com](https://pages.cloudflare.com)

2. **连接Git仓库**
   - 点击 "Create a project"
   - 连接GitHub仓库
   - 选择要部署的仓库

3. **配置构建**
   - Framework preset: None
   - Build command: 留空
   - Build output directory: `/`

**优点**：
- 全球最快CDN
- 无限带宽
- 每月免费100,000次请求

---

### 方法5：自己的服务器

如果有VPS或虚拟主机：

```bash
# 上传所有文件到网站根目录
scp -r * user@your-server.com:/var/www/html/

# 或使用FTP客户端上传
```

**Nginx配置示例**：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📱 测试移动端

部署后，在手机浏览器访问：
- iOS Safari
- Android Chrome
- 微信内置浏览器

建议添加到主屏幕，获得类似App的体验。

---

## 🔧 自定义域名

大多数平台支持自定义域名：

1. 在DNS设置中添加CNAME记录
2. 在平台设置中添加自定义域名
3. 等待SSL证书自动签发

---

## 💡 提示

- 所有音频文件已包含在 `audio/` 目录
- 所有图片已包含在 `img/` 目录
- 无需任何构建工具或依赖
- 文件总大小 < 2MB，加载速度快
