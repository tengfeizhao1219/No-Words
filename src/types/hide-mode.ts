/**
 * 隐藏模式类型定义
 */

/**
 * 隐藏模式类型
 */
export type HideMode = 'phonetic' | 'def' | 'both' | 'none';

/**
 * 卡片显示状态
 */
export interface CardRevealState {
  [wordId: string]: boolean; // true = 显示，false = 隐藏
}

/**
 * 复习模式配置
 */
export interface ReviewModeConfig {
  hidePhonetic: boolean;
  hideDef: boolean;
  onlyDue: boolean;
  sortBy: 'ebbinghaus' | 'time' | 'random';
}

/**
 * 默认复习配置
 */
export const DEFAULT_REVIEW_CONFIG: ReviewModeConfig = {
  hidePhonetic: false,
  hideDef: true, // 默认隐藏释义，强制回忆
  onlyDue: true, // 默认只复习到期的
  sortBy: 'ebbinghaus',
};

/**
 * 检查是否应该隐藏内容
 */
export function shouldHide(mode: HideMode, targetType: 'phonetic' | 'def'): boolean {
  if (mode === 'none') return false;
  if (mode === 'both') return true;
  return mode === targetType;
}
