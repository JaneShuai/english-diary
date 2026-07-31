/* =========================================================================
 * diary-api-worker.js —— 日记后端 API（部署到 Cloudflare Workers + KV）
 * -------------------------------------------------------------------------
 * API 路由：
 *   POST /api/register    { username, password, level }  → { token, user }
 *   POST /api/login       { username, password }         → { token, user }
 *   GET  /api/diaries     Authorization: Bearer {token}  → { diaries }
 *   POST /api/diaries     { diary }                      保存/更新一篇日记
 *   DELETE /api/diaries/:id                               删除一篇日记
 *   GET  /api/settings    Authorization: Bearer {token}  → { settings }
 *   POST /api/settings    { key:val ... }                保存设置
 *   全部返回 JSON，自动处理 CORS 跨域。
 *
 * KV 存储结构：
 *   user:{username}     → { passwordHash, salt, level, createdAt }
 *   diary:{username}    → JSON 数组 [{ id, date, weather, mood, tags, content, stat, ts }]
 *   settings:{username} → JSON 对象 { online, font, linespace, proxy }
 *
 * 部署步骤：
 *   1. Cloudflare Dashboard → Workers & Pages → KV → 创建命名空间 "DIARY_KV"
 *   2. Workers & Pages → 创建 Worker → 粘贴本文件 → 部署
 *   3. Worker 详情 → Settings → Variables → 添加：
 *        SECRET       = 一个随机字符串（用于 token 签名，自己生成就行）
 *   4. Worker 详情 → Settings → Bindings → KV Namespace → 绑定：
 *        DIARY_KV     = 刚才创建的命名空间
 *   5. 复制 *.workers.dev 地址，填入日记网站「设置 → API 服务器地址」
 * ========================================================================= */

// CORS 头
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 跨域预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const path = url.pathname;

    try {
      // ===== 无需认证的路由 =====
      if (path === '/api/register' && request.method === 'POST') {
        return await handleRegister(await request.json(), env);
      }
      if (path === '/api/login' && request.method === 'POST') {
        return await handleLogin(await request.json(), env);
      }

      // ===== 需要认证的路由 =====
      const user = await auth(request, env);
      if (!user) return json({ error: '未登录或登录已过期，请重新登录' }, 401);

      if (path === '/api/diaries') {
        if (request.method === 'GET') return await handleGetDiaries(user, env);
        if (request.method === 'POST') return await handleSaveDiary(user, await request.json(), env);
      }
      if (path.startsWith('/api/diaries/') && request.method === 'DELETE') {
        return await handleDeleteDiary(user, path.split('/').pop(), env);
      }
      if (path === '/api/settings') {
        if (request.method === 'GET') return await handleGetSettings(user, env);
        if (request.method === 'POST') return await handleSaveSettings(user, await request.json(), env);
      }

      return json({ error: 'not found' }, 404);
    } catch (e) {
      return json({ error: String(e) }, 500);
    }
  },
};

/* =================== Token 签发 / 校验 =================== */

// 生成 token：payload + "." + hmac_sha256(payload, SECRET)
// payload = base64({ username, exp })
async function makeToken(username, env) {
  const payload = { username, exp: Date.now() + 30 * 24 * 3600 * 1000 }; // 30 天有效期
  const payload64 = btoa(JSON.stringify(payload));
  const sig = await hmacSha256(payload64, env.SECRET || 'diary-secret');
  return payload64 + '.' + sig;
}

// 校验 token，返回 username 或 null
async function auth(request, env) {
  const header = request.headers.get('Authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const idx = token.lastIndexOf('.');
  if (idx < 0) return null;
  const payload64 = token.slice(0, idx);
  const sig = token.slice(idx + 1);

  const expected = await hmacSha256(payload64, env.SECRET || 'diary-secret');
  if (sig !== expected) return null;

  try {
    const payload = JSON.parse(atob(payload64));
    if (payload.exp < Date.now()) return null; // 过期
    return payload.username;
  } catch {
    return null;
  }
}

async function hmacSha256(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

/* =================== 注册 =================== */

async function handleRegister(body, env) {
  const { username, password, level } = body || {};
  if (!username || !password) return json({ error: '用户名和密码不能为空' }, 400);
  if (username.length < 2 || username.length > 20) return json({ error: '用户名需 2-20 个字符' }, 400);
  if (password.length < 4) return json({ error: '密码至少 4 位' }, 400);

  // 检查是否已存在
  const existing = await env.DIARY_KV.get(`user:${username}`);
  if (existing) return json({ error: '该用户名已被注册，请直接登录' }, 409);

  const salt = crypto.randomUUID();
  const passwordHash = await sha256(password + salt);
  const userData = {
    username,
    passwordHash,
    salt,
    level: level || 'cet4',
    createdAt: Date.now(),
  };
  await env.DIARY_KV.put(`user:${username}`, JSON.stringify(userData));

  const token = await makeToken(username, env);
  return json({ token, user: { username, level: userData.level } });
}

/* =================== 登录 =================== */

async function handleLogin(body, env) {
  const { username, password } = body || {};
  if (!username || !password) return json({ error: '用户名和密码不能为空' }, 400);

  const raw = await env.DIARY_KV.get(`user:${username}`);
  if (!raw) return json({ error: '用户不存在，请先注册' }, 401);

  const userData = JSON.parse(raw);
  const hash = await sha256(password + userData.salt);
  if (hash !== userData.passwordHash) return json({ error: '密码错误' }, 401);

  const token = await makeToken(username, env);
  return json({ token, user: { username, level: userData.level } });
}

/* =================== 日记存取 =================== */

async function handleGetDiaries(username, env) {
  const raw = await env.DIARY_KV.get(`diary:${username}`);
  const diaries = raw ? JSON.parse(raw) : [];
  return json({ diaries });
}

async function handleSaveDiary(username, body, env) {
  const { diary } = body || {};
  if (!diary || !diary.id) return json({ error: '缺少日记数据' }, 400);

  const raw = await env.DIARY_KV.get(`diary:${username}`);
  const diaries = raw ? JSON.parse(raw) : [];

  // 如果已有同 id 的日记则更新，否则追加到数组最前
  const idx = diaries.findIndex(d => d.id === diary.id);
  if (idx >= 0) {
    diaries[idx] = diary;
  } else {
    diaries.unshift(diary);
  }

  await env.DIARY_KV.put(`diary:${username}`, JSON.stringify(diaries));
  return json({ ok: true });
}

async function handleDeleteDiary(username, id, env) {
  const raw = await env.DIARY_KV.get(`diary:${username}`);
  let diaries = raw ? JSON.parse(raw) : [];
  diaries = diaries.filter(d => d.id !== id);
  await env.DIARY_KV.put(`diary:${username}`, JSON.stringify(diaries));
  return json({ ok: true });
}

/* =================== 设置存取 =================== */

async function handleGetSettings(username, env) {
  const raw = await env.DIARY_KV.get(`settings:${username}`);
  const settings = raw ? JSON.parse(raw) : {};
  return json({ settings });
}

async function handleSaveSettings(username, body, env) {
  const { key, value } = body || {};
  if (!key) return json({ error: '缺少 key' }, 400);

  const raw = await env.DIARY_KV.get(`settings:${username}`);
  const settings = raw ? JSON.parse(raw) : {};
  settings[key] = value;
  await env.DIARY_KV.put(`settings:${username}`, JSON.stringify(settings));
  return json({ ok: true });
}

/* =================== 工具函数 =================== */

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}
