/* =========================================================================
 * youdao-worker.js —— 有道翻译「轻代理」（部署到 Cloudflare Workers）
 * -------------------------------------------------------------------------
 * 作用：解决纯前端两个硬伤
 *   1) 浏览器跨域（CORS）：本代理在响应头加上 Access-Control-Allow-Origin:*
 *   2) 密钥暴露：有道 appSecret 只存在 Workers 环境变量里，前端永远看不到
 *
 * 部署步骤（两种任选）：
 *  【方式A：控制台粘贴（最简单）】
 *    1. 打开 https://dash.cloudflare.com → Workers & Pages → 创建 Worker
 *    2. 把本文件内容全部粘进去，保存
 *    3. 进入该 Worker → Settings → Variables → 添加环境变量：
 *         YOUDAO_APP_KEY  = 你的应用ID
 *         YOUDAO_APP_SECRET = 你的应用密钥
 *       （Encryption 选 Encrypt 更稳妥）
 *    4. 复制分配的 *.workers.dev 地址（形如 https://my-youdao.xxx.workers.dev）
 *  【方式B：wrangler 命令行】
 *    npm i -g wrangler && wrangler login
 *    wrangler secret put YOUDAO_APP_KEY   （按提示粘贴）
 *    wrangler secret put YOUDAO_APP_SECRET
 *    wrangler deploy
 *
 * 部署完成后，把 *.workers.dev 地址填进日记网站「设置 → 有道翻译代理」即可。
 * ========================================================================= */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // 预检请求（浏览器跨域 OPTIONS）
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const appKey = env.YOUDAO_APP_KEY;
    const appSecret = env.YOUDAO_APP_SECRET;
    if (!appKey || !appSecret) {
      return json({ error: '代理未配置 YOUDAO_APP_KEY / YOUDAO_APP_SECRET，请在 Workers 环境变量中设置' }, 500);
    }

    try {
      const url = new URL(request.url);
      const q = url.searchParams.get('q') || '';
      const from = url.searchParams.get('from') || 'zh-CHS';
      const to = url.searchParams.get('to') || 'en';
      if (!q) return json({ error: '缺少 q 参数' }, 400);

      // —— 有道 v3 签名：sha256(appKey + input + salt + curtime + appSecret) ——
      const salt = crypto.randomUUID();
      const curtime = String(Math.floor(Date.now() / 1000));
      // input：q 长度<=20 用原串；否则取 前10 + 长度 + 后10
      const input = q.length <= 20 ? q : q.slice(0, 10) + q.length + q.slice(q.length - 10);
      const sign = await sha256(appKey + input + salt + curtime + appSecret);

      const youdao =
        'https://openapi.youdao.com/api?q=' + encodeURIComponent(q) +
        '&from=' + from + '&to=' + to +
        '&appKey=' + appKey + '&salt=' + salt +
        '&sign=' + sign + '&signType=v3&curtime=' + curtime;

      const resp = await fetch(youdao);
      const data = await resp.json();
      return json(data);
    } catch (e) {
      return json({ error: String(e) }, 500);
    }
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

// SHA-256 → 32 位十六进制（Workers 运行时自带 crypto.subtle）
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
