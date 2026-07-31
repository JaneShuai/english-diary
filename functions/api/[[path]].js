// Cloudflare Pages Function: 处理日记 API（/api/* 路由）
// 文件位置：functions/api/[[path]].js → 自动匹配 /api/* 所有路径
// KV 绑定：在 Pages 设置里绑定 DIARY_KV 命名空间
// Secret：在 Pages 设置里添加 SECRET 环境变量
// 部署后访问：https://<your-project>.pages.dev/api/login

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Pages Function 用 onRequest 导出（不是 fetch）
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  // Pages Function 已经剥离了 /api 前缀
  // 例如：访问 /api/login → 这里 path 就是 /login
  const path = url.pathname;

  // 跨域预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  // 去掉 /api 前缀，让路由匹配简单
  let route = path.replace(/^\/api/, '');

  try {
    // 有道翻译代理（无需登录，直接走 env 里的 API 密钥）
    if (route === '/translate') {
      const q = url.searchParams.get('q') || '';
      const from = url.searchParams.get('from') || 'zh-CHS';
      const to = url.searchParams.get('to') || 'en';
      if (!q) return json({ error: '缺少 q 参数' }, 400);
      const appKey = env.YOUDAO_APP_KEY;
      const appSecret = env.YOUDAO_APP_SECRET;
      if (!appKey || !appSecret) return json({ error: '未配置有道 API 密钥' }, 500);
      const salt = crypto.randomUUID();
      const curtime = String(Math.floor(Date.now() / 1000));
      const input = q.length <= 20 ? q : q.slice(0, 10) + q.length + q.slice(q.length - 10);
      const sign = await sha256(appKey + input + salt + curtime + appSecret);
      const target = 'https://openapi.youdao.com/api?q=' + encodeURIComponent(q)
        + '&from=' + from + '&to=' + to + '&appKey=' + appKey
        + '&salt=' + salt + '&sign=' + sign + '&signType=v3&curtime=' + curtime;
      const resp = await fetch(target);
      return new Response(await resp.text(), { headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' } });
    }

    if (route === '/register' && request.method === 'POST') {
      return await handleRegister(await request.json(), env);
    }
    if (route === '/login' && request.method === 'POST') {
      return await handleLogin(await request.json(), env);
    }

    const user = await auth(request, env);
    if (!user) return json({ error: '未登录或登录已过期，请重新登录' }, 401);

    if (route === '/diaries') {
      if (request.method === 'GET') return await handleGetDiaries(user, env);
      if (request.method === 'POST') return await handleSaveDiary(user, await request.json(), env);
    }
    if (route.startsWith('/diaries/') && request.method === 'DELETE') {
      return await handleDeleteDiary(user, route.split('/').pop(), env);
    }
    if (route === '/settings') {
      if (request.method === 'GET') return await handleGetSettings(user, env);
      if (request.method === 'POST') return await handleSaveSettings(user, await request.json(), env);
    }
    return json({ error: 'not found: ' + route }, 404);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
}

/* =================== Token 签发 / 校验 =================== */
async function makeToken(username, env) {
  const payload = { username, exp: Date.now() + 30 * 24 * 3600 * 1000 };
  const payload64 = btoa(JSON.stringify(payload));
  const sig = await hmacSha256(payload64, env.SECRET || 'diary-secret');
  return payload64 + '.' + sig;
}

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
    if (payload.exp < Date.now()) return null;
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
  const existing = await env.DIARY_KV.get(`user:${username}`);
  if (existing) return json({ error: '该用户名已被注册，请直接登录' }, 409);
  const salt = crypto.randomUUID();
  const passwordHash = await sha256(password + salt);
  await env.DIARY_KV.put(
    `user:${username}`,
    JSON.stringify({ username, passwordHash, salt, level: level || 'cet4', createdAt: Date.now() })
  );
  return json({ token: await makeToken(username, env), user: { username, level: level || 'cet4' } });
}

/* =================== 登录 =================== */
async function handleLogin(body, env) {
  const { username, password } = body || {};
  if (!username || !password) return json({ error: '用户名和密码不能为空' }, 400);
  const raw = await env.DIARY_KV.get(`user:${username}`);
  if (!raw) return json({ error: '用户不存在，请先注册' }, 401);
  const u = JSON.parse(raw);
  if (await sha256(password + u.salt) !== u.passwordHash) return json({ error: '密码错误' }, 401);
  return json({ token: await makeToken(username, env), user: { username, level: u.level } });
}

/* =================== 日记存取 =================== */
async function handleGetDiaries(username, env) {
  const raw = await env.DIARY_KV.get(`diary:${username}`);
  return json({ diaries: raw ? JSON.parse(raw) : [] });
}

async function handleSaveDiary(username, body, env) {
  const d = body && body.diary;
  if (!d || !d.id) return json({ error: '缺少日记数据' }, 400);
  const raw = await env.DIARY_KV.get(`diary:${username}`);
  const arr = raw ? JSON.parse(raw) : [];
  const idx = arr.findIndex(x => x.id === d.id);
  if (idx >= 0) arr[idx] = d;
  else arr.unshift(d);
  await env.DIARY_KV.put(`diary:${username}`, JSON.stringify(arr));
  return json({ ok: true });
}

async function handleDeleteDiary(username, id, env) {
  const raw = await env.DIARY_KV.get(`diary:${username}`);
  let arr = raw ? JSON.parse(raw) : [];
  arr = arr.filter(x => x.id !== id);
  await env.DIARY_KV.put(`diary:${username}`, JSON.stringify(arr));
  return json({ ok: true });
}

/* =================== 设置存取 =================== */
async function handleGetSettings(username, env) {
  const raw = await env.DIARY_KV.get(`settings:${username}`);
  return json({ settings: raw ? JSON.parse(raw) : {} });
}

async function handleSaveSettings(username, body, env) {
  const { key, value } = body || {};
  if (!key) return json({ error: '缺少 key' }, 400);
  const raw = await env.DIARY_KV.get(`settings:${username}`);
  const s = raw ? JSON.parse(raw) : {};
  s[key] = value;
  await env.DIARY_KV.put(`settings:${username}`, JSON.stringify(s));
  return json({ ok: true });
}

/* =================== 工具 =================== */
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