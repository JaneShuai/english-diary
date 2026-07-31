/* =========================================================================
 * app.js —— 主逻辑（解锁 / 写作 / 历史 / 报表 / 设置 / 导出）
 * 依赖：data.js / storage.js / translate.js / charts.js（按 index.html 顺序加载）
 * ========================================================================= */

/* ============================ 全局状态 ============================ */
const state = {
  unlocked: false,
  level: 'cet4',
  online: false,
  proxy: '',            // 有道翻译代理地址（站点级全局配置，存于浏览器）
  editingId: null,        // 正在编辑的历史日记 id（写作页用于续写/覆盖）
  aiInserts: 0,           // 本次编辑会话中，由提示插入的英文句数（AI 辅助）
  weather: '',
  mood: '',
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  tagFilter: '',
  lastGrammar: null       // {issues, text} 用于一键修正
};

const WEATHERS = [['☀️','晴'],['⛅','多云'],['🌧️','雨'],['❄️','雪'],['🌫️','雾'],['🌈','彩虹']];
const MOODS = [['😊','开心'],['😢','难过'],['😌','平静'],['😟','焦虑'],['🤩','兴奋'],['🥱','疲惫']];
const STICKERS = ['🌸','🌟','💕','🌈','☀️','🌙','⭐','🍰','☕','🐱','🌿','🍀','💫','🎀','🌻','🍎'];

// 查图标：根据中文标签（如"多云"）反查 emoji（"⛅"）；找不到则返回空字符串
function iconOf(value, list){
  if(!value) return '';
  const hit = list.find(x => x[1] === value);
  return hit ? hit[0] : '';
}

/* ============================ 工具 ============================ */
function $(s){return document.querySelector(s);}
function $all(s){return Array.from(document.querySelectorAll(s));}
function esc(s){return (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function toast(msg){
  const t=$('#toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200);
}
function lock(){ // 回到书桌首页（清空当前选中日记本，仅收起应用）
  state.unlocked=false;
  setCurrentUser(null);          // 退出当前日记本，回到选择页
  $('#app').classList.remove('show');
  $('#desk-page').style.display='flex';
  closeAllMask();
}

/* ============================ 解锁 / 首次设置 ============================ */
// 点击“开始记录”
$('#btn-start').addEventListener('click', openUnlock);

function openUnlock(){
  if (isFirstUse()) { renderSetupModal(); }   // 还没有任何日记本 → 直接创建
  else { renderPickerModal(); }               // 已有日记本 → 选择 / 输入密码
  $('#mask-unlock').classList.add('show');
}

// 多人共用：选择已有日记本（各自输入密码进入）
function renderPickerModal(){
  const users = getUsers();
  const cards = users.map(u => `
    <div class="user-card">
      <div class="uc-name">📔 ${esc(u.username)}</div>
      <span class="badge">${LEVELS[u.level] || u.level}</span>
      <input class="field sm" type="password" placeholder="输入密码" data-uid="${u.id}" />
      <button class="btn sm primary" data-enter="${u.id}">进入</button>
      <div class="uc-err" data-err="${u.id}"></div>
    </div>`).join('');
  $('#modal-unlock').innerHTML = `
    <h3>📖 选择你的日记本</h3>
    <div class="hint" style="margin-bottom:10px">可多人共用同一设备：每人一本独立日记，数据互不干扰。</div>
    <div id="user-cards">${cards}</div>
    <button class="btn green" id="up-new">＋ 创建新日记本</button>
      <button class="btn blue" id="up-login">🔑 登录云端账号</button>
  `;
  $('#up-new').onclick = () => renderSetupModal();
  $('#up-login').onclick = () => renderLoginModal();
  $('#modal-unlock').querySelectorAll('[data-enter]').forEach(btn => {
    btn.onclick = () => {
      const u = findUserById(btn.dataset.enter);
      const inp = $(`#modal-unlock input[data-uid="${btn.dataset.enter}"]`);
      if (inp.value === u.pwd) { setCurrentUser(u); finishUnlock(); }
      else { $(`#modal-unlock [data-err="${btn.dataset.enter}"]`).textContent = '密码错误，请重试'; inp.value = ''; }
    };
  });
  $('#modal-unlock').querySelectorAll('input[data-uid]').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.closest('.user-card').querySelector('[data-enter]').click(); });
  });
}

