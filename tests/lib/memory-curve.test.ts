import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  MEMORY_CURVE_INTERVALS,
  getNextReviewTime,
  isWordDue,
  countDueWords,
  updateMemoryLevel,
  calculateProgress,
  getLevelDescription,
  getDaysUntilReview,
  getReviewUrgency
} from '../../src/lib/memory-curve'

describe('memory-curve', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('MEMORY_CURVE_INTERVALS', () => {
    it('应该有正确的间隔天数', () => {
      expect(MEMORY_CURVE_INTERVALS).toEqual([1, 3, 7, 14, 30, 90])
    })
  })

  describe('getNextReviewTime', () => {
    it('应该根据等级计算下次复习时间', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      
      const level0 = getNextReviewTime(0)
      expect(level0).toBe(now + 1 * 24 * 60 * 60 * 1000)
      
      const level2 = getNextReviewTime(2)
      expect(level2).toBe(now + 7 * 24 * 60 * 60 * 1000)
    })

    it('应该处理超出范围的等级', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      
      const highLevel = getNextReviewTime(10)
      expect(highLevel).toBe(now + 90 * 24 * 60 * 60 * 1000)
    })
  })

  describe('isWordDue', () => {
    it('已掌握的单词不应该需要复习', () => {
      const word = { mastered: true, nextReview: Date.now() - 1000 }
      expect(isWordDue(word)).toBe(false)
    })

    it('没有下次复习时间的单词应该需要复习', () => {
      const word = { mastered: false, nextReview: null }
      expect(isWordDue(word)).toBe(true)
    })

    it('已过期的单词应该需要复习', () => {
      const word = { mastered: false, nextReview: Date.now() - 1000 }
      expect(isWordDue(word)).toBe(true)
    })

    it('未到期的单词不应该需要复习', () => {
      const word = { mastered: false, nextReview: Date.now() + 1000 }
      expect(isWordDue(word)).toBe(false)
    })
  })

  describe('countDueWords', () => {
    it('应该正确计算待复习单词数量', () => {
      const now = Date.now()
      const words = [
        { mastered: false, nextReview: now - 1000 }, // 过期
        { mastered: false, nextReview: null }, // 无时间
        { mastered: false, nextReview: now + 1000 }, // 未到期
        { mastered: true, nextReview: now - 1000 }, // 已掌握
      ]
      
      expect(countDueWords(words)).toBe(2)
    })
  })

  describe('updateMemoryLevel', () => {
    it('评分高时应该提升等级', () => {
      expect(updateMemoryLevel(2, 5)).toBe(3)
    })

    it('评分中等时应该保持等级', () => {
      expect(updateMemoryLevel(2, 3)).toBe(2)
      expect(updateMemoryLevel(2, 4)).toBe(2)
    })

    it('评分低时应该降低等级', () => {
      expect(updateMemoryLevel(2, 1)).toBe(1)
      expect(updateMemoryLevel(2, 2)).toBe(1)
    })

    it('不应该降到0以下', () => {
      expect(updateMemoryLevel(0, 1)).toBe(0)
    })

    it('不应该超过最大等级', () => {
      expect(updateMemoryLevel(5, 5)).toBe(6)
      expect(updateMemoryLevel(6, 5)).toBe(6)
    })
  })

  describe('calculateProgress', () => {
    it('应该正确计算进度百分比', () => {
      expect(calculateProgress(0)).toBe(0)
      expect(calculateProgress(3)).toBe(50) // 3/6 * 100 = 50
      expect(calculateProgress(6)).toBe(100)
      expect(calculateProgress(10)).toBe(100) // 不超过100%
    })
  })

  describe('getLevelDescription', () => {
    it('应该返回正确的等级描述', () => {
      expect(getLevelDescription(0)).toBe('新单词')
      expect(getLevelDescription(2)).toBe('短期记忆')
      expect(getLevelDescription(5)).toBe('牢固记忆')
      expect(getLevelDescription(6)).toBe('永久记忆')
      expect(getLevelDescription(10)).toBe('永久记忆') // 超出范围
    })
  })

  describe('getDaysUntilReview', () => {
    it('应该计算距离下次复习的天数', () => {
      const now = Date.now()
      const tomorrow = now + 24 * 60 * 60 * 1000
      const yesterday = now - 24 * 60 * 60 * 1000
      
      expect(getDaysUntilReview(tomorrow)).toBe(1)
      expect(getDaysUntilReview(yesterday)).toBe(-1)
      expect(getDaysUntilReview(null)).toBe(0)
      expect(getDaysUntilReview(undefined)).toBe(0)
    })
  })

  describe('getReviewUrgency', () => {
    it('已掌握的单词应该返回mastered', () => {
      expect(getReviewUrgency(Date.now() - 1000, true)).toBe('mastered')
    })

    it('没有下次复习时间的单词应该返回urgent', () => {
      expect(getReviewUrgency(null, false)).toBe('urgent')
    })

    it('已过期的单词应该返回urgent', () => {
      const now = Date.now()
      expect(getReviewUrgency(now - 1000, false)).toBe('urgent')
    })

    it('3天内到期的单词应该返回soon', () => {
      const now = Date.now()
      const in2Days = now + 2 * 24 * 60 * 60 * 1000
      expect(getReviewUrgency(in2Days, false)).toBe('soon')
    })

    it('3天以上到期的单词应该返回later', () => {
      const now = Date.now()
      const in5Days = now + 5 * 24 * 60 * 60 * 1000
      expect(getReviewUrgency(in5Days, false)).toBe('later')
    })
  })
})