import React from 'react';

interface ReviewMinimalProps {
  user: any;
  onLoginRequest: () => void;
}

export default function ReviewMinimal({ user, onLoginRequest }: ReviewMinimalProps) {
  console.log('ReviewMinimal组件渲染，用户状态:', user ? '已登录' : '未登录');
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1e293b',
          marginBottom: '10px'
        }}>
          单词复习
        </h1>
        
        <p style={{
          color: '#64748b',
          marginBottom: '30px'
        }}>
          简化版复习页面 - 测试用
        </p>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '20px'
          }}>
            页面状态
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '15px',
              backgroundColor: '#e0e7ff',
              borderRadius: '12px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#4f46e5'
              }}>
                5
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6366f1'
              }}>
                总单词数
              </div>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '15px',
              backgroundColor: '#d1fae5',
              borderRadius: '12px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#059669'
              }}>
                3
              </div>
              <div style={{
                fontSize: '14px',
                color: '#10b981'
              }}>
                需要复习
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              console.log('开始复习按钮点击');
              if (!user) {
                onLoginRequest();
                return;
              }
              alert('开始复习功能（简化版）');
            }}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
          >
            {user ? '开始复习' : '登录后开始复习'}
          </button>
          
          {!user && (
            <p style={{
              marginTop: '15px',
              fontSize: '14px',
              color: '#94a3b8'
            }}>
              登录后可以保存学习进度
            </p>
          )}
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '15px'
          }}>
            调试信息
          </h3>
          
          <div style={{
            fontSize: '14px',
            color: '#475569',
            textAlign: 'left',
            backgroundColor: '#f1f5f9',
            padding: '12px',
            borderRadius: '8px',
            fontFamily: 'monospace'
          }}>
            <div>组件: ReviewMinimal.tsx</div>
            <div>状态: 渲染成功</div>
            <div>用户: {user ? user.email : '未登录'}</div>
            <div>时间: {new Date().toLocaleTimeString()}</div>
          </div>
          
          <button
            onClick={() => {
              console.log('测试控制台日志');
              alert('控制台已输出测试日志');
            }}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            测试控制台
          </button>
        </div>
      </div>
    </div>
  );
}