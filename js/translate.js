/* =========================================================================
 * translate.js —— 翻译 & 语法检测（双层逻辑）
 * -------------------------------------------------------------------------
 * 离线兜底：依赖 data.js 的 SENTENCE_LIBRARY（matchSentences）。
 * 联网增强：免费、无需密钥的公共接口
 *   - 翻译：Google 翻译公共端点 translate.googleapis.com（仅上传单句中文）
 *   - 语法：LanguageTool 公共接口 api.languagetool.org（仅上传单句文本）
 * 隐私约束：绝不上传日记全文 / 用户名 / 密码 / 心情等；只传“当前正在输入的那一句”。
 * 失败 / 断网：自动降级到离线，绝不抛错卡死。
 * ========================================================================= */

/* ----------------------- 1. 实时中文 → 英文提示 ----------------------- */
// 离线：基于素材库匹配，返回候选英文（含口语/书面两种）
function offlineSuggest(text, level) {
  const items = matchSentences(text, level, 6);
  const out = [];
  items.forEach(it => {
    out.push({ from: 'offline', label: '口语', text: it.spoken, cn: it.cn });
    out.push({ from: 'offline', label: '书面', text: it.written, cn: it.cn });
  });
  return out;
}

// 联网实时翻译“当前单句中文”——经用户自建的有道代理（Cloudflare Workers）调用有道官方 API。
// 隐私：仅把“当前正在输入的那一句中文”发给你的代理；代理再转发给有道。
// 密钥（appSecret）只存在于你的 Workers 环境变量中，绝不暴露给前端 / 他人。
// 失败（断网 / 代理不可用 / 配额耗尽 / 未配置代理）→ 抛错，由调用方降级到本地素材库。
async function onlineTranslateOne(sentence, proxy) {
  if (!proxy) throw new Error('no-proxy');
  const sep = proxy.includes('?') ? '&' : '?';
  const url = proxy + sep + 'q=' + encodeURIComponent(sentence) + '&from=zh-CHS&to=en';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error('http ' + res.status);
    const data = await res.json();
    // 有道 errorCode 为 "0"（字符串或数字）表示成功，其余为错误码
    if (data.errorCode !== undefined && String(data.errorCode) !== '0') throw new Error('youdao ' + data.errorCode);
    const text = (data.translation && data.translation[0]) || '';
    if (!text) throw new Error('empty');
    return { text: text.trim() };
  } finally {
    clearTimeout(timer);
  }
}

/* 综合建议：联网开 + 在线 → 在线翻译 + 离线素材候选；否则纯离线。
 * text: 当前中文句；level: 等级；onlineOn: 是否开启联网增强
 * 回调 onResult(list) 实时填充弹窗。
 */
async function getSuggestions(text, level, onlineOn) {
  const list = offlineSuggest(text, level); // 离线永远有兜底
  if (onlineOn && navigator.onLine) {
    try {
      const r = await onlineTranslateOne(text);
      // 把在线精准翻译插到最前面，标注“AI 精准”
      list.unshift({ from: 'online', label: 'AI 精准', text: r.text, cn: text });
    } catch (e) {
      // 静默降级：在线失败就用离线，不报错
    }
  }
  return list;
}

