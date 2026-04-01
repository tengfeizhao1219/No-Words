/**
 * 艾宾浩斯记忆曲线算法
 * 
 * 复习间隔：[1, 3, 7, 14, 30, 90] 天
 * 根据用户的复习表现动态调整下次复习时间
 */

// 记忆曲线间隔（单位：天）
export const MEMORY_CURVE_INTERVALS = [1, 3, 7, 14, 30, 90];

/**
 * 计算下次复习时间
 * @param level 当前记忆等级（0-5）
 * @returns 下次复习的毫秒时间戳
 */
export function getNextReviewTime(level: number): number {
  const interval = MEMORY_CURVE_INTERVALS[Math.min(level, MEMORY_CURVE_INTERVALS.length - 1)] || 90;
  return Date.now() + interval * 24 * 60 * 60 * 1000;
}

/**
 * 判断单词是否到期需要复习
 * @param word 单词对象
 * @returns 是否需要复习
 */
export function isWordDue(word: {
  mastered?: boolean;
  nextReview?: number | null;
}): boolean {
  if (word.mastered) return false;
  if (!word.nextReview) return true;
  return Date.now() >= word.nextReview;
}

/**
 * 计算待复习单词数量
 * @param words 单词列表
 * @returns 待复习数量
 */
export function countDueWords(words: Array<{ mastered?: boolean; nextReview?: number | null }>): number {
  return words.filter(isWordDue).length;
}

/**
 * 根据复习表现更新记忆等级
 * @param currentLevel 当前等级
 * @param rating 用户评分（1=困难，3=一般，5=简单）
 * @returns 新的记忆等级
 */
export function updateMemoryLevel(currentLevel: number, rating: number): number {
  if (rating >= 5) {
    // 简单：提升等级
    return Math.min(currentLevel + 1, MEMORY_CURVE_INTERVALS.length);
  } else if (rating >= 3) {
    // 一般：保持当前等级
    return currentLevel;
  } else {
    // 困难：降级到上一级（最低为 0）
    return Math.max(0, currentLevel - 1);
  }
}

/**
 * 计算单词的记忆进度
 * @param level 当前记忆等级
 * @returns 进度百分比（0-100）
 */
export function calculateProgress(level: number): number {
  return Math.min((level / MEMORY_CURVE_INTERVALS.length) * 100, 100);
}

/**
 * 获取记忆等级的文字描述
 * @param level 记忆等级
 * @returns 描述文字
 */
export function getLevelDescription(level: number): string {
  const descriptions = [
    '新单词',
    '初步记忆',
    '短期记忆',
    '中期记忆',
    '长期记忆',
    '牢固记忆',
    '永久记忆'
  ];
  return descriptions[Math.min(level, descriptions.length - 1)];
}

/**
 * 计算距离下次复习的天数
 * @param nextReview 下次复习时间
 * @returns 天数（负数表示已过期）
 */
export function getDaysUntilReview(nextReview?: number | null): number {
  if (!nextReview) return 0;
  const diff = nextReview - Date.now();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

/**
 * 获取复习紧迫程度
 * @param nextReview 下次复习时间
 * @returns 'urgent' | 'soon' | 'later' | 'mastered'
 */
export function getReviewUrgency(nextReview?: number | null, mastered?: boolean): string {
  if (mastered) return 'mastered';
  if (!nextReview) return 'urgent';
  
  const days = getDaysUntilReview(nextReview);
  if (days <= 0) return 'urgent';
  if (days <= 3) return 'soon';
  return 'later';
}
