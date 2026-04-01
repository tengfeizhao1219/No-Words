import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // TODO: 对接有道翻译 API
      // 临时模拟翻译结果
      setTimeout(() => {
        setTranslation(`[翻译结果] ${query}`);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Translation error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        {/* 搜索框 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            不记单词
          </h1>
          <p className="text-gray-500 text-center mb-6">
            查询即收藏，无感积累
          </p>
          
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入单词或句子..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
          
          <button
            onClick={handleTranslate}
            disabled={loading || !query.trim()}
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? '翻译中...' : '翻译'}
          </button>
        </div>
        
        {/* 翻译结果 */}
        {translation && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              翻译结果
            </h2>
            <p className="text-gray-600">{translation}</p>
            
            <button className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              ✅ 已收藏到词库
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
