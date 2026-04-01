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
CREATE INDEX IF NOT EXISTS idx_words_level ON public.words(user_id, level);

-- 启用行级安全策略（RLS）
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的单词
CREATE POLICY "Users can view own words"
  ON public.words
  FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：用户可以插入自己的单词
CREATE POLICY "Users can insert own words"
  ON public.words
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户可以更新自己的单词
CREATE POLICY "Users can update own words"
  ON public.words
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 创建策略：用户可以删除自己的单词
CREATE POLICY "Users can delete own words"
  ON public.words
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. 创建自动更新 updated_at 的触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 profiles 表创建触发器
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 words 表创建触发器
CREATE TRIGGER update_words_updated_at
  BEFORE UPDATE ON public.words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. 创建复习队列视图（待复习的单词）
-- ============================================
CREATE OR REPLACE VIEW public.review_queue AS
SELECT 
  id,
  user_id,
  word,
  translation,
  phonetic,
  audio_url,
  meanings,
  roots,
  tip,
  level,
  next_review,
  review_count,
  mastered,
  CASE
    WHEN mastered = TRUE THEN 3  -- 已掌握，优先级最低
    WHEN next_review IS NULL THEN 0  -- 从未复习，优先级最高
    WHEN next_review <= NOW() THEN 1  -- 到期需要复习
    ELSE 2  -- 未到期
  END as priority,
  CASE
    WHEN next_review IS NULL THEN 0
    WHEN next_review <= NOW() THEN 0
    ELSE EXTRACT(DAY FROM (next_review - NOW()))::INTEGER
  END as days_until_review
FROM public.words
ORDER BY priority, next_review ASC NULLS FIRST;

-- ============================================
-- 完成提示
-- ============================================
-- ✅ 数据库表结构创建完成！
-- 接下来：
-- 1. 在 Supabase 控制台启用 Email 认证
-- 2. 获取 SUPABASE_URL 和 SUPABASE_ANON_KEY
-- 3. 更新项目的 .env 文件
