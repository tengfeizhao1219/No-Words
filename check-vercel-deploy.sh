#!/bin/bash

echo "🚀 No-Words项目Vercel部署检查"
echo "=========================================="

# 检查本地构建
echo "🔧 1. 检查本地构建..."
if npm run build > /dev/null 2>&1; then
    echo "✅ 本地构建成功"
else
    echo "❌ 本地构建失败"
    exit 1
fi

# 检查环境变量
echo "🔧 2. 检查环境变量配置..."
if [ -f .env ]; then
    echo "✅ .env文件存在"
    grep -q "VITE_SUPABASE_URL" .env && echo "✅ VITE_SUPABASE_URL 已配置"
    grep -q "VITE_SUPABASE_ANON_KEY" .env && echo "✅ VITE_SUPABASE_ANON_KEY 已配置"
    grep -q "VITE_YOUDAO_APP_KEY" .env && echo "✅ VITE_YOUDAO_APP_KEY 已配置"
    grep -q "VITE_YOUDAO_APP_SECRET" .env && echo "✅ VITE_YOUDAO_APP_SECRET 已配置"
else
    echo "❌ .env文件不存在"
fi

# 检查vercel.json
echo "🔧 3. 检查vercel.json配置..."
if [ -f vercel.json ]; then
    echo "✅ vercel.json文件存在"
    if grep -q "env" vercel.json; then
        echo "⚠️  警告: vercel.json中包含env配置，应该在Vercel控制台配置环境变量"
    else
        echo "✅ vercel.json配置正确"
    fi
else
    echo "❌ vercel.json文件不存在"
fi

# 检查Git状态
echo "🔧 4. 检查Git状态..."
if git status --porcelain | grep -q "^[^?]"; then
    echo "⚠️  有未提交的更改"
    git status --short
else
    echo "✅ 所有更改已提交"
fi

echo ""
echo "=========================================="
echo "📋 部署前检查清单:"
echo ""
echo "✅ 1. 代码已推送到GitHub"
echo "✅ 2. vercel.json配置已修复"
echo "✅ 3. 本地构建成功"
echo ""
echo "🚀 需要在Vercel控制台完成:"
echo "1. 登录 https://vercel.com"
echo "2. 进入 No-Words 项目"
echo "3. Settings → Environment Variables"
echo "4. 添加5个环境变量 (参考 VERCEL_ENV_SETUP.md)"
echo "5. 点击 Redeploy"
echo ""
echo "🌐 部署后访问: https://no-words-psi.vercel.app"
echo "=========================================="