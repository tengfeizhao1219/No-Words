import { useState, useEffect } from 'react';
import { wordService } from '../services/api';
import { 
  getNextReviewTime, 
  updateMemoryLevel, 
  calculateProgress,
  getLevelDescription,
  isWordDue,
  countDueWords
} from '../lib/memory-curve';

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

interface ReviewSimplifiedProps {
  user: any;
  onLoginRequest: () => void;
}

interface Word {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  audioUrl?: string;
  level?: number;
  nextReview?: number;
  reviewCount?: number;
  lastReviewed?: number;
}

interface ReviewConfig {
  onlyDue: boolean;
  sortBy: 'ebbinghaus' | 'time' | 'random';
}

export default function ReviewSimplified({ user, onLoginRequest }: ReviewSimplifiedProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewWords, setReviewWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [config, setConfig] = useState<ReviewConfig>({
    onlyDue: true,
    sortBy: 'ebbinghaus',
  });
  const [stats, setStats] = useState({
    total: 0,
    due: 0,
    completed: 0,
    progress: 0,
  });

  // 加载统计数据
  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const wordsData = await wordService.getReviewQueue();
      const dueWords = wordsData.filter((word: any) => 
        isWordDue({ nextReview: word.last_reviewed_at ? new Date(word.last_reviewed_at).getTime() : Date.now() })
      );
      
      setStats({
        total: wordsData.length,
        due: dueWords.length,
        completed: 0,
        progress: 0,
      });
    } catch (error) {
      console.error('Load stats error:', error);
      // 模拟数据
      setStats({
        total: 24,
        due: 8,
        completed: 0,
        progress: 0,
      });
    }
  };

  const startReview = async () => {
    // 检查用户是否登录
    if (!user) {
      onLoginRequest();
      return;
    }
    
    try {
      // 获取待复习单词
      const wordsData = await wordService.getReviewQueue();
      
      // 转换数据格式
      let words: Word[] = wordsData.map((word: any) => ({
        id: word.id,
        word: word.word,
        translation: word.translation,
        phonetic: word.original_text ? JSON.parse(word.original_text).phonetic : '',
        level: word.review_count || 0,
        reviewCount: word.review_count || 0,
        nextReview: word.last_reviewed_at ? new Date(word.last_reviewed_at).getTime() : Date.now(),
        lastReviewed: word.last_reviewed_at ? new Date(word.last_reviewed_at).getTime() : undefined,
      }));
      
      // 应用筛选
      if (config.onlyDue) {
        words = words.filter(w => isWordDue({ nextReview: w.nextReview }));
      }
      
      // 应用排序
      if (config.sortBy === 'ebbinghaus') {
        words = [...words].sort((a, b) => (a.nextReview || 0) - (b.nextReview || 0));
      } else if (config.sortBy === 'time') {
        words = [...words].sort((a, b) => (a.reviewCount || 0) - (b.reviewCount || 0));
      } else {
        words = [...words].sort(() => Math.random() - 0.5);
      }

      if (words.length === 0) {
        alert('暂无待复习单词，继续加油！');
        return;
      }

      setReviewWords(words);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsReviewing(true);
      
      // 更新统计
      setStats(prev => ({
        ...prev,
        due: words.length,
      }));
    } catch (error) {
      console.error('Start review error:', error);
      
      // 如果API调用失败，使用模拟数据
      const mockWords: Word[] = [
        { id: '1', word: 'perseverance', translation: '毅力', phonetic: '/ˌpɜːrsəˈvɪrəns/', level: 1, reviewCount: 2 },
        { id: '2', word: 'serendipity', translation: '机缘巧合', phonetic: '/ˌserənˈdɪpəti/', level: 2, reviewCount: 5 },
        { id: '3', word: 'ephemeral', translation: '短暂的', phonetic: '/ɪˈfemərəl/', level: 0, reviewCount: 0 },
        { id: '4', word: 'ubiquitous', translation: '无处不在的', phonetic: '/juːˈbɪkwɪtəs/', level: 3, reviewCount: 8 },
      ].filter(w => !config.onlyDue || isWordDue({ nextReview: Date.now() - Math.random() * 86400000 }));

      setReviewWords(mockWords);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsReviewing(true);
      
      setStats(prev => ({
        ...prev,
        due: mockWords.length,
      }));
    }
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRemember = async () => {
    if (currentIndex >= reviewWords.length) return;
    
    const currentWord = reviewWords[currentIndex];
    
    try {
      // 更新记忆等级
      const newLevel = updateMemoryLevel(currentWord.level || 0, true);
      
      // 调用API更新
      await wordService.updateWordReview(currentWord.id, {
        review_count: newLevel,
        last_reviewed_at: new Date().toISOString(),
      });
      
      // 移动到下一个单词
      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        
        // 更新统计
        setStats(prev => ({
          ...prev,
          completed: prev.completed + 1,
          progress: Math.round(((prev.completed + 1) / prev.due) * 100),
        }));
      } else {
        // 复习完成
        setIsReviewing(false);
        alert('复习完成！');
        loadStats(); // 重新加载统计
      }
    } catch (error) {
      console.error('Remember error:', error);
      // 即使API失败也继续
      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        setIsReviewing(false);
        alert('复习完成！');
      }
    }
  };

  const handleForget = async () => {
    if (currentIndex >= reviewWords.length) return;
    
    const currentWord = reviewWords[currentIndex];
    
    try {
      // 重置记忆等级
      const newLevel = updateMemoryLevel(currentWord.level || 0, false);
      
      // 调用API更新
      await wordService.updateWordReview(currentWord.id, {
        review_count: newLevel,
        last_reviewed_at: new Date().toISOString(),
      });
      
      // 保持当前单词，重新显示
      setIsFlipped(false);
    } catch (error) {
      console.error('Forget error:', error);
      setIsFlipped(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < reviewWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setIsReviewing(false);
      alert('复习完成！');
    }
  };

  const handleEndReview = () => {
    setIsReviewing(false);
  };

  // 获取当前单词
  const currentWord = reviewWords[currentIndex];

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
      fontSize: '24px',
      fontWeight: 700,
      color: DESIGN_SYSTEM.colors.gray[900],
      marginBottom: DESIGN_SYSTEM.spacing[1],
    },
    
    statLabel: {
      fontSize: '13px',
      color: DESIGN_SYSTEM.colors.gray[500],
    },
    
    // 进度条
    progressBar: {
      height: '8px',
      backgroundColor: DESIGN_SYSTEM.colors.gray[200],
      borderRadius: DESIGN_SYSTEM.borderRadius.full,
      marginTop: DESIGN_SYSTEM.spacing[3],
      overflow: 'hidden',
    },
    
    progressFill: {
      height: '100%',
      backgroundColor: DESIGN_SYSTEM.colors.primary,
      borderRadius: DESIGN_SYSTEM.borderRadius.full,
      transition: `width ${DESIGN_SYSTEM.transitions.base}`,
    },
    
    // 复习卡片
    reviewCard: {
      backgroundColor: 'white',
      borderRadius: DESIGN_SYSTEM.borderRadius.xl,
      padding: DESIGN_SYSTEM.spacing[4],
      marginBottom: DESIGN_SYSTEM.spacing[4],
      boxShadow: DESIGN_SYSTEM.shadows.md,
      border: `1px solid ${DESIGN_SYSTEM.colors.gray[200]}`,
      minHeight: '300px',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      transition: `transform ${DESIGN_SYSTEM.transitions.base}`,
    },
    
    // 单词信息
    wordInfo: {
      textAlign: 'center' as const,
    },
    
    wordText: {
      fontSize: '32px',
      fontWeight: 700,
      color: DESIGN_SYSTEM.colors.gray[900],
      marginBottom: DESIGN_SYSTEM.spacing[2],
    },
    
    phonetic: {
      fontSize: '16px',
      color: DESIGN_SYSTEM.colors.gray[500],
      marginBottom: DESIGN_SYSTEM.spacing[3],
      fontStyle: 'italic',
    },
    
    translation: {
      fontSize: '20px',
      color: DESIGN_SYSTEM.colors.gray[700],
      fontWeight: 600,
    },
    
    // 操作按钮
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: DESIGN_SYSTEM.spacing[3],
      marginTop: DESIGN_SYSTEM.spacing[4],
    },
    
    button: {
      padding: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[4]}`,
      borderRadius: DESIGN_SYSTEM.borderRadius.lg,
      fontWeight: 500,
      fontSize: '14px',
      cursor: 'pointer',
      transition: `all ${DESIGN_SYSTEM.transitions.base}`,
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: DESIGN_SYSTEM.spacing[2],
      minHeight: '44px', // 触摸友好
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
    
    // 配置区域
    configCard: {
      backgroundColor: 'white',
      borderRadius: DESIGN_SYSTEM.borderRadius.xl,
      padding: DESIGN_SYSTEM.spacing[4],
      marginBottom: DESIGN_SYSTEM.spacing[4],
      boxShadow: DESIGN_SYSTEM.shadows.md,
      border: `1px solid ${DESIGN_SYSTEM.colors.gray[200]}`,
    },
    
    configTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: DESIGN_SYSTEM.colors.gray[800],
      marginBottom: DESIGN_SYSTEM.spacing[3],
    },
    
    configOption: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${DESIGN_SYSTEM.spacing[2]} 0`,
      borderBottom: `1px solid ${DESIGN_SYSTEM.colors.gray[200]}`,
    },
    
    configLabel: {
      fontSize: '14px',
      color: DESIGN_SYSTEM.colors.gray[700],
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
  };

  return (
    <div style={styles.container}>
      {/* 极简导航 */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>N</div>
          <div>复习</div>
        </div>
        
        <div style={{ fontSize: '14px', color: DESIGN_SYSTEM.colors.gray[500] }}>
          {isReviewing ? `${currentIndex + 1}/${reviewWords.length}` : '复习系统'}
        </div>
      </header>

      <main>
        {!isReviewing ? (
          // 复习准备界面
          <>
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
                  <div style={styles.statValue}>{stats.completed}</div>
                  <div style={styles.statLabel}>已完成</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{stats.progress}%</div>
                  <div style={styles.statLabel}>进度</div>
                </div>
              </div>
              
              {/* 进度条 */}
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${stats.progress}%`,
                  }}
                />
              </div>
            </div>

            {/* 配置卡片 */}
            <div style={styles.configCard}>
              <div style={styles.configTitle}>复习设置</div>
              
              <div style={styles.configOption}>
                <div style={styles.configLabel}>只显示待复习单词</div>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={config.onlyDue}
                    onChange={(e) => setConfig({ ...config, onlyDue: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                </label>
              </div>
              
              <div style={styles.configOption}>
                <div style={styles.configLabel}>排序方式</div>
                <select
                  value={config.sortBy}
                  onChange={(e) => setConfig({ ...config, sortBy: e.target.value as any })}
                  style={{
                    padding: '4px 8px',
                    borderRadius: DESIGN_SYSTEM.borderRadius.md,
                    border: `1px solid ${DESIGN_SYSTEM.colors.gray[300]}`,
                    fontSize: '14px',
                  }}
                >
                  <option value="ebbinghaus">记忆曲线</option>
                  <option value="time">学习时间</option>
                  <option value="random">随机顺序</option>
                </select>
              </div>
            </div>

            {/* 开始复习按钮 */}
            <button
              onClick={startReview}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                width: '100%',
                fontSize: '16px',
                padding: `${DESIGN_SYSTEM.spacing[4]} ${DESIGN_SYSTEM.spacing[6]}`,
              }}
              disabled={stats.due === 0}
            >
              {stats.due === 0 ? '暂无待复习单词' : `开始复习 (${stats.due}个单词)`}
            </button>

            {/* 空状态 */}
            {stats.due === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📚</div>
                <div style={styles.emptyTitle}>暂无待复习单词</div>
                <div style={styles.emptyDescription}>
                  继续学习新单词，系统会根据记忆曲线自动安排复习
                </div>
              </div>
            )}
          </>
        ) : (
          // 复习进行中界面
          <>
            {/* 复习卡片 */}
            <div 
              style={styles.reviewCard}
              onClick={handleCardClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.wordInfo}>
                {!isFlipped ? (
                  // 正面：显示单词
                  <>
                    <div style={styles.wordText}>{currentWord?.word}</div>
                    {currentWord?.phonetic && (
                      <div style={styles.phonetic}>{currentWord.phonetic}</div>
                    )}
                    <div style={{ 
                      fontSize: '14px', 
                      color: DESIGN_SYSTEM.colors.gray[400],
                      marginTop: DESIGN_SYSTEM.spacing[4],
                    }}>
                      点击显示释义
                    </div>
                  </>
                ) : (
                  // 背面：显示释义
                  <>
                    <div style={styles.translation}>{currentWord?.translation}</div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: DESIGN_SYSTEM.colors.gray[400],
                      marginTop: DESIGN_SYSTEM.spacing[4],
                    }}>
                      记忆等级: {getLevelDescription(currentWord?.level || 0)}
                    </div>
                  </>
                )}
              </div>
              
              {/* 进度指示 */}
              <div style={{ 
                position: 'absolute',
                bottom: DESIGN_SYSTEM.spacing[3],
                right: DESIGN_SYSTEM.spacing[3],
                fontSize: '12px',
                color: DESIGN_SYSTEM.colors.gray[400],
              }}>
                {currentIndex + 1} / {reviewWords.length}
              </div>
            </div>

            {/* 操作按钮 */}
            <div style={styles.actionsGrid}>
              <button
                onClick={handleForget}
                style={{
                  ...styles.button,
                  ...styles.buttonWarning,
                }}
              >
                <span>忘记</span>
              </button>
              
              <button
                onClick={handleSkip}
                style={{
                  ...styles.button,
                  ...styles.buttonGray,
                }}
              >
                <span>跳过</span>
              </button>
              
              <button
                onClick={handleRemember}
                style={{
                  ...styles.button,
                  ...styles.buttonSuccess,
                }}
              >
                <span>记住</span>
              </button>
            </div>

            {/* 结束复习按钮 */}
            <button
              onClick={handleEndReview}
              style={{
                ...styles.button,
                ...styles.buttonGray,
                width: '100%',
                marginTop: DESIGN_SYSTEM.spacing[3],
              }}
            >
              结束复习
            </button>
          </>
        )}
      </main>

      {/* 登录提示 */}
      {!user && !isReviewing && (
        <div style={{
          marginTop: DESIGN_SYSTEM.spacing[6],
          padding: DESIGN_SYSTEM.spacing[4],
          backgroundColor: DESIGN_SYSTEM.colors.gray[50],
          borderRadius: DESIGN_SYSTEM.borderRadius.lg,
          border: `1px solid ${DESIGN_SYSTEM.colors.gray[200]}`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '14px', color: DESIGN_SYSTEM.colors.gray[600], marginBottom: DESIGN_SYSTEM.spacing[2] }}>
            登录后可以保存复习进度和同步数据
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