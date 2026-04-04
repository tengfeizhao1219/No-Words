import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 检查是否已安装
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();

    // 监听安装提示事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 延迟显示提示，避免立即打扰用户
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // 监听应用安装状态变化
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('用户接受了安装提示');
        setIsInstalled(true);
      } else {
        console.log('用户拒绝了安装提示');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('安装失败:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 保存用户选择，避免频繁提示
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // 如果已安装或用户已关闭提示，不显示
  if (isInstalled || !showPrompt || localStorage.getItem('pwa-prompt-dismissed') === 'true') {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
          </div>

          {/* 内容 */}
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">添加到主屏幕</h3>
            <p className="text-sm text-white text-opacity-90 mb-3">
              将「不记单词」添加到主屏幕，像原生应用一样使用
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-white text-purple-600 font-semibold py-2 px-4 rounded-xl hover:bg-opacity-90 transition-colors"
              >
                立即添加
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-white text-opacity-80 hover:text-opacity-100 transition-colors"
              >
                稍后
              </button>
            </div>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={handleDismiss}
            className="text-white text-opacity-70 hover:text-opacity-100 text-xl"
          >
            ×
          </button>
        </div>

        {/* 功能亮点 */}
        <div className="mt-4 pt-4 border-t border-white border-opacity-20">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-sm mb-1">🚀</div>
              <div className="text-white text-opacity-90">快速启动</div>
            </div>
            <div className="text-center">
              <div className="text-sm mb-1">📱</div>
              <div className="text-white text-opacity-90">全屏体验</div>
            </div>
            <div className="text-center">
              <div className="text-sm mb-1">⚡</div>
              <div className="text-white text-opacity-90">离线使用</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}