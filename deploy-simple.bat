@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title SCCIPC财务管理系统 v2.0.0 - 简化部署工具

echo.
echo ==========================================
echo   SCCIPC财务管理系统 v2.0.0
echo          简化部署工具
echo ==========================================
echo 当前目录：%cd%
echo.

:menu
echo 功能菜单:
echo   1. 完整部署
echo   2. 仅更新项目代码
echo   3. 仅启动本地服务器
echo   4. 快速部署到GitHub
echo   5. 检查系统环境
echo   6. 打开项目目录
echo   0. 退出
echo.
set /p choice=请选择操作 (0-6)^> 

if "%choice%"=="1" goto full_deploy
if "%choice%"=="2" goto update_only
if "%choice%"=="3" goto server_only
if "%choice%"=="4" goto deploy_github
if "%choice%"=="5" goto check_environment
if "%choice%"=="6" goto open_directory
if "%choice%"=="0" goto end

echo 无效选项: %choice%
goto menu

:full_deploy
echo.
echo [步骤1] 检查系统环境...
call :check_git
call :check_python
echo.
echo [步骤2] 更新项目代码...
call :update_project
echo.
echo [步骤3] 启动本地服务器...
call :start_server
goto menu

:update_only
echo.
echo 正在更新项目代码...
call :check_git
call :update_project
echo.
echo 项目更新完成!
pause
goto menu

:server_only
echo.
echo 正在启动本地服务器...
call :check_python
call :start_server
goto menu

:deploy_github
echo.
echo 正在部署到GitHub...
call :check_git
if errorlevel 1 goto menu

set /p msg=请输入提交说明(可留空)^> 
if "%msg%"=="" set "msg=更新项目 @ %date% %time%"

echo.
echo [1/4] 拉取远端更新...
git pull origin main
if errorlevel 1 (
    echo 拉取更新失败,请检查网络或解决冲突
    pause
    goto menu
)

echo [2/4] 暂存所有变更...
git add -A

echo [3/4] 提交变更...
git commit -m "%msg%"
if errorlevel 1 echo 没有变更需要提交

echo [4/4] 推送到远端...
git push origin main
if errorlevel 1 (
    echo 推送失败,请检查网络或权限
    pause
    goto menu
)

echo.
echo 部署完成!
pause
goto menu

:check_environment
echo.
echo 正在检查系统环境...
call :check_git
call :check_python
call :check_node
echo.
echo 环境检查完成!
pause
goto menu

:open_directory
start "" "%~dp0"
goto menu

:check_git
git --version >nul 2>nul
if errorlevel 1 (
    echo [错误] Git未安装,请先安装: https://git-scm.com/
    exit /b 1
) else (
    echo [成功] Git已安装
    exit /b 0
)

:check_python
python --version >nul 2>nul
if not errorlevel 1 (
    echo [成功] Python已安装
    set PYTHON_CMD=python
    exit /b 0
)

python3 --version >nul 2>nul
if not errorlevel 1 (
    echo [成功] Python3已安装
    set PYTHON_CMD=python3
    exit /b 0
)

echo [警告] Python未安装,请先安装: https://www.python.org/downloads/
exit /b 1

:check_node
node --version >nul 2>nul
if not errorlevel 1 (
    echo [成功] Node.js已安装
) else (
    echo [信息] Node.js未安装(可选)
)
exit /b 0

:update_project
if exist ".git" (
    echo 更新现有项目...
    git pull origin main
    if errorlevel 1 (
        echo 更新失败,请检查网络连接
        exit /b 1
    )
    echo 项目已更新到最新版本
) else (
    echo 项目目录未初始化Git仓库
    echo 请手动克隆项目或初始化Git仓库
)
exit /b 0

:start_server
if not defined PYTHON_CMD call :check_python

if errorlevel 1 (
    echo 无法启动服务器,请先安装Python
    pause
    exit /b 1
)

set PORT=8080

echo.
echo 服务器将在端口 %PORT% 启动
echo 访问地址: http://localhost:%PORT%
echo.
echo 按 Ctrl+C 停止服务器
echo.

:: 延迟后打开浏览器
start "" cmd /c "timeout /t 3 >nul && start http://localhost:%PORT%"

:: 启动Python服务器
echo 使用Python服务器启动...
%PYTHON_CMD% -m http.server %PORT%
exit /b 0

:end
echo.
echo 感谢使用 SCCIPC财务管理系统 部署工具!
echo.
pause
exit /b 0