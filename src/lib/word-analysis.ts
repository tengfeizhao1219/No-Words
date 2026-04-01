/**
 * 词根拆解和记忆技巧生成
 * 复用 WordMemeray 项目的精华功能
 */

/**
 * 常见前缀
 */
const PREFIXES: Record<string, string> = {
  'un': '否定/不',
  're': '再次/回',
  'pre': '前',
  'dis': '否定/分离',
  'mis': '错误',
  'over': '过度',
  'out': '超过',
  'sub': '在下面',
  'inter': '之间',
  'trans': '跨越',
  'super': '超级',
  'anti': '反对',
  'auto': '自动',
  'bi': '两个',
  'co': '共同',
  'de': '去除',
  'ex': '向外',
  'in': '向内/否定',
  'micro': '微小',
  'mid': '中间',
  'mono': '单一',
  'multi': '多',
  'non': '非',
  'post': '之后',
  'pro': '向前',
  'semi': '半',
  'tri': '三',
  'under': '在下面',
  'fore': '前面',
  'counter': '相反',
  'com': '共同',
  'con': '共同',
  'col': '共同',
  'cor': '共同',
  'im': '进入/否定',
  'il': '否定',
  'ir': '否定',
  'per': '通过',
  'para': '旁边',
  'dia': '穿过',
  'ana': '向上',
  'cata': '向下',
  'meta': '变化',
  'hyper': '过度',
  'hypo': '在下面',
};

/**
 * 常见后缀
 */
const SUFFIXES: Record<string, string> = {
  'tion': '名词后缀 (行为/状态)',
  'sion': '名词后缀 (行为/状态)',
  'ness': '名词后缀 (性质)',
  'ment': '名词后缀 (结果)',
  'able': '形容词后缀 (能够)',
  'ible': '形容词后缀 (能够)',
  'ful': '形容词后缀 (充满)',
  'less': '形容词后缀 (没有)',
  'ly': '副词后缀',
  'ize': '动词后缀 (使成为)',
  'ise': '动词后缀 (使成为)',
  'er': '名词后缀 (人/物)',
  'or': '名词后缀 (人/物)',
  'ist': '名词后缀 (专家)',
  'ism': '名词后缀 (主义)',
  'ity': '名词后缀 (状态)',
  'ive': '形容词后缀 (有...性质)',
  'al': '形容词后缀 (相关的)',
  'ic': '形容词后缀 (有...性质)',
  'ous': '形容词后缀 (充满)',
  'ary': '形容词/名词后缀',
  'ify': '动词后缀 (使成为)',
  'en': '动词后缀 (使...化)',
  'ate': '动词后缀 (做)',
  'ure': '名词后缀 (行为)',
  'ance': '名词后缀 (状态)',
  'ence': '名词后缀 (状态)',
  'ant': '形容词后缀 (具有...性质)',
  'ent': '形容词后缀 (具有...性质)',
  'ing': '现在分词/动名词',
  'ed': '过去式/过去分词',
  'es': '第三人称单数/复数',
  's': '第三人称单数/复数',
  'y': '形容词后缀 (充满)',
  'ty': '名词后缀 (状态)',
};

/**
 * 词根（简化版）
 */
const ROOTS: Record<string, string> = {
  'act': '做',
  'ag': '做',
  'apt': '拿',
  'ceive': '拿',
  'cept': '拿',
  'clude': '关闭',
  'clus': '关闭',
  'dict': '说',
  'duce': '引导',
  'duct': '引导',
  'fac': '做',
  'fact': '做',
  'fect': '做',
  'fer': '携带',
  'form': '形状',
  'gress': '走',
  'grad': '走',
  'ject': '投掷',
  'lect': '选择',
  'leg': '选择',
  'lig': '选择',
  'mit': '发送',
  'miss': '发送',
  'mot': '移动',
  'mov': '移动',
  'port': '携带',
  'pos': '放置',
  'posit': '放置',
  'press': '压',
  'prim': '压',
  'quest': '寻找',
  'quir': '寻找',
  'rupt': '打破',
  'scrib': '写',
  'script': '写',
  'sect': '切',
  'sent': '感觉',
  'sens': '感觉',
  'spect': '看',
  'spic': '看',
  'tain': '保持',
  'ten': '保持',
  'tin': '保持',
  'tract': '拉',
  'tract': '拉',
  'vad': '走',
  'vas': '走',
  'ven': '来',
  'vent': '来',
  'vert': '转',
  'vers': '转',
  'vid': '看',
  'vis': '看',
  'voc': '声音',
  'voke': '声音',
};

export interface WordRoot {
  part: string;
  meaning: string;
  type: '前缀' | '后缀' | '词根';
}

export interface WordAnalysis {
  word: string;
  roots: WordRoot[];
  tip: string;
}

/**
 * 拆解单词的词根
 * @param word 单词
 * @returns 词根数组
 */
export function guessRoots(word: string): WordRoot[] {
  const w = word.toLowerCase();
  const result: WordRoot[] = [];

  // 查找前缀
  for (const [prefix, meaning] of Object.entries(PREFIXES)) {
    if (w.startsWith(prefix) && w.length > prefix.length + 2) {
      result.push({
        part: prefix + '-',
        meaning,
        type: '前缀'
      });
      break;
    }
  }

  // 查找后缀
  for (const [suffix, meaning] of Object.entries(SUFFIXES)) {
    if (w.endsWith(suffix) && w.length > suffix.length + 2) {
      result.push({
        part: '-' + suffix,
        meaning,
        type: '后缀'
      });
      break;
    }
  }

  // 查找词根
  for (const [root, meaning] of Object.entries(ROOTS)) {
    if (w.includes(root) && root.length >= 3) {
      result.push({
        part: root,
        meaning,
        type: '词根'
      });
      break;
    }
  }

  // 如果没有找到任何词根，将整个单词作为词根
  if (result.length === 0) {
    result.push({
      part: word,
      meaning: '独立词根',
      type: '词根'
    });
  }

  return result;
}

/**
 * 生成记忆技巧
 * @param word 单词
 * @param meanings 释义
 * @returns 记忆技巧
 */
export function generateTip(word: string, meanings?: Array<{ defs?: Array<{ def?: string }> }>): string {
  const def = meanings?.[0]?.defs?.[0]?.def || '';
  
  const tips = [
    `将 "${word}" 想象成一幅画面：${def.slice(0, 30)}...`,
    `联想记忆：把 "${word}" 拆成熟悉的音节，编一个小故事。`,
    `反复使用：今天用 "${word}" 造 3 个句子，明天就不会忘了。`,
    `谐音联想：听 "${word}" 的发音，联想一个中文谐音词来辅助记忆。`,
    `语境记忆：将 "${word}" 放入一个你亲身经历的场景中去理解。`,
    `词根记忆：分析 "${word}" 的词根词缀，理解其构成逻辑。`,
    `对比记忆：找几个和 "${word}" 相似的单词一起记忆。`,
    `联想网络：把 "${word}" 和你知道的相关单词联系起来。`,
  ];

  // 根据单词长度选择一个记忆技巧
  return tips[word.length % tips.length];
}

/**
 * 分析单词
 * @param word 单词
 * @param meanings 释义
 * @returns 分析结果
 */
export function analyzeWord(word: string, meanings?: Array<{ defs?: Array<{ def?: string }> }>): WordAnalysis {
  return {
    word,
    roots: guessRoots(word),
    tip: generateTip(word, meanings)
  };
}
