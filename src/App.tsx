import { useState } from 'react';
import Home from './pages/Home';
import Library from './pages/Library';
import Review from './pages/Review';

type Page = 'home' | 'library' | 'review';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'library':
        return <Library />;
      case 'review':
        return <Review />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 页面内容 */}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
      
      {/* 底部导航 */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0">
        <div className="max-w-2xl mx-auto flex justify-around py-3">
          <button
            onClick={() => setCurrentPage('home')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              currentPage === 'home'
                ? 'text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📖 首页
          </button>
          <button
            onClick={() => setCurrentPage('library')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              currentPage === 'library'
                ? 'text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📚 词库
          </button>
          <button
            onClick={() => setCurrentPage('review')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              currentPage === 'review'
                ? 'text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎯 复习
          </button>
        </div>
      </nav>
    </div>
  );
}
