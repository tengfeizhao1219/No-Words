import { useState, useEffect, useRef } from 'react';
import { translationService, wordService } from '../services/api';
import { analyzeWord } from '../lib/word-analysis';
import type { WordAnalysis } from '../lib/word-analysis';

interface HomeRedesignedProps {
  user: any;
  onLoginRequest: () => void;
}

// 基于 UI/UX Pro Max 设计原则的设计系统
const DESIGN_SYSTEM = {
  // 配色方案 - 针对教育/学习应用优化
  colors: {
    primary: {
      main: '#4F46E5', // 靛蓝色 - 专注、专业
      light: '#818CF8',
      pale: '#EEF2FF',
      dark: '#3730A3',
    },
    secondary: {
      main: '#10B981', // 翠绿色 - 成长、学习
      light: '#34D399',
      pale: '#D1FAE5',
      dark: '#059669',
    },
    accent: {
      main: '#F59E0B', // 琥珀色 - 强调、互动
      light: '#FBBF24',
      pale: '#FEF3C7',
      dark: '#D97706',
    },
    neutral: {
      background: '#F9FAFB', // 浅灰色背景
      surface: '#FFFFFF', // 白色表面
      text: {
        primary: '#111827', // 深灰色文字
        secondary: '#6B7280', // 中灰色文字
        tertiary: '#9CA3AF', // 浅灰色文字
      },
      border: '#E5E7EB', // 边框颜色
    },
  },
  
  // 排版系统
  typography: {
    fontFamily: {
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Mono', monospace",
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  // 间距系统 (基于 4px 网格)
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
  },
  
  // 圆角系统
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    full: '9999px',
  },
  
  // 阴影系统
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    accent: `0 8px 32px -4px ${'rgba(79, 70, 229, 0.15)'}`,
  },
  
  // 动画和过渡
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export default function HomeRedesigned({ user, onLoginRequest }: HomeRedesignedProps) {
  const [query, setQuery] = useState('');
  const [translation, setTranslation] = useState<WordAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 加载最近搜索记录
  useEffect(() => {
    const saved = localStorage.getItem('no-words-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // 保存搜索记录
  const saveSearch = (word: string) => {
    const updated = [word, ...recentSearches.filter(w => w !== word)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('no-words-recent-searches', JSON.stringify(updated));
  };

  // 发音功能
  const handleSpeak = () => {
    if (!translation) return;
    
    if (translation.audioUrl) {
      const audio = new Audio(translation.audioUrl);
      audio.play().catch(console.error);
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translation.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      console.warn('当前浏览器不支持语音合成');
    }
  };

  const handleTranslate = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const result = await translationService.translate(query);
      const analysis = analyzeWord(result.query, [{ defs: [{ def: result.translation }] }]);
      const phonetic = result.phonetic || result.usPhonetic || result.ukPhonetic || '';
      
      setTranslation({
        ...analysis,
        phonetic: phonetic,
        audioUrl: result.speakUrl || '',
        explains: result.explains || [],
        webTranslations: result.webTranslations || []
      });
      setIsAdded(false);
      saveSearch(query);
    } catch (error) {
      console.error('Translation error:', error);
      const analysis = analyzeWord(query, [{ defs: [{ def: '翻译服务暂时不可用' }] }]);
      setTranslation({
        ...analysis,
        phonetic: '',
        audioUrl: '',
        explains: ['请检查网络连接或稍后重试']
      });
      setIsAdded(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!translation) return;
    
    if (!user) {
      onLoginRequest();
      return;
    }
    
    try {
      await wordService.saveWord(
        translation.word,
        translation.word,
        JSON.stringify({
          phonetic: translation.phonetic,
          audioUrl: translation.audioUrl,
          meanings: [{ pos: '未知', defs: [{ def: translation.word }] }],
          roots: translation.roots,
          tip: translation.tip,
        })
      );
      setIsAdded(true);
    } catch (error) {
      console.error('Add to library error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const handleRecentSearch = (word: string) => {
    setQuery(word);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('no-words-recent-searches');
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: DESIGN_SYSTEM.colors.neutral.background,
        fontFamily: DESIGN_SYSTEM.typography.fontFamily.body,
      }}
    >
      {/* 顶部导航栏 */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-sm bg-white/80 border-b"
        style={{
          borderColor: DESIGN_SYSTEM.colors.neutral.border,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: DESIGN_SYSTEM.colors.primary.main,
                  color: 'white',
                }}
              >
                <span className="font-bold">N</span>
              </div>
              <h1 
                className="text-xl font-bold"
                style={{
                  color: DESIGN_SYSTEM.colors.neutral.text.primary,
                  fontFamily: DESIGN_SYSTEM.typography.fontFamily.heading,
                }}
              >
                不记单词
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{
                      backgroundColor: DESIGN_SYSTEM.colors.primary.pale,
                      color: DESIGN_SYSTEM.colors.primary.main,
                    }}
                  >
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span 
                    className="text-sm hidden sm:inline"
                    style={{ color: DESIGN_SYSTEM.colors.neutral.text.secondary }}
                  >
                    {user.email || '用户'}
                  </span>
                </div>
              ) : (
                <button
                  onClick={onLoginRequest}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: DESIGN_SYSTEM.colors.primary.main,
                    color: 'white',
                    boxShadow: DESIGN_SYSTEM.shadows.md,
                  }}
                >
                  登录 / 注册
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 英雄区域 */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primary.main}, ${DESIGN_SYSTEM.colors.secondary.main})`,
              fontFamily: DESIGN_SYSTEM.typography.fontFamily.heading,
            }}
          >
            智能单词学习平台
          </h1>
          <p 
            className="text-lg"
            style={{ color: DESIGN_SYSTEM.colors.neutral.text.secondary }}
          >
            查询即收藏 · 词根分析 · 智能记忆 · 无感积累
          </p>
        </div>

        {/* 主搜索区域 */}
        <div 
          className="mb-8 rounded-2xl p-6"
          style={{
            backgroundColor: DESIGN_SYSTEM.colors.neutral.surface,
            boxShadow: DESIGN_SYSTEM.shadows.lg,
            borderRadius: DESIGN_SYSTEM.borderRadius.xl,
          }}
        >
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入英文单词或句子，按 Enter 查询..."
              className="w-full p-4 text-lg resize-none focus:outline-none"
              style={{
                minHeight: '120px',
                backgroundColor: DESIGN_SYSTEM.colors.neutral.background,
                borderRadius: DESIGN_SYSTEM.borderRadius.lg,
                border: `1px solid ${DESIGN_SYSTEM.colors.neutral.border}`,
                transition: DESIGN_SYSTEM.transitions.base,
              }}
              rows={3}
              onFocus={(e) => {
                e.target.style.borderColor = DESIGN_SYSTEM.colors.primary.main;
                e.target.style.boxShadow = DESIGN_SYSTEM.shadows.accent;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = DESIGN_SYSTEM.colors.neutral.border;
                e.target.style.boxShadow = 'none';
              }}
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuery('')}
                  className="px-3 py-1.5 text-sm rounded-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: DESIGN_SYSTEM.colors.neutral.background,
                    color: DESIGN_SYSTEM.colors.neutral.text.secondary,
                    border: `1px solid ${DESIGN_SYSTEM.colors.neutral.border}`,
                  }}
                >
                  清空
                </button>
                
                {recentSearches.length > 0 && (
                  <div className="hidden sm:flex items-center space-x-2">
                    <span 
                      className="text-sm"
                      style={{ color: DESIGN_SYSTEM.colors.neutral.text.tertiary }}
                    >
                      最近搜索:
                    </span>
                    <div className="flex items-center space-x-1">
                      {recentSearches.map((word, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearch(word)}
                          className="px-2 py-1 text-xs rounded-md transition-all hover:scale-105 active:scale-95"
                          style={{
                            backgroundColor: DESIGN_SYSTEM.colors.primary.pale,
                            color: DESIGN_SYSTEM.colors.primary.main,
                          }}
                        >
                          {word}
                        </button>
                      ))}
                      <button
                        onClick={handleClearRecent}
                        className="px-2 py-1 text-xs rounded-md transition-all hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: DESIGN_SYSTEM.colors.neutral.background,
                          color: DESIGN_SYSTEM.colors.neutral.text.tertiary,
                        }}
                      >
                        清除
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleTranslate}
                disabled={loading || !query.trim()}
                className="px-6 py-3 font-medium rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
                style={{
                  backgroundColor: DESIGN_SYSTEM.colors.primary.main,
                  color: 'white',
                  boxShadow: DESIGN_SYSTEM.shadows.md,
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>查询中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>智能查询</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 翻译结果区域 */}
        {translation && (
          <div 
            className="rounded-2xl overflow-hidden animate-slide-up"
            style={{
              backgroundColor: DESIGN_SYSTEM.colors.neutral.surface,
              boxShadow: DESIGN_SYSTEM.shadows.lg,
              borderRadius: DESIGN_SYSTEM.borderRadius.xl,
            }}
          >
            {/* 单词标题栏 */}
            <div 
              className="p-6"
              style={{
                backgroundColor: DESIGN_SYSTEM.colors.primary.pale,
                borderBottom: `1px solid ${DESIGN_SYSTEM.colors.neutral.border}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 
                    className="text-3xl font-bold mb-2"
                    style={{ color: DESIGN_SYSTEM.colors.neutral.text.primary }}
                  >
                    {translation.word}
                  </h2>
                  {translation.phonetic && (
                    <div className="flex items-center space-x-4">
                      <span 
                        className="px-3 py-1 rounded-lg font-medium"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          color: DESIGN_SYSTEM.colors.primary.main,
                        }}
                      >
                        {translation.phonetic}
                      </span>
                      <button 
                        onClick={handleSpeak}
                        className="flex items-center space-x-2 px-3 py-1 rounded-lg transition-all hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          color: DESIGN_SYSTEM.colors.primary.main,
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        <span>发音</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleAddToLibrary}
                  disabled={isAdded}
                  className={`px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2 ${
                    isAdded ? '' : 'hover:shadow-lg'
                  }`}
                  style={{
                    backgroundColor: isAdded 
                      ? DESIGN_SYSTEM.colors.neutral.background 
                      : DESIGN_SYSTEM.colors.secondary.main,
                    color: isAdded 
                      ? DESIGN_SYSTEM.colors.neutral.text.secondary 
                      : 'white',
                    border: isAdded ? `1px solid ${DESIGN_SYSTEM.colors.neutral.border}` : 'none',
                  }}
                >
                  {isAdded ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>已收藏</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>加入词库</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-6 space-y-8">
              {/* 词根拆解 */}
              {translation.roots && translation.roots.length > 0 && (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: DESIGN_SYSTEM.colors.accent.pale,
                        color: DESIGN_SYSTEM.colors.accent.main,
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 
                      className="text-lg font-semibold"
                      style={{ color: DESIGN_SYSTEM.colors.neutral.text.primary }}
                    >
                      词根分析
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {translation.roots.map((root, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg transition-all hover:scale-[1.02]"
                        style={{
                          backgroundColor: DESIGN_SYSTEM.colors.neutral.background,
                          border: `1px solid ${DESIGN_SYSTEM.colors.neutral.border}`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span 
                            className="text-sm font-medium px-2 py-1 rounded"
                            style={{
                              backgroundColor: DESIGN_SYSTEM.colors.accent.pale,
                              color: DESIGN_SYSTEM.colors.accent.main,
                            }}
                          >
                            {root.type}
                          </span>
                          <span 
                            className="font-bold"
                            style={{ color: DESIGN_SYSTEM.colors.neutral.text.primary }}
                          >
                            {root.part}
                          </span>
                        </div>
                        <p 
                          className="text-sm"
                          style={{ color: DESIGN_SYSTEM.colors.neutral.text.secondary }}
                        >
                          {root.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 记忆技巧 */}
              {translation.tip && (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: DESIGN_SYSTEM.colors.secondary.pale,
                        color: DESIGN_SYSTEM.colors.secondary.main,
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 
                      className="text-lg font-semibold"
                      style={{ color: DESIGN_SYSTEM.colors.neutral.text.primary }}
                    >
                      记忆技巧
                    </h3>
                  </div>
                  
                  <div 
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: DESIGN_SYSTEM.colors.secondary.pale,
                      borderLeft: `4px solid ${DESIGN_SYSTEM.colors.secondary.main}`,
                    }}
                  >
                    <p 
                      className="leading-relaxed"
                      style={{ color: DESIGN_SYSTEM.colors.neutral.text.primary }}
                    >
                      {translation.tip}
                    </p>
                  </div>
                </div>
              )}

              {/* 基本释义 */}
              {translation.explains && translation.explains.length > 0 && (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: DESIGN_SYSTEM.colors.primary.pale,
                        color: DESIGN_SYSTEM.colors.primary.main,
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 
                      className="text-lg font-semibold"
                      style={{ color: DESIGN_SYSTEM.colors.neutral.text.primary }}
                    >
                      基本释义
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {translation.explains.map((explain, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 rounded-lg"
                        style={{
                          backgroundColor: DESIGN_SYSTEM.colors.neutral.background,
                        }}
                      >
                        <div 
                          className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium"
                          style={{
                            backgroundColor: DESIGN_SYSTEM.colors.primary.main,
                            color: 'white',
                          }}
                        >
                          {index + 1}
                        </div>
                        <p 
                          className="flex-1"
                          style={{ color: DESIGN_SYSTEM.colors.neutral.text.primary }}
                        >
                          {explain}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 空状态和功能引导 */}
        {!translation && !loading && (
          <div className="space-y-8">
            {/* 欢迎卡片 */}
            <div 
              className="rounded-2xl p-8 text-center"
              style={{
                backgroundColor: DESIGN_SYSTEM.colors.neutral.surface,
                boxShadow: DESIGN_SYSTEM.shadows.lg,
                borderRadius: DESIGN_SYSTEM.borderRadius.xl,
              }}
            >
              <div 
                className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl"
                style={{
                  backgroundColor: DESIGN_SYSTEM.colors.primary.pale,
                  color: DESIGN_SYSTEM.colors.primary.main,
                }}
              >
                📚
              </div>
              <h3 
                className="text-2xl font-bold mb-3"
                style={{ color: DESIGN_SYSTEM.colors.neutral.text.primary }}
              >
                开始你的单词学习之旅
              </h3>
              <p 
                className="mb-6 max-w-md mx-auto"
                style={{ color: DESIGN_SYSTEM.colors.neutral.text.secondary }}
              >
                输入任何英文单词或句子，获取详细的词根分析、记忆技巧和发音
              </p>
              
              {/* 示例单词 */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {['hello', 'beautiful', 'technology', 'perseverance', 'serendipity'].map((word) => (
                  <button
                    key={word}
                    onClick={() => handleRecentSearch(word)}
                    className="px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: DESIGN_SYSTEM.colors.neutral.background,
                      color: DESIGN_SYSTEM.colors.primary.main,
                      border: `1px solid ${DESIGN_SYSTEM.colors.neutral.border}`,
                    }}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* 功能特性 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🔍',
                  title: '智能查询',
                  description: '支持单词、短语、句子查询，提供详细分析',
                  color: DESIGN_SYSTEM.colors.primary.main,
                },
                {
                  icon: '🧠',
                  title: '词根记忆',
                  description: '基于词根词缀分析，帮助理解单词构成',
                  color: DESIGN_SYSTEM.colors.secondary.main,
                },
                {
                  icon: '📊',
                  title: '学习统计',
                  description: '跟踪学习进度，智能推荐复习计划',
                  color: DESIGN_SYSTEM.colors.accent.main,
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: DESIGN_SYSTEM.colors.neutral.surface,
                    border: `1px solid ${DESIGN_SYSTEM.colors.neutral.border}`,
                    boxShadow: DESIGN_SYSTEM.shadows.md,
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                    style={{
                      backgroundColor: `${feature.color}15`,
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h4 
                    className="text-lg font-semibold mb-2"
                    style={{ color: DESIGN_SYSTEM.colors.neutral.text.primary }}
                  >
                    {feature.title}
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: DESIGN_SYSTEM.colors.neutral.text.secondary }}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* 登录提示 */}
            {!user && (
              <div 
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: DESIGN_SYSTEM.colors.primary.pale,
                  border: `1px solid ${DESIGN_SYSTEM.colors.primary.light}`,
                }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h4 
                      className="text-lg font-semibold mb-2"
                      style={{ color: DESIGN_SYSTEM.colors.primary.main }}
                    >
                      💡 解锁完整功能
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: DESIGN_SYSTEM.colors.neutral.text.secondary }}
                    >
                      登录后可以保存单词到云端，多设备同步学习，查看学习统计
                    </p>
                  </div>
                  
                  <button
                    onClick={onLoginRequest}
                    className="px-6 py-3 font-medium rounded-xl transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: DESIGN_SYSTEM.colors.primary.main,
                      color: 'white',
                      boxShadow: DESIGN_SYSTEM.shadows.md,
                    }}
                  >
                    立即登录
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer 
        className="mt-12 py-8 border-t"
        style={{
          borderColor: DESIGN_SYSTEM.colors.neutral.border,
          backgroundColor: DESIGN_SYSTEM.colors.neutral.background,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p 
              className="text-sm mb-2"
              style={{ color: DESIGN_SYSTEM.colors.neutral.text.secondary }}
            >
              © 2024 不记单词 · 让单词学习更高效
            </p>
            <p 
              className="text-xs"
              style={{ color: DESIGN_SYSTEM.colors.neutral.text.tertiary }}
            >
              基于 UI/UX Pro Max 设计原则重构 · 版本 2.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

