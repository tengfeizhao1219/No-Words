import { useState, useEffect } from 'react';
import { translationService, wordService } from '../services/api';
import { analyzeWord } from '../lib/word-analysis';
import type { WordAnalysis } from '../lib/word-analysis';

interface HomeProps {
  user: any;
  onLoginRequest: () => void;
}

export default function Home({ user, onLoginRequest }: HomeProps) {
  const [query, setQuery] = useState('');
  const [translation, setTranslation] = useState<WordAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // 发音功能
  const handleSpeak = () => {
    if (!translation) return;
    
    if (translation.audioUrl) {
      // 如果有有道发音URL，使用音频播放
      const audio = new Audio(translation.audioUrl);
      audio.play().catch(console.error);
    } else if ('speechSynthesis' in window) {
      // 使用浏览器语音合成
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
      // 调用翻译 API
      const result = await translationService.translate(query);
      
      // 分析单词（词根拆解 + 记忆技巧）
      const analysis = analyzeWord(result.query, [{ defs: [{ def: result.translation }] }]);
      
      // 使用API返回的音标信息
      const phonetic = result.phonetic || result.usPhonetic || result.ukPhonetic || '';
      
      setTranslation({
        ...analysis,
        phonetic: phonetic,
        audioUrl: result.speakUrl || '',
        explains: result.explains || [],
        webTranslations: result.webTranslations || []
      });
      setIsAdded(false);
    } catch (error) {
      console.error('Translation error:', error);
      
      // 显示错误信息
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
    
    // 检查用户是否登录
    if (!user) {
      onLoginRequest();
      return;
    }
    
    try {
      await wordService.saveWord(
        translation.word,
        translation.word, // TODO: 使用真实翻译
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 pb-24">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            不记单词
          </h1>
          <p className="text-gray-500 text-sm">查询即收藏，无感积累</p>
        </div>
        
        {/* 搜索框 */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入英文单词或句子..."
            className="w-full p-4 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg"
            rows={3}
          />
          
          <button
            onClick={handleTranslate}
            disabled={loading || !query.trim()}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-card hover:shadow-card-hover disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                查询中...
              </span>
            ) : (
              '🔍 查询'
            )}
          </button>
        </div>
        
        {/* 翻译结果 */}
        {translation && (
          <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up">
            {/* 单词和发音 */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {translation.word}
              </h2>
              {translation.phonetic && (
                <div className="flex items-center gap-3">
                  <span className="text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-lg">
                    {translation.phonetic}
                  </span>
                  <button 
                    onClick={handleSpeak}
                    className="flex items-center gap-1 text-purple-600 hover:bg-purple-50 px-3 py-1 rounded-lg transition-colors"
                  >
                    🔊 朗读
                  </button>
                </div>
              )}
            </div>

            {/* 词根拆解 */}
            {translation.roots && translation.roots.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-purple-600">🔤 词根组成</span>
                  <div className="flex-1 h-px bg-purple-100"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {translation.roots.map((root, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl px-4 py-3"
                    >
                      <div className="text-sm">
                        <span className="font-bold text-yellow-800">{root.type}：</span>
                        <span className="text-yellow-900 font-semibold">{root.part}</span>
                      </div>
                      <div className="text-xs text-yellow-700 mt-1">{root.meaning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 记忆技巧 */}
            {translation.tip && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-purple-600">💡 快速记忆技巧</span>
                  <div className="flex-1 h-px bg-purple-100"></div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-xl p-4">
                  <p className="text-green-800 text-sm leading-relaxed">
                    {translation.tip}
                  </p>
                </div>
              </div>
            )}
            
            {/* 添加到词库按钮 */}
            <button
              onClick={handleAddToLibrary}
              disabled={isAdded}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
                isAdded
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-card hover:shadow-card-hover'
              }`}
            >
              {isAdded ? '✅ 已在词库中' : '➕ 加入词库'}
            </button>
          </div>
        )}

        {/* 空状态 */}
        {!translation && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-gray-400">输入单词开始查询</p>
            
            {/* 登录提示 */}
            {!user && (
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl max-w-md mx-auto">
                <p className="text-sm text-gray-600 mb-3">
                  💡 登录后可以保存单词到云端，多设备同步学习
                </p>
                <button
                  onClick={onLoginRequest}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-card hover:shadow-card-hover"
                >
                  立即登录
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