/* ----------------------- 2. 全文语法检测 ----------------------- */
// 离线基础语法检测：基于启发式规则，识别常见低级错误
// 返回 [{type, original, message, suggestion}]
function offlineGrammarCheck(text) {
  const issues = [];
  const s = text;

  // 规则1：I 后面跟 is/are
  const iIsAre = s.match(/\bI\s+(is|are)\b/gi);
  if (iIsAre) {
    iIsAre.forEach(m => issues.push({
      original: m.trim(),
      message: '第一人称 I 后面要用 am，不用 is/are。',
      suggestion: 'I am'
    }));
  }
  // 规则2：He/She/It 作主语，谓语动词未加 -s（简单判断：后接动词原形）
  const third = s.match(/\b(He|She|It)\s+([a-z]+)(?:\s|$)/gi);
  // 常见不规则动词的第三人称单数
  const irreg3rd = { go:'goes', do:'does', have:'has', be:'is', say:'says' };
  if (third) {
    third.forEach(m => {
      const parts = m.trim().split(/\s+/);
      const subj = parts[0]; // He / She / It
      const verb = parts[1].toLowerCase();
      const irregular = ['is', 'was', 'has', 'can', 'may', 'will', 'would', 'should', 'does', 'goes', 'gets'];
      if (/^[a-z]+$/.test(verb) && !irregular.includes(verb) && !verb.endsWith('s')) {
        const fixedVerb = irreg3rd[verb] || (verb + 's');
        // 保留主语，只改动词
        issues.push({ original: m.trim(), message: '第三人称单数主语后，动词一般要加 -s。', suggestion: subj + ' ' + fixedVerb });
      }
    });
  }
  // 规则3：连续两个 the（多写）
  if (/\bthe\s+the\b/i.test(s)) {
    issues.push({ original: 'the the', message: '重复了冠词 the。', suggestion: 'the' });
  }
  // 规则4：句首小写（简单判断首字母）
  const firstWord = (s.match(/[A-Za-z]+/g) || [])[0];
  if (firstWord && /^[a-z]/.test(firstWord) && s.trim().startsWith(firstWord)) {
    issues.push({ original: firstWord, message: '英文句子首字母应大写。', suggestion: capitalize(firstWord) });
  }
  // 规则5：句末缺少标点（以字母结尾且无标点）
  if (/[a-zA-Z]\s*$/.test(s.trim()) && s.trim().length > 0) {
    issues.push({ original: '(句末)', message: '句子结尾建议加上标点（. ? !）。', suggestion: '.' });
  }

  // ===== 以下为扩充规则（让"非常啰嗦"和用词问题也能识别）=====

  // 规则6：a/an 不匹配（a 后面跟元音开头的单词，应该用 an）
  const aAn = s.match(/\ba\s+([aeiouAEIOU]\w*)/g);
  if (aAn) {
    aAn.forEach(m => {
      const w = m.split(/\s+/)[1];
      issues.push({ original: m, message: `以元音开头的单词前应该用 "an" 而不是 "a"。`, suggestion: 'an ' + w });
    });
  }

  // 规则7：more + 已经是比较级的词（双重比较）
  const doubleCmp = s.match(/\bmore\s+(better|harder|larger|bigger|smaller|worse|sooner|easier|nicer|taller|shorter|newer|older|faster|slower|stronger|weaker)\b/gi);
  if (doubleCmp) {
    doubleCmp.forEach(m => {
      const w = m.split(/\s+/)[1].toLowerCase();
      issues.push({ original: m, message: `"${w}" 本身已经是比较级，前面不要再加 more。`, suggestion: w });
    });
  }

  // 规则8：most + 已经是最高级的词（双重最高级）
  const doubleSup = s.match(/\bmost\s+(biggest|smallest|best|worst|tallest|shortest|fastest|slowest|strongest|weakest|newest|oldest|easiest|hardest|nicest)\b/gi);
  if (doubleSup) {
    doubleSup.forEach(m => {
      const w = m.split(/\s+/)[1].toLowerCase();
      issues.push({ original: m, message: `"${w}" 本身已经是最高级，前面不要再加 most。`, suggestion: w });
    });
  }

  // 规则9：very much + 形容词（啰嗦，去掉 much）
  const vm = s.match(/\bvery\s+much\s+(upset|happy|angry|sad|tired|excited|disappointed|pleased|surprised|nervous|worried|annoyed|frustrated|relieved|grateful)\b/gi);
  if (vm) {
    vm.forEach(m => {
      const w = m.split(/\s+/)[2].toLowerCase();
      issues.push({ original: m, message: `"very much" 后的形容词直接用 "very" 即可，去掉 much 更地道。`, suggestion: 'very ' + w });
    });
  }

  // 规则10：人称代词后多了 -ing 形式（am/is/are + 动词原形应该是现在分词，但这里检查常见错误：I/he/she/it 直接 + 过去式却应是过去式——留给在线检测做）

  return issues;
}

// 联网语法检测：LanguageTool 公共接口（仅传单句文本）
async function onlineGrammarCheck(text) {
  const url = 'https://api.languagetool.org/v2/check';
  const body = new URLSearchParams();
  body.set('text', text);
  body.set('language', 'en-US');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error('http ' + res.status);
    const data = await res.json();
    return (data.matches || []).map(m => ({
      original: text.substr(m.offset, m.length),
      // 优先用中文翻译；回退到 shortMessage → rule.description → 原英文 message
      message: translateLTMessage(m.message) || m.shortMessage || m.rule?.description || m.message,
      suggestion: (m.replacements && m.replacements[0] && m.replacements[0].value) || '',
      offset: m.offset,
      length: m.length
    }));
  } finally {
    clearTimeout(timer);
  }
}

