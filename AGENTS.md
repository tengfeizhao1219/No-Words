# AGENTS.md - 不记单词项目开发指南

## 🚀 Vercel 部署检查清单

**部署前必须执行的检查**：

### 1. 运行检查脚本
```bash
cd no-words
./scripts/vercel-check.sh
```

### 2. 手动验证（如果脚本不可用）

**Git 文件完整性**：
```bash
# 检查未提交的文件
git status

# 验证关键文件已跟踪
git ls-files src | grep -E "(main\.tsx|App\.tsx|index\.css)"
```

**本地构建测试**：
```bash
npm install --legacy-peer-deps
npm run build
```

**GitHub 文件验证**：
```bash
# 检查 GitHub 上的文件
curl -H "Authorization: token TOKEN" \
  https://api.github.com/repos/tengfeizhao1219/No-Words/contents/src
```

### 3. 部署到 Vercel

**自动部署**：
- 推送到 main 分支后，Vercel 自动部署
- 查看状态：https://vercel.com/dashboard

**手动部署**：
```bash
npx vercel --prod
```

---

## 📋 常见问题及解决方案

### Q1: 构建失败 - 找不到文件
**错误**：`Could not resolve './App.tsx'`

**原因**：文件未推送到 GitHub

**解决**：
1. 检查本地文件：`ls -la src/`
2. 检查 GitHub 文件：`git ls-files src/`
3. 提交缺失文件：`git add . && git commit -m "fix: add missing files"`
4. 重新推送：`git push`

### Q2: 构建失败 - tsconfig 问题
**错误**：`Cannot read file 'tsconfig.json'`

**原因**：使用了 `tsc -b` 构建模式

**解决**：
- 构建命令改为 `vite build`（已在 package.json 中修复）

### Q3: npm ci 失败
**错误**：`package-lock.json not in sync`

**原因**：package.json 和 lock 文件不同步

**解决**：
- 使用 `npm install --legacy-peer-deps`（已在 vercel.json 中配置）

---

## 🛠️ 技术栈

| 模块 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 19.2.4 |
| 构建工具 | Vite | 8.0.3 |
| 样式 | Tailwind CSS | 3.4.1 |
| 类型 | TypeScript | 5.9.3 |
| PWA | vite-plugin-pwa | 1.2.0 |
| 数据库 | Supabase | 2.101.1 |
| 部署 | Vercel | - |

---

## 📦 构建命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 本地预览
npm run preview

# 部署前检查
./scripts/vercel-check.sh
```

---

## 🔐 环境变量

需要配置的环境变量（在 Vercel 设置）：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📝 重要原则

### 1. 文件同步优先
- 任何代码修改后，先 `git add && git commit && git push`
- 部署前必须验证 GitHub 文件完整性
- 不要假设 Git 已跟踪所有文件

### 2. 构建命令简洁
- 只用 `vite build`，不单独运行 `tsc -b`
- Vite 会自动处理 TypeScript 转译

### 3. 依赖安装宽松
- 使用 `npm install --legacy-peer-deps`
- 避免 `npm ci`（除非 lock 文件完全同步）

### 4. 本地验证优先
- 部署前先在本地运行 `npm run build`
- 本地构建成功后再推送到 GitHub

---

## 🎯 下一步行动

- [ ] 创建 Supabase 数据库
- [ ] 配置环境变量
- [ ] 测试完整功能
- [ ] 优化 PWA 体验
- [ ] 添加域名绑定

---

*最后更新：2026-04-01*
