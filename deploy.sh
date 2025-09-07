#!/bin/bash

# SCCIPC智能车实验室财务管理系统 - 部署脚本
# 版本: 2.0.0
# 作者: SCCIPC Team

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="SCCIPC财务管理系统"
VERSION="2.0.0"
REPO_URL="https://github.com/onemott/personal-finance-manager.git"

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_header() {
    echo
    print_message $BLUE "=================================="
    print_message $BLUE "  $PROJECT_NAME v$VERSION"
    print_message $BLUE "=================================="
    echo
}

print_step() {
    print_message $YELLOW "🔄 $1"
}

print_success() {
    print_message $GREEN "✅ $1"
}

print_error() {
    print_message $RED "❌ $1"
}

# 检查依赖
check_dependencies() {
    print_step "检查系统依赖..."
    
    # 检查Git
    if ! command -v git &> /dev/null; then
        print_error "Git未安装，请先安装Git"
        exit 1
    fi
    
    # 检查Node.js（可选）
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js已安装: $NODE_VERSION"
    else
        print_message $YELLOW "⚠️  Node.js未安装，将使用Python作为本地服务器"
    fi
    
    # 检查Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python3已安装: $PYTHON_VERSION"
    elif command -v python &> /dev/null; then
        PYTHON_VERSION=$(python --version)
        print_success "Python已安装: $PYTHON_VERSION"
    else
        print_error "Python未安装，请先安装Python"
        exit 1
    fi
}

# 克隆或更新项目
setup_project() {
    print_step "设置项目..."
    
    if [ -d "personal-finance-manager" ]; then
        print_message $YELLOW "项目目录已存在，正在更新..."
        cd personal-finance-manager
        git pull origin main
        print_success "项目已更新到最新版本"
    else
        print_step "克隆项目仓库..."
        git clone $REPO_URL
        cd personal-finance-manager
        print_success "项目克隆完成"
    fi
}

# 安装依赖（如果有package.json）
install_dependencies() {
    if [ -f "package.json" ]; then
        print_step "安装项目依赖..."
        if command -v npm &> /dev/null; then
            npm install
            print_success "依赖安装完成"
        elif command -v yarn &> /dev/null; then
            yarn install
            print_success "依赖安装完成"
        else
            print_message $YELLOW "⚠️  npm或yarn未安装，跳过依赖安装"
        fi
    fi
}

# 启动本地服务器
start_server() {
    print_step "启动本地服务器..."
    
    # 选择可用的端口
    PORT=8080
    while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
        PORT=$((PORT + 1))
    done
    
    print_message $BLUE "服务器将在端口 $PORT 启动"
    print_message $BLUE "访问地址: http://localhost:$PORT"
    echo
    
    # 尝试不同的服务器
    if command -v npx &> /dev/null && [ -f "package.json" ]; then
        print_success "使用Node.js服务器启动..."
        npx serve . -p $PORT
    elif command -v python3 &> /dev/null; then
        print_success "使用Python3服务器启动..."
        python3 -m http.server $PORT
    elif command -v python &> /dev/null; then
        print_success "使用Python服务器启动..."
        python -m SimpleHTTPServer $PORT
    else
        print_error "无法启动服务器，请手动启动"
        exit 1
    fi
}

# 显示使用说明
show_usage() {
    print_header
    echo "用法: $0 [选项]"
    echo
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -u, --update   仅更新项目，不启动服务器"
    echo "  -s, --server   仅启动服务器（假设项目已存在）"
    echo "  -p, --port     指定端口号（默认8080）"
    echo
    echo "示例:"
    echo "  $0              # 完整部署并启动服务器"
    echo "  $0 --update     # 仅更新项目"
    echo "  $0 --server     # 仅启动服务器"
    echo "  $0 --port 3000  # 在端口3000启动服务器"
    echo
}

# 主函数
main() {
    local update_only=false
    local server_only=false
    local custom_port=""
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -u|--update)
                update_only=true
                shift
                ;;
            -s|--server)
                server_only=true
                shift
                ;;
            -p|--port)
                custom_port="$2"
                shift 2
                ;;
            *)
                print_error "未知选项: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    print_header
    
    if [ "$server_only" = true ]; then
        if [ ! -d "personal-finance-manager" ]; then
            print_error "项目目录不存在，请先运行完整部署"
            exit 1
        fi
        cd personal-finance-manager
        start_server
        return
    fi
    
    check_dependencies
    setup_project
    install_dependencies
    
    if [ "$update_only" = true ]; then
        print_success "项目更新完成！"
        print_message $BLUE "要启动服务器，请运行: $0 --server"
        return
    fi
    
    print_success "部署完成！正在启动服务器..."
    echo
    start_server
}

# 错误处理
trap 'print_error "部署过程中发生错误"; exit 1' ERR

# 运行主函数
main "$@"