// 把 LanguageTool 常见的英文错误提示翻译成中文
function translateLTMessage(msg) {
  if (!msg) return '';
  // 精确短语优先（直接整句替换）
  const exact = {
    "Don't put a space before the full stop.": '句号前不要加空格。',
    "Don't put a space before the question mark.": '问号前不要加空格。',
    "Don't put a space before the exclamation mark.": '感叹号前不要加空格。',
    "Don't put a space before the comma.": '逗号前不要加空格。',
    "Don't put a space before the period.": '句号前不要加空格。',
    "Two consecutive spaces": '不应有两个连续空格。',
    "Possible spelling mistake found.": '可能有拼写错误。',
    "This sentence does not start with an uppercase letter.": '句首字母应大写。',
    "Possible typo: you repeated a word": '单词重复了，请删除一个。',
    "Possible typo: 'you' is repeated": '单词 "you" 重复了。',
    "Redundant phrase.": '表达冗余，可精简。',
  };
  if (exact[msg]) return exact[msg];
  // 正则模式（捕获组用 $1..$n 占位，替换回原文捕获）
  const patterns = [
    [/Possible typo\.\s*Did you mean\s*"([^"]+)"\?/i, '可能是笔误。您是否想写 "$1"？'],
    [/Did you mean\s*"([^"]+)"\s*instead\?/i, '您是否想写 "$1"？'],
    [/Use\s*"([^"]+)"\s*instead of\s*"([^"]+)"\?/i, '请用 "$1" 代替 "$2"。'],
    [/A comma may be missing after[^.]*\./i, '此处可能缺少逗号。'],
    [/Add a space between[^.]*\./i, '两词之间应加空格。'],
    [/Make sure you use a comma[^.]*\./i, '此处请用逗号。'],
    [/This verb may not be used with[^.]*\./i, '动词用法可能不正确。'],
    [/Possible agreement error[^.]*\./i, '主谓可能不一致。'],
    [/Wrong verb form[^.]*\./i, '动词形式可能有误。'],
    [/Incorrect article[^.]*\./i, '冠词使用可能错误。'],
    [/Confusing prepositions?[^.]*\./i, '介词搭配可能有误。'],
    [/Wordiness[^.]*\./i, '表达过于啰嗦，建议精简。'],
    [/American English vs\.? British English[^.]*\./i, '美式与英式拼写混用了，请统一。'],
    [/Unpaired symbol[^.]*\./i, '符号未配对，请检查括号/引号。'],
    [/Possible typo[^.]*\./i, '可能有笔误。'],
    [/Spelling mistake[^.]*\./i, '拼写可能有误。'],
    [/Missing comma[^.]*\./i, '缺少逗号。'],
    [/comma splice[^.]*\./i, '不应使用逗号连接两个独立句子。'],
    [/run-on sentence[^.]*\./i, '这是一个连写句，请加句号或连接词。'],
    [/fragment[^.]*\./i, '句子不完整。'],
  ];
  for (const [re, cn] of patterns) {
    const m = msg.match(re);
    if (m) return cn.replace(/\$(\d)/g, (_, i) => m[+i] || '');
  }
  return ''; // 没匹配上时由调用方回退到 shortMessage/description
}

/* 综合语法检测：onlineOn 且在线 → 在线；否则离线。
 * 返回 {issues, mode:'online'|'offline'}
 */
async function checkGrammar(text, onlineOn) {
  if (onlineOn && navigator.onLine) {
    try {
      const issues = await onlineGrammarCheck(text);
      return { issues, mode: 'online' };
    } catch (e) {
      return { issues: offlineGrammarCheck(text), mode: 'offline' };
    }
  }
  return { issues: offlineGrammarCheck(text), mode: 'offline' };
}

/* 一键全文修正：把检测出的问题按顺序替换（在原始文本上应用）。
 * 关键：按 offset 倒序处理（从后往前替换），避免连锁错位。
 * 对离线"规则类"建议做启发式替换；对在线有明确 suggestion 的做精准替换。
 * 返回修正后的文本。
 */
function applyFixes(text, issues) {
  let out = text;

  // 1) 先处理有 offset 的（在线精准）：倒序替换，避免连锁错位
  const withOffset = issues
    .filter(it => it.offset !== undefined && it.offset !== null && it.suggestion && typeof it.length === 'number')
    .sort((a, b) => b.offset - a.offset);

  withOffset.forEach(it => {
    const start = Math.max(0, it.offset);
    const end = Math.min(out.length, it.offset + it.length);
    if (start >= end) return;
    out = out.slice(0, start) + it.suggestion + out.slice(end);
  });

  // 2) 处理没 offset 的（离线启发式）：按 original 字符串替换
  // 跳过已经被精确替换过的（避免重复替换）
  const offline = issues.filter(it => it.offset === undefined && it.suggestion && it.original);
  offline.forEach(it => {
    const re = new RegExp(escapeReg(it.original), 'i');
    if (re.test(out)) out = out.replace(re, it.suggestion);
  });

  return out;
}

/* ----------------------- 工具函数 ----------------------- */
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function escapeReg(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