// 首次使用：设置用户名 / 密码 / 等级
function renderSetupModal(){
  $('#modal-unlock').innerHTML = `
    <h3>🌟 欢迎创建你的私密日记本</h3>
    <div class="row">
      <label>给自己起个名字 / 日记本名</label>
      <input class="field" id="su-name" placeholder="例如：小树的日记" />
    </div>
    <div class="row">
      <label>设置解锁密码</label>
      <input class="field" id="su-pwd" type="password" placeholder="仅本地保存，请牢记" />
    </div>
    <div class="row">
      <label>确认密码</label>
      <input class="field" id="su-pwd2" type="password" />
    </div>
    <div class="row">
      <label>选择你的英语水平（决定提示用词难度）</label>
      <select class="field" id="su-level">
        <option value="cet4">英语四级</option>
        <option value="cet6">英语六级</option>
        <option value="ielts_basic">雅思基础</option>
        <option value="ielts_advanced">雅思进阶</option>
      </select>
    </div>
    <button class="btn primary" id="su-submit">进入日记本 💖</button>
    <div class="hint">⚠️ 密码仅存于本机浏览器，忘记无法找回，请妥善保管。</div>
  `;
  $('#su-submit').onclick = async () => {
    const name=$('#su-name').value.trim();
    const pwd=$('#su-pwd').value;
    const pwd2=$('#su-pwd2').value;
    const level=$('#su-level').value;
    if(!name){toast('请填写名字');return;}
    if(pwd.length<4){toast('密码至少 4 位');return;}
    if(pwd!==pwd2){toast('两次密码不一致');return;}

    // 如果配了云端 API：先在云端注册（失败则降级本地模式）
    if(getCloudApi()){
      try{
        toast('正在云端注册账号…');
        await cloudRegister(name, pwd, level);
      }catch(e){
        if(/已[被在]?注册|409/i.test(String(e.message))){
          toast('云端已有此账号，正在登录…');
          try{ await cloudLogin(name, pwd); }catch(e2){ toast('登录失败：'+e2.message+'（使用本地模式）'); }
        }else{
          toast('云端注册失败（'+e.message+'），已转为本地模式');
        }
      }
    }

    const u={ id:'u_'+Date.now()+'_'+Math.floor(Math.random()*1000),
              username:name, pwd, level, online:false, font:'', linespace:'34' };
    addUser(u); setCurrentUser(u);
    finishUnlock();
  };
}

// 登录云端已有账号（跨设备同步）
function renderLoginModal(){
  $('#modal-unlock').innerHTML = `
    <h3>🔑 登录你的云端日记</h3>
    <div class="hint">登录后日记自动从云端拉取，电脑手机数据同步。</div>
    <div class="row"><label>用户名</label><input class="field" id="li-username" placeholder="你的账号名" /></div>
    <div class="row"><label>密码</label><input class="field" id="li-pwd" type="password" placeholder="云端密码" /></div>
    <div class="row"><label>API 地址（可选，已配好则跳过）</label><input class="field" id="li-api" placeholder="https://xxx.workers.dev" value="${getCloudApi()}" /></div>
    <button class="btn primary" id="li-submit">登录并同步</button>
    <button class="btn ghost" id="li-back" style="margin-top:4px">← 返回</button>
    <div id="li-err" class="hint" style="color:#c05858;margin-top:6px"></div>
    <div class="hint" style="margin-top:4px">💡 还没部署 diary-api-worker.js？点返回用本地模式即可。</div>
  `;
  $('#li-back').onclick = () => renderPickerModal();
  $('#li-submit').onclick = async ()=>{
    const name = $('#li-username').value.trim();
    const pwd = $('#li-pwd').value;
    const api = $('#li-api').value.trim();
    if(!name){$('#li-err').textContent='请输入用户名';return;}
    if(!pwd){$('#li-err').textContent='请输入密码';return;}
    if(api) setCloudApi(api);
    if(!getCloudApi()){
      const u = findUserByName(name);
      if(!u){$('#li-err').textContent='本地无此账号且未配置云端。请先创建日记本或填写 API 地址。';return;}
      if(u.pwd!==pwd){$('#li-err').textContent='密码错误';return;}
      setCurrentUser(u); finishUnlock(); return;
    }
    $('#li-err').textContent=''; toast('正在连接云端…');
    try{
      const data = await cloudLogin(name, pwd);
      let u = findUserByName(name);
      if(!u){ u = { id:'u_'+Date.now()+'_'+Math.floor(Math.random()*1000), username:name, pwd, level:data.user.level||'cet4', online:false, font:'', linespace:'34' }; addUser(u); }
      setCurrentUser(u);
      toast('登录成功，同步日记中…');
      await syncFromCloud();
      finishUnlock();
      toast('同步完成 ☁️');
    }catch(e){ $('#li-err').textContent='登录失败：'+(e.message||'请检查 API 地址和网络'); }
  };
  $('#li-pwd').addEventListener('keydown', e=>{if(e.key==='Enter')$('#li-submit').click();});
}

