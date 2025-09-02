# GitHub远程更新指南

## 🌐 方法一：GitHub Web界面更新（推荐）

### 1. 访问你的GitHub仓库
- 打开浏览器，访问：https://github.com/你的用户名/personal-finance-manager
- 登录GitHub账户

### 2. 更新index.html
1. 点击 `index.html` 文件
2. 点击右上角的 ✏️ **Edit this file** 按钮
3. 删除所有内容，复制粘贴本地更新后的内容
4. 滚动到页面底部，填写提交信息：
   - **Commit message**: `添加支付宝和微信账单导入功能`
   - **Description**: `新增XLSX库支持，优化导入界面布局`
5. 点击 **Commit changes** 按钮

### 3. 更新style.css
1. 返回仓库主页，点击 `style.css` 文件
2. 点击 ✏️ **Edit this file** 按钮
3. 替换为本地更新后的CSS内容
4. 提交信息：`优化导入选项样式和响应式布局`
5. 点击 **Commit changes**

### 4. 更新script.js
1. 点击 `script.js` 文件
2. 点击 ✏️ **Edit this file** 按钮
3. 替换为包含导入功能的完整JS代码
4. 提交信息：`添加支付宝CSV和微信XLSX导入功能`
5. 点击 **Commit changes**

### 5. 添加使用指南文档
1. 在仓库主页点击 **Add file** → **Create new file**
2. 文件名输入：`账单导入使用指南.md`
3. 复制粘贴使用指南内容
4. 提交信息：`添加账单导入功能使用指南`
5. 点击 **Commit new file**

### 6. 添加更新说明文档
1. 再次点击 **Add file** → **Create new file**
2. 文件名输入：`账单导入功能更新说明.md`
3. 复制粘贴更新说明内容
4. 提交信息：`添加功能更新技术说明`
5. 点击 **Commit new file**

---

## 💻 方法二：使用Git命令行

如果你本地安装了Git，可以使用命令行：

### 1. 克隆仓库到本地
```bash
git clone https://github.com/你的用户名/personal-finance-manager.git
cd personal-finance-manager
```

### 2. 复制更新的文件
将本地的以下文件复制到克隆的仓库目录：
- `index.html`
- `style.css` 
- `script.js`
- `账单导入使用指南.md`
- `账单导入功能更新说明.md`

### 3. 提交并推送更新
```bash
git add .
git commit -m "添加支付宝和微信账单导入功能"
git push origin main
```

---

## 📱 方法三：使用GitHub Mobile App

### 1. 下载GitHub App
- iOS: App Store搜索"GitHub"
- Android: Google Play搜索"GitHub"

### 2. 登录并找到仓库
- 登录GitHub账户
- 找到personal-finance-manager仓库

### 3. 编辑文件
- 点击要编辑的文件
- 点击右上角编辑按钮
- 修改内容并提交

---

## 🔄 方法四：使用在线代码编辑器

### GitHub Codespaces
1. 在仓库页面点击绿色的 **Code** 按钮
2. 选择 **Codespaces** 标签
3. 点击 **Create codespace on main**
4. 在在线VS Code中编辑文件
5. 使用内置终端提交更改

### Gitpod
1. 在仓库URL前加上 `gitpod.io/#/`
2. 例如：`https://gitpod.io/#/https://github.com/你的用户名/personal-finance-manager`
3. 在在线IDE中编辑和提交

---

## ⚡ 快速更新步骤总结

**最快的方法是GitHub Web界面：**

1. 🌐 打开 https://github.com/你的用户名/personal-finance-manager
2. ✏️ 逐个编辑 index.html, style.css, script.js
3. ➕ 添加两个新的.md文档
4. 💾 每次编辑后都点击"Commit changes"
5. ⏰ 等待2-3分钟GitHub Pages自动部署
6. 🎉 访问 https://你的用户名.github.io/personal-finance-manager 查看更新

---

## 📋 需要更新的文件清单

### ✅ 必须更新的文件：
- [ ] `index.html` - 添加XLSX库引用和新导入界面
- [ ] `style.css` - 导入选项样式和响应式优化  
- [ ] `script.js` - 支付宝CSV和微信XLSX导入功能

### ✅ 新增的文档：
- [ ] `账单导入使用指南.md` - 用户操作指南
- [ ] `账单导入功能更新说明.md` - 技术更新说明

### 📝 提交信息建议：
- `添加支付宝和微信账单导入功能`
- `优化导入界面布局和响应式设计`
- `新增XLSX文件解析支持`
- `添加智能分类和数据处理功能`

---

## 🎯 更新后验证

更新完成后，访问你的网站验证功能：
1. 打开 https://你的用户名.github.io/personal-finance-manager
2. 点击"数据管理"按钮
3. 确认看到三个导入选项：JSON数据文件、支付宝账单、微信账单
4. 测试导入功能是否正常工作

如果遇到问题，检查浏览器控制台是否有错误信息。