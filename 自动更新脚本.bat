@echo off
chcp 65001
echo ========================================
echo   SCCIPC智能车实验室财务系统更新工具
echo ========================================
echo.
echo 🎯 本工具将自动更新以下功能：
echo    ✅ 支付宝CSV账单导入
echo    ✅ 微信XLSX账单导入  
echo    ✅ 智能分类识别
echo    ✅ 响应式界面优化
echo.

echo 正在检查Git环境...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到Git，请先安装Git或使用GitHub Web界面更新
    echo 📖 请参考"GitHub远程更新指南.md"中的方法一
    pause
    exit /b 1
)

echo ✅ Git环境检查通过
echo.

echo 💡 检测到参考仓库，按回车使用默认URL，或输入你的仓库URL
set /p REPO_URL="GitHub仓库URL [默认: https://github.com/onemott/personal-finance-manager.git]: "
if "%REPO_URL%"=="" (
    set REPO_URL=https://github.com/onemott/personal-finance-manager.git
    echo ✅ 使用默认仓库: %REPO_URL%
)

echo.
echo 📋 即将更新的文件：
echo    📄 index.html - 添加XLSX库和新导入界面
echo    🎨 style.css - 导入选项样式优化
echo    ⚙️ script.js - 核心导入功能
echo    📖 账单导入使用指南.md - 用户操作指南
echo    📋 账单导入功能更新说明.md - 技术说明
echo.
set /p CONFIRM="确认开始更新？(Y/n): "
if /i "%CONFIRM%"=="n" (
    echo ❌ 用户取消更新
    pause
    exit /b 0
)

echo.
echo 🔄 开始更新流程...
echo.

REM 检查必需文件是否存在
echo 📋 检查更新文件...
set MISSING_FILES=0

if not exist "%~dp0index.html" (
    echo ❌ 缺少文件: index.html
    set /a MISSING_FILES+=1
)
if not exist "%~dp0style.css" (
    echo ❌ 缺少文件: style.css
    set /a MISSING_FILES+=1
)
if not exist "%~dp0script.js" (
    echo ❌ 缺少文件: script.js
    set /a MISSING_FILES+=1
)

if %MISSING_FILES% gtr 0 (
    echo.
    echo ❌ 发现 %MISSING_FILES% 个缺失文件，无法继续更新
    echo 💡 请确保以下文件与脚本在同一目录：
    echo    - index.html
    echo    - style.css  
    echo    - script.js
    echo    - 账单导入使用指南.md
    echo    - 账单导入功能更新说明.md
    echo.
    pause
    exit /b 1
)

echo ✅ 所有必需文件检查通过
echo.

REM 创建临时目录
set TEMP_DIR=%TEMP%\finance_update_%RANDOM%
mkdir "%TEMP_DIR%"
cd /d "%TEMP_DIR%"

echo 📥 正在克隆仓库...
git clone "%REPO_URL%" repo
if errorlevel 1 (
    echo ❌ 克隆仓库失败，请检查URL和网络连接
    pause
    exit /b 1
)

cd repo

echo 📋 正在复制更新文件...

REM 检查源文件是否存在并复制
if exist "%~dp0index.html" (
    copy /Y "%~dp0index.html" . >nul 2>&1
    echo    ✅ index.html 复制完成
) else (
    echo    ❌ 未找到 index.html 文件
)

if exist "%~dp0style.css" (
    copy /Y "%~dp0style.css" . >nul 2>&1
    echo    ✅ style.css 复制完成
) else (
    echo    ❌ 未找到 style.css 文件
)

if exist "%~dp0script.js" (
    copy /Y "%~dp0script.js" . >nul 2>&1
    echo    ✅ script.js 复制完成
) else (
    echo    ❌ 未找到 script.js 文件
)

if exist "%~dp0账单导入使用指南.md" (
    copy /Y "%~dp0账单导入使用指南.md" . >nul 2>&1
    echo    ✅ 账单导入使用指南.md 复制完成
) else (
    echo    ❌ 未找到 账单导入使用指南.md 文件
)

if exist "%~dp0账单导入功能更新说明.md" (
    copy /Y "%~dp0账单导入功能更新说明.md" . >nul 2>&1
    echo    ✅ 账单导入功能更新说明.md 复制完成
) else (
    echo    ❌ 未找到 账单导入功能更新说明.md 文件
)

echo ✅ 文件复制完成

echo 📤 正在提交更改...
git add .
git commit -m "添加支付宝和微信账单导入功能

- 新增支付宝CSV账单导入功能
- 新增微信XLSX账单导入功能  
- 优化导入界面布局和响应式设计
- 添加智能分类和数据处理功能
- 新增详细的使用指南和技术文档"

if errorlevel 1 (
    echo ⚠️  没有检测到更改，可能文件已经是最新的
) else (
    echo ✅ 提交完成
)

echo 🚀 正在推送到GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ 推送失败，可能需要身份验证
    echo 💡 请尝试以下解决方案：
    echo    1. 使用GitHub Desktop
    echo    2. 配置Git凭据
    echo    3. 使用GitHub Web界面手动更新
    pause
    exit /b 1
)

echo ✅ 推送成功！

echo.
echo 🎉 更新完成！
echo.
echo 📋 更新内容：
echo    ✅ 支付宝CSV账单导入功能
echo    ✅ 微信XLSX账单导入功能
echo    ✅ 智能分类和数据处理
echo    ✅ 响应式界面优化
echo    ✅ 详细使用指南文档
echo.
echo ⏰ GitHub Pages通常需要2-3分钟完成部署

REM 从仓库URL提取用户名和仓库名来生成网站URL
for /f "tokens=4,5 delims=/" %%a in ("%REPO_URL%") do (
    set USERNAME=%%a
    set REPONAME=%%b
)
set REPONAME=%REPONAME:.git=%

if not "%USERNAME%"=="" if not "%REPONAME%"=="" (
    echo 🌐 你的网站地址: https://%USERNAME%.github.io/%REPONAME%
    echo 📱 请稍后访问查看更新效果
) else (
    echo 🌐 请访问你的GitHub Pages网站查看更新效果
)
echo.

REM 清理临时目录
cd /d "%~dp0"
rmdir /s /q "%TEMP_DIR%" >nul 2>&1

echo 按任意键退出...
pause >nul