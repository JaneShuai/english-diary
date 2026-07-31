/* =========================================================================
 * data.js —— 离线中英短句素材库
 * -------------------------------------------------------------------------
 * 说明（给 AI / 后续维护者）：
 *  - 这是“离线兜底”能力的核心数据，断网或关闭联网增强时完全靠它工作。
 *  - 分级：cet4（四级）/ cet6（六级）/ ielts_basic（雅思基础）/ ielts_advanced（雅思进阶）。
 *  - 每一条都区分“口语(spoken)”与“书面日记(written)”两种表达。
 *  - keywords：触发关键词，用户在输入框写中文时，命中关键词就弹出对应英文提示。
 *  - 覆盖场景：mood 心情 / weather 天气 / commute 通勤 / study 学习 / life 生活日常。
 *  - 用词全部生活化，无生僻词，严格匹配各自等级。
 * ========================================================================= */

// 英语等级枚举（与设置页选项保持一致）
const LEVELS = {
  cet4: '英语四级',
  cet6: '英语六级',
  ielts_basic: '雅思基础',
  ielts_advanced: '雅思进阶'
};

// 场景分类中文名（用于历史/报表无关的通用展示）
const SCENES = {
  mood: '心情',
  weather: '天气',
  commute: '通勤',
  study: '学习',
  life: '生活日常'
};

/* 素材库主数组
 * 字段：cat 场景 | level 等级 | cn 中文原句 | keywords 触发词 | spoken 口语 | written 书面
 */
