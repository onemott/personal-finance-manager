@echo off
chcp 65001 >nul
echo ========================================
echo   紧急修复 - SCCIPC财务系统
echo ========================================
echo.

echo 🚨 检测到功能异常，准备紧急修复...
echo.

REM 检查文件
if not exist "script.js" (
    echo ❌ 未找到script.js文件
    echo 请确保script.js文件在当前目录
    pause
    exit /b 1
)

echo 📋 检查script.js文件大小...
for %%A in (script.js) do set size=%%~zA
echo 文件大小: %size% 字节

if %size% LSS 1000 (
    echo ⚠️  警告: script.js文件可能不完整 (小于1KB)
    echo 建议检查文件内容
)

echo.
echo 🔧 准备修复选项:
echo 1. 重新上传script.js到GitHub
echo 2. 检查本地文件完整性
echo 3. 查看修复说明
echo.

set /p choice="请选择操作 (1-3): "

if "%choice%"=="1" goto upload
if "%choice%"=="2" goto check
if "%choice%"=="3" goto help

:upload
echo.
echo 🚀 准备重新上传script.js...
echo 💡 请手动执行以下步骤:
echo.
echo 1. 打开 https://github.com/onemott/personal-finance-manager
echo 2. 点击 script.js 文件
echo 3. 点击 ✏️ Edit this file
echo 4. 删除所有内容，复制本地script.js的完整内容
echo 5. 提交更改: "紧急修复JavaScript功能"
echo.
goto end

:check
echo.
echo 🔍 检查本地script.js文件...
echo 文件路径: %CD%\script.js
echo 文件大小: %size% 字节
echo.
echo 请用文本编辑器打开script.js检查:
echo - 文件是否完整
echo - 是否有语法错误
echo - 是否包含 openDataManagementModal 函数
echo.
goto end

:help
echo.
echo 📖 查看详细修复说明...
if exist "紧急修复说明.md" (
    start notepad "紧急修复说明.md"
) else (
    echo 未找到修复说明文件
)
goto end

:end
echo.
echo 按任意键退出...
pause >nul