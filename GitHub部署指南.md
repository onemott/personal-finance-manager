# GitHub Pages 部署指南

## 需要上传的文件清单

请确保以下文件都已准备好：

✅ **index.html** - 主页面文件
✅ **style.css** - 样式文件  
✅ **script.js** - 功能脚本文件
✅ **README.md** - 项目说明文档
✅ **manifest.json** - PWA支持文件
✅ **deploy.bat** - 部署脚本（可选）

## 上传步骤

### 方法一：网页上传（推荐新手）

1. **进入你的仓库页面**
   - 地址：https://github.com/你的用户名/personal-finance-manager

2. **上传文件**
   - 点击 "uploading an existing file" 链接
   - 或者点击 "Add file" → "Upload files"

3. **拖拽文件**
   - 将以下文件拖拽到上传区域：
     - index.html
     - style.css
     - script.js
     - README.md
     - manifest.json

4. **提交更改**
   - 在页面底部填写提交信息：`添加个人财务管理系统文件`
   - 点击 "Commit changes"

### 方法二：Git命令行（适合有经验用户）

```bash
# 克隆仓库到本地
git clone https://github.com/你的用户名/personal-finance-manager.git

# 进入项目目录
cd personal-finance-manager

# 复制所有项目文件到这个目录

# 添加文件到Git
git add .

# 提交更改
git commit -m "添加个人财务管理系统"

# 推送到GitHub
git push origin main
```

## 启用 GitHub Pages

1. **进入仓库设置**
   - 在仓库页面点击 "Settings" 标签

2. **找到 Pages 设置**
   - 在左侧菜单中找到 "Pages"
   - 或直接滚动到页面中的 "Pages" 部分

3. **配置部署源**
   - **Source**: 选择 "Deploy from a branch"
   - **Branch**: 选择 "main"
   - **Folder**: 选择 "/ (root)"
   - 点击 "Save"

4. **等待部署完成**
   - GitHub 会显示绿色提示：✅ Your site is published at https://你的用户名.github.io/personal-finance-manager
   - 首次部署可能需要 5-10 分钟

## 访问你的网站

部署完成后，你的财务管理系统将在以下地址可用：

🌐 **https://你的用户名.github.io/personal-finance-manager**

## 更新网站

以后如果需要更新系统：

1. 直接在 GitHub 仓库中编辑文件
2. 或者重新上传新版本文件
3. GitHub Pages 会自动重新部署

## 自定义域名（可选）

如果你有自己的域名：

1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容写入你的域名：`finance.yourdomain.com`
3. 在域名DNS设置中添加CNAME记录指向：`你的用户名.github.io`

## 故障排除

**常见问题：**

1. **404 错误**
   - 确保 index.html 文件在仓库根目录
   - 检查文件名拼写是否正确

2. **样式不显示**
   - 确保 style.css 和 script.js 文件已上传
   - 检查文件路径是否正确

3. **部署失败**
   - 检查仓库是否设置为 Public
   - 确认 Pages 设置中选择了正确的分支

## 技术支持

如果遇到问题，可以：
- 查看 GitHub Pages 官方文档
- 检查仓库的 Actions 标签页查看部署日志
- 确认所有文件都已正确上传

---

🎉 **恭喜！完成部署后，你就拥有了一个专业的在线财务管理系统！**