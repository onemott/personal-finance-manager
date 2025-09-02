@echo off
chcp 65001 >nul
echo ========================================
echo   SCCIPC财务系统更新工具 (简化版)
echo ========================================
echo.

REM 设置默认仓库
set DEFAULT_REPO=https://github.com/onemott/personal-finance-manager.git

echo 💡 使用默认仓库: %DEFAULT_REPO%
echo.

REM 检查Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未安装Git，请先安装Git
    echo 📖 或使用GitHub Web界面手动更新
    pause
    exit /b 1
)
echo ✅ Git环境正常

REM 检查文件
echo.
echo 📋 检查更新文件...
set FILES_OK=1

if not exist "index.html" (
    echo ❌ 未找到 index.html
    set FILES_OK=0
)
if not exist "style.css" (
    echo ❌ 未找到 style.css
    set FILES_OK=0
)
if not exist "script.js" (
    echo ❌ 未找到 script.js
    set FILES_OK=0
)

if %FILES_OK%==0 (
    echo.
    echo ❌ 缺少必要文件，请确保以下文件在当前目录：
    echo    - index.html
    echo    - style.css
    echo    - script.js
    echo.
    echo 📂 当前目录文件列表：
    dir /b *.html *.css *.js *.md 2>nul
    echo.
    pause
    exit /b 1
)

echo ✅ 文件检查通过

REM 确认更新
echo.
set /p CONFIRM="确认开始更新？(Y/n): "
if /i "%CONFIRM%"=="n" (
    echo 取消更新
    pause
    exit /b 0
)

REM 创建工作目录
set WORK_DIR=%CD%\temp_update
if exist "%WORK_DIR%" rmdir /s /q "%WORK_DIR%"
mkdir "%WORK_DIR%"

echo.
echo 🔄 开始更新...

REM 克隆仓库
echo 📥 克隆仓库...
git clone "%DEFAULT_REPO%" "%WORK_DIR%" >nul 2>&1
if errorlevel 1 (
    echo ❌ 克隆失败，请检查网络连接
    pause
    exit /b 1
)

REM 复制文件
echo 📋 复制文件...
copy /Y "index.html" "%WORK_DIR%\" >nul
copy /Y "style.css" "%WORK_DIR%\" >nul
copy /Y "script.js" "%WORK_DIR%\" >nul

if exist "账单导入使用指南.md" copy /Y "账单导入使用指南.md" "%WORK_DIR%\" >nul
if exist "账单导入功能更新说明.md" copy /Y "账单导入功能更新说明.md" "%WORK_DIR%\" >nul

REM 提交更改
cd /d "%WORK_DIR%"
git add . >nul 2>&1
git commit -m "添加支付宝和微信账单导入功能" >nul 2>&1

REM 推送
echo 🚀 推送更新...
git push origin main >nul 2>&1
if errorlevel 1 (
    echo ❌ 推送失败，可能需要身份验证
    echo 💡 请尝试：
    echo    1. 使用GitHub Desktop
    echo    2. 配置Git凭据
    echo    3. 使用GitHub Web界面
    cd /d "%~dp0"
    rmdir /s /q "%WORK_DIR%" >nul 2>&1
    pause
    exit /b 1
)

REM 清理
cd /d "%~dp0"
rmdir /s /q "%WORK_DIR%" >nul 2>&1

echo.
echo 🎉 更新完成！
echo 🌐 网站地址: https://onemott.github.io/personal-finance-manager
echo ⏰ 请等待2-3分钟GitHub Pages部署完成
echo.
pause