# 部署指南

本文档详细介绍了SCCIPC智能车实验室财务管理系统的各种部署方式。

## 🚀 快速部署

### 方式一：GitHub Pages（推荐）

1. **Fork仓库**
   ```bash
   # 在GitHub上Fork项目
   # 或者克隆到本地
   git clone https://github.com/onemott/personal-finance-manager.git
   cd personal-finance-manager
   ```

2. **启用GitHub Pages**
   - 进入仓库设置页面
   - 找到"Pages"选项
   - 选择"Deploy from a branch"
   - 选择"main"分支
   - 点击"Save"

3. **访问应用**
   - 等待几分钟部署完成
   - 访问：`https://yourusername.github.io/personal-finance-manager/`

### 方式二：本地部署

#### Windows用户

1. **使用增强版部署工具**
   ```cmd
   # 双击运行
   deploy-enhanced.bat
   
   # 或命令行运行
   deploy-enhanced.bat --help
   ```

2. **使用原版部署工具**
   ```cmd
   SCCIPC部署工具.bat
   ```

#### Linux/macOS用户

1. **使用Shell脚本**
   ```bash
   # 添加执行权限
   chmod +x deploy.sh
   
   # 运行部署脚本
   ./deploy.sh
   
   # 查看帮助
   ./deploy.sh --help
   ```

2. **手动部署**
   ```bash
   # 克隆项目
   git clone https://github.com/onemott/personal-finance-manager.git
   cd personal-finance-manager
   
   # 启动服务器
   python3 -m http.server 8080
   # 或使用Node.js
   npx serve . -p 8080
   ```

## 🔧 高级部署

### Docker部署

1. **创建Dockerfile**
   ```dockerfile
   FROM nginx:alpine
   COPY . /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **构建和运行**
   ```bash
   # 构建镜像
   docker build -t sccipc-finance .
   
   # 运行容器
   docker run -d -p 8080:80 sccipc-finance
   ```

### Vercel部署

1. **安装Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **部署项目**
   ```bash
   vercel --prod
   ```

3. **配置文件** (`vercel.json`)
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "**/*",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/$1"
       }
     ]
   }
   ```

### Netlify部署

1. **连接GitHub仓库**
   - 登录Netlify
   - 点击"New site from Git"
   - 选择GitHub仓库

2. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `.`

3. **配置文件** (`netlify.toml`)
   ```toml
   [build]
     publish = "."
     command = "echo 'No build needed'"
   
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
   ```

## 🌐 CDN和性能优化

### 使用CDN

1. **jsDelivr CDN**
   ```html
   <!-- 在index.html中替换本地文件 -->
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/yourusername/personal-finance-manager@main/style.css">
   <script src="https://cdn.jsdelivr.net/gh/yourusername/personal-finance-manager@main/script_final.js"></script>
   ```

2. **Cloudflare Pages**
   - 连接GitHub仓库
   - 自动部署和CDN加速

### 性能优化

1. **启用Gzip压缩**
   ```nginx
   # Nginx配置
   gzip on;
   gzip_types text/css application/javascript application/json;
   ```

2. **设置缓存头**
   ```nginx
   # 静态资源缓存
   location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

## 🔒 安全配置

### HTTPS配置

1. **Let's Encrypt证书**
   ```bash
   # 使用Certbot
   sudo certbot --nginx -d yourdomain.com
   ```

2. **强制HTTPS重定向**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

### 安全头配置

```nginx
# Nginx安全头
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;" always;
```

## 📱 PWA部署

### Service Worker

1. **创建sw.js**
   ```javascript
   const CACHE_NAME = 'sccipc-finance-v2.0.0';
   const urlsToCache = [
     '/',
     '/style.css',
     '/script_final.js',
     '/manifest.json'
   ];
   
   self.addEventListener('install', event => {
     event.waitUntil(
       caches.open(CACHE_NAME)
         .then(cache => cache.addAll(urlsToCache))
     );
   });
   ```

2. **注册Service Worker**
   ```javascript
   // 在script_final.js中添加
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/sw.js');
   }
   ```

## 🔄 自动化部署

### GitHub Actions

已配置的工作流程：`.github/workflows/deploy.yml`

- 自动部署到GitHub Pages
- 代码质量检查
- 安全审计
- 自动发布版本

### 自定义部署脚本

```bash
#!/bin/bash
# 自动化部署脚本

set -e

echo "🚀 开始部署..."

# 拉取最新代码
git pull origin main

# 运行测试
npm test

# 构建项目
npm run build

# 部署到服务器
rsync -avz --delete ./ user@server:/var/www/html/

echo "✅ 部署完成！"
```

## 🐳 容器化部署

### Docker Compose

```yaml
version: '3.8'
services:
  sccipc-finance:
    build: .
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - sccipc-finance
```

### Kubernetes部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sccipc-finance
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sccipc-finance
  template:
    metadata:
      labels:
        app: sccipc-finance
    spec:
      containers:
      - name: sccipc-finance
        image: sccipc-finance:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: sccipc-finance-service
spec:
  selector:
    app: sccipc-finance
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## 📊 监控和日志

### 访问日志分析

```bash
# 分析Nginx访问日志
tail -f /var/log/nginx/access.log | grep "sccipc-finance"

# 统计访问量
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr
```

### 性能监控

```javascript
// 添加性能监控
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('页面加载时间:', perfData.loadEventEnd - perfData.fetchStart);
});
```

## 🔧 故障排除

### 常见问题

1. **404错误**
   - 检查文件路径是否正确
   - 确认服务器配置

2. **样式不加载**
   - 检查MIME类型配置
   - 确认CSS文件路径

3. **JavaScript错误**
   - 查看浏览器控制台
   - 检查CSP策略

4. **PWA不工作**
   - 确认HTTPS环境
   - 检查manifest.json配置

### 调试工具

```bash
# 检查端口占用
netstat -tulpn | grep :8080

# 测试HTTP响应
curl -I http://localhost:8080

# 检查SSL证书
openssl s_client -connect yourdomain.com:443
```

## 📚 相关文档

- [API文档](../API.md)
- [贡献指南](../CONTRIBUTING.md)
- [安全政策](../SECURITY.md)
- [更新日志](../CHANGELOG.md)

---

**需要帮助？** 请查看[GitHub Issues](https://github.com/onemott/personal-finance-manager/issues)或联系维护团队。