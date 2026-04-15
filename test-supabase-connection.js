// 测试Supabase连接
import('node-fetch').then(async ({ default: fetch }) => {
  const SUPABASE_URL = 'https://hrfqnlghcukysrclpsbq.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZnFubGdoY3VreXNyY2xwc2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjk2MTksImV4cCI6MjA5MDYwNTYxOX0.4CDjC77ZkOgITz6euIldQLMKuQsJZtUhM0c_e3Rsbk0';

  try {
    console.log('🔍 测试Supabase连接...');
    
    // 测试1: 健康检查
    const healthResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (healthResponse.ok) {
      console.log('✅ Supabase连接成功！');
      console.log('📊 响应状态:', healthResponse.status);
      
      // 测试2: 获取数据库信息
      const tablesResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/vnd.pgrst.object+json'
        }
      });
      
      if (tablesResponse.ok) {
        const data = await tablesResponse.json();
        console.log('📋 数据库信息:', JSON.stringify(data, null, 2));
      } else {
        console.log('ℹ️ 无法获取数据库信息，可能需要初始化表结构');
      }
    } else {
      console.log('❌ Supabase连接失败');
      console.log('状态码:', healthResponse.status);
      console.log('响应:', await healthResponse.text());
    }
  } catch (error) {
    console.error('💥 连接测试出错:', error.message);
  }
}).catch(err => {
  console.error('无法导入node-fetch:', err);
  
  // 使用内置fetch
  const SUPABASE_URL = 'https://hrfqnlghcukysrclpsbq.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZnFubGdoY3VreXNyY2xwc2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjk2MTksImV4cCI6MjA5MDYwNTYxOX0.4CDjC77ZkOgITz6euIldQLMKuQsJZtUhM0c_e3Rsbk0';

  fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  })
  .then(response => {
    if (response.ok) {
      console.log('✅ Supabase连接成功！');
      console.log('📊 响应状态:', response.status);
    } else {
      console.log('❌ Supabase连接失败');
      console.log('状态码:', response.status);
    }
  })
  .catch(error => {
    console.error('💥 连接测试出错:', error.message);
  });
});