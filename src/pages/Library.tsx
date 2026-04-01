import { useState, useEffect } from 'react';
import { wordService } from '../services/api';
import { isWordDue, countDueWords, getDaysUntilReview } from '../lib/memory-curve';
import type { HideMode, CardRevealState } from '../types/hide-mode';

interface Word {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  meanings?: any;
  mastered?: boolean;
  level?: number;
  nextReview?: number;
  createdAt?: number;
}

export default function Library() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideMode, setHideMode] = useState<HideMode>('none');
  const [revealedCards, setRevealedCards] = useState<CardRevealState>({});
  const [filter, setFilter] = useState<'all' | 'due' | 'mastered'>('all');

  useEffect(() => {
    loadWords();
  }, [filter]);

  const loadWords = async () => {
    try {
      // TODO: 使用真实的 wordService.getWords()
      // 临时使用模拟数据
      const mockWords: Word[] = [
        {
          id: '1',
          word: 'Hello',
          translation: '你好',
          phonetic: '/həˈloʊ/',
          mastered: false,
          level: 2,
          nextReview: Date.now() + 86400000,
          createdAt: Date.now(),
        },
        {
          id: '2',
          word: 'World',
          translation: '世界',
          phonetic: '/wɜːrld/',
          mastered: true,
          level: 5,
          nextReview: Date.now() + 86400000 * 30,
          createdAt: Date.now() - 86400000,
        },
      ];
      setWords(mockWords);
    } catch (error) {
      console.error('Load words error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHideMode = (mode: HideMode) => {
    setHideMode(mode);
    setRevealedCards({}); // 重置所有卡片的显示状态
  };

  const toggleCardReveal = (wordId: string) => {
    setRevealedCards(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }));
  };

  const getFilteredWords = () => {
    if (filter === 'due') return words.filter(w => isWordDue({ mastered: w.mastered, nextReview: w.nextReview }));
    if (filter === 'mastered') return words.filter(w => w.mastered);
    return words;
  };

  const shouldHideContent = (contentType: 'phonetic' | 'def') => {
    if (hideMode === 'none') return false;
    if (hideMode === 'both') return true;
    return hideMode === contentType;
  };

  const filteredWords = getFilteredWords();
  const dueCount = countDueWords(words);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 pb-24">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            📚 我的词库
          </h1>
          <p className="text-gray-500 text-sm">
            共 {words.length} 个单词 · 待复习 {dueCount} 个
          </p>
        </div>

        {/* 工具栏 */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-6">
          {/* 筛选按钮 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-card'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('due')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                filter === 'due'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-card'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              待复习
            </button>
            <button
              onClick={() => setFilter('mastered')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                filter === 'mastered'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-card'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              已掌握
            </button>
          </div>

          {/* 隐藏模式 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">隐藏模式：</span>
            <button
              onClick={() => toggleHideMode('none')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                hideMode === 'none'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent'
              }`}
            >
              👁 显示
            </button>
            <button
              onClick={() => toggleHideMode('phonetic')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                hideMode === 'phonetic'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent'
              }`}
            >
              🔊 隐藏读音
            </button>
            <button
              onClick={() => toggleHideMode('def')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                hideMode === 'def'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent'
              }`}
            >
              📝 隐藏释义
            </button>
            <button
              onClick={() => toggleHideMode('both')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                hideMode === 'both'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent'
              }`}
            >
              🔒 全隐藏
            </button>
          </div>
        </div>
        
        {/* 单词列表 */}
        <div className="space-y-4">
          {filteredWords.map((item) => {
            const isRevealed = revealedCards[item.id] || hideMode === 'none';
            const hidePhonetic = shouldHideContent('phonetic') && !isRevealed;
            const hideDef = shouldHideContent('def') && !isRevealed;
            const isDueWord = isWordDue({ mastered: item.mastered, nextReview: item.nextReview });
            const daysLeft = item.nextReview ? getDaysUntilReview(item.nextReview) : 0;

            return (
              <div
                key={item.id}
                onClick={() => toggleCardReveal(item.id)}
                className={`bg-white rounded-2xl shadow-card p-5 transition-all cursor-pointer ${
                  hideMode !== 'none' ? 'hover:shadow-card-hover' : ''
                } ${item.mastered ? 'border-l-4 border-green-500' : isDueWord ? 'border-l-4 border-orange-500' : 'border-l-4 border-purple-500'}`}
              >
                {/* 显示/隐藏按钮 */}
                {hideMode !== 'none' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCardReveal(item.id);
                    }}
                    className="absolute right-4 top-4 text-gray-400 hover:text-purple-600 transition-colors text-xl"
                  >
                    {isRevealed ? '🙈' : '👁'}
                  </button>
                )}

                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* 单词 */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {item.word}
                    </h3>
                    
                    {/* 发音 */}
                    <div className={`mb-3 transition-all duration-300 ${hidePhonetic ? 'blur-md select-none' : ''}`}>
                      {item.phonetic && (
                        <span className="text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-lg text-sm">
                          {item.phonetic}
                        </span>
                      )}
                    </div>
                    
                    {/* 释义 */}
                    <div className={`transition-all duration-300 ${hideDef ? 'blur-md select-none' : ''}`}>
                      <p className="text-gray-600">{item.translation}</p>
                    </div>

                    {/* 记忆等级 */}
                    {item.level !== undefined && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${((item.level || 0) / 6) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">L{item.level}</span>
                      </div>
                    )}

                    {/* 复习信息 */}
                    <div className="mt-3 flex items-center gap-3">
                      {item.mastered ? (
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                          ✅ 已掌握
                        </span>
                      ) : isDueWord ? (
                        <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                          ⏰ 待复习
                        </span>
                      ) : (
                        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                          📅 {daysLeft > 0 ? `${daysLeft}天后复习` : '今天复习'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 空状态 */}
        {filteredWords.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500">
              {filter === 'due' ? '暂无待复习单词，继续加油！' : 
               filter === 'mastered' ? '还没有掌握的单词' : 
               '词库是空的，去搜索添加单词吧'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
