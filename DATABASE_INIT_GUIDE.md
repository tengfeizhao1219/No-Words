# No-Words项目数据库初始化指南

## 🎯 目标
在Supabase控制台运行数据库初始化SQL脚本，创建No-Words项目所需的所有表、索引、视图和函数。

## 📋 前置要求
- 已创建Supabase项目：`no-words`
- 已获取URL和ANON_KEY
- 已登录Supabase控制台

## 🚀 详细步骤

### 步骤1：登录Supabase控制台
1. 访问：https://app.supabase.com
2. 使用你的账号登录
3. 选择 `no-words` 项目

### 步骤2：进入SQL Editor
1. 在左侧菜单中点击 **"SQL Editor"**
2. 点击 **"New query"** 按钮
3. 你会看到一个空白的SQL编辑器

### 步骤3：运行数据库初始化脚本
1. **复制完整的SQL脚本**（见下方）
2. **粘贴到SQL编辑器中**
3. **点击 "Run"** 按钮执行

## 📜 完整SQL脚本

```sql
-- 不记单词 - Supabase 数据库初始化脚本
-- 执行方式：在 Supabase 控制台的 SQL Editor 中运行此脚本

-- ============================================
-- 1. 创建用户表（扩展 Supabase 默认的 auth.users）
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用行级安全策略（RLS）
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的数据
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- ============================================
-- 2. 创建单词表
-- ============================================
CREATE TABLE IF NOT EXISTS public.words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  phonetic TEXT,  -- 发音
  audio_url TEXT,  -- 发音音频 URL
  meanings JSONB,  -- 详细释义 [{pos: string, defs: [{def: string, example: string}]}]
  roots JSONB,  -- 词根分析 [{part: string, meaning: string, type: string}]
  tip TEXT,  -- 记忆技巧
  original_text TEXT,  -- 原句（如果是句子翻译）
  mastered BOOLEAN DEFAULT FALSE,  -- 是否已掌握
  level INTEGER DEFAULT 0,  -- 记忆等级（0-6，对应艾宾浩斯曲线）
  next_review TIMESTAMPTZ,  -- 下次复习时间
  review_count INTEGER DEFAULT 0,  -- 复习次数
  last_reviewed_at TIMESTAMPTZ,  -- 上次复习时间
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引（提高查询性能）
CREATE INDEX IF NOT EXISTS idx_words_user_id ON public.words(user_id);
CREATE INDEX IF NOT EXISTS idx_words_created_at ON public.words(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_words_mastered ON public.words(user_id, mastered);
CREATE INDEX IF NOT EXISTS idx_words_next_review ON public.words(user_id, next_review);

-- 启用行级安全策略（RLS）
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的单词
CREATE POLICY "Users can view own words"
  ON public.words
  FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的单词
CREATE POLICY "Users can insert own words"
  ON public.words
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能更新自己的单词
CREATE POLICY "Users can update own words"
  ON public.words
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的单词
CREATE POLICY "Users can delete own words"
  ON public.words
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. 创建学习记录表
-- ============================================
CREATE TABLE IF NOT EXISTS public.study_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  word_id UUID REFERENCES public.words(id) ON DELETE CASCADE NOT NULL,
  study_type TEXT NOT NULL,  -- 'learn', 'review', 'test'
  result BOOLEAN,  -- true: 正确, false: 错误
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_study_records_user_id ON public.study_records(user_id);
CREATE INDEX IF NOT EXISTS idx_study_records_word_id ON public.study_records(word_id);
CREATE INDEX IF NOT EXISTS idx_study_records_created_at ON public.study_records(created_at DESC);

-- 启用行级安全策略（RLS）
ALTER TABLE public.study_records ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的学习记录
CREATE POLICY "Users can view own study records"
  ON public.study_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的学习记录
CREATE POLICY "Users can insert own study records"
  ON public.study_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. 创建复习计划表
-- ============================================
CREATE TABLE IF NOT EXISTS public.review_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  daily_target INTEGER DEFAULT 20,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用行级安全策略（RLS）
ALTER TABLE public.review_plans ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的复习计划
CREATE POLICY "Users can view own review plans"
  ON public.review_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：用户只能管理自己的复习计划
CREATE POLICY "Users can manage own review plans"
  ON public.review_plans
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 5. 创建函数和触发器
-- ============================================
-- 创建更新时间的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为profiles表创建触发器
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为words表创建触发器
DROP TRIGGER IF EXISTS update_words_updated_at ON public.words;
CREATE TRIGGER update_words_updated_at
  BEFORE UPDATE ON public.words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为review_plans表创建触发器
DROP TRIGGER IF EXISTS update_review_plans_updated_at ON public.review_plans;
CREATE TRIGGER update_review_plans_updated_at
  BEFORE UPDATE ON public.review_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. 创建视图（简化常用查询）
-- ============================================
-- 用户学习统计视图
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  w.user_id,
  COUNT(DISTINCT w.id) as total_words,
  COUNT(DISTINCT CASE WHEN w.mastered = true THEN w.id END) as mastered_words,
  COUNT(DISTINCT CASE WHEN w.next_review <= NOW() THEN w.id END) as words_to_review,
  AVG(w.level) as avg_level,
  MAX(w.created_at) as last_word_added
FROM public.words w
GROUP BY w.user_id;

-- 今日学习统计视图
CREATE OR REPLACE VIEW public.today_study_stats AS
SELECT 
  sr.user_id,
  COUNT(DISTINCT sr.word_id) as words_studied_today,
  SUM(CASE WHEN sr.result = true THEN 1 ELSE 0 END) as correct_answers_today,
  AVG(sr.time_spent_seconds) as avg_time_per_word
FROM public.study_records sr
WHERE sr.created_at >= CURRENT_DATE
GROUP BY sr.user_id;

-- ============================================
-- 7. 创建存储过程（常用操作）
-- ============================================
-- 获取需要复习的单词
CREATE OR REPLACE FUNCTION get_words_to_review(user_uuid UUID)
RETURNS TABLE (
  word_id UUID,
  word TEXT,
  translation TEXT,
  phonetic TEXT,
  meanings JSONB,
  level INTEGER,
  review_count INTEGER,
  days_since_last_review INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.word,
    w.translation,
    w.phonetic,
    w.meanings,
    w.level,
    w.review_count,
    EXTRACT(DAY FROM NOW() - w.last_reviewed_at)::INTEGER
  FROM public.words w
  WHERE w.user_id = user_uuid
    AND w.next_review <= NOW()
    AND w.mastered = false
  ORDER BY w.next_review ASC, w.level ASC;
END;
$$ LANGUAGE plpgsql;

-- 更新单词复习状态
CREATE OR REPLACE FUNCTION update_word_review(
  word_uuid UUID,
  is_correct BOOLEAN,
  review_time_seconds INTEGER
)
RETURNS VOID AS $$
DECLARE
  current_level INTEGER;
  new_level INTEGER;
  next_review_interval INTERVAL;
BEGIN
  -- 获取当前等级
  SELECT level INTO current_level
  FROM public.words WHERE id = word_uuid;
  
  -- 根据答题结果调整等级（艾宾浩斯遗忘曲线）
  IF is_correct THEN
    new_level := LEAST(current_level + 1, 6);
    -- 正确：增加复习间隔
    next_review_interval := CASE new_level
      WHEN 0 THEN INTERVAL '20 minutes'
      WHEN 1 THEN INTERVAL '1 hour'
      WHEN 2 THEN INTERVAL '9 hours'
      WHEN 3 THEN INTERVAL '1 day'
      WHEN 4 THEN INTERVAL '2 days'
      WHEN 5 THEN INTERVAL '6 days'
      WHEN 6 THEN INTERVAL '31 days'
    END;
  ELSE
    new_level := GREATEST(current_level - 2, 0);
    -- 错误：缩短复习间隔
    next_review_interval := CASE new_level
      WHEN 0 THEN INTERVAL '20 minutes'
      WHEN 1 THEN INTERVAL '1 hour'
      WHEN 2 THEN INTERVAL '9 hours'
      WHEN 3 THEN INTERVAL '1 day'
      WHEN 4 THEN INTERVAL '2 days'
      WHEN 5 THEN INTERVAL '6 days'
      WHEN 6 THEN INTERVAL '31 days'
    END;
  END IF;
  
  -- 更新单词记录
  UPDATE public.words
  SET 
    level = new_level,
    review_count = review_count + 1,
    last_reviewed_at = NOW(),
    next_review = NOW() + next_review_interval,
    updated_at = NOW(),
    mastered = CASE WHEN new_level >= 6 THEN true ELSE mastered END
  WHERE id = word_uuid;
END;
$$ LANGUAGE plpgsql;

-- 获取用户今日学习进度
CREATE OR REPLACE FUNCTION get_today_progress(user_uuid UUID)
RETURNS TABLE (
  total_words_today INTEGER,
  correct_words_today INTEGER,
  accuracy_rate DECIMAL,
  total_time_seconds INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT sr.word_id)::INTEGER,
    SUM(CASE WHEN sr.result = true THEN 1 ELSE 0 END)::INTEGER,
    CASE 
      WHEN COUNT(DISTINCT sr.word_id) > 0 
      THEN ROUND(SUM(CASE WHEN sr.result = true THEN 1.0 ELSE 0.0 END) / COUNT(DISTINCT sr.word_id) * 100, 2)
      ELSE 0.0 
    END,
    COALESCE(SUM(sr.time_spent_seconds), 0)::INTEGER
  FROM public.study_records sr
  WHERE sr.user_id = user_uuid
    AND sr.created_at >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
```

