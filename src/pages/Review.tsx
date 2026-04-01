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

interface Word {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  audioUrl?: string;
  level?: number;
  nextReview?: number;
  reviewCount?: number;
}

interface ReviewConfig {
  hidePhonetic: boolean;
  hideDef: boolean;
  onlyDue: boolean;
  sortBy: 'ebbinghaus' | 'time' | 'random';
}

export default function Review() {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewWords, setReviewWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [config, setConfig] = useState<ReviewConfig>({
    hidePhonetic: false,
    hideDef: true,
    onlyDue: true,
    sortBy: 'ebbinghaus',
  });

  // 模拟待复习单词
  const mockWords: Word[] = [
    { id: '1', word: 'Hello', translation: '你好', phonetic: '/həˈloʊ/', level: 1, reviewCount: 2 },
    { id: '2', word: 'World', translation: '世界', phonetic: '/wɜːrld/', level: 2, reviewCount: 5 },
    { id: '3', word: 'Apple', translation: '苹果', phonetic: '/ˈæpəl/', level: 0, reviewCount: 0 },
    { id: '4', word: 'Banana', translation: '香蕉', phonetic: '/bəˈnænə/', level: 3, reviewCount: 8 },
    { id: '5', word: 'Orange', translation: '橙子', phonetic: '/ˈɔːrɪndʒ/', level: 1, reviewCount: 3 },
  ];

  const startReview = () => {
    let words = config.onlyDue ? mockWords.filter(w => isWordDue({ nextReview: w.nextReview })) : mockWords;
    
    if (config.sortBy === 'ebbinghaus') {
      words = [...words].sort((a, b) => (a.nextReview || 0) - (b.nextReview || 0));
    } else if (config.sortBy === 'time') {
      words = [...words].sort((a, b) => (a.reviewCount || 0) - (b.reviewCount || 0));
    } else {
      words = [...words].sort(() => Math.random() - 0.5);
    }

    setReviewWords(words);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsReviewing(true);
  };

  const handleNext = async (rating: number) => {
    const currentWord = reviewWords[currentIndex];
    
    try {
      // 更新记忆等级
      const newLevel = updateMemoryLevel(currentWord.level || 0, rating);
      const nextReview = getNextReviewTime(newLevel);
      
      // TODO: 调用 API 更新
      console.log(`更新单词 ${currentWord.word}: Level ${currentWord.level} → ${newLevel}, 下次复习：${new Date(nextReview).toLocaleDateString()}`);
      
      // 移动到下一个单词
      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        // 复习完成
        alert(`🎉 复习完成！\n\n本次复习：${reviewWords.length}个单词\n继续加油！`);
        setIsReviewing(false);
      }
    } catch (error) {
      console.error('Update word error:', error);
    }
  };

  const closeReview = () => {
    setIsReviewing(false);
  };

  // 复习覆盖层
  if (isReviewing && reviewWords.length > 0) {
    const currentWord = reviewWords[currentIndex];
    const progress = ((currentIndex + 1) / reviewWords.length) * 100;

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-purple-50 to-white flex flex-col">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex justify-between items-center shadow-header">
          <span className="text-white font-bold">
            {currentIndex + 1} / {reviewWords.length}
          </span>
          <button
            onClick={closeReview}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors"
          >
            退出复习
          </button>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-purple-200 h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 单词卡片 */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="bg-white rounded-3xl shadow-card p-8 cursor-pointer transition-all hover:shadow-card-hover min-h-[400px] flex flex-col items-center justify-center"
            >
              {/* 单词 */}
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                {currentWord.word}
              </h2>

              {/* 发音 */}
              {currentWord.phonetic && !config.hidePhonetic && (
                <div className="text-purple-600 font-medium bg-purple-50 px-4 py-2 rounded-xl mb-6">
                  {currentWord.phonetic}
                </div>
              )}

              {/* 记忆等级 */}
              <div className="mb-6 text-center">
                <div className="text-sm text-gray-500 mb-2">当前等级</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 w-32">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${calculateProgress(currentWord.level || 0)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-purple-600">L{currentWord.level}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {getLevelDescription(currentWord.level || 0)}
                </div>
              </div>

              {/* 点击提示 */}
              {!isFlipped && (
                <div className="text-gray-400 text-sm mt-8">
                  👆 点击显示释义
                </div>
              )}

              {/* 释义（翻转后显示） */}
              {isFlipped && !config.hideDef && (
                <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-l-4 border-green-500 animate-fade-in">
                  <p className="text-green-800 text-lg font-medium">
                    {currentWord.translation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 评分按钮 */}
        {isFlipped && (
          <div className="p-6 bg-white border-t border-gray-100">
            <div className="max-w-md mx-auto grid grid-cols-3 gap-4">
              <button
                onClick={() => handleNext(1)}
                className="bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-300 rounded-2xl p-4 transition-all hover:shadow-card"
              >
                <div className="text-2xl mb-1">😰</div>
                <div className="text-red-700 font-bold text-sm">记不住</div>
                <div className="text-red-500 text-xs mt-1">1 天后复习</div>
              </button>

              <button
                onClick={() => handleNext(3)}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border-2 border-yellow-300 rounded-2xl p-4 transition-all hover:shadow-card"
              >
                <div className="text-2xl mb-1">🤔</div>
                <div className="text-yellow-700 font-bold text-sm">有点印象</div>
                <div className="text-yellow-500 text-xs mt-1">3 天后复习</div>
              </button>

              <button
                onClick={() => handleNext(5)}
                className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-300 rounded-2xl p-4 transition-all hover:shadow-card"
              >
                <div className="text-2xl mb-1">😄</div>
                <div className="text-green-700 font-bold text-sm">记住了</div>
                <div className="text-green-500 text-xs mt-1">7 天后复习</div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 复习设置页面
  const dueCount = countDueWords(mockWords);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 pb-24">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🎯 复习设置
          </h1>
          <p className="text-gray-500 text-sm">
            待复习单词：{dueCount} 个
          </p>
        </div>

        {/* 复习选项 */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">复习内容</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">只复习今日到期单词</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.onlyDue}
                  onChange={(e) => setConfig({ ...config, onlyDue: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">隐藏读音（靠记忆回想）</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.hidePhonetic}
                  onChange={(e) => setConfig({ ...config, hidePhonetic: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">隐藏释义（靠记忆回想）</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.hideDef}
                  onChange={(e) => setConfig({ ...config, hideDef: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 排序方式 */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <h3 className="font-bold text-gray-800 mb-4">排序方式</h3>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setConfig({ ...config, sortBy: 'ebbinghaus' })}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                config.sortBy === 'ebbinghaus'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-card'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📈 记忆曲线
            </button>
            <button
              onClick={() => setConfig({ ...config, sortBy: 'time' })}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                config.sortBy === 'time'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-card'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🕐 添加时间
            </button>
            <button
              onClick={() => setConfig({ ...config, sortBy: 'random' })}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                config.sortBy === 'random'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-card'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🎲 随机
            </button>
          </div>
        </div>

        {/* 开始复习按钮 */}
        <button
          onClick={startReview}
          disabled={dueCount === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-5 px-6 rounded-2xl transition-all shadow-card hover:shadow-card-hover disabled:shadow-none text-lg"
        >
          {dueCount > 0 ? '开始复习 →' : '暂无待复习单词'}
        </button>

        {/* 说明 */}
        <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6">
          <h4 className="font-bold text-purple-800 mb-3">💡 艾宾浩斯记忆曲线</h4>
          <p className="text-purple-700 text-sm leading-relaxed mb-4">
            根据德国心理学家艾宾浩斯的研究，人类大脑的记忆遗忘是有规律的。
            通过在特定时间点（1 天、3 天、7 天、14 天、30 天、90 天）复习，
            可以将短期记忆转化为长期记忆。
          </p>
          <div className="flex justify-between text-xs text-purple-600">
            <span>新单词</span>
            <span>→</span>
            <span>短期记忆</span>
            <span>→</span>
            <span>长期记忆</span>
            <span>→</span>
            <span>永久记忆</span>
          </div>
        </div>
      </div>
    </div>
  );
}
