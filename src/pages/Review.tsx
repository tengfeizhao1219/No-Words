import { useState } from 'react';

export default function Review() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // TODO: 从 Supabase 拉取待复习单词
  const words = [
    { id: 1, word: 'Hello', translation: '你好' },
    { id: 2, word: 'World', translation: '世界' },
    { id: 3, word: 'Apple', translation: '苹果' },
  ];

  const handleNext = (mastered: boolean) => {
    console.log(`Word ${words[currentIndex].word} mastered:`, mastered);
    setIsFlipped(false);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert('复习完成！🎉');
      setCurrentIndex(0);
    }
  };

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          没有待复习的单词
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        {/* 进度显示 */}
        <div className="text-center text-gray-600 mb-4">
          {currentIndex + 1} / {words.length}
        </div>
        
        {/* 闪卡 */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="bg-white rounded-lg shadow-lg p-8 h-64 flex items-center justify-center cursor-pointer transform transition-transform hover:scale-105"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              {isFlipped ? currentWord.translation : currentWord.word}
            </h2>
            <p className="text-gray-500 mt-4 text-sm">
              点击{isFlipped ? '查看英文' : '查看中文'}
            </p>
          </div>
        </div>
        
        {/* 掌握标记按钮 */}
        {isFlipped && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => handleNext(false)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ❌ 没记住
            </button>
            <button
              onClick={() => handleNext(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ✅ 掌握了
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
