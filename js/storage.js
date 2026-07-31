/* =========================================================================
 * storage.js —— 本地存储 + 云端同步层
 * -------------------------------------------------------------------------
 * 双层策略：云端优先（有网络时自动拉取/上传），localStorage 为本地兜底。
 * 云端 API 通过 diary-api-worker.js（Cloudflare Workers + KV）提供。
 * 用户不配置 API 地址时，退化为纯本地模式（双击 file:// 照常可用）。
 * ========================================================================= */

const STORE_PREFIX = 'diary_';
const KEY_USERS = STORE_PREFIX + 'users';
const KEY_TOKEN = STORE_PREFIX + 'token';   // 登录 token（存在 localStorage，跨页签共享）
const KEY_API = STORE_PREFIX + 'api_url';   // API 服务器地址

let _cur = null;         // 当前日记本用户
let _cloudOk = false;    // 是否成功连接过云端（用于 UI 提示）

// —— LocalStorage 封装 ——
function lsGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
function lsSet(key, val) { try { localStorage.setItem(key, val); return true; } catch (e) { return false; } }
function lsRemove(key) { try { localStorage.removeItem(key); } catch (e) {} }

/* ================ 云端连接 ================ */
function getCloudApi() { return lsGet(KEY_API) || 'https://diary-api.1127857011.workers.dev'; }
function setCloudApi(url) { lsSet(KEY_API, (url || '').trim()); }
function getToken() { return lsGet(KEY_TOKEN) || ''; }
function setToken(t) { if (t) lsSet(KEY_TOKEN, t); else lsRemove(KEY_TOKEN); }
function isCloudOk() { return _cloudOk; }

async function cloudCall(method, path, body) {
  const api = getCloudApi();
  if (!api) throw new Error('未配置云端地址');
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  const token = getToken();
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  if (body) opts.body = JSON.stringify(body);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(api + path, { ...opts, signal: ctrl.signal });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '请求失败 ' + res.status);
    _cloudOk = true;
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/* ================ 云端注册 / 登录 ================ */
async function cloudRegister(username, password, level) {
  const data = await cloudCall('POST', '/api/register', { username, password, level });
  setToken(data.token);
  return data;
}

async function cloudLogin(username, password) {
  const data = await cloudCall('POST', '/api/login', { username, password });
  setToken(data.token);
  return data;
}

/* ================ 云端日记存取 ================ */
async function cloudGetDiaries() {
  const data = await cloudCall('GET', '/api/diaries');
  return (data.diaries || []).sort((a, b) => b.ts - a.ts);
}

async function cloudSaveDiary(diary) {
  await cloudCall('POST', '/api/diaries', { diary });
}

async function cloudDeleteDiary(id) {
  await cloudCall('DELETE', '/api/diaries/' + encodeURIComponent(id));
}

/* ================ 云端设置存取 ================ */
async function cloudGetSettings() {
  const data = await cloudCall('GET', '/api/settings');
  return data.settings || {};
}
async function cloudSaveSetting(key, value) {
  await cloudCall('POST', '/api/settings', { key, value });
}

/* ================ 同步：云端 → 本地合并 ================ */
async function syncFromCloud() {
  if (!getCloudApi() || !getToken()) return; // 未登录或未配 API
  try {
    const clouds = await cloudGetDiaries();
    if (!clouds.length) return;
    // 本地日记（用 id 做键，避免重复）
    const locals = getDiaries();
    const map = {};
    locals.forEach(d => { map[d.id] = d; });
    clouds.forEach(d => { map[d.id] = d; });
    const merged = Object.values(map).sort((a, b) => b.ts - a.ts);
    saveDiaries(merged);
    // 同步设置
    try {
      const cs = await cloudGetSettings();
      if (cs.online !== undefined && _cur) { _cur.online = !!cs.online; updateUser(_cur); }
      if (cs.font && _cur) { _cur.font = cs.font; updateUser(_cur); }
      if (cs.linespace && _cur) { _cur.linespace = cs.linespace; updateUser(_cur); }
      if (cs.proxy) setYoudaoProxy(cs.proxy);
    } catch (e) { /* 设置同步失败不影响日记 */ }
    _cloudOk = true;
  } catch (e) {
    _cloudOk = false;
    console.warn('云端同步失败，使用本地数据', e.message);
  }
}

// 异步上传单篇日记到云端（失败不报错，本地保留）
function pushToCloud(diary) {
  if (!getCloudApi() || !getToken()) return;
  cloudSaveDiary(diary).catch(() => {});
}

