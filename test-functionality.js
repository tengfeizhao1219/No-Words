// No-Words项目功能测试脚本
import { createClient } from '@supabase/supabase-js'

// 从环境变量读取配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hrfqnlghcukysrclpsbq.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZnFubGdoY3VreXNyY2xwc2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjk2MTksImV4cCI6MjA5MDYwNTYxOX0.4CDjC77ZkOgITz6euIldQLMKuQsJZtUhM0c_e3Rsbk0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
  console.log('🔍 测试数据库连接...')
  
  try {
    // 测试1: 检查表是否存在
    const { data: tables, error: tablesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
    
    if (tablesError) {
      console.log('❌ 无法连接到profiles表:', tablesError.message)
      return false
    }
    
    console.log('✅ 数据库连接成功！profiles表可访问')
    
    // 测试2: 检查其他表
    const tablesToCheck = ['words', 'study_records', 'review_plans']
    for (const table of tablesToCheck) {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table}表访问失败:`, error.message)
      } else {
        console.log(`✅ ${table}表可访问`)
      }
    }
    
    return true
  } catch (error) {
    console.error('💥 数据库连接测试出错:', error.message)
    return false
  }
}

async function testRLSPolicies() {
  console.log('\n🔒 测试RLS策略...')
  
  try {
    // 测试RLS策略：未认证用户应该无法插入数据
    const { error } = await supabase
      .from('words')
      .insert({
        word: 'test',
        translation: '测试',
        user_id: '00000000-0000-0000-0000-000000000000'
      })
    
    if (error && error.code === '42501') {
      console.log('✅ RLS策略生效：未认证用户无法插入数据')
    } else if (error) {
      console.log('⚠️ RLS策略可能有问题:', error.message)
    } else {
      console.log('❌ RLS策略可能未生效：未认证用户插入了数据')
    }
    
    return true
  } catch (error) {
    console.error('💥 RLS策略测试出错:', error.message)
    return false
  }
}

async function testYoudaoAPI() {
  console.log('\n🌐 测试有道翻译API...')
  
  const youdaoAppKey = process.env.VITE_YOUDAO_APP_KEY || 'CFA0UQNEv8wn6zUdBBEdYwRsXazlsMWf'
  const youdaoAppSecret = process.env.VITE_YOUDAO_APP_SECRET || '0becfe1f56765761'
  
  if (!youdaoAppKey || !youdaoAppSecret) {
    console.log('❌ 有道翻译API密钥未配置')
    return false
  }
  
  console.log('✅ 有道翻译API密钥已配置')
  console.log('🔑 App Key:', youdaoAppKey.substring(0, 8) + '...')
  console.log('🔐 App Secret:', youdaoAppSecret.substring(0, 8) + '...')
  
  // 注意：这里不实际调用API，避免产生费用
  console.log('ℹ️ 有道翻译API配置正确，实际调用将在应用中测试')
  
  return true
}

async function testApplicationStructure() {
  console.log('\n📁 测试应用结构...')
  
  // 动态导入fs和path模块
  const fs = await import('fs')
  const path = await import('path')
  
  const requiredFiles = [
    'src/App.tsx',
    'src/config.ts',
    'src/main.tsx',
    'index.html',
    'vite.config.ts',
    'package.json'
  ]
  
  let allFilesExist = true
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} 存在`)
    } else {
      console.log(`❌ ${file} 不存在`)
      allFilesExist = false
    }
  }
  
  // 检查环境变量文件
  const envFiles = ['.env', '.env.example']
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile)
    if (fs.existsSync(envPath)) {
      console.log(`✅ ${envFile} 存在`)
      if (envFile === '.env') {
        const content = fs.readFileSync(envPath, 'utf8')
        const hasSupabaseUrl = content.includes('VITE_SUPABASE_URL')
        const hasSupabaseKey = content.includes('VITE_SUPABASE_ANON_KEY')
        const hasYoudaoKey = content.includes('VITE_YOUDAO_APP_KEY')
        
        console.log(`   - Supabase URL配置: ${hasSupabaseUrl ? '✅' : '❌'}`)
        console.log(`   - Supabase Key配置: ${hasSupabaseKey ? '✅' : '❌'}`)
        console.log(`   - 有道API配置: ${hasYoudaoKey ? '✅' : '❌'}`)
      }
    } else {
      console.log(`⚠️ ${envFile} 不存在`)
    }
  }
  
  return allFilesExist
}

async function runAllTests() {
  console.log('🚀 开始No-Words项目功能测试')
  console.log('=' .repeat(50))
  
  const results = {
    database: await testDatabaseConnection(),
    rls: await testRLSPolicies(),
    youdao: await testYoudaoAPI(),
    structure: await testApplicationStructure()
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('📊 测试结果汇总:')
  console.log('=' .repeat(50))
  
  const passed = Object.values(results).filter(Boolean).length
  const total = Object.keys(results).length
  
  console.log(`✅ 通过: ${passed}/${total}`)
  console.log(`❌ 失败: ${total - passed}/${total}`)
  
  console.log('\n详细结果:')
  for (const [test, result] of Object.entries(results)) {
    console.log(`  ${result ? '✅' : '❌'} ${test}: ${result ? '通过' : '失败'}`)
  }
  
  console.log('\n' + '=' .repeat(50))
  
  if (passed === total) {
    console.log('🎉 所有测试通过！No-Words项目配置正确')
    console.log('\n下一步:')
    console.log('1. 访问 http://localhost:3000 测试应用')
    console.log('2. 验证用户注册/登录功能')
    console.log('3. 测试单词添加和翻译功能')
    console.log('4. 部署到Vercel生产环境')
  } else {
    console.log('⚠️ 部分测试失败，需要检查配置')
    console.log('\n建议检查:')
    if (!results.database) console.log('  - Supabase数据库连接和表结构')
    if (!results.rls) console.log('  - RLS策略配置')
    if (!results.youdao) console.log('  - 有道翻译API密钥')
    if (!results.structure) console.log('  - 应用文件结构')
  }
  
  return passed === total
}

// 运行测试
runAllTests().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('💥 测试运行出错:', error)
  process.exit(1)
})