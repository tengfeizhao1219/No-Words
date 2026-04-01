import { supabase } from './supabase';

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
      .order('mastered', { ascending: false }) // 未掌握的在前
      .order('last_reviewed_at', { ascending: true, nullsFirst: true }) // 从未复习的在前
      .limit(20);

    if (error) throw error;
    return data;
  },
};

/**
 * 翻译服务（对接有道 API）
 * 注意：实际使用时需要在后端调用，避免暴露密钥
 */
export const translationService = {
  async translate(query: string, from = 'auto', to = 'zh-CHS') {
    // TODO: 实现有道翻译 API 调用
    // 由于需要保护 API 密钥，建议通过后端服务调用
    // 这里先返回模拟数据
    
    console.log('Translating:', query);
    
    // 模拟翻译结果（临时）
    return {
      query,
      translation: `[翻译] ${query}`,
      from,
      to,
    };
  },
};