## ✅ 执行验证

### 验证步骤1：检查表是否创建成功
1. 在Supabase控制台，点击左侧菜单的 **"Table Editor"**
2. 应该能看到以下表：
   - `profiles`（用户资料）
   - `words`（单词表）
   - `study_records`（学习记录）
   - `review_plans`（复习计划）

### 验证步骤2：检查RLS策略
1. 点击任意表
2. 查看 **"Policies"** 标签页
3. 应该能看到对应的行级安全策略

### 验证步骤3：检查视图和函数
1. 在SQL Editor中运行测试查询：
```sql
-- 测试视图
SELECT * FROM public.user_stats LIMIT 5;

-- 测试函数
SELECT * FROM get_words_to_review('00000000-0000-0000-0000-000000000000');
```

## 🚨 常见问题解决

### 问题1：SQL脚本执行错误
**症状**: 执行时出现语法错误
**解决**:
1. 检查SQL语法
2. 确保没有重复创建表
3. 可以分段执行（先创建表，再创建策略）

### 问题2：权限不足
**症状**: 无法创建表或函数
**解决**:
1. 确保使用项目所有者账号
2. 检查数据库权限设置
3. 联系Supabase支持

### 问题3：表已存在
**症状**: "relation already exists" 错误
**解决**:
1. 先删除已存在的表（如果测试环境）
2. 或修改脚本使用 `CREATE TABLE IF NOT EXISTS`

## 🎯 完成标志

### 必须完成
- [ ] 所有表创建成功
- [ ] RLS策略生效
- [ ] 索引创建成功
- [ ] 视图和函数创建成功

### 建议验证
- [ ] 测试插入数据
- [ ] 测试查询数据
- [ ] 验证RLS策略限制

## 🔄 后续步骤

数据库初始化完成后，我们可以：
1. **本地运行测试**：验证应用功能
2. **部署到Vercel**：上线生产环境
3. **配置监控**：设置数据库监控

---

**现在请你在Supabase控制台运行上面的SQL脚本，完成后告诉我，我们继续下一步。**