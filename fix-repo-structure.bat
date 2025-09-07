@echo off
chcp 65001 >nul
echo 修复GitHub仓库结构...
echo.

echo [1/5] 检查Git状态...
git status

echo.
echo [2/5] 添加所有文件到暂存区...
git add .

echo.
echo [3/5] 提交当前更改...
git commit -m "fix: 修复仓库结构，将文件移回根目录"

echo.
echo [4/5] 推送到GitHub...
git push origin main

echo.
echo [5/5] 完成！
echo.
echo 现在您的GitHub仓库结构应该正确了。
echo 所有文件都应该在根目录下，而不是在子文件夹中。
echo.
pause