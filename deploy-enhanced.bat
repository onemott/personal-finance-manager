@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: SCCIPC智能车实验室财务管理系统 - 增强版部署工具
:: 版本: 2.0.0
:: 作者: SCCIPC Team

title SCCIPC财务管理系统 v2.0.0 - 增强版部署工具

:: 颜色定义
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "MAGENTA=[95m"
set "CYAN=[96m"
set "WHITE=[97m"
set "NC=[0m"

:: 项目信息
set "PROJECT_NAME=SCCIPC财务管理系统"
set "VERSION=2.0.0"
set "REPO_URL=https://github.com/onemott/personal-finance-manager.git"
set "DEFAULT_PORT=8080"

:: 始终切到脚本所在目录
cd /d "%~dp0"

:: 显示标题
call :print_header

:: 检查命令行参数
if "%1"=="--help" goto :show_usage
if "%1"=="-h" goto :show_usage
if "%1"=="--update" goto :update_only
if "%1"=="-u" goto :update_only
if "%1"=="--server" goto :server_only
if "%1"=="-s" goto :server_only
if "%1"=="--deploy" goto :deploy_github
if "%1"=="-d" goto :deploy_github
if "%1"=="--fix" goto :quick_fix
if "%1"=="-f" goto :quick_fix

:: 显示菜单
:menu
echo.
echo %CYAN%功能菜单：%NC%
echo   %GREEN%1.%NC% 完整部署（检查依赖 + 更新项目 + 启动服务器）
echo   %GREEN%2.%NC% 仅更新项目代码
echo   %GREEN%3.%NC% 仅启动本地服务器
echo   %GREEN%4.%NC% 快速部署到 GitHub
echo   %GREEN%5.%NC% 紧急修复并推送
echo   %GREEN%6.%NC% 检查系统环境
echo   %GREEN%7.%NC% 查看项目信息
echo   %GREEN%8.%NC% 打开项目目录
echo   %GREEN%9.%NC% 显示帮助信息
echo   %RED%0.%NC% 退出
echo.
set /p choice=%YELLOW%请选择操作 (0-9)%NC%^> 

if "%choice%"=="1" goto :full_deploy
if "%choice%"=="2" goto :update_only
if "%choice%"=="3" goto :server_only
if "%choice%"=="4" goto :deploy_github
if "%choice%"=="5" goto :quick_fix
if "%choice%"=="6" goto :check_environment
if "%choice%"=="7" goto :show_project_info
if "%choice%"=="8" goto :open_directory
if "%choice%"=="9" goto :show_usage
if "%choice%"=="0" goto :end

echo %RED%❌ 无效选项：%choice%%NC%
goto :menu

:: 主要功能实现

:full_deploy
call :print_step "开始完整部署流程..."
call :check_dependencies
call :setup_project
call :install_dependencies
call :start_server
goto :menu

:update_only
call :print_step "仅更新项目..."
call :check_dependencies
call :setup_project
call :install_dependencies
call :print_success "项目更新完成！"
echo.
echo %CYAN%要启动服务器，请选择菜单选项 3%NC%
pause
goto :menu

:server_only
call :print_step "仅启动服务器..."
if not exist "personal-finance-manager" (
    call :print_error "项目目录不存在，请先运行完整部署（选项1）"
    pause
    goto :menu
)
cd personal-finance-manager
call :start_server
cd ..
goto :menu

:deploy_github
call :require_git
echo.
if not "%2"=="" (
    set "msg=%2"
) else (
    set /p msg=%YELLOW%请输入提交说明（可留空）%NC%^> 
    if "!msg!"=="" set "msg=chore: 快速部署 @ %date% %time%"
)
call :do_commit_and_push "!msg!"
goto :menu

:quick_fix
call :require_git
echo.
if not "%2"=="" (
    set "msg=%2"
) else (
    set /p msg=%YELLOW%请输入修复说明（可留空）%NC%^> 
    if "!msg!"=="" set "msg=fix: 紧急修复 @ %date% %time%"
)
call :do_commit_and_push "!msg!"
goto :menu

:check_environment
call :print_step "检查系统环境..."
call :check_dependencies
echo.
call :print_info "环境检查完成"
pause
goto :menu

