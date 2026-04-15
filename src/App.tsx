import { useState, useEffect } from 'react';
import HomeRedesigned from './pages/HomeRedesigned';
import LibrarySimplified from './pages/LibrarySimplified';
import ReviewSimplified from './pages/ReviewSimplified';
import AuthModal from './components/AuthModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import DataExport from './components/DataExport';
import { authService } from './services/api';

type Page = 'home' | 'library' | 'review';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 检查用户登录状态
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    checkAuth();
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderPage = () => {
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

    switch (currentPage) {
      case 'home':
        return <HomeRedesigned user={user} onLoginRequest={() => setShowAuthModal(true)} />;
      case 'library':
        return <LibrarySimplified user={user} onLoginRequest={() => setShowAuthModal(true)} />;
      case 'review':
        return <ReviewSimplified user={user} onLoginRequest={() => setShowAuthModal(true)} />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl">📖</div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              不记单词
            </h1>
          </div>
          
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDataExport(true)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors hidden sm:inline-flex items-center gap-1"
                title="数据备份"
              >
                <span>💾</span>
                <span className="hidden md:inline">备份</span>
              </button>
              <div className="text-sm text-gray-600 hidden sm:block">
                {user.email}
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-card hover:shadow-card-hover"
            >
              登录/注册
            </button>
          )}
        </div>
      </header>

      {/* 页面内容 */}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
      
      {/* 底部导航 */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
        <div className="max-w-2xl mx-auto flex justify-around py-3">
          <button
            onClick={() => setCurrentPage('home')}
            className={`flex-1 py-2 text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
              currentPage === 'home'
                ? 'text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-lg">🔍</span>
            <span>首页</span>
          </button>
          <button
            onClick={() => setCurrentPage('library')}
            className={`flex-1 py-2 text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
              currentPage === 'library'
                ? 'text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-lg">📚</span>
            <span>词库</span>
          </button>
          <button
            onClick={() => setCurrentPage('review')}
            className={`flex-1 py-2 text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
              currentPage === 'review'
                ? 'text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-lg">🎯</span>
            <span>复习</span>
          </button>
        </div>
      </nav>

      {/* 登录模态框 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* PWA安装提示 */}
      <PWAInstallPrompt />

      {/* 数据导出模态框 */}
      <DataExport
        user={user}
        onClose={() => setShowDataExport(false)}
      />
    </div>
  );
}
