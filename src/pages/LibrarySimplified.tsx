import { useState, useEffect } from 'react';
import { wordService } from '../services/api';
import { isWordDue, countDueWords, getDaysUntilReview } from '../lib/memory-curve';

// 设计系统常量 - 应用移动端简化原则
const DESIGN_SYSTEM = {
  // 简化配色系统
  colors: {
    primary: '#4f46e5',
    primaryLight: '#e0e7ff',
    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    }
  },
  
  // 简化间距系统
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
  },
  
  // 简化圆角
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  // 简化阴影
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  
  // 简化动画
  transitions: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
  },
};

interface LibrarySimplifiedProps {
  user: any;
  onLoginRequest: () => void;
}

interface Word {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  mastered?: boolean;
  level?: number;
  nextReview?: number;
  createdAt?: number;
  due?: boolean;
}

export default function LibrarySimplified({ user, onLoginRequest }: LibrarySimplifiedProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'due' | 'mastered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    due: 0,
    mastered: 0,
    recent: 0,
  });

  useEffect(() => {
    loadWords();
  }, [filter]);

  const loadWords = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        // 用户未登录，显示空状态
        setWords([]);
        setStats({
          total: 0,
          due: 0,
          mastered: 0,
          recent: 0,
        });
        setLoading(false);
        return;
      }
      
      // 使用真实的 wordService.getWords()
      const wordsData = await wordService.getWords();
      
      // 转换数据格式
      const formattedWords: Word[] = wordsData.map((word: any) => ({
        id: word.id,
        word: word.word,
        translation: word.translation,
        phonetic: word.original_text ? JSON.parse(word.original_text).phonetic : '',
        mastered: word.mastered || false,
        level: word.review_count || 0,
        nextReview: word.last_reviewed_at ? new Date(word.last_reviewed_at).getTime() + 86400000 : Date.now(),
        createdAt: new Date(word.created_at).getTime(),
        due: isWordDue({ nextReview: word.last_reviewed_at ? new Date(word.last_reviewed_at).getTime() + 86400000 : Date.now() }),
      }));
      
      setWords(formattedWords);
      
      // 计算统计
      const dueWords = formattedWords.filter(w => w.due);
      const masteredWords = formattedWords.filter(w => w.mastered);
      const recentWords = formattedWords.filter(w => 
        w.createdAt && (Date.now() - w.createdAt) < 7 * 86400000
      );
      
      setStats({
        total: formattedWords.length,
        due: dueWords.length,
        mastered: masteredWords.length,
        recent: recentWords.length,
      });
    } catch (error) {
      console.error('Load words error:', error);
      
      // 如果API调用失败，使用模拟数据
      const mockWords: Word[] = [
        {
          id: '1',
          word: 'perseverance',
          translation: '毅力',
          phonetic: '/ˌpɜːrsəˈvɪrəns/',
          mastered: false,
          level: 2,
          nextReview: Date.now() + 86400000,
          createdAt: Date.now() - 86400000,
          due: true,
        },
        {
          id: '2',
          word: 'serendipity',
          translation: '机缘巧合',
          phonetic: '/ˌserənˈdɪpəti/',
          mastered: true,
          level: 5,
          nextReview: Date.now() + 86400000 * 30,
          createdAt: Date.now() - 2 * 86400000,
          due: false,
        },
        {
          id: '3',
          word: 'ephemeral',
          translation: '短暂的',
          phonetic: '/ɪˈfemərəl/',
          mastered: false,
          level: 1,
          nextReview: Date.now() + 86400000 * 3,
          createdAt: Date.now() - 3 * 86400000,
          due: false,
        },
        {
          id: '4',
          word: 'ubiquitous',
          translation: '无处不在的',
          phonetic: '/juːˈbɪkwɪtəs/',
          mastered: false,
          level: 3,
          nextReview: Date.now() + 86400000 * 7,
          createdAt: Date.now() - 4 * 86400000,
          due: false,
        },
      ];
      
      setWords(mockWords);
      
      const dueWords = mockWords.filter(w => w.due);
      const masteredWords = mockWords.filter(w => w.mastered);
      const recentWords = mockWords.filter(w => 
        w.createdAt && (Date.now() - w.createdAt) < 7 * 86400000
      );
      
      setStats({
        total: mockWords.length,
        due: dueWords.length,
        mastered: masteredWords.length,
        recent: recentWords.length,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    if (!confirm('确定要删除这个单词吗？')) return;
    
    try {
      await wordService.deleteWord(wordId);
      setWords(words.filter(w => w.id !== wordId));
      
      // 重新加载统计
      loadWords();
    } catch (error) {
      console.error('Delete word error:', error);
      alert('删除失败，请重试');
    }
  };

  const handleToggleMastered = async (wordId: string) => {
    try {
      const word = words.find(w => w.id === wordId);
      if (!word) return;
      
      await wordService.updateWord(wordId, {
        mastered: !word.mastered,
      });
      
      // 更新本地状态
      setWords(words.map(w => 
        w.id === wordId ? { ...w, mastered: !w.mastered } : w
      ));
      
      // 重新加载统计
      loadWords();
    } catch (error) {
      console.error('Toggle mastered error:', error);
    }
  };

  // 过滤单词
  const filteredWords = words.filter(word => {
    // 应用筛选器
    if (filter === 'due' && !word.due) return false;
    if (filter === 'mastered' && !word.mastered) return false;
    
    // 应用搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        word.word.toLowerCase().includes(query) ||
        word.translation.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // 样式对象
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: DESIGN_SYSTEM.colors.gray[50],
      padding: DESIGN_SYSTEM.spacing[4],
    },
    
    // 极简导航
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[4]}`,
      backgroundColor: 'white',
      borderBottom: `1px solid ${DESIGN_SYSTEM.colors.gray[200]}`,
      position: 'sticky' as const,
      top: 0,
      zIndex: 10,
    },
    
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: DESIGN_SYSTEM.spacing[2],
      fontWeight: 600,
      color: DESIGN_SYSTEM.colors.primary,
      fontSize: '18px',
    },
    
    logoIcon: {
      width: '32px',
      height: '32px',
      backgroundColor: DESIGN_SYSTEM.colors.primary,
      color: 'white',
      borderRadius: DESIGN_SYSTEM.borderRadius.md,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
    },
    
    // 搜索栏
    searchBar: {
      backgroundColor: 'white',
      borderRadius: DESIGN_SYSTEM.borderRadius.xl,
      padding: DESIGN_SYSTEM.spacing[3],
      marginBottom: DESIGN_SYSTEM.spacing[4],
      boxShadow: DESIGN_SYSTEM.shadows.md,
      border: `1px solid ${DESIGN_SYSTEM.colors.gray[200]}`,
    },
    
    searchInput: {
      width: '100%',
      padding: `${DESIGN_SYSTEM.spacing[2]} ${DESIGN_SYSTEM.spacing[3]}`,
      border: `1px solid ${DESIGN_SYSTEM.colors.gray[300]}`,
      borderRadius: DESIGN_SYSTEM.borderRadius.lg,
      fontSize: '14px',
      outline: 'none',
      transition: `border-color ${DESIGN_SYSTEM.transitions.base}`,
    },
    
    // 统计卡片
    statsCard: {
      backgroundColor: 'white',
      borderRadius: DESIGN_SYSTEM.borderRadius.xl,
      padding: DESIGN_SYSTEM.spacing[4],
      marginBottom: DESIGN_SYSTEM.spacing[4],
      boxShadow: DESIGN_SYSTEM.shadows.md,
      border: `1px solid ${DESIGN_SYSTEM.colors.gray[200]}`,
    },
    
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: DESIGN_SYSTEM.spacing[3],
    },
    
    statItem: {
      textAlign: 'center' as const,
      padding: DESIGN_SYSTEM.spacing[3],
      backgroundColor: DESIGN_SYSTEM.colors.gray[50],
      borderRadius: DESIGN_SYSTEM.borderRadius.lg,
      border: `1px solid ${DESIGN_SYSTEM.colors.gray[200]}`,
    },
    
    statValue: {
      fontSize: '20px',
      fontWeight: 700,
      color: DESIGN_SYSTEM.colors.gray[900],
      marginBottom: DESIGN_SYSTEM.spacing[1],
    },
    
    statLabel: {
      fontSize: '12px',
      color: DESIGN_SYSTEM.colors.gray[500],
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    
    // 筛选器
    filterBar: {
      display: 'flex',
      gap: DESIGN_SYSTEM.spacing[2],
      marginBottom: DESIGN_SYSTEM.spacing[4],
      overflowX: 'auto' as const,
      paddingBottom: DESIGN_SYSTEM.spacing[2],
    },
    
    filterButton: {
      padding: `${DESIGN_SYSTEM.spacing[2]} ${DESIGN_SYSTEM.spacing[3]}`,
      borderRadius: DESIGN_SYSTEM.borderRadius.full,
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: `all ${DESIGN_SYSTEM.transitions.base}`,
      border: 'none',
      whiteSpace: 'nowrap' as const,
      minHeight: '36px',
    },
    
    filterButtonActive: {
      backgroundColor: DESIGN_SYSTEM.colors.primary,
      color: 'white',
    },
    
    filterButtonInactive: {
      backgroundColor: DESIGN_SYSTEM.colors.gray[100],
      color: DESIGN_SYSTEM.colors.gray[700],
    },
    
    // 单词卡片
    wordCard: {
      backgroundColor: 'white',
      borderRadius: DESIGN_SYSTEM.borderRadius.xl,
      padding: DESIGN_SYSTEM.spacing[4],
      marginBottom: DESIGN_SYSTEM.spacing[3],
      boxShadow: DESIGN_SYSTEM.shadows.md,
      border: `1px solid ${DESIGN_SYSTEM.colors.gray[200]}`,
      transition: `transform ${DESIGN_SYSTEM.transitions.base}`,
    },
    
    wordHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: DESIGN_SYSTEM.spacing[2],
    },
    
    wordText: {
      fontSize: '20px',
      fontWeight: 700,
      color: DESIGN_SYSTEM.colors.gray[900],
      marginBottom: DESIGN_SYSTEM.spacing[1],
    },
    
    phonetic: {
      fontSize: '14px',
      color: DESIGN_SYSTEM.colors.gray[500],
      fontStyle: 'italic',
      marginBottom: DESIGN_SYSTEM.spacing[2],
    },
    
    translation: {
      fontSize: '16px',
      color: DESIGN_SYSTEM.colors.gray[700],
      fontWeight: 500,
      marginBottom: DESIGN_SYSTEM.spacing[3],
    },
    
    // 标签
    tag: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: DESIGN_SYSTEM.borderRadius.sm,
      fontSize: '11px',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    
    tagDue: {
      backgroundColor: DESIGN_SYSTEM.colors.warningLight,
      color: DESIGN_SYSTEM.colors.warning,
    },
    
    tagMastered: {
      backgroundColor: DESIGN_SYSTEM.colors.successLight,
      color: DESIGN_SYSTEM.colors.success,
    },
    
    tagNew: {
      backgroundColor: DESIGN_SYSTEM.colors.primaryLight,
      color: DESIGN_SYSTEM.colors.primary,
    },
    
    // 操作按钮
    actionButtons: {
      display: 'flex',
      gap: DESIGN_SYSTEM.spacing[2],
      marginTop: DESIGN_SYSTEM.spacing[3],
    },
    
    button: {
      padding: `${DESIGN_SYSTEM.spacing[2]} ${DESIGN_SYSTEM.spacing[3]}`,
      borderRadius: DESIGN_SYSTEM.borderRadius.lg,
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: `all ${DESIGN_SYSTEM.transitions.base}`,
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: DESIGN_SYSTEM.spacing[1],
      minHeight: '36px',
    },
    
    buttonPrimary: {
      backgroundColor: DESIGN_SYSTEM.colors.primary,
      color: 'white',
    },
    
    buttonSuccess: {
      backgroundColor: DESIGN_SYSTEM.colors.success,
      color: 'white',
    },
    
    buttonWarning: {
      backgroundColor: DESIGN_SYSTEM.colors.warning,
      color: 'white',
    },
    
    buttonGray: {
      backgroundColor: DESIGN_SYSTEM.colors.gray[200],
      color: DESIGN_SYSTEM.colors.gray[700],
    },
    
    buttonDanger: {
      backgroundColor: DESIGN_SYSTEM.colors.errorLight,
      color: DESIGN_SYSTEM.colors.error,
    },
    
    // 空状态
    emptyState: {
      textAlign: 'center' as const,
      padding: `${DESIGN_SYSTEM.spacing[8]} 0`,
    },
    
    emptyIcon: {
      fontSize: '48px',
      marginBottom: DESIGN_SYSTEM.spacing[4],
      opacity: 0.5,
    },
    
    emptyTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: DESIGN_SYSTEM.colors.gray[800],
      marginBottom: DESIGN_SYSTEM.spacing[2],
    },
    
    emptyDescription: {
      fontSize: '14px',
      color: DESIGN_SYSTEM.colors.gray[500],
      marginBottom: DESIGN_SYSTEM.spacing[6],
    },
    
    // 加载状态
    loadingState: {
      textAlign: 'center' as const,
      padding: `${DESIGN_SYSTEM.spacing[8]} 0`,
    },
    
    loadingText: {
      fontSize: '14px',
      color: DESIGN_SYSTEM.colors.gray[500],
    },
  };

  return (
    <div style={styles.container}>
      {/* 极简导航 */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>N</div>
          <div>词库</div>
        </div>
        
        <div style={{ fontSize: '14px', color: DESIGN_SYSTEM.colors.gray[500] }}>
          {stats.total} 个单词
        </div>
      </header>

      <main>
        {/* 搜索栏 */}
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="搜索单词或释义..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* 统计卡片 */}
        <div style={styles.statsCard}>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>总单词</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{stats.due}</div>
              <div style={styles.statLabel}>待复习</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{stats.mastered}</div>
              <div style={styles.statLabel}>已掌握</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{stats.recent}</div>
              <div style={styles.statLabel}>最近添加</div>
            </div>
          </div>
        </div>

        {/* 筛选器 */}
        <div style={styles.filterBar}>
          <button
            onClick={() => setFilter('all')}
            style={{
              ...styles.filterButton,
              ...(filter === 'all' ? styles.filterButtonActive : styles.filterButtonInactive),
            }}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('due')}
            style={{
              ...styles.filterButton,
              ...(filter === 'due' ? styles.filterButtonActive : styles.filterButtonInactive),
            }}
          >
            待复习 ({stats.due})
          </button>
          <button
            onClick={() => setFilter('mastered')}
            style={{
              ...styles.filterButton,
              ...(filter === 'mastered' ? styles.filterButtonActive : styles.filterButtonInactive),
            }}
          >
            已掌握 ({stats.mastered})
          </button>
        </div>

        {/* 内容区域 */}
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingText}>加载中...</div>
          </div>
        ) : filteredWords.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📚</div>
            <div style={styles.emptyTitle}>
              {searchQuery ? '未找到相关单词' : '词库为空'}
            </div>
            <div style={styles.emptyDescription}>
              {searchQuery 
                ? '尝试搜索其他单词'
                : '开始查询单词，系统会自动保存到词库'
              }
            </div>
          </div>
        ) : (
          // 单词列表
          <div>
            {filteredWords.map((word) => {
              const isNew = word.createdAt && (Date.now() - word.createdAt) < 3 * 86400000;
              
              return (
                <div 
                  key={word.id}
                  style={styles.wordCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={styles.wordHeader}>
                    <div style={{ flex: 1 }}>
                      <div style={styles.wordText}>{word.word}</div>
                      {word.phonetic && (
                        <div style={styles.phonetic}>{word.phonetic}</div>
                      )}
                    </div>
                    
                    {/* 标签 */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {word.due && (
                        <div style={{ ...styles.tag, ...styles.tagDue }}>待复习</div>
                      )}
                      {word.mastered && (
                        <div style={{ ...styles.tag, ...styles.tagMastered }}>已掌握</div>
                      )}
                      {isNew && (
                        <div style={{ ...styles.tag, ...styles.tagNew }}>新</div>
                      )}
                    </div>
                  </div>
                  
                  <div style={styles.translation}>{word.translation}</div>
                  
                  {/* 记忆信息 */}
                  <div style={{ 
                    fontSize: '12px', 
                    color: DESIGN_SYSTEM.colors.gray[500],
                    marginBottom: DESIGN_SYSTEM.spacing[2],
                  }}>
                    记忆等级: {word.level || 0} • 
                    下次复习: {word.due ? '今天' : getDaysUntilReview({ nextReview: word.nextReview || Date.now() })}天后
                  </div>
                  
                  {/* 操作按钮 */}
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => handleToggleMastered(word.id)}
                      style={{
                        ...styles.button,
                        ...(word.mastered ? styles.buttonGray : styles.buttonSuccess),
                        flex: 1,
                      }}
                    >
                      {word.mastered ? '取消掌握' : '标记掌握'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteWord(word.id)}
                      style={{
                        ...styles.button,
                        ...styles.buttonDanger,
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 登录提示 */}
      {!user && !loading && (
        <div style={{
          marginTop: DESIGN_SYSTEM.spacing[6],
          padding: DESIGN_SYSTEM.spacing[4],
          backgroundColor: DESIGN_SYSTEM.colors.gray[50],
          borderRadius: DESIGN_SYSTEM.borderRadius.lg,
          border: `1px solid ${DESIGN_SYSTEM.colors.gray[200]}`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '14px', color: DESIGN_SYSTEM.colors.gray[600], marginBottom: DESIGN_SYSTEM.spacing[2] }}>
            登录后可以保存单词和同步数据
          </div>
          <button
            onClick={onLoginRequest}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              fontSize: '13px',
              padding: '6px 12px',
            }}
          >
            登录/注册
          </button>
        </div>
      )}
    </div>
  );
}