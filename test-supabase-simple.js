// 简单的Supabase连接测试
import('node-fetch').then(fetch => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hrfqnlghcukysrclpsbq.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZnFubGdoY3VreXNyY2xwc2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjk2MTksImV4cCI6MjA5MDYwNTYxOX0.4CDjC77ZkOgITz6euIldQLMKuQsJZtUhM0c_e3Rsbk0';
  
  console.log('测试Supabase连接...');
  console.log('URL:', supabaseUrl);
  
  fetch.default(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  .then(response => {
    console.log('响应状态:', response.status, response.statusText);
    return response.text();
  })
  .then(data => {
    console.log('响应数据:', data.substring(0, 200));
    console.log('✅ Supabase连接成功！');
  })
  .catch(error => {
    console.error('❌ Supabase连接失败:', error.message);
  });
}).catch(error => {
  console.error('无法加载node-fetch:', error.message);
  console.log('请安装: npm install node-fetch');
});