// （旧版单用户密码弹窗已废弃，改用多日记本选择 renderPickerModal）

function finishUnlock(){
  state.unlocked=true;
  state.level=getLevel();
  state.online=getOnline();
  $('#mask-unlock').classList.remove('show');
  $('#desk-page').style.display='none';
  $('#app').classList.add('show');
  // 同步设置页控件
  $('#set-username').value=getUser()||'';
  $('#set-level').value=state.level;
  $('#set-online').checked=state.online;
  $('#set-proxy').value=getYoudaoProxy(); state.proxy=getYoudaoProxy();
  // 代理地址实时保存
  $('#set-proxy').addEventListener('input', e => {
    const v = e.target.value.trim();
    setYoudaoProxy(v);
    state.proxy = v;
    if (v) toast('有道代理已保存，下一次输入中文即生效');
  });
  // API 服务器地址（云端同步）
  $('#set-api').value=getCloudApi();
  $('#set-api').addEventListener('input', e => setCloudApi(e.target.value.trim()));
  $('#set-font').value=getFont();
  $('#set-linespace').value=getLineSpace()||'1.6';
  applyEditorPref();
  resetWritePage();
  const badge = (getCloudApi() && getToken()) ? ' ☁️已同步' : '';
  toast('欢迎回来，'+ (getUser()||'') +' 🌸'+badge);
}

