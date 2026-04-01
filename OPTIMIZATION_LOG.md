# 功能优化记录 - 方案 A

**实施时间**: 2026-04-01  
**目标**: 移植 WordMemeray 项目的精华功能到"不记单词"新项目

---

## ✅ 已完成的功能

### 1. 艾宾浩斯记忆曲线

**文件**: `src/lib/memory-curve.ts`

**核心功能**:
- ✅ 记忆曲线间隔：[1, 3, 7, 14, 30, 90] 天
- ✅ 根据复习表现动态调整下次复习时间
- ✅ 判断单词是否到期需要复习
- ✅ 计算待复习单词数量
- ✅ 记忆等级系统（0-6 级）
- ✅ 进度计算和等级描述

**关键函数**:
```typescript
getNextReviewTime(level: number) // 计算下次复习时间
isWordDue(word) // 判断是否到期
updateMemoryLevel(currentLevel, rating) // 更新记忆等级
calculateProgress(level) // 计算进度百分比
```

---

### 2. 词根拆解 + 记忆技巧

**文件**: `src/lib/word-analysis.ts`

**核心功能**:
- ✅ 前缀识别（35+ 常见前缀）
- ✅ 后缀识别（30+ 常见后缀）
- ✅ 词根识别（50+ 常见词根）
- ✅ 自动生成记忆技巧
- ✅ 完整的单词分析

**示例输出**:
```javascript
// 输入：unpredictable
{
  word: "unpredictable",
  roots: [
    { part: "un-", meaning: "否定/不", type: "前缀" },
    { part: "-able", meaning: "形容词后缀 (能够)", type: "后缀" },
    { part: "dict", meaning: "说", type: "词根" }
  ],
  tip: "联想记忆：把 "unpredictable" 拆成熟悉的音节，编一个小故事。"
}
```

---

### 3. 数据库 Schema 升级

**文件**: `supabase-schema.sql`

**新增字段**:
- `phonetic` - 发音
- `audio_url` - 发音音频 URL
- `meanings` - 详细释义（JSON）
- `roots` - 词根分析（JSON）
- `tip` - 记忆技巧
- `level` - 记忆等级（0-6）
- `next_review` - 下次复习时间

**新增索引**:
- `idx_words_next_review` - 优化复习查询
- `idx_words_level` - 优化等级查询

**优化视图**:
- `review_queue` - 智能复习队列（按优先级排序）

---

### 4. 隐藏模式支持

**文件**: `src/types/hide-mode.ts`

**功能类型**:
- `phonetic` - 隐藏读音
- `def` - 隐藏释义
- `both` - 全部隐藏
- `none` - 不隐藏

**配置选项**:
```typescript
ReviewModeConfig {
  hidePhonetic: boolean,
  hideDef: boolean,
  onlyDue: boolean,
  sortBy: 'ebbinghaus' | 'time' | 'random'
}
```

---

### 5. UI 样式优化

**文件**: `tailwind.config.js`

**新增配色**:
- 紫色主题（主色调）
- 蓝色辅助色
- 绿色（掌握/成功）
- 橙色（待复习/警告）
- 红色（困难/删除）

**新增阴影**:
- `shadow-card` - 卡片阴影
- `shadow-card-hover` - 悬停阴影
- `shadow-header` - 头部阴影

**新增动画**:
- `flip` - 翻面动画
- `fade-in` - 淡入
- `slide-up` - 上滑

---

## 📋 待完成的功能

### 第一阶段：核心功能集成（今天）
- [ ] 更新首页组件（集成词根分析）
- [ ] 更新词库组件（隐藏模式）
- [ ] 更新复习组件（艾宾浩斯算法）
- [ ] 集成真实翻译 API

### 第二阶段：UI 优化（明天）
- [ ] 应用新配色方案
- [ ] 添加卡片阴影和动画
- [ ] 优化移动端布局
- [ ] 添加加载动画

### 第三阶段：完善功能（后天）
- [ ] 浏览器提醒功能
- [ ] 学习统计页面
- [ ] 数据导出/导入
- [ ] 用户反馈收集

---

## 🎯 下一步行动

**立即开始**:
1. 更新首页组件（集成词根分析和记忆技巧）
2. 更新词库组件（添加隐藏模式）
3. 更新复习组件（使用艾宾浩斯算法）

**需要配置**:
1. Supabase 数据库（运行新的 schema）
2. Vercel 环境变量
3. 有道翻译 API（可选）

---

## 📊 对比改进

| 功能 | 改进前 | 改进后 |
|------|--------|--------|
| 记忆算法 | 简单标记 | 艾宾浩斯曲线（6 级） |
| 单词分析 | 无 | 词根拆解 + 记忆技巧 |
| 复习模式 | 翻面卡片 | 隐藏模式 + 智能排序 |
| UI 样式 | 基础样式 | 渐变色 + 阴影 + 动画 |
| 数据结构 | 简单字段 | 完整 JSON（释义/词根） |

---

*持续更新中...*
