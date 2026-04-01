# 不记单词 - 部署指南

## 📋 前置准备

### 1. Supabase 数据库配置

**步骤**：

1. 访问 [Supabase](https://supabase.com) 创建账号（免费）

2. 创建新项目
   - 项目名称：`no-words`
   - 数据库密码：（记住这个密码）
   - 区域：选择离你最近的（亚洲选 `Singapore`）

3. 运行数据库初始化脚本
   - 进入项目控制台 → SQL Editor
   - 复制 `supabase-schema.sql` 文件内容
   - 粘贴并运行

4. 获取 API 配置
   - Settings → API
   - 复制 `Project URL` 和 `anon public` key

5. 启用 Email 认证
   - Authentication → Providers
   - 启用 `Email`
   - 关闭 `Confirm email`（可选，简化登录流程）

---

### 2. 有道翻译 API 申请（可选，后期配置）

**步骤**：

1. 访问 [有道智云](https://ai.youdao.com/)

2. 注册账号并实名认证

3. 创建应用
   - 选择 `翻译服务` → `文本翻译`
   - 应用名称：`不记单词`

4. 获取密钥
   - 应用管理 → 查看 `App Key` 和 `Secret Key`

---

## 🚀 本地开发

```bash
# 克隆项目
git clone https://github.com/tengfeizhao1219/No-Words.git
cd No-Words

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入 Supabase 配置

# 启动开发服务器
npm run dev
```

---

## 🌐 部署到 Vercel

### 方式一：一键部署（推荐）

1. 访问 [Vercel](https://vercel.com)

2. 登录并导入 GitHub 项目
   - Import Git Repository → 选择 `No-Words`

3. 配置环境变量
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. 点击 Deploy

### 方式二：CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

---

## 📱 PWA 配置（待完成）

1. 创建 `manifest.json`
2. 配置 Service Worker
3. 添加离线缓存
4. 测试添加到主屏幕功能

---

## ✅ 检查清单

部署完成后检查：

- [ ] 可以访问网站
- [ ] 邮箱登录功能正常
- [ ] 查询单词可以保存
- [ ] 词库页面显示数据
- [ ] 闪卡复习功能正常
- [ ] 移动端适配良好

---

## 🆘 常见问题

### Q: Supabase 连接失败？
A: 检查 `.env` 文件中的 URL 和 Key 是否正确，确保没有多余空格。

### Q: 翻译 API 报错？
A: 检查有道 API 密钥是否正确，确认账户有免费额度。

### Q: 部署后无法登录？
A: 在 Supabase 控制台的 Authentication → URL Configuration 中添加 Vercel 域名到白名单。

---

## 📞 支持

遇到问题？查看：
- [Supabase 文档](https://supabase.com/docs)
- [Vercel 文档](https://vercel.com/docs)
- [有道翻译 API 文档](https://ai.youdao.com/DOCSIRMA/html/trans/api/wbfy/index.html)
