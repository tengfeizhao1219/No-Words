import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../../src/pages/Home'

// Mock 依赖
vi.mock('../../src/services/api', () => ({
  translationService: {
    translate: vi.fn(),
  },
  wordService: {
    addWord: vi.fn(),
  },
}))

vi.mock('../../src/lib/word-analysis', () => ({
  analyzeWord: vi.fn(),
}))

describe('Simple Home Component Tests', () => {
  const mockUser = { id: '123', email: 'test@example.com' }
  const mockOnLoginRequest = vi.fn()
  
  it('应该渲染标题和输入框', () => {
    render(<Home user={mockUser} onLoginRequest={mockOnLoginRequest} />)
    
    // 检查标题
    expect(screen.getByText('不记单词')).toBeInTheDocument()
    expect(screen.getByText('查询即收藏，无感积累')).toBeInTheDocument()
    
    // 检查输入框
    expect(screen.getByPlaceholderText('输入英文单词或句子...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '🔍 查询' })).toBeInTheDocument()
  })

  it('未登录时应该显示登录提示', () => {
    render(<Home user={null} onLoginRequest={mockOnLoginRequest} />)
    
    // 检查登录提示 - 使用更灵活的选择器
    expect(screen.getByText(/登录后可以保存单词到云端/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '立即登录' })).toBeInTheDocument()
  })

  it('应该显示空状态', () => {
    render(<Home user={mockUser} onLoginRequest={mockOnLoginRequest} />)
    
    // 检查空状态
    expect(screen.getByText('输入单词开始查询')).toBeInTheDocument()
  })
})