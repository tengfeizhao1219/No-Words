import { useState } from 'react';
import { authService } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.signInWithEmail(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || '发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('请输入验证码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyOtp(email, otp);
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || '验证码错误');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'email') {
        handleSendOtp();
      } else {
        handleVerifyOtp();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {step === 'email' ? '欢迎使用不记单词' : '输入验证码'}
          </h2>
          <p className="text-gray-500 text-sm">
            {step === 'email' 
              ? '输入邮箱地址，获取验证码登录' 
              : `验证码已发送至 ${email}`}
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 邮箱输入步骤 */}
        {step === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="your@email.com"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading || !email.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-card hover:shadow-card-hover disabled:shadow-none"
            >
              {loading ? '发送中...' : '获取验证码'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              点击"获取验证码"即表示同意我们的服务条款和隐私政策
            </p>
          </div>
        )}

        {/* 验证码输入步骤 */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                验证码
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入6位验证码"
                maxLength={6}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('email')}
                className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                返回
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={loading || !otp.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-card hover:shadow-card-hover disabled:shadow-none"
              >
                {loading ? '验证中...' : '登录'}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="text-sm text-purple-600 hover:text-purple-700 disabled:text-gray-400"
              >
                重新发送验证码
              </button>
              <p className="text-xs text-gray-500 mt-2">
                验证码有效期15分钟
              </p>
            </div>
          </div>
        )}

        {/* 其他登录方式（后续扩展） */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">
            其他登录方式（开发中）
          </p>
          <div className="flex justify-center gap-3">
            <button
              disabled
              className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-colors cursor-not-allowed"
              title="开发中"
            >
              <span className="text-lg">📱</span>
            </button>
            <button
              disabled
              className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-colors cursor-not-allowed"
              title="开发中"
            >
              <span className="text-lg">🐧</span>
            </button>
            <button
              disabled
              className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-colors cursor-not-allowed"
              title="开发中"
            >
              <span className="text-lg">🍎</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}