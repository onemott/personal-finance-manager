@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title SCCIPC智能车实验室财务系统 - 统一部署管理工具

rem 始终切到脚本所在目录
cd /d "%~dp0"

call :print_header

rem 支持命令行参数执行：SCCIPC部署工具.bat [0-5] [message]
if not "%~1"=="" (
  set "choice=%~1"
  set "arg2=%~2"
  goto handle_choice
)

:menu
echo.
echo 功能菜单：
echo   1. 快速部署到 GitHub
echo   2. 紧急修复功能问题（输入提交说明后立即提交并推送）
echo   3. 查看帮助信息
echo   4. 打开项目目录
echo   5. 启动本地预览服务器 (Python http.server 8000)
echo   0. 退出
echo.
set /p choice=请选择操作 (0-5)^> 
goto handle_choice

:handle_choice
if "%choice%"=="1" goto quick_deploy_arg
if "%choice%"=="2" goto quick_fix_arg
if "%choice%"=="3" goto help
if "%choice%"=="4" (
  start "" "%~dp0"
  goto menu
)
if "%choice%"=="5" goto start_server
if "%choice%"=="0" goto end
echo [提示] 无效选项：%choice%
goto menu

:quick_deploy_arg
call :require_git
if not "%arg2%"=="" (
  set "msg=%arg2%"
) else (
  set "msg=chore: 快速部署 @ %date% %time%"
)
call :do_commit_and_push "%msg%"
goto menu

:quick_fix_arg
call :require_git
if not "%arg2%"=="" (
  set "usermsg=%arg2%"
) else (
  set "usermsg=fix: 紧急修复 @ %date% %time%"
)
call :do_commit_and_push "%usermsg%"
goto menu

:require_git
where git >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Git，请先安装：https://git-scm.com/
  pause
  goto menu
)
exit /b

:quick_deploy
call :require_git
echo.
echo [部署] 开始快速部署到 GitHub...
set "msg=chore: 快速部署 @ %date% %time%"
call :do_commit_and_push "%msg%"
goto menu

:quick_fix
call :require_git
echo.
set /p usermsg=请输入本次修复说明（可留空）^> 
if "%usermsg%"=="" (
  set "usermsg=fix: 紧急修复 @ %date% %time%"
)
call :do_commit_and_push "%usermsg%"
goto menu

:do_commit_and_push
set "commitMsg=%~1"
echo.
echo [1/4] 拉取远端更新（rebase）
git pull --rebase origin main
if errorlevel 1 goto git_error

echo [2/4] 暂存所有变更
git add -A

echo [3/4] 提交变更
git commit -m "%commitMsg%"
if errorlevel 1 echo (可能没有变更需要提交，忽略)

echo [4/4] 推送到远端 main
git push origin main
if errorlevel 1 goto git_error

echo.
echo [完成] 已推送到远端 main。
for /f "usebackq tokens=1" %%h in (`git rev-parse HEAD`) do set "HEAD=%%h"
echo 本地/远端最新提交：%HEAD%
echo.
pause
goto :eof

:git_error
echo.
echo [错误] Git 操作失败，请检查网络、权限或冲突情况。
echo       可在命令行手动执行：git status / git pull --rebase / git push
echo.
pause
goto menu

:start_server
where python >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Python，请先安装：https://www.python.org/downloads/
  pause
  goto menu
)
echo 将在新窗口启动本地服务器：http://localhost:8000
start "" powershell -NoLogo -NoExit -Command "Set-Location '%~dp0'; python -m http.server 8000"
goto menu

:help
echo.
echo 使用说明：
echo - “快速部署到 GitHub”：拉取(rebase) → add -A → commit → push 到 main
echo - “紧急修复功能问题”：输入说明後立即提交推送
echo - “启动本地预览服务器”：在新终端运行 python -m http.server 8000
echo - 建议：服务器与部署命令分开窗口运行，避免日志互相干扰
echo - 命令行用法：SCCIPC部署工具.bat [选项] [提交信息]
echo   · 1 直接快速部署（可选第二个参数作为提交信息）
echo   · 2 紧急修复（可选第二个参数作为提交信息）
echo   · 0 退出
echo.
pause
goto menu

:print_header
cls
echo ========================================
echo   SCCIPC智能车实验室财务系统
echo        统一部署管理工具
echo ========================================
echo 当前目录：%cd%
exit /b

:end
echo 已退出。
endlocal
exit /b