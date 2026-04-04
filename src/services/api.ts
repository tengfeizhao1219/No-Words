import { supabase } from '../lib/supabase';

/**
 * 用户认证服务
 */
export const authService = {
  // 邮箱登录（发送验证码）
  async signInWithEmail(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    });
    if (error) throw error;
    return data;
  },

  // 验证码登录
  async verifyOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw error;
    return data;
  },

  // 退出登录
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 获取当前用户
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};

/**
 * 单词数据服务
 */
export const wordService = {
  // 保存单词（查询时自动调用）
  async saveWord(word: string, translation: string, originalText?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const { data, error } = await supabase
      .from('words')
      .insert({
        user_id: user.id,
        word,
        translation,
        original_text: originalText,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 获取用户的单词列表
  async getWords(limit = 50) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // 更新单词（标记为已掌握/未掌握）
  async updateWord(id: string, updates: { mastered?: boolean; review_count?: number }) {
    const { data, error } = await supabase
      .from('words')
      .update({
        ...updates,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除单词
  async deleteWord(id: string) {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // 获取待复习单词
  async getReviewQueue() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('user_id', user.id)
      .order('mastered', { ascending: false })
      .order('last_reviewed_at', { ascending: true, nullsFirst: true })
      .limit(20);

    if (error) throw error;
    return data;
  },
};

import { translateText, detectTextType, getPronunciationUrl, testAPIConnection } from './youdao-translation';
import type { TranslationResult } from './youdao-translation';

/**
 * 翻译服务（集成有道翻译API）
 */
export const translationService = {
  async translate(query: string, from = 'auto', to = 'zh-CHS') {
    try {
      // 调用有道翻译API
      const result = await translateText(query);
      
      return {
        query: result.query,
        translation: result.translation,
        from,
        to,
        phonetic: result.phonetic,
        usPhonetic: result.usPhonetic,
        ukPhonetic: result.ukPhonetic,
        explains: result.explains || [],
        webTranslations: result.webTranslations || [],
        speakUrl: result.speakUrl,
        textType: detectTextType(query),
        errorCode: result.errorCode
      };
    } catch (error) {
      console.error('翻译服务错误:', error);
      
      // 返回错误信息
      return {
        query,
        translation: `翻译失败: ${query}`,
        from,
        to,
        explains: ['请检查网络连接或稍后重试'],
        textType: detectTextType(query),
        errorCode: '999'
      };
    }
  },
  
  // 测试API连接
  async testConnection() {
    return await testAPIConnection();
  },
  
  // 获取发音URL
  getPronunciationUrl(result: any): string | null {
    return getPronunciationUrl(result);
  },
  
  // 判断文本类型
  detectTextType(text: string): 'word' | 'sentence' {
    return detectTextType(text);
  }
};
