export default function Library() {
  // TODO: 从 Supabase 拉取用户单词列表
  const words = [
    { id: 1, word: 'Hello', translation: '你好', created_at: '2026-04-01' },
    { id: 2, word: 'World', translation: '世界', created_at: '2026-04-01' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-2xl mx-auto pt-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          我的词库
        </h1>
        
        {/* 单词列表（卡片式） */}
        <div className="space-y-4">
          {words.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.word}
                  </h3>
                  <p className="text-gray-600 mt-1">{item.translation}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {item.created_at}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {words.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            还没有收藏单词，快去查询吧！
          </div>
        )}
      </div>
    </div>
  );
}