:show_project_info
call :print_step "项目信息..."
echo.
echo %CYAN%项目名称：%NC%%PROJECT_NAME%
echo %CYAN%版本号：%NC%%VERSION%
echo %CYAN%仓库地址：%NC%%REPO_URL%
echo %CYAN%当前目录：%NC%%cd%
echo.
if exist "personal-finance-manager" (
    cd personal-finance-manager
    echo %CYAN%Git状态：%NC%
    git status --porcelain 2>nul
    if errorlevel 1 (
        echo %YELLOW%  未初始化Git仓库%NC%
    ) else (
        for /f "tokens=*" %%i in ('git rev-parse --short HEAD 2^>nul') do (
            echo %GREEN%  当前提交：%%i%NC%
        )
        for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do (
            echo %GREEN%  当前分支：%%i%NC%
        )
    )
    cd ..
) else (
    echo %YELLOW%项目目录不存在%NC%
)
echo.
pause
goto :menu

:open_directory
start "" "%~dp0"
goto :menu

:: 工具函数

:print_header
cls
echo.
echo %BLUE%==========================================%NC%
echo %BLUE%  %PROJECT_NAME% v%VERSION%%NC%
echo %BLUE%         增强版部署工具%NC%
echo %BLUE%==========================================%NC%
echo %CYAN%当前目录：%cd%%NC%
goto :eof

:print_step
echo %YELLOW%🔄 %~1%NC%
goto :eof

:print_success
echo %GREEN%✅ %~1%NC%
goto :eof

:print_error
echo %RED%❌ %~1%NC%
goto :eof

:print_info
echo %CYAN%ℹ️  %~1%NC%
goto :eof

:print_warning
echo %YELLOW%⚠️  %~1%NC%
goto :eof

:check_dependencies
call :print_step "检查系统依赖..."

:: 检查Git
where git >nul 2>&1
if errorlevel 1 (
    call :print_error "Git未安装"
    echo %CYAN%下载地址: https://git-scm.com/download/win%NC%
    set HAS_GIT=0
) else (
    for /f "tokens=*" %%i in ('git --version 2^>nul') do (
        call :print_success "Git已安装: %%i"
    )
    set HAS_GIT=1
)

:: 检查Node.js
where node >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do (
        call :print_success "Node.js已安装: %%i"
    )
    set HAS_NODE=1
) else (
    call :print_warning "Node.js未安装，将使用Python作为本地服务器"
    echo %CYAN%下载地址: https://nodejs.org/%NC%
    set HAS_NODE=0
)

:: 检查Python
where python >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=*" %%i in ('python --version 2^>nul') do (
        call :print_success "Python已安装: %%i"
    )
    set HAS_PYTHON=1
    set PYTHON_CMD=python
) else (
    where python3 >nul 2>&1
    if not errorlevel 1 (
        for /f "tokens=*" %%i in ('python3 --version 2^>nul') do (
            call :print_success "Python3已安装: %%i"
        )
        set HAS_PYTHON=1
        set PYTHON_CMD=python3
    ) else (
        call :print_error "Python未安装"
        echo %CYAN%下载地址: https://www.python.org/downloads/%NC%
        set HAS_PYTHON=0
    )
)

:: 检查网络连接
ping -n 1 github.com >nul 2>&1
if not errorlevel 1 (
    call :print_success "网络连接正常"
) else (
    call :print_warning "无法连接到GitHub，请检查网络"
)

goto :eof

:require_git
call :check_dependencies
if %HAS_GIT%==0 (
    call :print_error "Git未安装，无法执行Git操作"
    pause
    goto :menu
)
goto :eof

:setup_project
call :print_step "设置项目..."

if exist "personal-finance-manager" (
    call :print_info "项目目录已存在，正在更新..."
    cd personal-finance-manager
    
    :: 检查是否有未提交的更改
    git status --porcelain 2>nul | findstr /r "." >nul
    if not errorlevel 1 (
        call :print_warning "检测到未提交的更改，正在暂存..."
        git stash push -m "Auto stash before update"
    )
    
    git pull --rebase origin main
    if errorlevel 1 (
        call :print_error "项目更新失败，请检查网络或解决冲突"
        pause
        cd ..
        goto :menu
    )
    
    :: 恢复暂存的更改
    git stash list | findstr "Auto stash before update" >nul
    if not errorlevel 1 (
        call :print_info "恢复之前暂存的更改..."
        git stash pop
    )
    
    call :print_success "项目已更新到最新版本"
    cd ..
) else (
    call :print_step "克隆项目仓库..."
    git clone %REPO_URL%
    if errorlevel 1 (
        call :print_error "项目克隆失败，请检查网络连接"
        pause
        goto :menu
    )
    call :print_success "项目克隆完成"
)
goto :eof

