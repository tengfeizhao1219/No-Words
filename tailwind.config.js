/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 紫色主题（参考 WordMemeray）
        purple: {
          DEFAULT: '#7C3AED',
          light: '#A78BFA',
          pale: '#EDE9FE',
          dark: '#5B21B6',
        },
        // 蓝色辅助色
        blue: {
          DEFAULT: '#2563EB',
          light: '#60A5FA',
          pale: '#DBEAFE',
        },
        // 绿色（掌握/成功）
        green: {
          DEFAULT: '#059669',
          light: '#6EE7B7',
          pale: '#ECFDF5',
        },
        // 橙色（待复习/警告）
        orange: {
          DEFAULT: '#D97706',
          light: '#FCD34D',
          pale: '#FEF3C7',
        },
        // 红色（困难/删除）
        red: {
          DEFAULT: '#DC2626',
          light: '#FCA5A5',
          pale: '#FEF2F2',
        },
      },
      boxShadow: {
        'card': '0 2px 16px rgba(124,58,237,0.08)',
        'card-hover': '0 4px 24px rgba(124,58,237,0.12)',
        'header': '0 2px 12px rgba(124,58,237,0.2)',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
