#!/bin/bash

# Vercel 部署前检查脚本
# 用法：./scripts/vercel-check.sh

set -e

echo "🔍 Vercel 部署前检查"
echo "===================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
PASS=0
FAIL=0
WARN=0

check_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARN++))
}

# 1. Git 状态检查
echo "📦 1. Git 状态检查"
echo "-------------------"

if git status --porcelain | grep -q .; then
    check_warn "有未提交的文件变更"
    git status --short
else
    check_pass "所有文件已提交"
fi

# 2. Git 文件完整性
echo ""
echo "📄 2. Git 跟踪的文件检查"
echo "-----------------------"

SRC_FILES=$(git ls-files src | wc -l)
echo "Git 跟踪的 src 文件数：$SRC_FILES"

if [ $SRC_FILES -lt 10 ]; then
    check_fail "src 目录文件过少（当前：$SRC_FILES）"
else
    check_pass "src 文件数量正常（$SRC_FILES 个）"
fi

# 3. 关键文件检查
echo ""
echo "🔑 3. 关键文件检查"
echo "-----------------"

CRITICAL_FILES=(
    "src/main.tsx"
    "src/App.tsx"
    "src/index.css"
    "package.json"
    "vercel.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if git ls-files --error-unmatch "$file" &>/dev/null; then
        check_pass "$file 已跟踪"
    else
        check_fail "$file 未被 Git 跟踪"
    fi
done

# 4. 本地构建测试
echo ""
echo "🔨 4. 本地构建测试"
echo "-----------------"

if [ ! -f "node_modules/.bin/vite" ]; then
    check_warn "node_modules 不存在，需要先安装依赖"
else
    echo "执行本地构建..."
    if npm run build &>/dev/null; then
        check_pass "本地构建成功"
    else
        check_fail "本地构建失败"
    fi
fi

# 5. Vercel 配置检查
echo ""
echo "⚙️  5. Vercel 配置检查"
echo "---------------------"

if [ -f "vercel.json" ]; then
    check_pass "vercel.json 存在"
    
    # 检查构建命令
    BUILD_CMD=$(grep -o '"buildCommand": "[^"]*"' vercel.json | cut -d'"' -f4)
    echo "构建命令：$BUILD_CMD"
    
    if [[ "$BUILD_CMD" == *"tsc -b"* ]]; then
        check_warn "构建命令包含 'tsc -b'，可能在 Vercel 上失败"
    else
        check_pass "构建命令简洁"
    fi
else
    check_fail "vercel.json 不存在"
fi

# 6. 环境变量检查
echo ""
echo "🔐 6. 环境变量检查"
echo "-----------------"

if [ -f ".env.example" ]; then
    check_pass ".env.example 存在"
    echo "需要配置的环境变量："
    grep -v "^#" .env.example | grep -v "^$" | while read line; do
        echo "  - $line"
    done
else
    check_warn ".env.example 不存在"
fi

# 7. GitHub 文件同步检查（可选）
echo ""
echo "🌐 7. GitHub 文件同步检查（可选）"
echo "--------------------------------"

if command -v gh &> /dev/null; then
    echo "使用 GitHub CLI 检查远程文件..."
    REMOTE_FILES=$(gh api repos/tengfeizhao1219/No-Words/contents/src --paginate | jq -r '.[].name' | wc -l)
    echo "GitHub 上 src 目录文件数：$REMOTE_FILES"
    
    if [ $REMOTE_FILES -lt $SRC_FILES ]; then
        check_warn "GitHub 文件数少于本地（GitHub: $REMOTE_FILES, 本地：$SRC_FILES）"
    else
        check_pass "GitHub 文件同步完整"
    fi
else
    check_warn "未安装 GitHub CLI，跳过远程检查"
    echo "提示：安装 gh CLI 可以自动检查 GitHub 文件"
fi

# 总结
echo ""
echo "===================="
echo "📊 检查总结"
echo "===================="
echo -e "${GREEN}通过：$PASS${NC}"
echo -e "${YELLOW}警告：$WARN${NC}"
echo -e "${RED}失败：$FAIL${NC}"
echo ""

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}❌ 发现 $FAIL 个问题，建议修复后再部署${NC}"
    exit 1
elif [ $WARN -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $WARN 个警告，可以部署但需注意${NC}"
    exit 0
else
    echo -e "${GREEN}✅ 所有检查通过，可以安全部署！${NC}"
    exit 0
fi
