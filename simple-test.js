// 简单测试Supabase连接
const SUPABASE_URL = 'https://hrfqnlghcukysrclpsbq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZnFubGdoY3VreXNyY2xwc2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjk2MTksImV4cCI6MjA5MDYwNTYxOX0.4CDjC77ZkOgITz6euIldQLMKuQsJZtUhM0c_e3Rsbk0';

console.log('🔍 测试Supabase基本信息...');
console.log('📋 Supabase URL:', SUPABASE_URL);
console.log('🔑 Anon Key 长度:', SUPABASE_ANON_KEY.length, '字符');
console.log('🔑 Anon Key 前20字符:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

// 检查URL格式
if (!SUPABASE_URL.startsWith('https://') || !SUPABASE_URL.includes('.supabase.co')) {
  console.error('❌ Supabase URL格式不正确');
} else {
  console.log('✅ Supabase URL格式正确');
}

// 检查密钥格式（JWT格式）
if (SUPABASE_ANON_KEY.startsWith('eyJ')) {
  console.log('✅ Anon Key格式正确（JWT格式）');
} else {
  console.error('❌ Anon Key格式不正确，应该以eyJ开头');
}

console.log('\n🎯 下一步：需要在Supabase控制台运行数据库初始化SQL脚本');
console.log('1. 登录 https://app.supabase.com');
console.log('2. 选择 no-words 项目');
console.log('3. 点击左侧菜单的 "SQL Editor"');
console.log('4. 点击 "New query"');
console.log('5. 复制并运行 supabase-schema.sql 文件中的SQL脚本');
console.log('6. 运行完成后，数据库就初始化完成了');