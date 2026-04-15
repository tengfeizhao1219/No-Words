import { useState, useEffect } from 'react';
import { wordService } from '../services/api';

interface ReviewSimplifiedFixedProps {
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

export default function ReviewSimplifiedFixed({ user, onLoginRequest }: ReviewSimplifiedFixedProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewWords, setReviewWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载复习单词
  useEffect(() => {
    loadReviewWords();
  }, [user]);

  const loadReviewWords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        // 用户未登录，显示示例数据
        setReviewWords([
          { id: '1', word: 'hello', translation: '你好', level: 1 },
          { id: '2', word: 'world', translation: '世界', level: 2 },
          { id: '3', word: 'apple', translation: '苹果', level: 1 },
        ]);
        return;
      }

      // 用户已登录，从API加载
      const words = await wordService.getReviewQueue();
      setReviewWords(words);
    } catch (err: any) {
      console.error('加载复习单词失败:', err);
      setError(err.message || '加载失败');
      
      // 显示示例数据作为降级
      setReviewWords([
        { id: '1', word: 'hello', translation: '你好', level: 1 },
        { id: '2', word: 'world', translation: '世界', level: 2 },
        { id: '3', word: 'apple', translation: '苹果', level: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startReview = () => {
    if (!user) {
      onLoginRequest();
      return;
    }
    
    if (reviewWords.length === 0) {
      setError('没有需要复习的单词');
      return;
    }
    
    setIsReviewing(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRemembered = async () => {
    if (currentIndex < reviewWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // 复习完成
      setIsReviewing(false);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const handleForgot = async () => {
    // 将当前单词移到列表末尾，稍后再次复习
    const updatedWords = [...reviewWords];
    const currentWord = updatedWords[currentIndex];
    updatedWords.splice(currentIndex, 1);
    updatedWords.push(currentWord);
    setReviewWords(updatedWords);
    
    if (currentIndex < updatedWords.length - 1) {
      setCurrentIndex(currentIndex);
    } else {
      setIsReviewing(false);
    }
    setIsFlipped(false);
  };

  const currentWord = reviewWords[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isReviewing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">单词复习</h1>
            <p className="text-gray-600">通过闪卡模式巩固记忆</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{reviewWords.length}</div>
                <div className="text-sm text-gray-500">总单词数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {reviewWords.filter(w => !w.level || w.level < 3).length}
                </div>
                <div className="text-sm text-gray-500">需要复习</div>
              </div>
            </div>

            <button
              onClick={startReview}
              disabled={reviewWords.length === 0}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              {reviewWords.length === 0 ? '暂无单词需要复习' : '开始复习'}
            </button>

            {!user && (
              <div className="mt-4 text-center text-sm text-gray-500">
                登录后可以保存学习进度
              </div>
            )}
          </div>

          {reviewWords.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">即将复习的单词</h3>
              <div className="space-y-3">
                {reviewWords.slice(0, 5).map((word, index) => (
                  <div key={word.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{word.word}</div>
                      <div className="text-sm text-gray-500">{word.translation}</div>
                    </div>
                    <div className="text-sm text-gray-400">
                      等级 {word.level || 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 复习模式
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">
            进度 {currentIndex + 1} / {reviewWords.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / reviewWords.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <div 
            className="bg-white rounded-2xl shadow-xl p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:shadow-2xl"
            onClick={handleCardClick}
          >
            {isFlipped ? (
              <div className="text-center">
                <div className="text-4xl mb-6">🇨🇳</div>
                <div className="text-3xl font-bold text-gray-800 mb-4">
                  {currentWord.translation}
                </div>
                <div className="text-gray-500">
                  {currentWord.phonetic && `/${currentWord.phonetic}/`}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-6">🇺🇸</div>
                <div className="text-4xl font-bold text-gray-800 mb-4">
                  {currentWord.word}
                </div>
                <div className="text-gray-500">
                  点击卡片查看中文释义
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center mt-4 text-sm text-gray-500">
            {isFlipped ? '点击返回英文' : '点击查看中文'}
          </div>
        </div>

        {isFlipped && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleForgot}
              className="py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl text-lg hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <span>❌</span>
                <span>没记住</span>
              </div>
            </button>
            <button
              onClick={handleRemembered}
              className="py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl text-lg hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <span>✅</span>
                <span>记住了</span>
              </div>
            </button>
          </div>
        )}

        {!isFlipped && (
          <div className="text-center text-gray-500">
            查看中文释义后选择记忆情况
          </div>
        )}
      </div>
    </div>
  );
}