// Supabase连接测试脚本
import { createClient } from '@supabase/supabase-js';

// 请在这里填写你的Supabase配置
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

async function testSupabaseConnection() {
  console.log('🔍 开始测试Supabase连接...');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Anon Key: ${SUPABASE_ANON_KEY.substring(0, 10)}...`);

  try {
    // 创建Supabase客户端
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 测试1: 检查认证状态
    console.log('\n📊 测试1: 检查认证状态');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(`❌ 认证测试失败: ${authError.message}`);
    } else {
      console.log(`✅ 认证测试成功: ${authData.session ? '已登录' : '未登录'}`);
    }
    
    // 测试2: 检查数据库表
    console.log('\n📊 测试2: 检查数据库表');
    const { data: tablesData, error: tablesError } = await supabase
      .from('words')
      .select('count')
      .limit(1);
    
    if (tablesError) {
      console.log(`❌ 数据库表测试失败: ${tablesError.message}`);
      
      // 检查是否是表不存在
      if (tablesError.message.includes('does not exist')) {
        console.log('⚠️  表不存在，请运行SQL脚本创建表');
        console.log('运行命令: psql -h your-project.supabase.co -p 5432 -U postgres -d postgres -f supabase-schema.sql');
      }
    } else {
      console.log(`✅ 数据库表测试成功: 表存在`);
    }
    
    // 测试3: 检查行级安全策略
    console.log('\n📊 测试3: 检查行级安全策略');
    const { data: rlsData, error: rlsError } = await supabase
      .from('words')
      .select('*')
      .limit(1);
    
    if (rlsError) {
      console.log(`❌ RLS策略测试失败: ${rlsError.message}`);
    } else {
      console.log(`✅ RLS策略测试成功: 可以查询数据`);
    }
    
    // 测试4: 检查存储过程
    console.log('\n📊 测试4: 检查存储过程');
    const { data: funcData, error: funcError } = await supabase.rpc('get_review_queue');
    
    if (funcError) {
      console.log(`❌ 存储过程测试失败: ${funcError.message}`);
      console.log('⚠️  存储过程不存在，请运行SQL脚本创建');
    } else {
      console.log(`✅ 存储过程测试成功`);
    }
    
    console.log('\n🎉 Supabase连接测试完成！');
    
    if (authError || tablesError || rlsError || funcError) {
      console.log('\n🔧 需要修复的问题:');
      console.log('1. 确保Supabase项目已创建');
      console.log('2. 运行SQL脚本创建表和存储过程');
      console.log('3. 检查行级安全策略配置');
      console.log('4. 验证API密钥是否正确');
    } else {
      console.log('\n✅ 所有测试通过！数据库配置正确。');
    }
    
  } catch (error) {
    console.error(`💥 测试过程中发生错误: ${error.message}`);
    console.log('\n🔧 可能的解决方案:');
    console.log('1. 检查网络连接');
    console.log('2. 验证Supabase URL和密钥');
    console.log('3. 确保Supabase项目已激活');
    console.log('4. 检查防火墙设置');
  }
}

// 运行测试
testSupabaseConnection();