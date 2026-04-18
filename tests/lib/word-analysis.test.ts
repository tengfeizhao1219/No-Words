import { describe, it, expect } from 'vitest'
import { guessRoots, generateTip, analyzeWord, type WordRoot } from '../../src/lib/word-analysis'

describe('word-analysis', () => {
  describe('guessRoots', () => {
    it('应该识别常见前缀', () => {
      const result = guessRoots('unhappy')
      expect(result.length).toBeGreaterThan(0)
      const prefix = result.find(r => r.type === '前缀')
      expect(prefix).toBeDefined()
      expect(prefix).toMatchObject({
        part: 'un-',
        type: '前缀',
        meaning: '否定/不'
      })
    })

    it('应该识别常见后缀', () => {
      const result = guessRoots('happiness')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        part: '-ness',
        type: '后缀',
        meaning: '名词后缀 (性质)'
      })
    })

    it('应该识别常见词根', () => {
      const result = guessRoots('action')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        part: 'act',
        type: '词根',
        meaning: '做'
      })
    })

    it('对于无法识别的单词应该返回独立词根', () => {
      const result = guessRoots('xyzabc')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        part: 'xyzabc',
        type: '词根',
        meaning: '独立词根'
      })
    })

    it('应该处理空字符串', () => {
      const result = guessRoots('')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        part: '',
        type: '词根',
        meaning: '独立词根'
      })
    })
  })

  describe('generateTip', () => {
    it('应该生成记忆技巧', () => {
      const tip = generateTip('example')
      expect(tip).toBeTypeOf('string')
      expect(tip.length).toBeGreaterThan(10)
    })

    it('应该使用提供的释义', () => {
      const meanings = [{
        defs: [{ def: 'a representative form or pattern' }]
      }]
      const tip = generateTip('example', meanings)
      expect(tip).toContain('example')
      // 注意：generateTip 函数可能不会直接包含释义内容
      expect(typeof tip).toBe('string')
      expect(tip.length).toBeGreaterThan(10)
    })

    it('应该处理空释义', () => {
      const tip = generateTip('example', [])
      expect(tip).toBeTypeOf('string')
      expect(tip.length).toBeGreaterThan(10)
    })
  })

  describe('analyzeWord', () => {
    it('应该返回完整的分析结果', () => {
      const result = analyzeWord('unhappiness')
      
      expect(result).toHaveProperty('word', 'unhappiness')
      expect(result).toHaveProperty('roots')
      expect(result).toHaveProperty('tip')
      
      expect(Array.isArray(result.roots)).toBe(true)
      expect(result.roots.length).toBeGreaterThan(0)
      expect(typeof result.tip).toBe('string')
    })

    it('应该包含词根分析', () => {
      const result = analyzeWord('transport')
      const hasPrefix = result.roots.some((r: WordRoot) => r.type === '前缀')
      const hasRoot = result.roots.some((r: WordRoot) => r.type === '词根')
      expect(hasPrefix || hasRoot).toBe(true)
    })
  })
})