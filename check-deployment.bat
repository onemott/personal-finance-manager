@echo off
chcp 65001 >nul
echo 检查部署状态...
echo.

echo [1] 检查Git状态...
git status

echo.
echo [2] 检查最新提交...
git log --oneline -3

echo.
echo [3] 检查远程仓库...
git remote -v

echo.
echo [4] 检查分支...
git branch -a

echo.
echo [5] 测试本地服务器...
echo 启动本地服务器测试...
echo 访问地址: http://localhost:8080
echo 按Ctrl+C停止服务器
echo.

start http://localhost:8080
python -m http.server 8080

pause