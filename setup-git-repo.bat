@echo off
chcp 65001 >nul
echo 设置Git仓库并推送到GitHub...
echo.

echo [1/7] 初始化Git仓库...
git init

echo.
echo [2/7] 添加远程仓库...
git remote add origin https://github.com/onemott/personal-finance-manager.git

echo.
echo [3/7] 创建main分支...
git branch -M main

echo.
echo [4/7] 添加所有文件...
git add .

echo.
echo [5/7] 提交文件...
git commit -m "feat: 更新SCCIPC财务管理系统到v2.0.0版本

- 新增12个专业文档文件
- 优化用户界面和用户体验
- 添加通知系统和错误处理
- 完善部署工具和自动化流程
- 提升代码质量和安全性"

echo.
echo [6/7] 推送到GitHub（强制覆盖）...
git push -f origin main

echo.
echo [7/7] 完成！
echo.
echo 现在您的GitHub仓库应该有正确的文件结构了！
echo 所有文件都在根目录下。
echo.
echo 访问地址: https://onemott.github.io/personal-finance-manager/
echo.
pause