:install_dependencies
if exist "personal-finance-manager\package.json" (
    call :print_step "安装项目依赖..."
    cd personal-finance-manager
    
    if %HAS_NODE%==1 (
        npm --version >nul 2>&1
        if not errorlevel 1 (
            npm install
            call :print_success "依赖安装完成"
        ) else (
            yarn --version >nul 2>&1
            if not errorlevel 1 (
                yarn install
                call :print_success "依赖安装完成"
            ) else (
                call :print_warning "npm或yarn未安装，跳过依赖安装"
            )
        )
    ) else (
        call :print_info "Node.js未安装，跳过依赖安装"
    )
    cd ..
)
goto :eof

:find_available_port
set /a PORT=%DEFAULT_PORT%
:port_loop
netstat -an | find ":%PORT% " >nul
if not errorlevel 1 (
    set /a PORT+=1
    if %PORT% gtr 9000 (
        call :print_error "无法找到可用端口"
        goto :eof
    )
    goto :port_loop
)
goto :eof

:start_server
call :print_step "启动本地服务器..."
call :find_available_port

echo.
echo %BLUE%服务器将在端口 %PORT% 启动%NC%
echo %BLUE%访问地址: http://localhost:%PORT%%NC%
echo.
echo %YELLOW%按 Ctrl+C 停止服务器%NC%
echo.

:: 延迟后打开浏览器
start "" cmd /c "timeout /t 3 >nul && start http://localhost:%PORT%"

:: 启动服务器
if %HAS_NODE%==1 (
    where npx >nul 2>&1
    if not errorlevel 1 (
        if exist "package.json" (
            call :print_success "使用Node.js服务器启动..."
            npx serve . -p %PORT%
            goto :eof
        )
    )
)

if %HAS_PYTHON%==1 (
    call :print_success "使用Python服务器启动..."
    %PYTHON_CMD% -m http.server %PORT%
) else (
    call :print_error "无法启动服务器，请安装Python或Node.js"
    pause
)
goto :eof

:do_commit_and_push
set "commitMsg=%~1"
echo.
call :print_step "开始Git操作..."

echo %CYAN%[1/4] 拉取远端更新（rebase）%NC%
git pull --rebase origin main
if errorlevel 1 (
    call :print_error "拉取更新失败"
    goto :git_error
)

echo %CYAN%[2/4] 暂存所有变更%NC%
git add -A

echo %CYAN%[3/4] 提交变更%NC%
git commit -m "%commitMsg%"
if errorlevel 1 (
    call :print_warning "没有变更需要提交"
) else (
    call :print_success "变更已提交"
)

echo %CYAN%[4/4] 推送到远端 main%NC%
git push origin main
if errorlevel 1 (
    call :print_error "推送失败"
    goto :git_error
)

echo.
call :print_success "已成功推送到远端 main"
for /f "usebackq tokens=1" %%h in (`git rev-parse --short HEAD`) do (
    echo %GREEN%最新提交：%%h%NC%
)
echo.
pause
goto :eof

:git_error
echo.
call :print_error "Git操作失败，请检查网络、权限或冲突情况"
echo %CYAN%建议手动执行：git status / git pull --rebase / git push%NC%
echo.
pause
goto :eof

:show_usage
echo.
echo %CYAN%使用说明：%NC%
echo.
echo %YELLOW%命令行用法：%NC%
echo   %~nx0 [选项] [参数]
echo.
echo %YELLOW%选项：%NC%
echo   -h, --help     显示此帮助信息
echo   -u, --update   仅更新项目，不启动服务器
echo   -s, --server   仅启动服务器（假设项目已存在）
echo   -d, --deploy   快速部署到GitHub
echo   -f, --fix      紧急修复并推送
echo.
echo %YELLOW%示例：%NC%
echo   %~nx0                    # 显示菜单
echo   %~nx0 --update           # 仅更新项目
echo   %~nx0 --server           # 仅启动服务器
echo   %~nx0 --deploy "更新文档" # 部署并指定提交信息
echo   %~nx0 --fix "修复bug"    # 紧急修复
echo.
echo %YELLOW%功能说明：%NC%
echo - 完整部署：检查环境 + 更新代码 + 安装依赖 + 启动服务器
echo - 项目更新：从GitHub拉取最新代码并安装依赖
echo - 启动服务器：在本地启动HTTP服务器预览项目
echo - GitHub部署：提交所有更改并推送到远程仓库
echo - 紧急修复：快速提交修复并推送
echo.
pause
goto :menu

:end
echo.
call :print_success "感谢使用 %PROJECT_NAME% 部署工具！"
echo.
pause
exit /b 0