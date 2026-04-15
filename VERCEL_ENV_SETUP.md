# Vercel环境变量配置指南

## 🔧 问题诊断
Vercel部署失败，错误信息：
```
The `vercel.json` schema validation failed with the following message: `env.VITE_SUPABASE_URL` should be string
```

## ✅ 已修复的问题
1. **vercel.json配置** - 已移除错误的`env`对象格式
2. **代码已推送** - 修复已提交到GitHub

## 🚀 需要你在Vercel控制台配置的环境变量

### 步骤1: 访问Vercel项目设置
1. 登录 https://vercel.com
2. 进入 No-Words 项目
3. 点击 **Settings** → **Environment Variables**

### 步骤2: 添加以下环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | `https://hrfqnlghcukysrclpsbq.supabase.co` | Supabase项目URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZnFubGdoY3VreXNyY2xwc2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjk2MTksImV4cCI6MjA5MDYwNTYxOX0.4CDjC77ZkOgITz6euIldQLMKuQsJZtUhM0c_e3Rsbk0` | Supabase匿名密钥 |
| `VITE_YOUDAO_APP_KEY` | `CFA0UQNEv8wn6zUdBBEdYwRsXazlsMWf` | 有道翻译App Key |
| `VITE_YOUDAO_APP_SECRET` | `0becfe1f56765761` | 有道翻译App Secret |
| `VITE_APP_ENV` | `production` | 环境标识 |

### 步骤3: 配置选项
对于每个环境变量：
1. **Environment** - 选择 **Production** (或 All Environments)
2. **Value** - 粘贴上面的值
3. **点击 Add**

### 步骤4: 重新部署
1. 回到项目概览页
2. 点击 **Redeploy** 或等待自动部署
3. 查看部署日志

## 📋 环境变量验证清单

### 必须配置的变量:
- [ ] `VITE_SUPABASE_URL` - Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase密钥
- [ ] `VITE_YOUDAO_APP_KEY` - 有道翻译Key
- [ ] `VITE_YOUDAO_APP_SECRET` - 有道翻译Secret

### 可选配置的变量:
- [ ] `VITE_APP_ENV` - 设置为`production`
- [ ] `VITE_APP_VERSION` - 应用版本号

## 🔍 验证配置是否正确

### 方法1: 检查部署日志
部署完成后，查看日志中是否有：
- ✅ `Environment Variables loaded`
- ✅ `Building with Vite`
- ✅ `Build completed successfully`

### 方法2: 测试应用功能
访问部署后的应用，测试：
1. **页面加载** - 是否正常显示？
2. **控制台错误** - 按F12查看Console
3. **网络请求** - API调用是否成功？

### 方法3: 检查环境变量生效
在浏览器控制台输入：
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('App Env:', import.meta.env.VITE_APP_ENV);
```

## 🆘 常见问题解决

### 问题1: 环境变量未生效
**症状**: 应用显示"Configuration missing"或API调用失败
**解决方案**:
1. 确认环境变量已添加到 **Production** 环境
2. 重新部署项目
3. 清除浏览器缓存后测试

### 问题2: Supabase连接失败
**症状**: 401 Unauthorized 错误
**解决方案**:
1. 检查 `VITE_SUPABASE_ANON_KEY` 是否正确
2. 验证Supabase项目是否启用
3. 检查CORS设置

### 问题3: 有道翻译API失败
**症状**: 翻译功能不可用
**解决方案**:
1. 检查 `VITE_YOUDAO_APP_KEY` 和 `VITE_YOUDAO_APP_SECRET`
2. 确认有道翻译API配额
3. 测试API直接调用

## 📞 需要帮助时

如果部署仍然失败，请提供：
1. **Vercel部署日志** (完整错误信息)
2. **环境变量配置截图**
3. **具体错误描述**

我会立即帮你分析解决！

## 🚀 快速操作步骤

1. **登录Vercel** → No-Words项目 → Settings → Environment Variables
2. **添加5个环境变量** (按上面表格)
3. **回到概览页** → 点击 Redeploy
4. **等待部署完成** → 访问在线链接测试

**预计时间**: 5-10分钟