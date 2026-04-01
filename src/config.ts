// Supabase 配置
// 注意：需要替换为真实的 Supabase 项目信息
// 创建步骤：
// 1. 访问 https://supabase.com 创建账号
// 2. 创建新项目
// 3. 在 Settings → API 获取 URL 和 Anon Key

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// 有道翻译 API 配置
// 申请地址：https://ai.youdao.com/DOCSIRMA/html/trans/api/wbfy/index.html
export const YOUDAO_API_URL = 'https://openapi.youdao.com/api';

export { SUPABASE_URL, SUPABASE_ANON_KEY };
