/**
 * 有道翻译API服务
 * 注意：在实际生产环境中，应该通过后端服务调用API以保护密钥
 */

// 你的有道翻译API配置
const YOUDAO_CONFIG = {
  appKey: 'CFA0UQNEv8wn6zUdBBEdYwRsXazlsMWf',
  appSecret: '0becfe1f56765761',
  baseUrl: 'https://openapi.youdao.com/api'
};

// 生成有道签名
async function generateYoudaoSign(text: string, salt: string): Promise<string> {
  const input = text.length > 20 
    ? text.substring(0, 10) + text.length + text.substring(text.length - 10)
    : text;
  
  const str = YOUDAO_CONFIG.appKey + input + salt + YOUDAO_CONFIG.appSecret;
  
  // 使用SHA-256生成签名
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

// 有道翻译API响应类型
export interface YoudaoTranslationResponse {
  errorCode: string;
  query: string;
  translation: string[];
  basic?: {
    phonetic?: string;
    'us-phonetic'?: string;
    'uk-phonetic'?: string;
    explains?: string[];
  };
  web?: Array<{
    key: string;
    value: string[];
  }>;
  l: string;
  dict?: {
    url: string;
  };
  webdict?: {
    url: string;
  };
  tSpeakUrl?: string;
  speakUrl?: string;
}

// 翻译结果类型
export interface TranslationResult {
  query: string;
  translation: string;
  phonetic?: string;
  usPhonetic?: string;
  ukPhonetic?: string;
  explains?: string[];
  webTranslations?: Array<{
    key: string;
    value: string[];
  }>;
  speakUrl?: string;
  tSpeakUrl?: string;
  errorCode?: string;
}

/**
 * 调用有道翻译API
 * @param text 要翻译的文本
 * @param from 源语言，默认自动检测
 * @param to 目标语言，默认中文
 */
export async function translateWithYoudao(
  text: string, 
  from: string = 'auto', 
  to: string = 'zh-CHS'
): Promise<TranslationResult> {
  try {
    const salt = Date.now().toString();
    const sign = await generateYoudaoSign(text, salt);
    
    const params = new URLSearchParams({
      q: text,
      from: from,
      to: to,
      appKey: YOUDAO_CONFIG.appKey,
      salt: salt,
      sign: sign,
      signType: 'v3',
      curtime: Math.floor(Date.now() / 1000).toString()
    });

    const response = await fetch(`${YOUDAO_CONFIG.baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`翻译API错误: ${response.status}`);
    }
    
    const data: YoudaoTranslationResponse = await response.json();
    
    if (data.errorCode !== '0') {
      throw new Error(`翻译错误: ${data.errorCode}`);
    }
    
    // 处理返回数据
    const result: TranslationResult = {
      query: data.query,
      translation: data.translation?.[0] || '',
      errorCode: data.errorCode
    };
    
    // 处理基础信息
    if (data.basic) {
      result.phonetic = data.basic.phonetic;
      result.usPhonetic = data.basic['us-phonetic'];
      result.ukPhonetic = data.basic['uk-phonetic'];
      result.explains = data.basic.explains;
    }
    
    // 处理网络释义
    if (data.web && data.web.length > 0) {
      result.webTranslations = data.web.slice(0, 3);
    }
    
    // 处理发音URL
    if (data.speakUrl) {
      result.speakUrl = data.speakUrl;
    }
    
    if (data.tSpeakUrl) {
      result.tSpeakUrl = data.tSpeakUrl;
    }
    
    return result;
    
  } catch (error) {
    console.error('有道翻译失败:', error);
    throw error;
  }
}

/**
 * 备用翻译服务（当有道翻译失败时使用）
 */
export async function translateWithFallback(text: string): Promise<TranslationResult> {
  try {
    // 尝试使用Free Dictionary API作为备用
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text)}`);
    
    if (response.ok) {
      const data = await response.json();
      
      // 处理Free Dictionary API的响应
      if (Array.isArray(data) && data.length > 0) {
        const wordData = data[0];
        const meanings = wordData.meanings?.[0];
        const definition = meanings?.definitions?.[0]?.definition || '';
        
        return {
          query: text,
          translation: definition || `[备用翻译] ${text}`,
          phonetic: wordData.phonetic || wordData.phonetics?.[0]?.text || '',
          explains: meanings?.definitions?.slice(0, 3).map((d: any) => d.definition) || []
        };
      }
    }
  } catch (error) {
    console.warn('备用翻译失败:', error);
  }
  
  // 如果所有API都失败，返回本地生成的备用结果
  return {
    query: text,
    translation: `[本地翻译] ${text}`,
    explains: ['翻译服务暂时不可用，请检查网络连接']
  };
}

/**
 * 主翻译函数，包含错误降级机制
 */
export async function translateText(text: string): Promise<TranslationResult> {
  try {
    // 首先尝试有道翻译
    return await translateWithYoudao(text);
  } catch (error) {
    console.warn('有道翻译失败，尝试备用方案:', error);
    
    try {
      // 尝试备用翻译
      return await translateWithFallback(text);
    } catch (fallbackError) {
      console.error('所有翻译服务都失败:', fallbackError);
      
      // 返回最基本的本地结果
      return {
        query: text,
        translation: `翻译失败: ${text}`,
        explains: ['请检查网络连接或稍后重试']
      };
    }
  }
}

/**
 * 判断文本类型（单词或句子）
 */
export function detectTextType(text: string): 'word' | 'sentence' {
  const trimmed = text.trim();
  
  // 如果包含空格，很可能是句子
  if (trimmed.includes(' ')) {
    return 'sentence';
  }
  
  // 如果是单个单词，检查长度和格式
  if (trimmed.length <= 20 && /^[a-zA-Z\-']+$/.test(trimmed)) {
    return 'word';
  }
  
  return 'sentence';
}

/**
 * 获取发音URL（如果有）
 */
export function getPronunciationUrl(result: TranslationResult): string | null {
  // 优先使用有道提供的发音URL
  if (result.speakUrl) {
    return result.speakUrl;
  }
  
  // 如果没有有道发音URL，可以使用浏览器语音合成
  return null;
}

/**
 * 测试API连接
 */
export async function testAPIConnection(): Promise<boolean> {
  try {
    const result = await translateWithYoudao('hello');
    return result.errorCode === '0' && !!result.translation;
  } catch (error) {
    console.error('API连接测试失败:', error);
    return false;
  }
}