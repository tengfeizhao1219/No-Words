# Supabase 配置指南

## 🚀 快速开始

### 1. 创建Supabase项目
1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用GitHub账号登录
4. 创建新组织（Organization）
5. 创建新项目（Project）

### 2. 项目配置
- **项目名称**: `no-words`（或你喜欢的名称）
- **数据库密码**: 保存好，后续需要
- **地区**: 选择离你最近的地区（如 `ap-southeast-1`）
- **定价计划**: 选择 **Free Plan**

### 3. 初始化数据库
1. 进入项目后，点击左侧菜单的 **SQL Editor**
2. 点击 **New query**
3. 复制 `supabase-schema.sql` 的全部内容
4. 点击 **Run** 执行SQL脚本
5. 等待执行完成（约10-30秒）

### 4. 配置认证
1. 点击左侧菜单的 **Authentication**
2. 点击 **Providers**
3. 启用 **Email** 认证
4. 配置邮箱设置（可选）:
   - 发件人地址: `no-reply@yourdomain.com`
   - 确认链接有效期: 24小时
   - 重定向URL: 你的应用URL

### 5. 获取API密钥
1. 点击左侧菜单的 **Settings**
2. 点击 **API**
3. 复制以下信息:
   - **Project URL**: 作为 `VITE_SUPABASE_URL`
   - **anon public**: 作为 `VITE_SUPABASE_ANON_KEY`
   - **service_role**: 保存好，不要在前端使用

## 🔧 环境变量配置

### 创建 `.env.local` 文件
```bash
# 复制示例文件
cp .env.local.example .env.local

# 编辑 .env.local
nano .env.local
```

### 配置内容
```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# 开发服务器配置
VITE_DEV_SERVER_PORT=5173
```

## 📊 验证配置

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 测试数据库连接
1. 打开浏览器访问 http://localhost:5173
2. 尝试注册/登录
3. 查询单词并保存
4. 检查Supabase控制台的数据表

### 3. 检查数据表
1. 在Supabase控制台点击 **Table Editor**
2. 应该能看到两个表:
   - `profiles` - 用户信息
   - `words` - 单词数据
3. 检查数据是否正确插入

## 🛡️ 安全配置

### 1. 行级安全策略（RLS）
- 已通过SQL脚本自动配置
- 用户只能访问自己的数据
- 防止数据泄露

### 2. CORS配置
1. 在Supabase控制台点击 **Settings**
2. 点击 **API**
3. 在 **CORS** 部分添加:
   - `http://localhost:5173`（开发环境）
   - `https://your-domain.com`（生产环境）
   - `https://*.vercel.app`（如果使用Vercel）

### 3. 速率限制
- Free Plan: 500请求/秒
- 对于个人使用完全足够
- 如果需要更高限制，可升级到Pro Plan

## 🔄 数据迁移

### 从开发环境到生产环境
1. **导出开发数据**:
   ```sql
   -- 在开发环境的SQL Editor中运行
   COPY (SELECT * FROM public.words) TO '/tmp/words.csv' WITH CSV HEADER;
   COPY (SELECT * FROM public.profiles) TO '/tmp/profiles.csv' WITH CSV HEADER;
   ```

2. **导入到生产环境**:
   ```sql
   -- 在生产环境的SQL Editor中运行
   COPY public.words FROM '/tmp/words.csv' WITH CSV HEADER;
   COPY public.profiles FROM '/tmp/profiles.csv' WITH CSV HEADER;
   ```

### 备份和恢复
1. **手动备份**:
   - 在Supabase控制台点击 **Settings**
   - 点击 **Database**
   - 点击 **Backups** → **Create backup**

2. **自动备份**:
   - Free Plan: 每天自动备份
   - 保留7天备份
   - 可手动下载备份文件

## 🚨 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查环境变量
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# 测试连接
curl -X GET "$VITE_SUPABASE_URL/rest/v1/" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
```

#### 2. 认证失败
- 检查Supabase的 **Authentication** → **Providers** 配置
- 确保邮箱认证已启用
- 检查邮箱验证链接是否正常发送

#### 3. 数据插入失败
- 检查RLS策略是否正确配置
- 确认用户已登录
- 检查数据表结构是否匹配

#### 4. CORS错误
```bash
# 检查浏览器控制台错误
# 在Supabase中添加正确的CORS域名
```

### 调试方法
1. **浏览器开发者工具**:
   - Network标签查看API请求
   - Console标签查看错误信息
   - Application标签查看LocalStorage

2. **Supabase日志**:
   - 在控制台点击 **Logs**
   - 查看数据库操作日志
   - 查看认证日志

3. **前端日志**:
   ```javascript
   // 在代码中添加调试日志
   console.log('API Response:', data);
   console.error('API Error:', error);
   ```

## 📈 性能优化

### 数据库优化
1. **索引优化**:
   - 已为常用查询字段创建索引
   - 定期检查查询性能

2. **查询优化**:
   - 使用分页查询大量数据
   - 避免全表扫描
   - 使用合适的WHERE条件

### 前端优化
1. **请求合并**:
   - 批量保存单词
   - 使用缓存减少重复请求

2. **离线支持**:
   - Service Worker缓存静态资源
   - LocalStorage存储临时数据

## 🔄 版本升级

### 数据库结构变更
1. **添加新字段**:
   ```sql
   ALTER TABLE public.words ADD COLUMN new_column TEXT;
   ```

2. **修改字段类型**:
   ```sql
   ALTER TABLE public.words ALTER COLUMN column_name TYPE new_type;
   ```

3. **删除字段**:
   ```sql
   ALTER TABLE public.words DROP COLUMN column_name;
   ```

### 数据迁移脚本
```sql
-- 示例：添加新字段并迁移数据
ALTER TABLE public.words ADD COLUMN tags TEXT[];
UPDATE public.words SET tags = ARRAY['default'] WHERE tags IS NULL;
```

## 🎯 最佳实践

### 1. 环境分离
- **开发环境**: `localhost:5173`
- **测试环境**: `staging.yourdomain.com`
- **生产环境**: `yourdomain.com`

### 2. 密钥管理
- 永远不要提交 `.env.local` 到Git
- 使用环境变量存储敏感信息
- 定期轮换API密钥

### 3. 监控告警
- 设置数据库使用率告警
- 监控API请求频率
- 设置错误率告警

### 4. 定期维护
- 每月检查数据库性能
- 清理过期数据
- 更新依赖包

## 📞 支持资源

### 官方文档
- **Supabase文档**: https://supabase.com/docs
- **React Supabase**: https://supabase.com/docs/guides/getting-started/tutorials/with-react
- **API参考**: https://supabase.com/docs/reference

### 社区支持
- **GitHub Issues**: https://github.com/supabase/supabase/issues
- **Discord社区**: https://discord.supabase.com
- **Stack Overflow**: `supabase` 标签

### 付费支持
- **Supabase Pro**: 包含技术支持
- **Supabase Enterprise**: 专属客户经理

## ✅ 完成检查清单

- [ ] 创建Supabase项目
- [ ] 执行数据库初始化脚本
- [ ] 配置邮箱认证
- [ ] 获取API密钥
- [ ] 配置环境变量
- [ ] 测试数据库连接
- [ ] 配置CORS
- [ ] 测试完整功能

---

**配置完成后，你的"不记单词"应用将具备完整的云端数据同步功能！**