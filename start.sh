#!/bin/bash
# 工作台启动脚本（支持飞书同步）

echo "============================"
echo "   工作台 启动脚本"
echo "   支持飞书多维表格实时同步"
echo "============================"
echo ""

# 检查是否配置了飞书凭证
ENV_FILE="$(dirname "$0")/server/.env"
HAS_FEISHU=false
if [ -f "$ENV_FILE" ]; then
    if grep -q "FEISHU_APP_ID=your" "$ENV_FILE" 2>/dev/null || ! grep -q "FEISHU_APP_ID" "$ENV_FILE" 2>/dev/null; then
        HAS_FEISHU=false
    else
        HAS_FEISHU=true
    fi
fi

# 方式1: Docker（推荐，前后端一体）
if command -v docker &> /dev/null; then
    echo "检测到 Docker，正在构建并启动..."
    if [ "$HAS_FEISHU" = true ]; then
        echo "  飞书同步: 已启用"
    else
        echo "  飞书同步: 未配置（将使用本地模式）"
        echo "  配置方法: 编辑 server/.env 填入飞书应用凭证"
    fi
    echo ""
    docker compose up -d --build
    echo ""
    echo "  工作台已启动"
    echo "  本地访问: http://localhost:8080"
    echo "  局域网访问: http://$(hostname -I | awk '{print $1}'):8080"
    echo ""
    echo "  停止服务: docker compose down"
    echo "  查看日志: docker compose logs -f"
    echo ""

# 方式2: Node.js（需要先安装依赖）
elif command -v node &> /dev/null; then
    echo "检测到 Node.js，正在启动..."
    cd "$(dirname "$0")/server"

    # 安装依赖
    if [ ! -d "node_modules" ]; then
        echo "  首次运行，正在安装依赖..."
        npm install
    fi

    # 检查 .env 文件
    if [ ! -f ".env" ]; then
        echo "  提示: 未找到 .env 文件，将使用本地模式"
        echo "  配置飞书同步: cp .env.example .env 并编辑填入凭证"
    fi
    echo ""
    cd "$(dirname "$0")"
    node server/server.js

# 方式3: Python（仅前端，无飞书同步）
elif command -v python3 &> /dev/null; then
    echo "检测到 Python3（仅前端模式，不支持飞书同步）"
    echo "  如需飞书同步，请安装 Docker 或 Node.js"
    echo ""
    cd "$(dirname "$0")"
    python3 -m http.server 8080

else
    echo "未检测到 Docker / Node.js / Python3"
    echo "请先安装其中任一工具"
    echo ""
    echo "推荐使用 Docker: https://docs.docker.com/get-docker"
    exit 1
fi