const SENTENCE_LIBRARY = [
  /* ===================== 心情 mood ===================== */
  // 四级
  { cat: 'mood', level: 'cet4', cn: '今天我很开心', keywords: ['开心', '高兴', '快乐'], spoken: "I'm so happy today.", written: "I felt really happy today." },
  { cat: 'mood', level: 'cet4', cn: '我有点累', keywords: ['累', '疲惫'], spoken: "I'm a little tired.", written: "I was feeling a bit tired." },
  { cat: 'mood', level: 'cet4', cn: '我很难过', keywords: ['难过', '伤心', '哭'], spoken: "I'm very sad.", written: "I felt quite sad today." },
  { cat: 'mood', level: 'cet4', cn: '我今天很放松', keywords: ['放松', '悠闲'], spoken: "I'm very relaxed today.", written: "I felt relaxed and at ease today." },
  // 六级
  { cat: 'mood', level: 'cet6', cn: '我觉得很满足', keywords: ['满足', '知足'], spoken: "I feel pretty content.", written: "I felt a deep sense of contentment." },
  { cat: 'mood', level: 'cet6', cn: '我有点焦虑', keywords: ['焦虑', '不安', '紧张'], spoken: "I'm kind of anxious.", written: "I was a little anxious about what's ahead." },
  { cat: 'mood', level: 'cet6', cn: '我感到无比兴奋', keywords: ['兴奋', '激动'], spoken: "I'm super excited!", written: "I was thrilled beyond words." },
  { cat: 'mood', level: 'cet6', cn: '我有些失落', keywords: ['失落', '沮丧'], spoken: "I feel a bit down.", written: "I felt somewhat let down." },
  // 雅思基础
  { cat: 'mood', level: 'ielts_basic', cn: '今天我的情绪起伏很大', keywords: ['情绪', '起伏', '心情复杂'], spoken: "My mood went up and down today.", written: "I experienced quite an emotional rollercoaster today." },
  { cat: 'mood', level: 'ielts_basic', cn: '我感到平静而充实', keywords: ['平静', '充实'], spoken: "I feel calm and fulfilled.", written: "I felt calm and fulfilled inside." },
  { cat: 'mood', level: 'ielts_basic', cn: '我为刚才的争吵感到懊悔', keywords: ['懊悔', '后悔', '争吵'], spoken: "I regret that argument.", written: "I felt a pang of regret over the quarrel." },
  // 雅思进阶
  { cat: 'mood', level: 'ielts_advanced', cn: '一种难以名状的孤寂感涌上心头', keywords: ['孤寂', '孤独', '寂寞'], spoken: "I felt this strange loneliness.", written: "An indescribable sense of loneliness washed over me." },
  { cat: 'mood', level: 'ielts_advanced', cn: '我对自己的坚韧感到骄傲', keywords: ['骄傲', '坚韧', '坚强'], spoken: "I'm proud of my strength.", written: "I took quiet pride in my own resilience." },
  { cat: 'mood', level: 'ielts_advanced', cn: '涌上心头的怀旧之情让我出神', keywords: ['怀旧', '出神', '回忆'], spoken: "I got lost in old memories.", written: "A wave of nostalgia swept over me and I drifted off." },

  /* ===================== 天气 weather ===================== */
  // 四级
  { cat: 'weather', level: 'cet4', cn: '今天天气真好', keywords: ['天气好', '晴天', '阳光'], spoken: "The weather is so nice today.", written: "It was a genuinely lovely day." },
  { cat: 'weather', level: 'cet4', cn: '今天下雨了', keywords: ['下雨', '雨'], spoken: "It rained today.", written: "It was raining throughout the day." },
  { cat: 'weather', level: 'cet4', cn: '外面好冷', keywords: ['冷', '寒冷'], spoken: "It's so cold outside.", written: "The cold outside was biting." },
  { cat: 'weather', level: 'cet4', cn: '风很大', keywords: ['风大', '刮风'], spoken: "It's really windy.", written: "A strong wind was blowing." },
  // 六级
  { cat: 'weather', level: 'cet6', cn: '今天阴沉沉的', keywords: ['阴', '阴天', '灰蒙蒙'], spoken: "It's gloomy today.", written: "The sky was dull and overcast." },
  { cat: 'weather', level: 'cet6', cn: '下起了绵绵细雨', keywords: ['细雨', '毛毛雨'], spoken: "It's drizzling.", written: "A fine drizzle settled in." },
  { cat: 'weather', level: 'cet6', cn: '空气很湿润', keywords: ['湿润', '潮湿'], spoken: "The air feels damp.", written: "The air was heavy with moisture." },
  // 雅思基础
  { cat: 'weather', level: 'ielts_basic', cn: '乌云压顶仿佛要下暴雨', keywords: ['乌云', '暴雨', '雷'], spoken: "Dark clouds look like rain.", written: "Heavy clouds loomed as if a storm were coming." },
  { cat: 'weather', level: 'ielts_basic', cn: '难得一见的彩虹挂在天边', keywords: ['彩虹'], spoken: "There's a rainbow!", written: "A rare rainbow arched across the sky." },
  // 雅思进阶
  { cat: 'weather', level: 'ielts_advanced', cn: '薄雾为清晨披上一层静谧', keywords: ['薄雾', '雾', '清晨'], spoken: "The morning fog was calm.", written: "A thin mist draped the dawn in stillness." },
  { cat: 'weather', level: 'ielts_advanced', cn: '燥热的空气令人喘不过气', keywords: ['燥热', '闷热', '喘'], spoken: "It's stuffy and hot.", written: "The sultry air left me breathless." },

  /* ===================== 通勤 commute ===================== */
  // 四级
  { cat: 'commute', level: 'cet4', cn: '今天我坐地铁上班', keywords: ['地铁', '上班', '通勤'], spoken: "I took the subway to work.", written: "I commuted to work by subway." },
  { cat: 'commute', level: 'cet4', cn: '路上很堵', keywords: ['堵车', '堵', '塞车'], spoken: "The traffic was bad.", written: "The roads were badly jammed." },
  { cat: 'commute', level: 'cet4', cn: '我走路去学校', keywords: ['走路', '步行', '去学校'], spoken: "I walked to school.", written: "I walked all the way to school." },
  // 六级
  { cat: 'commute', level: 'cet6', cn: '我赶上了早班公交', keywords: ['公交', '早班', '赶上'], spoken: "I caught the early bus.", written: "I managed to catch the early bus." },
  { cat: 'commute', level: 'cet6', cn: '通勤时间太长了', keywords: ['通勤长', '时间长', '耗时'], spoken: "My commute is too long.", written: "The commute felt endlessly long." },
  { cat: 'commute', level: 'cet6', cn: '我骑车去公司', keywords: ['骑车', '自行车', '公司'], spoken: "I biked to the office.", written: "I cycled over to the office." },
  // 雅思基础
  { cat: 'commute', level: 'ielts_basic', cn: '拥挤的车厢让人透不过气', keywords: ['拥挤', '车厢', '地铁挤'], spoken: "The train was packed.", written: "The crowded carriage left me breathless." },
  { cat: 'commute', level: 'ielts_basic', cn: '我利用路上时间听播客', keywords: ['播客', '听', '路上'], spoken: "I listened to a podcast.", written: "I spent the ride listening to a podcast." },
  // 雅思进阶
  { cat: 'commute', level: 'ielts_advanced', cn: '晨光中的车窗景致让我出神', keywords: ['车窗', '晨光', '出神'], spoken: "I stared out the window.", written: "The morning light through the window held me spellbound." },

  /* ===================== 学习 study ===================== */
  // 四级
  { cat: 'study', level: 'cet4', cn: '我今天背了单词', keywords: ['背单词', '单词', '记单词'], spoken: "I memorized words today.", written: "I drilled some new vocabulary today." },
  { cat: 'study', level: 'cet4', cn: '我写了一篇作文', keywords: ['作文', '写作', '写文章'], spoken: "I wrote a composition.", written: "I wrote a short essay." },
  { cat: 'study', level: 'cet4', cn: '我在图书馆看书', keywords: ['图书馆', '看书', '读书'], spoken: "I read in the library.", written: "I spent time reading at the library." },
  // 六级
  { cat: 'study', level: 'cet6', cn: '我啃完了一篇长难文献', keywords: ['文献', '论文', '长难句'], spoken: "I finished a hard paper.", written: "I plowed through a dense academic paper." },
  { cat: 'study', level: 'cet6', cn: '我整理了一页笔记', keywords: ['笔记', '整理'], spoken: "I organized my notes.", written: "I tidied up a full page of notes." },
  { cat: 'study', level: 'cet6', cn: '我卡在一道题上很久', keywords: ['卡住', '难题', '不会'], spoken: "I got stuck on a problem.", written: "I got stuck on one problem for ages." },
  // 雅思基础
  { cat: 'study', level: 'ielts_basic', cn: '我用影子跟读法练口语', keywords: ['口语', '跟读', '影子'], spoken: "I practiced speaking.", written: "I trained my speaking with shadowing." },
  { cat: 'study', level: 'ielts_basic', cn: '我刷完了一套真题', keywords: ['真题', '刷题', '套题'], spoken: "I finished a practice test.", written: "I worked through a full set of past papers." },
  // 雅思进阶
  { cat: 'study', level: 'ielts_advanced', cn: '批判性阅读刷新了我的视角', keywords: ['批判性', '阅读', '视角'], spoken: "I read critically today.", written: "Critical reading reshaped my perspective." },
  { cat: 'study', level: 'ielts_advanced', cn: '我把零散知识串成了体系', keywords: ['体系', '知识', '串联'], spoken: "I connected my knowledge.", written: "I wove scattered notes into a coherent system." },

  /* ===================== 生活日常 life ===================== */
  // 四级
  { cat: 'life', level: 'cet4', cn: '我吃了很好吃的晚饭', keywords: ['晚饭', '吃饭', '好吃'], spoken: "I had a tasty dinner.", written: "I had a really delicious dinner." },
  { cat: 'life', level: 'cet4', cn: '我和朋友逛了街', keywords: ['逛街', '朋友', '出去'], spoken: "I hung out with friends.", written: "I went shopping with a friend." },
  { cat: 'life', level: 'cet4', cn: '我看了一部电影', keywords: ['电影', '看片'], spoken: "I watched a movie.", written: "I watched a film in the evening." },
  { cat: 'life', level: 'cet4', cn: '我给家人打了电话', keywords: ['家人', '打电话', '爸妈'], spoken: "I called my family.", written: "I phoned my family tonight." },
  // 六级
  { cat: 'life', level: 'cet6', cn: '我窝在沙发里发了会呆', keywords: ['沙发', '发呆', '躺'], spoken: "I zoned out on the sofa.", written: "I lounged on the sofa, lost in thought." },
  { cat: 'life', level: 'cet6', cn: '我煮了一锅热汤', keywords: ['煮汤', '做饭', '热汤'], spoken: "I made some soup.", written: "I simmered a pot of warm soup." },
  { cat: 'life', level: 'cet6', cn: '我养的多肉冒了新芽', keywords: ['多肉', '植物', '新芽'], spoken: "My plant grew a new bud.", written: "A tiny bud sprouted on my succulent." },
  // 雅思基础
  { cat: 'life', level: 'ielts_basic', cn: '我清理了积灰的桌面', keywords: ['清理', '整理', '桌面'], spoken: "I cleaned my desk.", written: "I cleared the dust off my desk." },
  { cat: 'life', level: 'ielts_basic', cn: '我慢跑时遇见了晚霞', keywords: ['慢跑', '跑步', '晚霞'], spoken: "I jogged at sunset.", written: "I met the sunset on my evening jog." },
  // 雅思进阶
  { cat: 'life', level: 'ielts_advanced', cn: '一束烛光让夜晚有了仪式感', keywords: ['烛光', '仪式感', '夜晚'], spoken: "A candle made the night special.", written: "A single candle gave the night a sense of ritual." },
  { cat: 'life', level: 'ielts_advanced', cn: '我把琐碎日常过成了诗', keywords: ['琐碎', '日常', '诗'], spoken: "I enjoyed small moments.", written: "I turned the little routines into something poetic." },

  /* ===================== 生活扩展（提升自由中文命中率） ===================== */
  // 四级：吃饭 / 睡眠 / 工作 / 运动 / 健康 等高频场景
  { cat: 'life', level: 'cet4', cn: '我饿了', keywords: ['饿', '肚子饿', '饥'], spoken: "I'm hungry.", written: "I felt hungry." },
  { cat: 'life', level: 'cet4', cn: '我吃饱了', keywords: ['吃饱', '饱了', '撑'], spoken: "I'm full.", written: "I was full and satisfied." },
  { cat: 'life', level: 'cet4', cn: '我想睡觉', keywords: ['睡觉', '困', '想睡', '瞌睡'], spoken: "I want to sleep.", written: "I wanted to get some sleep." },
  { cat: 'life', level: 'cet4', cn: '今天很忙', keywords: ['忙', '忙碌', '没空'], spoken: "I was busy today.", written: "Today was a really busy day." },
  { cat: 'life', level: 'cet4', cn: '我加班了', keywords: ['加班', '晚了', '留到很晚'], spoken: "I worked overtime.", written: "I stayed late at work." },
  { cat: 'life', level: 'cet4', cn: '我开了个会', keywords: ['开会', '会议', '碰头'], spoken: "I had a meeting.", written: "I attended a meeting." },
  { cat: 'life', level: 'cet4', cn: '我去跑步了', keywords: ['跑步', '去跑', '晨跑'], spoken: "I went for a run.", written: "I went jogging this morning." },
  { cat: 'life', level: 'cet4', cn: '我健身了', keywords: ['健身', '锻炼', '运动', '撸铁'], spoken: "I worked out.", written: "I did some exercise at the gym." },
  { cat: 'life', level: 'cet4', cn: '我和朋友吃饭', keywords: ['朋友吃饭', '聚餐', '约饭', '下馆子'], spoken: "I had dinner with friends.", written: "I went out to eat with friends." },
  { cat: 'life', level: 'cet4', cn: '我看剧了', keywords: ['看剧', '追剧', '电视剧', '综艺'], spoken: "I watched a show.", written: "I binge-watched a series." },
  { cat: 'life', level: 'cet4', cn: '我生病了', keywords: ['生病', '不舒服', '难受', '身体'], spoken: "I'm sick.", written: "I wasn't feeling well today." },
  { cat: 'life', level: 'cet4', cn: '我感冒了', keywords: ['感冒', '发烧', '咳嗽'], spoken: "I caught a cold.", written: "I came down with a cold." },
  { cat: 'life', level: 'cet4', cn: '我去散步', keywords: ['散步', '走走', '遛弯'], spoken: "I took a walk.", written: "I went for a stroll." },
  { cat: 'life', level: 'cet4', cn: '我今天很懒', keywords: ['懒', '懒散', '摆烂'], spoken: "I was lazy today.", written: "I felt lazy and did little." },
  { cat: 'life', level: 'cet4', cn: '我购物了', keywords: ['购物', '逛街买', '买东西', '下单'], spoken: "I went shopping.", written: "I picked up a few things." },
  { cat: 'life', level: 'cet4', cn: '我做家务', keywords: ['家务', '打扫', '洗衣', '拖地'], spoken: "I did some housework.", written: "I took care of the chores." },
  // 六级：情绪 / 状态 / 自我激励
  { cat: 'mood', level: 'cet6', cn: '我有点生气', keywords: ['生气', '恼火', '气', '烦'], spoken: "I'm a bit annoyed.", written: "I felt rather irritated." },
  { cat: 'mood', level: 'cet6', cn: '我陷入低谷', keywords: ['低谷', '低落', '丧', 'emo'], spoken: "I felt a bit down.", written: "I was in a low patch." },
  { cat: 'mood', level: 'cet6', cn: '我充满动力', keywords: ['动力', '干劲', '冲劲', '斗志'], spoken: "I feel motivated.", written: "I was full of drive." },
  { cat: 'study', level: 'cet6', cn: '我赶 deadline', keywords: ['deadline', '截止', '赶工', '赶进度'], spoken: "I rushed a deadline.", written: "I was racing against a deadline." },
  { cat: 'study', level: 'cet6', cn: '我理清了思路', keywords: ['思路', '理清', '想通', '捋清'], spoken: "I sorted out my thoughts.", written: "I straightened out my thinking." },
  { cat: 'life', level: 'cet6', cn: '我犒劳自己', keywords: ['犒劳', '奖励', '宠'], spoken: "I treated myself.", written: "I rewarded myself with a treat." },
  { cat: 'life', level: 'cet6', cn: '我享受周末', keywords: ['周末', '休息日', '放假'], spoken: "I enjoyed the weekend.", written: "I made the most of my weekend." },
  // 雅思基础：平衡 / 成长
  { cat: 'life', level: 'ielts_basic', cn: '我平衡了工作与生活', keywords: ['平衡', '工作生活', '劳逸'], spoken: "I balanced work and life.", written: "I struck a balance between work and life." },
  { cat: 'mood', level: 'ielts_basic', cn: '我享受独处时光', keywords: ['独处', '一个人', '安静', '独处'], spoken: "I enjoyed my alone time.", written: "I savored the quiet of being alone." },
  { cat: 'study', level: 'ielts_basic', cn: '我克服了畏难', keywords: ['畏难', '克服', '害怕', '不敢'], spoken: "I overcame my fear.", written: "I pushed through my reluctance." },
  // 雅思进阶：细腻心境
  { cat: 'mood', level: 'ielts_advanced', cn: '我在喧嚣中守住了内心秩序', keywords: ['内心', '秩序', '喧嚣', '浮躁'], spoken: "I kept my inner order.", written: "Amid the noise, I held onto my inner order." }
];

/* 根据中文文本 + 用户等级，返回匹配的素材条目（最多 limit 条）
 * 匹配策略：拆出触发关键词命中，再按等级严格筛选。
 */
function matchSentences(text, level, limit) {
  limit = limit || 6;
  if (!text) return [];
  const hits = [];
  const seen = new Set();
  for (const item of SENTENCE_LIBRARY) {
    if (item.level !== level) continue;           // 严格匹配等级（需求硬性要求）
    // 关键词命中 或 中文原句被包含
    const kwHit = item.keywords.some(k => text.includes(k));
    const cnHit = text.includes(item.cn);
    if (kwHit || cnHit) {
      const key = item.cn + '|' + item.level;
      if (!seen.has(key)) { seen.add(key); hits.push(item); }
    }
    if (hits.length >= limit) break;
  }
  return hits;
}