// 异步删除云端单篇日记
function delFromCloud(id) {
  if (!getCloudApi() || !getToken()) return;
  cloudDeleteDiary(id).catch(() => {});
}

/* ===================== 日记本账号（多用户） ===================== */
function getUsers() {
  const raw = lsGet(KEY_USERS);
  try { return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
}
function saveUsers(list) { lsSet(KEY_USERS, JSON.stringify(list)); }
function addUser(u) { const list = getUsers(); list.push(u); saveUsers(list); return u; }
function updateUser(u) { saveUsers(getUsers().map(x => x.id === u.id ? u : x)); }
function findUserById(id) { return getUsers().find(u => u.id === id) || null; }
function setCurrentUser(u) { _cur = u; }
function getCurrentUser() { return _cur; }

// 首次使用判定
function isFirstUse() { return getUsers().length === 0; }

// 根据用户名查找本地账号（登录时用）
function findUserByName(username) { return getUsers().find(u => u.username === username) || null; }

/* ===================== 当前日记本配置读写 ===================== */
function getUser() { return _cur ? _cur.username : null; }
function setUser(v) { if (_cur) { _cur.username = v; updateUser(_cur); } }
function getPwd() { return _cur ? _cur.pwd : null; }
function setPwd(v) { if (_cur) { _cur.pwd = v; updateUser(_cur); } }
function getLevel() { return _cur ? _cur.level : 'cet4'; }
function setLevel(v) { if (_cur) { _cur.level = v; updateUser(_cur); } }
function getOnline() { return _cur ? !!_cur.online : false; }
function setOnline(on) { if (_cur) { _cur.online = !!on; updateUser(_cur); } }
function getFont() { return _cur ? (_cur.font || '') : ''; }
function setFont(v) { if (_cur) { _cur.font = v; updateUser(_cur); } }
function getLineSpace() { return _cur ? (_cur.linespace || '34') : '34'; }
function setLineSpace(v) { if (_cur) { _cur.linespace = v; updateUser(_cur); } }

/* ===================== 日记（按用户隔离 + 云端双写） ===================== */
function diariesKey(id) { return STORE_PREFIX + 'd_' + id; }

function getDiaries() {
  if (!_cur) return [];
  const raw = lsGet(diariesKey(_cur.id));
  try { return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
}
function saveDiaries(list) { if (!_cur) return; lsSet(diariesKey(_cur.id), JSON.stringify(list)); }

function upsertDiary(diary) {
  const list = getDiaries();
  // 自动生成 ID（若没有）
  const d = { ...diary };
  if (!d.id) d.id = 'd_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  if (!d.ts) d.ts = Date.now();
  if (!d.date) d.date = ymd(new Date());
  const idx = list.findIndex(x => x.id === d.id);
  if (idx >= 0) { list[idx] = d; } else { list.unshift(d); }
  saveDiaries(list);
  // 异步上传云端（静默失败）
  pushToCloud(d);
  return d;
}

function getDiaryById(id) { return getDiaries().find(d => d.id === id) || null; }

function deleteDiary(id) {
  saveDiaries(getDiaries().filter(d => d.id !== id));
  delFromCloud(id);
}

function clearCurrentBook() {
  if (!_cur) return;
  saveDiaries([]);
  _cur.online = false; _cur.font = ''; _cur.linespace = '34'; _cur.level = 'cet4';
  updateUser(_cur);
}

function deleteCurrentBook() {
  if (!_cur) return;
  lsRemove(diariesKey(_cur.id));
  saveUsers(getUsers().filter(u => u.id !== _cur.id));
  _cur = null;
  setToken(''); // 登出
}

/* ===================== 统计辅助 ===================== */
function groupByDate(list) {
  const map = {};
  list.forEach(d => { (map[d.date] = map[d.date] || []).push(d); });
  return map;
}
function calcStreak(list) {
  if (!list.length) return 0;
  const dates = new Set(list.map(d => d.date));
  const today = new Date();
  const fmt = ymd;
  let cursor = new Date(today);
  if (!dates.has(fmt(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dates.has(fmt(cursor))) return 0;
  }
  let streak = 0;
  while (dates.has(fmt(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}
function totalWords(list) { return list.reduce((s, d) => s + (d.stat ? d.stat.words : 0), 0); }

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/* ===================== 有道翻译代理地址 ===================== */
const KEY_PROXY = STORE_PREFIX + 'youdao_proxy';
function getYoudaoProxy() { return lsGet(KEY_PROXY) || ''; }
function setYoudaoProxy(v) { lsSet(KEY_PROXY, (v || '').trim()); }