/* ============================ 导航切换 ============================ */
$all('.nav-btn').forEach(b=>b.addEventListener('click',()=>{
  $all('.nav-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  const p=b.dataset.page;
  $all('.page').forEach(pg=>pg.classList.remove('show'));
  $('#page-'+p).classList.add('show');
  if(p==='history') renderHistory();
  if(p==='report') renderReport();
  if(p==='settings') {/* 已同步 */}
}));
$('#btn-lock').addEventListener('click',()=>{ lock(); toast('已上锁，日记安全收好 🔒'); });

/* ============================ 写作页：天气/心情/贴纸 ============================ */
function renderChips(){
  const wc=$('#weather-chips'); wc.innerHTML='';
  WEATHERS.forEach(([e,n])=>{
    const c=document.createElement('div');c.className='chip';c.innerHTML=`<span class="emo">${e}</span>${n}`;
    c.onclick=()=>{state.weather=n;$all('#weather-chips .chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');};
    wc.appendChild(c);
  });
  const mc=$('#mood-chips'); mc.innerHTML='';
  MOODS.forEach(([e,n])=>{
    const c=document.createElement('div');c.className='chip';c.innerHTML=`<span class="emo">${e}</span>${n}`;
    c.onclick=()=>{state.mood=n;$all('#mood-chips .chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');};
    mc.appendChild(c);
  });
  const sb=$('#sticker-bar'); sb.innerHTML='';
  STICKERS.forEach(s=>{
    const d=document.createElement('div');d.className='sticker';d.textContent=s;
    d.onclick=()=>insertAtCursor(s);
    sb.appendChild(d);
  });
}

// 替换光标前最近的中文片段（点击英文建议时使用：拿英文替中文）
function replaceTrailingCn(newText){
  const ed = $('#editor');
  const caret = ed.selectionStart;
  const before = ed.value.slice(0, caret);
  // 与 extractCn 保持同一套正则：中文 + 常见中文标点 的连续片段
  const m = before.match(/[\u4e00-\u9fa5，。！？、；：,.!?]+$/);
  if(!m){ // 光标前没有中文（理论上不会出现，弹窗只会在有中文时出现），退回插入
    insertAtCursor(newText + ' ');
    return;
  }
  const cnStart = caret - m[0].length; // 中文片段起点
  const after = ed.value.slice(caret); // 光标后原样保留
  ed.value = ed.value.slice(0, cnStart) + newText + ' ' + after;
  const newCaret = cnStart + newText.length + 1;
  ed.selectionStart = ed.selectionEnd = newCaret;
  ed.focus();
  if(/[a-zA-Z]/.test(newText)) state.aiInserts++; // 计为 AI 辅助
  onEditorInput();
}

// 在光标处插入文本（贴纸 / 英文提示共用）
function insertAtCursor(text){
  const ed=$('#editor');
  const s=ed.selectionStart, e=ed.selectionEnd;
  ed.value=ed.value.slice(0,s)+text+ed.value.slice(e);
  ed.selectionStart=ed.selectionEnd=s+text.length;
  ed.focus();
  if(/[a-zA-Z]/.test(text)){ state.aiInserts++; } // 插入英文计为 AI 辅助
  onEditorInput();
}

/* ============================ 实时中文→英文提示 ============================ */
let suggestToken=0;
// 输入法组合中（isComposing）不触发，避免拼音阶段误判；确认提交后再检测
$('#editor').addEventListener('input', e=>{ if(e.isComposing) return; onEditorInput(); });
$('#editor').addEventListener('compositionend', ()=> onEditorInput()); // 中文输入法确认后再次触发

// 从当前行提取中文查询串
function extractCn(line){
  if(!line) return '';
  // 只匹配末尾的中文汉字 + 中文标点，不含英文标点（避免打句号/问号/逗号也弹提示）
  const m = line.match(/[\u4e00-\u9fa5，。！？、；：]+$/);
  if (m) return m[0];
  if (/[\u4e00-\u9fa5]/.test(line)) return line;
  return '';
}

function onEditorInput(){
  const ed=$('#editor');
  const line=ed.value.slice(0, ed.selectionStart).split('\n').pop(); // 当前行（到光标）
  const query=extractCn(line);
  if(!query){ $('#suggest-pop').classList.remove('show'); return; }
  const token=++suggestToken;
  // 未配置代理：直接给引导提示，不静默
  if(!state.proxy){
    renderSuggest([], query, '尚未配置有道翻译代理。请到「设置 → 有道翻译代理」填入你的 Cloudflare Workers 地址（部署步骤见 README），即可联网翻译中文。');
    return;
  }
  $('#suggest-mode').textContent = '有道翻译中…';
  onlineTranslateOne(query, state.proxy).then(r=>{
    if(token!==suggestToken) return; // 抛弃过期结果
    renderSuggest([{from:'online',label:'有道翻译',text:r.text,cn:query}], query, null);
  }).catch(()=>{
    if(token!==suggestToken) return;
    // 联网失败 → 降级本地素材库兜底（仍保证“有东西弹”）
    const off=offlineSuggest(query, state.level);
    if(off.length){
      renderSuggest(off, query, '有道联网失败，已用本地素材兜底（断网 / 代理不可用）。');
    }else{
      renderSuggest([], query, '有道联网翻译失败，且本地无匹配素材。请检查代理地址与网络后重试。');
    }
  });
}

function renderSuggest(list, query, tip){
  const pop=$('#suggest-pop'), box=$('#suggest-list');
  box.innerHTML='';
  // 仅提示、无匹配项
  if(tip && (!list || !list.length)){
    box.innerHTML = `<div class="suggest-tip">💡 ${esc(tip)}</div>`;
    pop.classList.add('show');
    return;
  }
  if(!list || !list.length){ pop.classList.remove('show'); return; }
  list.slice(0,8).forEach(it=>{
    const div=document.createElement('div');div.className='suggest-item';
    const tagCls = it.from==='online' ? 'tag online':'tag';
    div.innerHTML=`<span class="${tagCls}">${it.label}</span><span class="en">${esc(it.text)}</span><div class="cn">${esc(it.cn||query)}</div>`;
    div.onclick=()=>{ replaceTrailingCn(it.text); $('#suggest-pop').classList.remove('show'); };
    box.appendChild(div);
  });
  pop.classList.add('show');
}

/* ============================ 语法检测 ============================ */
$('#btn-grammar').addEventListener('click', async ()=>{
  const text=$('#editor').value.trim();
  if(!text){toast('先写点什么再检测吧');return;}
  toast('正在检测语法…');
  const {issues,mode}=await checkGrammar(text, state.online);
  state.lastGrammar={issues,text};
  const box=$('#grammar-result');
  if(!issues.length){
    box.innerHTML=`<div class="hint">🎉 没有发现明显问题，写得很棒！（${mode==='online'?'联网精准检测':'离线基础检测'}）</div>`;
  }else{
    box.innerHTML=`<ul class="grammar-list">`+issues.map(it=>{
      const old=it.original?`<span class="old">${esc(it.original)}</span>`:'';
      const neu=it.suggestion?`→ <span class="new">${esc(it.suggestion)}</span>`:'';
      return `<li><div class="msg">${esc(it.message)}</div><div>${old} ${neu}</div></li>`;
    }).join('')+`</ul><div class="hint">检测模式：${mode==='online'?'联网精准':'离线基础'}（共 ${issues.length} 处）</div>`;
  }
  $('#mask-grammar').classList.add('show');
});
$('#btn-grammar-close').addEventListener('click',()=>$('#mask-grammar').classList.remove('show'));
$('#btn-fix-all').addEventListener('click',()=>{
  if(!state.lastGrammar) return;
  const fixed=applyFixes(state.lastGrammar.text, state.lastGrammar.issues);
  $('#editor').value=fixed;
  $('#mask-grammar').classList.remove('show');
  toast('已一键修正全文 ✨');
});

/* ============================ 保存日记 + 统计 ============================ */
// 拆分统计：自主英文 / AI 辅助英文 / 中文 句子数
function analyzeContent(text){
  const segs=text.split(/[\n.!?。！？]+/).map(s=>s.trim()).filter(Boolean);
  let en=0,cn=0;
  segs.forEach(s=>{
    const hasCn=/[\u4e00-\u9fa5]/.test(s);
    const hasEn=/[a-zA-Z]/.test(s);
    if(hasEn) en++;
    else if(hasCn) cn++;
  });
  const enAi=Math.min(state.aiInserts, en);
  return { enSelf:Math.max(0,en-enAi), enAi, cn, words:text.replace(/\s/g,'').length };
}

$('#btn-save').addEventListener('click',()=>{
  const content=$('#editor').value.trim();
  if(!content){toast('日记是空的哦');return;}
  const stat=analyzeContent(content);
  const now=new Date();
  const diary={
    id: state.editingId || undefined,
    date: ymd(now),
    ts: now.getTime(),
    content,
    weather: state.weather,
    mood: state.mood,
    tags: parseTags(content),
    stat,
    aiAssist: stat.enAi
  };
  upsertDiary(diary);
  toast('已保存 💾 英文 '+stat.enSelf+' 句 · AI 辅助 '+stat.enAi+' 句 · 中文 '+stat.cn+' 句');
  state.editingId=null;
  resetWritePage();
});

// 从正文提取 #标签
function parseTags(text){
  const set=new Set();
  (text.match(/#[\u4e00-\u9fa5\w]+/g)||[]).forEach(t=>set.add(t.slice(1)));
  return Array.from(set);
}

function resetWritePage(){
  $('#editor').value='';
  state.aiInserts=0; state.weather=''; state.mood='';
  $all('#weather-chips .chip,#mood-chips .chip').forEach(x=>x.classList.remove('active'));
  $('#suggest-pop').classList.remove('show');
  $('#write-tip').textContent='';
}

/* ============================ 历史页 ============================ */
function renderHistory(){
  renderCalendar();
  renderTagFilter();
  renderDiaryList();
}
function renderCalendar(){
  const y=state.calYear,m=state.calMonth;
  $('#cal-title').textContent=`${y} 年 ${m+1} 月`;
  const grid=$('#cal-grid');grid.innerHTML='';
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  for(let i=0;i<first;i++){const e=document.createElement('div');e.className='cal-cell empty';grid.appendChild(e);}
  const grouped=groupByDate(getDiaries());
  for(let d=1;d<=days;d++){
    const key=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const e=document.createElement('div');e.className='cal-cell';e.textContent=d;
    if(grouped[key]){e.classList.add('has');e.title=key+' 有 '+grouped[key].length+' 篇日记';
      e.onclick=()=>{ state.tagFilter=''; $('#tag-filter').value=''; renderDiaryList(grouped[key]); };}
    grid.appendChild(e);
  }
}
$('#cal-prev').onclick=()=>{state.calMonth--;if(state.calMonth<0){state.calMonth=11;state.calYear--;}renderCalendar();};
$('#cal-next').onclick=()=>{state.calMonth++;if(state.calMonth>11){state.calMonth=0;state.calYear++;}renderCalendar();};

function renderTagFilter(){
  const sel=$('#tag-filter');
  const allTags=new Set();getDiaries().forEach(d=>(d.tags||[]).forEach(t=>allTags.add(t)));
  sel.innerHTML='<option value="">全部标签</option>'+Array.from(allTags).map(t=>`<option value="${esc(t)}">#${esc(t)}</option>`).join('');
  sel.value=state.tagFilter;
}
$('#tag-filter').addEventListener('change',e=>{state.tagFilter=e.target.value;renderDiaryList();});

function renderDiaryList(list){
  const box=$('#diary-list');
  let diaries=list||getDiaries().slice().sort((a,b)=>b.ts-a.ts);
  if(state.tagFilter) diaries=diaries.filter(d=>(d.tags||[]).includes(state.tagFilter));
  if(!diaries.length){box.innerHTML='<div class="hint">还没有日记，去写作页写第一篇吧 ✍️</div>';return;}
  box.innerHTML=diaries.map(d=>`
    <div class="card diary-item" data-id="${d.id}">
      <h4>${d.date}${d.weather?' · '+iconOf(d.weather,WEATHERS)+' '+d.weather:''}${d.mood?' · '+iconOf(d.mood,MOODS)+' '+d.mood:''}</h4>
      <div class="diary-meta">
        <span>英文 ${d.stat.enSelf} 句</span><span>AI ${d.stat.enAi}</span><span>中文 ${d.stat.cn}</span><span>${d.stat.words} 字</span>
        ${(d.tags||[]).map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}
      </div>
      <div class="diary-body">${esc(d.content)}</div>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn sm" data-act="view">查看/编辑</button>
        <button class="btn sm blue" data-act="txt">导出TXT</button>
        <button class="btn sm green" data-act="pdf">导出PDF</button>
        <button class="btn sm danger" data-act="del">删除</button>
      </div>
    </div>`).join('');
  // 事件委托
  box.querySelectorAll('.diary-item').forEach(card=>{
    const id=card.dataset.id;
    card.querySelector('[data-act="view"]').onclick=()=>openView(id);
    card.querySelector('[data-act="txt"]').onclick=()=>exportTXT(getDiaryById(id));
    card.querySelector('[data-act="pdf"]').onclick=()=>exportPDF([getDiaryById(id)]);
    card.querySelector('[data-act="del"]').onclick=()=>{if(confirm('确定删除这篇日记？')){deleteDiary(id);renderHistory();toast('已删除');}};
  });
}

// 查看/编辑弹窗
function openView(id){
  const d=getDiaryById(id);if(!d)return;
  $('#modal-view').innerHTML=`
    <h3>${d.date} 的日记</h3>
    <div class="diary-meta">${d.weather?iconOf(d.weather,WEATHERS)+d.weather:''} ${d.mood?iconOf(d.mood,MOODS)+d.mood:''} · 英文${d.stat.enSelf}/AI${d.stat.enAi}/中文${d.stat.cn}</div>
    <textarea class="field" id="view-editor" style="width:100%;min-height:220px">${esc(d.content)}</textarea>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="btn green" id="view-save">保存修改</button>
      <button class="btn blue" id="view-txt">导出TXT</button>
      <button class="btn ghost" id="view-close">关闭</button>
    </div>`;
  $('#mask-view').classList.add('show');
  $('#view-save').onclick=()=>{
    d.content=$('#view-editor').value;
    d.tags=parseTags(d.content);
    d.stat=analyzeContentRedo(d);
    upsertDiary(d);
    $('#mask-view').classList.remove('show');renderHistory();toast('已更新');
  };
  $('#view-txt').onclick=()=>exportTXT(d);
  $('#view-close').onclick=()=>$('#mask-view').classList.remove('show');
}
// 编辑后重算统计（复用 state.aiInserts 不可靠，这里以 AI=0 近似，保留原 enAi）
function analyzeContentRedo(d){
  const s=analyzeContent(d.content);
  s.enAi=Math.min(d.aiAssist||0,s.enSelf+s.enAi);
  return s;
}

$('#btn-export-all').addEventListener('click',()=>{
  const list=getDiaries();
  if(!list.length){toast('没有可导出的日记');return;}
  exportTXT(list,'all');
});

/* ============================ 报表页 ============================ */
function renderReport(){
  const list=getDiaries();
  const streak=calcStreak(list);
  const total=totalWords(list);
  const aiTotal=list.reduce((s,d)=>s+(d.aiAssist||0),0);
  $('#report-stats').innerHTML=`
    <div class="stat-box"><div class="num">${list.length}</div><div class="lab">累计日记</div></div>
    <div class="stat-box"><div class="num">${streak}</div><div class="lab">连续打卡(天)</div></div>
    <div class="stat-box"><div class="num">${total}</div><div class="lab">累计字数</div></div>
    <div class="stat-box"><div class="num">${aiTotal}</div><div class="lab">AI 辅助句</div></div>`;
  // 近 14 天占比
  const days14=[];const grouped=groupByDate(list);
  for(let i=13;i>=0;i--){
    const dt=new Date();dt.setDate(dt.getDate()-i);
    const key=ymd(dt);const arr=grouped[key]||[];
    let en=0,cn=0;arr.forEach(d=>{en+=d.stat.enSelf+d.stat.enAi;cn+=d.stat.cn;});
    days14.push({label:`${dt.getMonth()+1}-${dt.getDate()}`,en,cn});
  }
  drawEnRatioBar($('#chart-ratio'),days14);
  // 成长趋势（有日记的日期，按时间序，累计英文占比）
  const byDay=Object.keys(grouped).sort();
  const trend=byDay.map(k=>{
    let en=0,cn=0;grouped[k].forEach(d=>{en+=d.stat.enSelf+d.stat.enAi;cn+=d.stat.cn;});
    const dt=new Date(k);
    return {label:`${dt.getMonth()+1}-${dt.getDate()}`,ratio:en+cn?Math.round(en/(en+cn)*100):0};
  });
  drawTrendLine($('#chart-trend'),trend.slice(-30));
  // 本月打卡
  const diaryDates=list.map(d=>d.date);
  drawCheckinGrid($('#chart-checkin'),diaryDates,state.calYear,new Date().getMonth());
}

/* ============================ 设置页 ============================ */
$('#btn-save-settings').addEventListener('click',()=>{
  const name=$('#set-username').value.trim();
  const lvl=$('#set-level').value;
  const np=$('#set-pwd-new').value, nc=$('#set-pwd-confirm').value;
  if(!name){toast('名字不能为空');return;}
  setUser(name);setLevel(lvl);state.level=lvl;
  setYoudaoProxy($('#set-proxy').value.trim()); state.proxy=getYoudaoProxy();
  if(np){
    if(np.length<4){toast('新密码至少 4 位');return;}
    if(np!==nc){toast('两次密码不一致');return;}
    setPwd(np);toast('密码已更新');
  }
  $('#set-pwd-new').value='';$('#set-pwd-confirm').value='';
  applyEditorPref();
  toast('设置已保存 ✅');
});
$('#set-online').addEventListener('change',e=>{
  state.online=e.target.checked;setOnline(state.online);
  toast(state.online?'已开启联网增强（仅上传单句中文）':'已关闭，回到离线模式');
});
$('#set-font').addEventListener('change',e=>{setFont(e.target.value);applyEditorPref();});
$('#set-linespace').addEventListener('change',e=>{setLineSpace(e.target.value);applyEditorPref();});
function applyEditorPref(){
  const ed=$('#editor');
  ed.style.fontFamily=getFont()||'inherit';
  const row=getLineSpace()||'34';            // 行距同时驱动“横线纸网格高度”
  ed.style.setProperty('--row', row+'px');
  ed.style.lineHeight=row+'px';
}
$('#btn-clear').addEventListener('click',()=>{
  if(confirm('确定清空【本日记本】的全部日记与设置？（账号保留，可重新记录）')){
    clearCurrentBook();
    $('#set-username').value=getUser(); $('#set-level').value=getLevel();
    $('#set-online').checked=getOnline(); $('#set-font').value=getFont();
    $('#set-linespace').value=getLineSpace(); applyEditorPref();
    toast('本日记本已清空 🧹');
  }
});
$('#btn-del-book').addEventListener('click',()=>{
  if(confirm('彻底删除本日记本（含账号与全部日记）？此操作不可恢复！')){
    deleteCurrentBook(); lock(); toast('日记本已删除');
  }
});

/* ============================ 导出：TXT / PDF ============================ */
function diaryToText(d){
  return `【${d.date}】${d.weather?' 天气:'+iconOf(d.weather,WEATHERS)+d.weather:''}${d.mood?' 心情:'+iconOf(d.mood,MOODS)+d.mood:''}\n`
    + `标签: ${(d.tags||[]).map(t=>'#'+t).join(' ') || '无'}\n`
    + `统计: 英文${d.stat.enSelf}句 / AI辅助${d.stat.enAi}句 / 中文${d.stat.cn}句 / ${d.stat.words}字\n`
    + `--------------------------------\n${d.content}\n\n`;
}
function exportTXT(list,name){
  const arr=Array.isArray(list)?list:[list];
  const text=arr.map(diaryToText).join('');
  const blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=(name==='all'?'我的英语日记合集':'日记_'+arr[0].date)+'.txt';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('TXT 已下载到本地 💾');
}
// PDF：用浏览器打印“另存为 PDF”（真正离线、中文不乱码）
function exportPDF(list){
  const arr=Array.isArray(list)?list:[list];
  let root=document.getElementById('print-root');
  if(!root){root=document.createElement('main');root.id='print-root';root.className='page';document.body.appendChild(root);}
  root.innerHTML=`<div class="print-area" style="padding:24px;font-family:serif;color:#333">`
    +`<h2 style="text-align:center">${esc(getUser()||'我的英语日记')}</h2>`
    +arr.map(d=>`<div class="print-area" style="margin-bottom:24px;border-bottom:1px dashed #ccc;padding-bottom:12px">
        <h3>${d.date} ${d.weather?iconOf(d.weather,WEATHERS)+' '+d.weather:''} ${d.mood?iconOf(d.mood,MOODS)+' '+d.mood:''}</h3>
        <div style="font-size:13px;color:#888">${(d.tags||[]).map(t=>'#'+t).join(' ')}</div>
        <p style="white-space:pre-wrap;line-height:1.8">${esc(d.content)}</p></div>`).join('')
    +`</div>`;
  setTimeout(()=>{window.print();},50);
  toast('已唤起打印，请选择“另存为 PDF”保存到本地');
}

/* ============================ 通用遮罩关闭 ============================ */
function closeAllMask(){$all('.mask').forEach(m=>m.classList.remove('show'));}
$all('.mask').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show');}));

/* ============================ 初始化 ============================ */
renderChips();
// 默认锁定：书桌首页可见，应用隐藏（刷新/关闭后自动回到此状态）
$('#app').classList.remove('show');
$('#desk-page').style.display='flex';
