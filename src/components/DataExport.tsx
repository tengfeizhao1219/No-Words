import { useState } from 'react';
import { wordService } from '../services/api';

interface DataExportProps {
  user: any;
  onClose: () => void;
}

export default function DataExport({ user, onClose }: DataExportProps) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleExport = async () => {
    if (!user) {
      setMessage('请先登录');
      setMessageType('error');
      return;
    }

    setExporting(true);
    setMessage('');

    try {
      const words = await wordService.getWords(1000); // 获取最多1000个单词
      
      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        user: {
          email: user.email,
          userId: user.id
        },
        words: words.map(word => ({
          word: word.word,
          translation: word.translation,
          phonetic: word.original_text ? JSON.parse(word.original_text).phonetic : '',
          mastered: word.mastered,
          reviewCount: word.review_count,
          createdAt: word.created_at,
          lastReviewedAt: word.last_reviewed_at
        })),
        stats: {
          totalWords: words.length,
          masteredWords: words.filter(w => w.mastered).length,
          totalReviews: words.reduce((sum, w) => sum + (w.review_count || 0), 0)
        }
      };

      // 创建下载链接
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `不记单词-备份-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage(`成功导出 ${words.length} 个单词`);
      setMessageType('success');
    } catch (error) {
      console.error('导出失败:', error);
      setMessage('导出失败，请重试');
      setMessageType('error');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setImporting(true);
    setMessage('');

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      // 验证数据格式
      if (!importData.words || !Array.isArray(importData.words)) {
        throw new Error('数据格式错误');
      }

      // 这里可以添加导入逻辑
      // 注意：实际导入需要调用API批量创建单词
      console.log('导入数据:', importData);

      setMessage(`成功读取 ${importData.words.length} 个单词（导入功能开发中）`);
      setMessageType('success');
    } catch (error) {
      console.error('导入失败:', error);
      setMessage('导入失败，请检查文件格式');
      setMessageType('error');
    } finally {
      setImporting(false);
      // 清空文件输入
      event.target.value = '';
    }
  };

  const handleExportCSV = async () => {
    if (!user) {
      setMessage('请先登录');
      setMessageType('error');
      return;
    }

    setExporting(true);
    setMessage('');

    try {
      const words = await wordService.getWords(1000);
      
      // 创建CSV内容
      const headers = ['单词', '翻译', '音标', '掌握状态', '复习次数', '创建时间', '最后复习时间'];
      const rows = words.map(word => [
        `"${word.word}"`,
        `"${word.translation}"`,
        `"${word.original_text ? JSON.parse(word.original_text).phonetic : ''}"`,
        word.mastered ? '已掌握' : '未掌握',
        word.review_count || 0,
        new Date(word.created_at).toLocaleDateString('zh-CN'),
        word.last_reviewed_at ? new Date(word.last_reviewed_at).toLocaleDateString('zh-CN') : '从未复习'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // 创建下载链接
      const dataBlob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `不记单词-备份-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage(`成功导出 ${words.length} 个单词为CSV格式`);
      setMessageType('success');
    } catch (error) {
      console.error('CSV导出失败:', error);
      setMessage('导出失败，请重试');
      setMessageType('error');
    } finally {
      setExporting(false);
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">数据备份与恢复</h2>
          <p className="text-gray-500 text-sm">
            定期备份数据，防止意外丢失
          </p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mb-4 p-3 rounded-xl ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-600'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        {/* 导出选项 */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-700 mb-3">📤 导出数据</h3>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                disabled={exporting || !user}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-card hover:shadow-card-hover disabled:shadow-none"
              >
                {exporting ? '导出中...' : '导出为JSON'}
              </button>
              
              <button
                onClick={handleExportCSV}
                disabled={exporting || !user}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-card hover:shadow-card-hover disabled:shadow-none"
              >
                {exporting ? '导出中...' : '导出为CSV'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              JSON格式包含完整数据，CSV格式适合在Excel中查看
            </p>
          </div>

          {/* 导入选项 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-700 mb-3">📥 导入数据</h3>
            <div className="space-y-3">
              <label className="block">
                <div className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-card hover:shadow-card-hover text-center cursor-pointer ${
                  importing || !user ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  {importing ? '导入中...' : '选择JSON文件导入'}
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={importing || !user}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              仅支持之前导出的JSON格式文件（导入功能开发中）
            </p>
          </div>

          {/* 登录提示 */}
          {!user && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm text-gray-600 text-center">
                🔒 请先登录后使用数据备份功能
              </p>
            </div>
          )}

          {/* 注意事项 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-bold text-yellow-800 text-sm mb-2">⚠️ 注意事项</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• 建议每月备份一次数据</li>
              <li>• 备份文件请妥善保管，包含个人学习数据</li>
              <li>• 导入功能会覆盖现有数据，请谨慎操作</li>
              <li>• 云端数据会自动同步，但本地备份更安全</li>
            </ul>
          </div>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  );
}