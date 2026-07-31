/* =========================================================
 * 手绘治愈私密英语日记 - 统一 Worker
 * 同时托管网站 + API，同一域名无跨域问题
 * KV: DIARY_KV | Secret: SECRET
 * 生成: 2026-07-31 07:59:48
 * ========================================================= */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const STATIC = {
  '/': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>手绘治愈私密英语日记本</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>

  <!-- ============ 书桌首页（初始页面，未解锁时唯一可见） ============ -->
  <section id="desk-page">
    <div class="desk-card">
      <div class="diary-book" aria-hidden="true"></div>
      <div class="desk-title hand">我的私密英语日记本</div>
      <div class="desk-sub">把每天的小心情，写成温柔的英文 ✦</div>
      <button class="btn primary" id="btn-start">开始记录</button>
      <div class="desk-lock-hint">点击「开始记录」选择或创建你的日记本 · 可多人共用 · 刷新/关闭后自动上锁</div>
    </div>
  </section>

  <!-- ============ 应用主框架（解锁后显示） ============ -->
  <div id="app">
    <header class="topbar">
      <div class="brand hand">📔 英语日记本</div>
      <button class="nav-btn active" data-page="write">✏️ 写作</button>
      <button class="nav-btn" data-page="history">📚 历史</button>
      <button class="nav-btn" data-page="report">📈 报表</button>
      <button class="nav-btn" data-page="settings">⚙️ 设置</button>
      <button class="btn ghost sm" id="btn-lock" title="上锁返回书桌">🔒 上锁</button>
    </header>

    <!-- ---------- 写作主页 ---------- -->
    <main class="page show" id="page-write">
      <div class="weather-mood card">
        <div>
          <div class="row" style="margin:0 0 6px"><b>☁️ 天气</b></div>
          <div class="chip-group" id="weather-chips"></div>
        </div>
        <div>
          <div class="row" style="margin:0 0 6px"><b>💗 心情</b></div>
          <div class="chip-group" id="mood-chips"></div>
        </div>
      </div>

      <div class="write-wrap">
        <textarea id="editor" class="field" placeholder="Write down every little feeling~"></textarea>

        <!-- 实时中英提示悬浮卡片 -->
        <div id="suggest-pop">
          <div class="suggest-head">
            <span>💡 中文实时英文提示（点击即可插入）</span>
            <span class="badge" id="suggest-mode">离线素材库</span>
          </div>
          <div id="suggest-list"></div>
        </div>
      </div>

      <!-- 贴纸表情美化工具条 -->
      <div class="toolbar">
        <span class="badge">🎀 贴纸</span>
        <div class="sticker-bar" id="sticker-bar"></div>
      </div>

      <div class="toolbar">
        <button class="btn blue" id="btn-grammar">🔍 全文语法检测</button>
        <button class="btn green" id="btn-save">💾 保存日记</button>
        <span id="write-tip" class="hint" style="font-size:12px;color:var(--ink-soft)"></span>
      </div>
    </main>

    <!-- ---------- 历史日记页 ---------- -->
    <main class="page" id="page-history">
      <div class="card">
        <div class="cal-head">
          <button class="btn sm" id="cal-prev">◀</button>
          <b id="cal-title">2026 年 7 月</b>
          <button class="btn sm" id="cal-next">▶</button>
        </div>
        <div class="cal-grid" id="cal-grid"></div>
      </div>

      <div class="card">
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px">
          <b>📋 日记列表</b>
          <select id="tag-filter" class="field sm" style="width:auto"></select>
          <button class="btn sm ghost" id="btn-export-all">⬇️ 批量导出</button>
        </div>
        <div id="diary-list"></div>
      </div>
    </main>

    <!-- ---------- 数据报表页 ---------- -->
    <main class="page" id="page-report">
      <div class="stat-grid" id="report-stats"></div>
      <div class="chart-box"><h3>📊 英文写作占比（近 14 天）</h3><canvas id="chart-ratio" width="880" height="300"></canvas></div>
      <div class="chart-box"><h3>📈 英文写作成长趋势</h3><canvas id="chart-trend" width="880" height="280"></canvas></div>
      <div class="chart-box"><h3>🗓️ 本月打卡日历</h3><canvas id="chart-checkin" width="880" height="260"></canvas></div>
    </main>

    <!-- ---------- 设置页 ---------- -->
    <main class="page" id="page-settings">
      <div class="card">
        <h3>👤 基本信息</h3>
        <div class="set-row">
          <div>用户名 / 日记本名</div>
          <input class="field" id="set-username" style="width:200px" />
        </div>
        <div class="set-row">
          <div>英语等级</div>
          <select class="field" id="set-level" style="width:auto">
            <option value="cet4">英语四级</option>
            <option value="cet6">英语六级</option>
            <option value="ielts_basic">雅思基础</option>
            <option value="ielts_advanced">雅思进阶</option>
          </select>
        </div>
        <div class="set-row">
          <div>修改解锁密码</div>
          <div>
            <input class="field sm" id="set-pwd-new" placeholder="新密码" style="width:130px" />
            <input class="field sm" id="set-pwd-confirm" placeholder="再输一次" style="width:130px" />
          </div>
        </div>
        <button class="btn primary sm" id="btn-save-settings">保存设置</button>
      </div>

      <div class="card">
        <h3>🌐 有道翻译（联网增强）</h3>
        <div class="set-row">
          <div>
            <div>有道翻译代理地址</div>
            <div class="hint" style="font-size:12px;color:var(--ink-soft);max-width:360px">
              🔒 填你自己部署的 Cloudflare Workers 代理地址（部署步骤见 README）。有道密钥只存在你的服务端，前端<b>只上传“当前正在输入的那一句中文”</b>。
            </div>
          </div>
          <input class="field" id="set-proxy" placeholder="https://你的代理.workers.dev" style="width:240px" />
        </div>
        <div class="set-row">
          <div>
            <div>开启后实时翻译 / 语法检测更精准</div>
            <div class="hint" style="font-size:12px;color:var(--ink-soft);max-width:360px">
              🔒 隐私：仅在你输中文时，把<b>当前这一句中文</b>经代理发往有道；<b>绝不上传</b>日记全文、用户名、密码、心情。断网或未配置代理会自动降级为本地离线素材库。
            </div>
          </div>
          <label class="switch">
            <input type="checkbox" id="set-online" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="card">
        <h3>☁️ 云端同步（跨设备）</h3>
        <div class="set-row">
          <div>
            <div>API 服务器地址</div>
            <div class="hint" style="font-size:12px;color:var(--ink-soft);max-width:360px">
              部署 diary-api-worker.js（Cloudflare Workers）后填入地址，即可注册/登录云端账号，实现<b>电脑和手机日记自动同步</b>。不填则仅使用本机存储。
            </div>
          </div>
          <input class="field" id="set-api" placeholder="https://xxx.workers.dev" style="width:240px" />
        </div>
      </div>

      <div class="card">
        <h3>✒️ 编辑区偏好</h3>
        <div class="set-row">
          <div>字体</div>
          <select class="field" id="set-font" style="width:auto">
            <option value="">默认（护眼黑体）</option>
            <option value="'Comic Sans MS',cursive">手写体</option>
            <option value="'KaiTi','STKaiti',serif">楷体</option>
            <option value="Georgia,serif">衬线体</option>
          </select>
        </div>
        <div class="set-row">
          <div>行距</div>
          <select class="field" id="set-linespace" style="width:auto">
            <option value="28">紧凑</option>
            <option value="34" selected>舒适（默认）</option>
            <option value="42">宽松</option>
            <option value="50">超宽</option>
          </select>
        </div>
      </div>

      <div class="card">
        <h3>🗑️ 数据管理</h3>
        <div class="set-row">
          <div>清空本日记本全部日记与设置（账号保留）</div>
          <button class="btn danger" id="btn-clear">清空本日记本</button>
        </div>
        <div class="set-row">
          <div>彻底删除本日记本（含账号与全部日记）</div>
          <button class="btn danger" id="btn-del-book">删除日记本</button>
        </div>
      </div>
    </main>
  </div>

  <!-- ============ 弹窗：解锁 / 首次设置 ============ -->
  <div class="mask" id="mask-unlock">
    <div class="modal" id="modal-unlock"></div>
  </div>

  <!-- ============ 弹窗：语法检测结果 ============ -->
  <div class="mask" id="mask-grammar">
    <div class="modal">
      <h3>🔍 语法检测报告</h3>
      <div id="grammar-result"></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn green" id="btn-fix-all">✨ 一键全文修正</button>
        <button class="btn ghost" id="btn-grammar-close">关闭</button>
      </div>
    </div>
  </div>

  <!-- ============ 弹窗：历史日记 查看/编辑 ============ -->
  <div class="mask" id="mask-view">
    <div class="modal" id="modal-view" style="max-width:560px"></div>
  </div>

  <!-- ============ Toast ============ -->
  <div id="toast"></div>

  <!-- 脚本：严格顺序加载（data→storage→translate→charts→app）-->
  <script src="js/data.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/translate.js"></script>
  <script src="js/charts.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
`,
  '/css/style.css': `/* =========================================================================
 * style.css —— 手绘治愈风样式
 * 马卡龙浅色系 / 圆角卡通 / 书桌 & 横线纸背景 / 柔和过渡动画 / 全响应式
 * ========================================================================= */

:root{
  /* 马卡龙低饱和配色 */
  --pink:#f7c5d8; --pink-soft:#fde7ef;
  --blue:#bcd9f0; --blue-soft:#e7f2fb;
  --green:#c7e7c9; --green-soft:#eaf6eb;
  --yellow:#fbe6a8; --yellow-soft:#fdf6e3;
  --purple:#d9c7ee; --purple-soft:#f1e9fa;
  --paper:#fffdf8;          /* 纸张米白 */
  --ink:#6f5f68;            /* 手写墨色（护眼深灰紫）*/
  --ink-soft:#9b8b94;
  --line:#f0dde6;           /* 横线 */
  --shadow:rgba(180,140,160,.18);
  --desk:#e9d3b8;           /* 木质书桌 */
  --desk-dark:#d8bd9c;
}

*{box-sizing:border-box;}
html,body{margin:0;padding:0;}
body{
  font-family:"PingFang SC","Microsoft YaHei","Segoe UI",sans-serif;
  color:var(--ink);
  background:var(--paper);
  -webkit-font-smoothing:antialiased;
  line-height:1.6;
}
/* 手写标题字体（系统卡通手写体回退，离线可用）*/
.hand{font-family:"Comic Sans MS","Segoe Print","Bradley Hand","Chalkboard SE",cursive;}

button{font-family:inherit;cursor:pointer;color:var(--ink);}
input,textarea,select{font-family:inherit;color:var(--ink);}

/* ---------- 手绘卡通按钮 ---------- */
.btn{
  border:2.5px dashed var(--ink-soft);
  background:var(--paper);
  border-radius:18px 22px 20px 24px;   /* 不规则圆角，手绘感 */
  padding:10px 18px;
  font-size:15px;
  box-shadow:2px 3px 0 var(--shadow);
  transition:transform .12s ease, box-shadow .12s ease, background .2s;
}
.btn:hover{transform:translateY(-2px) rotate(-.5deg);box-shadow:3px 5px 0 var(--shadow);}
.btn:active{transform:translateY(1px);box-shadow:1px 2px 0 var(--shadow);}
.btn.primary{background:var(--pink-soft);border-color:var(--pink);}
.btn.blue{background:var(--blue-soft);border-color:var(--blue);}
.btn.green{background:var(--green-soft);border-color:var(--green);}
.btn.yellow{background:var(--yellow-soft);border-color:var(--yellow);}
.btn.ghost{background:transparent;border-style:dotted;}
.btn.sm{padding:6px 12px;font-size:13px;border-radius:14px;}
.btn.danger{background:#fdeaea;border-color:#f0b4b4;color:#c05858;}

/* ---------- 手绘输入框 ---------- */
.field{
  border:2.5px solid var(--line);
  border-radius:14px 16px 14px 18px;
  padding:10px 12px;
  background:#fff;
  outline:none;
  transition:border-color .2s, box-shadow .2s;
}
.field:focus{border-color:var(--pink);box-shadow:0 0 0 4px var(--pink-soft);}

/* ===================================================================
 * 书桌首页（初始页面，始终可见，未解锁时其它页面隐藏）
 * =================================================================== */
#desk-page{
  min-height:100vh;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  /* 木纹书桌背景：渐变 + 横向纹理 */
  background:
    repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 6px, rgba(0,0,0,.02) 6px 12px),
    linear-gradient(160deg,var(--desk) 0%, var(--desk-dark) 100%);
  position:relative;overflow:hidden;
}
.desk-card{
  background:var(--paper);
  border:3px dashed var(--ink-soft);
  border-radius:30px;
  padding:34px 40px;
  text-align:center;
  box-shadow:0 14px 40px rgba(120,90,110,.25);
  max-width:92vw;animation:floatIn .6s ease;
}
@keyframes floatIn{from{opacity:0;transform:translateY(18px) scale(.96);}to{opacity:1;transform:none;}}
.desk-title{font-size:30px;margin:6px 0 2px;color:var(--ink);}
.desk-sub{color:var(--ink-soft);font-size:14px;margin-bottom:18px;}
/* 卡通日记本摆件（纯 CSS）*/
.diary-book{
  width:150px;height:110px;margin:0 auto 18px;position:relative;
  background:linear-gradient(135deg,var(--pink),var(--purple));
  border-radius:10px 14px 14px 10px;
  box-shadow:inset -8px 0 0 rgba(0,0,0,.06), 4px 6px 0 var(--shadow);
  transform:rotate(-3deg);
}
.diary-book::before{ /* 书脊 */
  content:"";position:absolute;left:10px;top:0;bottom:0;width:8px;
  background:rgba(255,255,255,.5);border-radius:6px 0 0 6px;
}
.diary-book::after{ /* 封面小爱心 */
  content:"❤";position:absolute;right:18px;top:42px;font-size:26px;color:#fff;
}
.desk-lock-hint{font-size:12px;color:var(--ink-soft);margin-top:14px;}

/* ===================================================================
 * 应用主框架（解锁后显示）
 * =================================================================== */
#app{display:none;min-height:100vh;flex-direction:column;background:var(--paper);}
#app.show{display:flex;}

.topbar{
  display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  padding:12px 18px;background:var(--pink-soft);
  border-bottom:3px dashed var(--pink);
  position:sticky;top:0;z-index:20;
}
.topbar .brand{font-size:18px;margin-right:auto;display:flex;align-items:center;gap:6px;}
.nav-btn{
  border:2px solid transparent;background:transparent;border-radius:14px;
  padding:7px 14px;font-size:14px;transition:.18s;
}
.nav-btn.active{background:#fff;border-color:var(--pink);box-shadow:1px 2px 0 var(--shadow);}
.nav-btn:hover{background:var(--paper);}

.page{display:none;padding:20px;max-width:960px;width:100%;margin:0 auto;animation:pageIn .35s ease;}
.page.show{display:block;}
@keyframes pageIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}

/* ===================================================================
 * 写作主页
 * =================================================================== */
.write-wrap{position:relative;}
.weather-mood{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:14px;align-items:center;}
.chip-group{display:flex;flex-wrap:wrap;gap:6px;}
.chip{
  border:2px solid var(--line);background:#fff;border-radius:14px;
  padding:5px 12px;font-size:14px;cursor:pointer;transition:.15s;user-select:none;
}
.chip.active{background:var(--green-soft);border-color:var(--green);transform:scale(1.05);}
.chip .emo{margin-right:4px;}

/* 编辑区：横线笔记本纸张纹理（网格高度跟随行距 --row，保证字落在格线上）*/
#editor{
  width:100%;min-height:320px;resize:vertical;
  border:3px solid var(--line);border-radius:8px;
  padding:3px 20px 8px;                    /* 顶部几乎贴边（让文字顶端对齐横线网格的起点） */
  font-size:17px;
  --row:34px;                              /* 每行高度（行距设置会覆盖）*/
  line-height:var(--row);
  background-color:var(--paper);
  /* 横线仍画在每行底部，但用 background-position 让它从内容区顶部开始对齐，
     让"文字顶端 → 横线"之间留出大半个 row 的留白，文字落在两线正中、不压线 */
  background-image:repeating-linear-gradient(
    transparent, transparent calc(var(--row) - 1px), var(--line) calc(var(--row) - 1px), var(--line) var(--row));
  background-size:100% var(--row);
  background-attachment:local;
  outline:none;margin-top:4px;
}
/* 占位符样式：放在两线正中，颜色淡一点 */
#editor::placeholder{ color:var(--ink-soft); opacity:.65; }
#editor:focus{box-shadow:0 0 0 4px var(--blue-soft);}

.toolbar{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0;align-items:center;}

/* 实时中英提示悬浮卡片（固定贴屏幕底部居中，输入时始终可见） */
#suggest-pop{
  position:fixed;left:50%;transform:translateX(-50%);bottom:16px;
  width:min(760px,calc(100% - 28px));z-index:200;
  display:none;max-height:44vh;overflow:auto;
  background:#fff;border:3px dashed var(--blue);border-radius:16px;
  padding:12px 14px;box-shadow:0 12px 34px var(--shadow);
  animation:popIn .25s ease;
}
#suggest-pop.show{display:block;}
.suggest-tip{font-size:14px;color:var(--ink-soft);line-height:1.7;padding:4px 2px;}
@keyframes popIn{from{opacity:0;transform:translateX(-50%) translateY(10px) scale(.98);}to{opacity:1;transform:translateX(-50%);}}
.suggest-head{font-size:13px;color:var(--ink-soft);margin-bottom:8px;display:flex;justify-content:space-between;}
.suggest-item{
  border:2px solid var(--line);border-radius:12px;padding:8px 10px;margin-bottom:7px;
  cursor:pointer;transition:.15s;background:var(--paper);
}
.suggest-item:hover{background:var(--blue-soft);border-color:var(--blue);transform:translateX(3px);}
.suggest-item .tag{
  display:inline-block;font-size:11px;padding:1px 7px;border-radius:10px;
  background:var(--yellow-soft);color:#9a8a4a;margin-right:8px;border:1px solid var(--yellow);
}
.suggest-item .tag.online{background:var(--green-soft);color:#5b8a5f;border-color:var(--green);}
.suggest-item .en{font-size:15px;}
.suggest-item .cn{font-size:12px;color:var(--ink-soft);}

/* ===================================================================
 * 弹窗 / 模态框
 * =================================================================== */
.mask{
  position:fixed;inset:0;background:rgba(120,90,110,.28);
  display:none;align-items:center;justify-content:center;z-index:50;padding:16px;
  animation:fadeIn .25s ease;
}
.mask.show{display:flex;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
.modal{
  background:var(--paper);border:3px dashed var(--pink);border-radius:22px;
  padding:24px 26px;width:100%;max-width:420px;box-shadow:0 18px 50px rgba(120,90,110,.3);
  animation:popIn .3s ease;max-height:88vh;overflow:auto;
}
.modal h3{margin:0 0 14px;font-size:20px;}
.modal .row{margin-bottom:14px;}
.modal label{display:block;font-size:13px;color:var(--ink-soft);margin-bottom:5px;}
.modal .hint{font-size:12px;color:var(--ink-soft);margin-top:4px;}

/* 语法检查结果列表 */
.grammar-list{list-style:none;padding:0;margin:0;max-height:46vh;overflow:auto;}
.grammar-list li{
  border:2px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:8px;
  background:var(--yellow-soft);
}
.grammar-list .msg{font-size:14px;font-weight:bold;}
.grammar-list .old{text-decoration:line-through;color:#bb7;color:#c08;}
.grammar-list .new{color:#5b8a5f;font-weight:bold;}
.grammar-list .reason{font-size:12px;color:var(--ink-soft);margin-top:3px;}

/* ===================================================================
 * 历史页 / 报表页 通用卡片
 * =================================================================== */
.card{
  background:#fff;border:2.5px solid var(--line);border-radius:18px;
  padding:16px 18px;margin-bottom:14px;box-shadow:1px 3px 0 var(--shadow);
}
.diary-item{border-left:6px solid var(--pink);}
.diary-item h4{margin:0 0 6px;font-size:16px;}
.diary-meta{font-size:12px;color:var(--ink-soft);margin-bottom:8px;display:flex;flex-wrap:wrap;gap:8px;}
.diary-body{font-size:14px;white-space:pre-wrap;max-height:140px;overflow:hidden;position:relative;}
.diary-body.open{max-height:none;}
.tag{display:inline-block;font-size:12px;background:var(--purple-soft);color:#8a6;color:#7a5f9a;
  border:1px solid var(--purple);border-radius:10px;padding:1px 8px;margin:2px 4px 2px 0;}

.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin:14px 0;}
.stat-box{background:var(--blue-soft);border:2px solid var(--blue);border-radius:16px;padding:14px;text-align:center;}
.stat-box .num{font-size:26px;font-weight:bold;color:var(--ink);}
.stat-box .lab{font-size:12px;color:var(--ink-soft);}

.cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;}
.cal-cell{
  aspect-ratio:1;border:2px solid var(--line);border-radius:10px;display:flex;
  align-items:center;justify-content:center;font-size:13px;cursor:pointer;transition:.15s;
  background:#fff;position:relative;
}
.cal-cell.has{background:var(--green-soft);border-color:var(--green);color:#5b8a5f;font-weight:bold;}
.cal-cell:hover{transform:scale(1.06);}
.cal-cell.empty{visibility:hidden;}

/* 报表图表容器 */
.chart-box{background:#fff;border:2.5px solid var(--line);border-radius:18px;padding:12px;margin-bottom:16px;box-shadow:1px 3px 0 var(--shadow);}
.chart-box h3{margin:4px 0 10px;font-size:16px;}
.chart-box canvas{width:100%;height:auto;display:block;}

/* 设置项 */
.set-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:12px 0;}
.switch{position:relative;width:52px;height:28px;}
.switch input{opacity:0;width:0;height:0;}
.slider{position:absolute;inset:0;background:var(--line);border-radius:20px;transition:.2s;cursor:pointer;}
.slider::before{content:"";position:absolute;width:22px;height:22px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s;box-shadow:0 1px 3px var(--shadow);}
.switch input:checked + .slider{background:var(--green);}
.switch input:checked + .slider::before{transform:translateX(24px);}

/* 贴纸表情工具条 */
.sticker-bar{display:flex;flex-wrap:wrap;gap:6px;}
.sticker{
  width:38px;height:38px;border:2px solid var(--line);border-radius:12px;background:#fff;
  font-size:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.15s;
}
.sticker:hover{background:var(--yellow-soft);transform:scale(1.12) rotate(-6deg);}

/* 小徽标 */
.badge{display:inline-flex;align-items:center;gap:4px;font-size:12px;background:var(--purple-soft);
  border:1px solid var(--purple);border-radius:12px;padding:2px 10px;color:#7a5f9a;}

/* 多日记本选择卡片 */
.user-card{border:2.5px solid var(--line);border-radius:16px;padding:12px 14px;margin-bottom:10px;
  background:#fff;display:flex;flex-wrap:wrap;gap:8px;align-items:center;}
.user-card .uc-name{font-weight:bold;flex:1 1 100%;font-size:15px;}
.user-card .uc-err{color:#c05858;flex:1 1 100%;margin:0;font-size:12px;min-height:0;}

/* 提示气泡（toast）*/
#toast{
  position:fixed;left:50%;bottom:30px;transform:translateX(-50%) translateY(20px);
  background:var(--ink);color:#fff;padding:10px 18px;border-radius:16px;font-size:14px;
  opacity:0;pointer-events:none;transition:.3s;z-index:99;max-width:90vw;text-align:center;
}
#toast.show{opacity:1;transform:translateX(-50%) translateY(0);}

/* 打印专用（导出 PDF 时用浏览器打印，另存为 PDF）*/
@media print{
  #desk-page,#app .topbar,.toolbar,.sticker-bar,#toast,.mask,.cal-head,.card .set-row{display:none !important;}
  body{background:#fff;}
  .page{display:none !important;padding:0;}
  #print-root{display:block !important;}
  #print-root .print-area{border:none !important;box-shadow:none !important;break-inside:avoid;}
}

/* ---------- 全响应式：窄屏适配 ---------- */
@media (max-width:600px){
  .desk-card{padding:26px 22px;}
  .desk-title{font-size:24px;}
  .topbar{padding:10px 12px;gap:4px;}
  .nav-btn{padding:6px 10px;font-size:13px;}
  .page{padding:14px;}
  #editor{font-size:16px;min-height:260px;}
  .modal{padding:18px;}
}
`,
  '/js/data.js': `/* =========================================================================
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
`,
  '/js/storage.js': `/* =========================================================================
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
function getCloudApi() { return lsGet(KEY_API) || ''; }   // 同一 Worker 下为空，走相对路径
function setCloudApi(url) { lsSet(KEY_API, (url || '').trim()); }
function getToken() { return lsGet(KEY_TOKEN) || ''; }
function setToken(t) { if (t) lsSet(KEY_TOKEN, t); else lsRemove(KEY_TOKEN); }
function isCloudOk() { return _cloudOk; }

async function cloudCall(method, path, body) {
  const api = getCloudApi();
  const url = api ? (api + path) : path;  // 无配置时走相对路径（同一Worker下）
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  const token = getToken();
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  if (body) opts.body = JSON.stringify(body);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
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
  return \`\${y}-\${m}-\${d}\`;
}

/* ===================== 有道翻译代理地址 ===================== */
const KEY_PROXY = STORE_PREFIX + 'youdao_proxy';
function getYoudaoProxy() { return lsGet(KEY_PROXY) || ''; }
function setYoudaoProxy(v) { lsSet(KEY_PROXY, (v || '').trim()); }
`,
  '/js/translate.js': `/* =========================================================================
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
  const iIsAre = s.match(/\\bI\\s+(is|are)\\b/gi);
  if (iIsAre) {
    iIsAre.forEach(m => issues.push({
      original: m.trim(),
      message: '第一人称 I 后面要用 am，不用 is/are。',
      suggestion: 'I am'
    }));
  }
  // 规则2：He/She/It 作主语，谓语动词未加 -s（简单判断：后接动词原形）
  const third = s.match(/\\b(He|She|It)\\s+([a-z]+)(?:\\s|\$)/gi);
  // 常见不规则动词的第三人称单数
  const irreg3rd = { go:'goes', do:'does', have:'has', be:'is', say:'says' };
  if (third) {
    third.forEach(m => {
      const parts = m.trim().split(/\\s+/);
      const subj = parts[0]; // He / She / It
      const verb = parts[1].toLowerCase();
      const irregular = ['is', 'was', 'has', 'can', 'may', 'will', 'would', 'should', 'does', 'goes', 'gets'];
      if (/^[a-z]+\$/.test(verb) && !irregular.includes(verb) && !verb.endsWith('s')) {
        const fixedVerb = irreg3rd[verb] || (verb + 's');
        // 保留主语，只改动词
        issues.push({ original: m.trim(), message: '第三人称单数主语后，动词一般要加 -s。', suggestion: subj + ' ' + fixedVerb });
      }
    });
  }
  // 规则3：连续两个 the（多写）
  if (/\\bthe\\s+the\\b/i.test(s)) {
    issues.push({ original: 'the the', message: '重复了冠词 the。', suggestion: 'the' });
  }
  // 规则4：句首小写（简单判断首字母）
  const firstWord = (s.match(/[A-Za-z]+/g) || [])[0];
  if (firstWord && /^[a-z]/.test(firstWord) && s.trim().startsWith(firstWord)) {
    issues.push({ original: firstWord, message: '英文句子首字母应大写。', suggestion: capitalize(firstWord) });
  }
  // 规则5：句末缺少标点（以字母结尾且无标点）
  if (/[a-zA-Z]\\s*\$/.test(s.trim()) && s.trim().length > 0) {
    issues.push({ original: '(句末)', message: '句子结尾建议加上标点（. ? !）。', suggestion: '.' });
  }

  // ===== 以下为扩充规则（让"非常啰嗦"和用词问题也能识别）=====

  // 规则6：a/an 不匹配（a 后面跟元音开头的单词，应该用 an）
  const aAn = s.match(/\\ba\\s+([aeiouAEIOU]\\w*)/g);
  if (aAn) {
    aAn.forEach(m => {
      const w = m.split(/\\s+/)[1];
      issues.push({ original: m, message: \`以元音开头的单词前应该用 "an" 而不是 "a"。\`, suggestion: 'an ' + w });
    });
  }

  // 规则7：more + 已经是比较级的词（双重比较）
  const doubleCmp = s.match(/\\bmore\\s+(better|harder|larger|bigger|smaller|worse|sooner|easier|nicer|taller|shorter|newer|older|faster|slower|stronger|weaker)\\b/gi);
  if (doubleCmp) {
    doubleCmp.forEach(m => {
      const w = m.split(/\\s+/)[1].toLowerCase();
      issues.push({ original: m, message: \`"\${w}" 本身已经是比较级，前面不要再加 more。\`, suggestion: w });
    });
  }

  // 规则8：most + 已经是最高级的词（双重最高级）
  const doubleSup = s.match(/\\bmost\\s+(biggest|smallest|best|worst|tallest|shortest|fastest|slowest|strongest|weakest|newest|oldest|easiest|hardest|nicest)\\b/gi);
  if (doubleSup) {
    doubleSup.forEach(m => {
      const w = m.split(/\\s+/)[1].toLowerCase();
      issues.push({ original: m, message: \`"\${w}" 本身已经是最高级，前面不要再加 most。\`, suggestion: w });
    });
  }

  // 规则9：very much + 形容词（啰嗦，去掉 much）
  const vm = s.match(/\\bvery\\s+much\\s+(upset|happy|angry|sad|tired|excited|disappointed|pleased|surprised|nervous|worried|annoyed|frustrated|relieved|grateful)\\b/gi);
  if (vm) {
    vm.forEach(m => {
      const w = m.split(/\\s+/)[2].toLowerCase();
      issues.push({ original: m, message: \`"very much" 后的形容词直接用 "very" 即可，去掉 much 更地道。\`, suggestion: 'very ' + w });
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
  // 正则模式（捕获组用 \$1..\$n 占位，替换回原文捕获）
  const patterns = [
    [/Possible typo\\.\\s*Did you mean\\s*"([^"]+)"\\?/i, '可能是笔误。您是否想写 "\$1"？'],
    [/Did you mean\\s*"([^"]+)"\\s*instead\\?/i, '您是否想写 "\$1"？'],
    [/Use\\s*"([^"]+)"\\s*instead of\\s*"([^"]+)"\\?/i, '请用 "\$1" 代替 "\$2"。'],
    [/A comma may be missing after[^.]*\\./i, '此处可能缺少逗号。'],
    [/Add a space between[^.]*\\./i, '两词之间应加空格。'],
    [/Make sure you use a comma[^.]*\\./i, '此处请用逗号。'],
    [/This verb may not be used with[^.]*\\./i, '动词用法可能不正确。'],
    [/Possible agreement error[^.]*\\./i, '主谓可能不一致。'],
    [/Wrong verb form[^.]*\\./i, '动词形式可能有误。'],
    [/Incorrect article[^.]*\\./i, '冠词使用可能错误。'],
    [/Confusing prepositions?[^.]*\\./i, '介词搭配可能有误。'],
    [/Wordiness[^.]*\\./i, '表达过于啰嗦，建议精简。'],
    [/American English vs\\.? British English[^.]*\\./i, '美式与英式拼写混用了，请统一。'],
    [/Unpaired symbol[^.]*\\./i, '符号未配对，请检查括号/引号。'],
    [/Possible typo[^.]*\\./i, '可能有笔误。'],
    [/Spelling mistake[^.]*\\./i, '拼写可能有误。'],
    [/Missing comma[^.]*\\./i, '缺少逗号。'],
    [/comma splice[^.]*\\./i, '不应使用逗号连接两个独立句子。'],
    [/run-on sentence[^.]*\\./i, '这是一个连写句，请加句号或连接词。'],
    [/fragment[^.]*\\./i, '句子不完整。'],
  ];
  for (const [re, cn] of patterns) {
    const m = msg.match(re);
    if (m) return cn.replace(/\\\$(\\d)/g, (_, i) => m[+i] || '');
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
function escapeReg(str) { return str.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\\$&'); }
`,
  '/js/charts.js': `/* =========================================================================
 * charts.js —— 无依赖 Canvas 图表（手绘治愈风）
 * -------------------------------------------------------------------------
 * 纯前端、断网可用，不引入任何外部图表库。
 * 提供：英文写作占比柱状图、长期成长趋势折线图、每日打卡记录可视化。
 * ========================================================================= */

// 通用：手绘风圆角矩形
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// 马卡龙配色
const C = {
  pink: '#f7c5d8', blue: '#bcd9f0', green: '#c7e7c9', yellow: '#fbe6a8',
  purple: '#d9c7ee', text: '#7a6a72', line: '#e3b9c9', bg: '#fffdf8'
};

/* 英文写作占比柱状图
 * data: [{label:'07-20', en:12, cn:3}]  en/cn 为句子数
 */
function drawEnRatioBar(canvas, data) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  if (!data.length) { drawEmpty(ctx, W, H); return; }
  const padL = 36, padR = 16, padT = 20, padB = 36;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const max = Math.max(1, ...data.map(d => d.en + d.cn));
  const n = data.length;
  const bw = Math.min(34, plotW / n * 0.6);
  const gap = plotW / n;
  // 轴线
  ctx.strokeStyle = C.line; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
  ctx.fillStyle = C.text; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
  data.forEach((d, i) => {
    const x = padL + gap * i + (gap - bw) / 2;
    const total = d.en + d.cn;
    const hEn = total ? (d.en / max) * plotH : 0;
    const hCn = total ? (d.cn / max) * plotH : 0;
    // 英文（蓝）
    ctx.fillStyle = C.blue;
    roundRect(ctx, x, padT + plotH - hEn - hCn, bw, hEn, 5); ctx.fill();
    // 中文（粉）
    ctx.fillStyle = C.pink;
    roundRect(ctx, x, padT + plotH - hCn, bw, hCn, 5); ctx.fill();
    // 标签
    ctx.fillStyle = C.text; ctx.font = '10px sans-serif';
    ctx.fillText(d.label, x + bw / 2, padT + plotH + 14);
    // 占比
    const ratio = total ? Math.round(d.en / total * 100) : 0;
    ctx.fillStyle = '#a98';
    ctx.fillText(ratio + '%', x + bw / 2, padT + plotH - hEn - hCn - 6);
  });
  // 图例
  ctx.textAlign = 'left'; ctx.font = '10px sans-serif';
  ctx.fillStyle = C.blue; ctx.fillRect(padL, 6, 10, 10);
  ctx.fillStyle = C.text; ctx.fillText('英文', padL + 14, 15);
  ctx.fillStyle = C.pink; ctx.fillRect(padL + 60, 6, 10, 10);
  ctx.fillStyle = C.text; ctx.fillText('中文', padL + 74, 15);
}

/* 长期成长趋势折线图（累计英文占比随时间）
 * data: [{label:'07-20', ratio:60}]  ratio 为百分比
 */
function drawTrendLine(canvas, data) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  if (data.length < 2) { drawEmpty(ctx, W, H, '至少写 2 天日记才有趋势～'); return; }
  const padL = 36, padR = 16, padT = 20, padB = 36;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const max = 100, min = 0;
  const n = data.length;
  const stepX = plotW / (n - 1);
  const yOf = v => padT + plotH - ((v - min) / (max - min)) * plotH;
  // 网格
  ctx.strokeStyle = '#f0e2ea'; ctx.lineWidth = 1;
  for (let g = 0; g <= 100; g += 25) {
    const y = yOf(g);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    ctx.fillStyle = C.text; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(g + '%', padL - 6, y + 3);
  }
  // 折线
  ctx.strokeStyle = '#f29bb5'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = padL + stepX * i, y = yOf(d.ratio);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  // 点 + 标签
  ctx.fillStyle = '#fff';
  data.forEach((d, i) => {
    const x = padL + stepX * i, y = yOf(d.ratio);
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f29bb5'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.text; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(d.label, x, padT + plotH + 14);
  });
}

/* 打卡日历热力（简单方格：写过的日期填色）
 * dates: ['2026-07-20', ...]  year/month 控制范围
 */
function drawCheckinGrid(canvas, dates, year, month) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const set = new Set(dates);
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const startW = first.getDay();
  const cols = 7, cw = (W - 20) / cols, ch = 22;
  const labels = ['日', '一', '二', '三', '四', '五', '六'];
  ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
  labels.forEach((lb, i) => { ctx.fillStyle = C.text; ctx.fillText(lb, 10 + cw * i + cw / 2, 14); });
  for (let d = 1; d <= days; d++) {
    const idx = (startW + d - 1);
    const r = Math.floor(idx / cols), c = idx % cols;
    const x = 10 + cw * c, y = 22 + ch * r;
    const key = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(d).padStart(2, '0')}\`;
    ctx.fillStyle = set.has(key) ? C.green : '#f3ecef';
    roundRect(ctx, x + 2, y + 1, cw - 4, ch - 4, 5); ctx.fill();
    ctx.fillStyle = set.has(key) ? '#5b8a5f' : '#bca',
    ctx.fillStyle = set.has(key) ? '#fff' : '#c9bcc2';
    ctx.fillText(String(d), x + cw / 2, y + ch / 2 + 4);
  }
}

function drawEmpty(ctx, W, H, msg) {
  ctx.fillStyle = C.text; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(msg || '还没有数据哦，写日记后这里会开花～', W / 2, H / 2);
}
`,
  '/js/app.js': `/* =========================================================================
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
function \$(s){return document.querySelector(s);}
function \$all(s){return Array.from(document.querySelectorAll(s));}
function esc(s){return (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function toast(msg){
  const t=\$('#toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200);
}
function lock(){ // 回到书桌首页（清空当前选中日记本，仅收起应用）
  state.unlocked=false;
  setCurrentUser(null);          // 退出当前日记本，回到选择页
  \$('#app').classList.remove('show');
  \$('#desk-page').style.display='flex';
  closeAllMask();
}

/* ============================ 解锁（注册 / 登录二选一） ============================ */
\$('#btn-start').addEventListener('click', openUnlock);

function openUnlock(){
  renderWelcomeModal();
  \$('#mask-unlock').classList.add('show');
}

// 首页选择：注册 or 登录（二选一，简洁明了）
function renderWelcomeModal(){
  \$('#modal-unlock').innerHTML = \`
    <h3>📔 私密英语日记</h3>
    <p class="hint" style="margin-bottom:14px">日记存于云端，在任意设备登录同一账号都能看到全部历史记录。</p>
    <div style="display:flex;gap:10px;justify-content:center">
      <button class="btn primary" id="wu-register" style="flex:1;max-width:200px">🆕 注册新账户</button>
      <button class="btn blue" id="wu-login" style="flex:1;max-width:200px">🔑 登录已有账户</button>
    </div>
  \`;
  \$('#wu-register').onclick = () => renderRegisterModal();
  \$('#wu-login').onclick = () => renderLoginModal();
}

// ==================== 注册 ====================
function renderRegisterModal(){
  \$('#modal-unlock').innerHTML = \`
    <h3>🆕 注册新账户</h3>
    <div class="row"><label>用户名</label><input class="field" id="rg-name" placeholder="取个好记的名字，纯英文为宜" /></div>
    <div class="row"><label>密码</label><input class="field" id="rg-pwd" type="password" placeholder="至少4位" /></div>
    <div class="row"><label>确认密码</label><input class="field" id="rg-pwd2" type="password" /></div>
    <div class="row"><label>英语水平</label>
      <select class="field" id="rg-level">
        <option value="cet4">英语四级</option><option value="cet6">英语六级</option>
        <option value="ielts_basic">雅思基础</option><option value="ielts_advanced">雅思进阶</option>
      </select>
    </div>
    <button class="btn primary" id="rg-submit">注册并进入 ✨</button>
    <button class="btn ghost" id="rg-back" style="margin-top:4px">← 返回</button>
    <div id="rg-err" class="hint" style="color:#c05858;margin-top:6px"></div>
  \`;
  \$('#rg-back').onclick = () => renderWelcomeModal();
  \$('#rg-submit').onclick = async () => {
    const name = \$('#rg-name').value.trim();
    const pwd  = \$('#rg-pwd').value;
    const pwd2 = \$('#rg-pwd2').value;
    const level = \$('#rg-level').value;
    if(!name){ \$('#rg-err').textContent='请输入用户名'; return; }
    if(name.length<2||name.length>20){ \$('#rg-err').textContent='用户名需2-20个字符'; return; }
    if(pwd.length<4){ \$('#rg-err').textContent='密码至少4位'; return; }
    if(pwd!==pwd2){ \$('#rg-err').textContent='两次密码不一致'; return; }

    // 云端注册
    if(getCloudApi()){
      \$('#rg-err').textContent='';
      try{
        await cloudRegister(name, pwd, level);
      }catch(e){
        if(/已[被在]?注册|409/i.test(String(e.message))){
          \$('#rg-err').textContent='该用户名已被注册，请返回登录。';
          return;
        }
        // 云端不可达，降级本地
        if(!confirm('云端暂时连不上（'+e.message+'），要先用本地模式进入吗？日记暂时只存本机。')){
          return;
        }
      }
    }

    // 创建本地账号
    const u = { id:'u_'+Date.now()+'_'+Math.floor(Math.random()*1000),
                username:name, pwd, level, online:false, font:'', linespace:'34' };
    addUser(u); setCurrentUser(u);
    finishUnlock();
  };
  \$('#rg-pwd2').addEventListener('keydown', e=>{ if(e.key==='Enter') \$('#rg-submit').click(); });
}

// ==================== 登录 ====================
function renderLoginModal(){
  \$('#modal-unlock').innerHTML = \`
    <h3>🔑 登录已有账户</h3>
    <div class="hint" style="margin-bottom:8px">在不同浏览器登录同一账户，日记会自动同步。</div>
    <div class="row"><label>用户名</label><input class="field" id="li-name" placeholder="你的账户名" /></div>
    <div class="row"><label>密码</label><input class="field" id="li-pwd" type="password" placeholder="你的密码" /></div>
    <button class="btn primary" id="li-submit">登录并同步 ☁️</button>
    <button class="btn ghost" id="li-back" style="margin-top:4px">← 返回</button>
    <div id="li-err" class="hint" style="color:#c05858;margin-top:6px"></div>
    <div class="hint" style="margin-top:4px;font-size:12px;color:var(--ink-soft)">数据存于云端（Cloudflare KV），密码加密传输，请放心。</div>
  \`;
  \$('#li-back').onclick = () => renderWelcomeModal();
  \$('#li-submit').onclick = async () => {
    const name = \$('#li-name').value.trim();
    const pwd = \$('#li-pwd').value;
    if(!name){ \$('#li-err').textContent='请输入用户名'; return; }
    if(!pwd){ \$('#li-err').textContent='请输入密码'; return; }

    if(!getCloudApi()){
      // 无云端，尝试匹配本地账号
      const u = findUserByName(name);
      if(!u){ \$('#li-err').textContent='本地无此账号，且云端未配置。请先注册新账户。'; return; }
      if(u.pwd !== pwd){ \$('#li-err').textContent='密码错误'; return; }
      setCurrentUser(u); finishUnlock(); return;
    }

    \$('#li-err').textContent=''; toast('正在连接云端…');
    try{
      const data = await cloudLogin(name, pwd);
      // 云端登录成功：创建或更新本地账号
      let u = findUserByName(name);
      if(!u){
        u = { id:'u_'+Date.now()+'_'+Math.floor(Math.random()*1000),
              username:name, pwd, level:data.user.level||'cet4',
              online:false, font:'', linespace:'34' };
        addUser(u);
      }
      setCurrentUser(u);
      toast('登录成功，正在同步日记…');
      await syncFromCloud();
      finishUnlock();
      toast('同步完成！日记已从云端拉取 ☁️');
    }catch(e){
      \$('#li-err').textContent='登录失败：'+(e.message||'请检查网络和 API 地址');
    }
  };
  \$('#li-pwd').addEventListener('keydown', e=>{ if(e.key==='Enter') \$('#li-submit').click(); });
}

function finishUnlock(){
  state.unlocked=true;
  state.level=getLevel();
  state.online=getOnline();
  \$('#mask-unlock').classList.remove('show');
  \$('#desk-page').style.display='none';
  \$('#app').classList.add('show');
  // 同步设置页控件
  \$('#set-username').value=getUser()||'';
  \$('#set-level').value=state.level;
  \$('#set-online').checked=state.online;
  \$('#set-proxy').value=getYoudaoProxy(); state.proxy=getYoudaoProxy();
  // 代理地址实时保存
  \$('#set-proxy').addEventListener('input', e => {
    const v = e.target.value.trim();
    setYoudaoProxy(v);
    state.proxy = v;
    if (v) toast('有道代理已保存，下一次输入中文即生效');
  });
  // API 服务器地址（云端同步）
  \$('#set-api').value=getCloudApi();
  \$('#set-api').addEventListener('input', e => setCloudApi(e.target.value.trim()));
  \$('#set-font').value=getFont();
  \$('#set-linespace').value=getLineSpace()||'1.6';
  applyEditorPref();
  resetWritePage();
  const badge = (getCloudApi() && getToken()) ? ' ☁️已同步' : '';
  toast('欢迎回来，'+ (getUser()||'') +' 🌸'+badge);
}

/* ============================ 导航切换 ============================ */
\$all('.nav-btn').forEach(b=>b.addEventListener('click',()=>{
  \$all('.nav-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  const p=b.dataset.page;
  \$all('.page').forEach(pg=>pg.classList.remove('show'));
  \$('#page-'+p).classList.add('show');
  if(p==='history') renderHistory();
  if(p==='report') renderReport();
  if(p==='settings') {/* 已同步 */}
}));
\$('#btn-lock').addEventListener('click',()=>{ lock(); toast('已上锁，日记安全收好 🔒'); });

/* ============================ 写作页：天气/心情/贴纸 ============================ */
function renderChips(){
  const wc=\$('#weather-chips'); wc.innerHTML='';
  WEATHERS.forEach(([e,n])=>{
    const c=document.createElement('div');c.className='chip';c.innerHTML=\`<span class="emo">\${e}</span>\${n}\`;
    c.onclick=()=>{state.weather=n;\$all('#weather-chips .chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');};
    wc.appendChild(c);
  });
  const mc=\$('#mood-chips'); mc.innerHTML='';
  MOODS.forEach(([e,n])=>{
    const c=document.createElement('div');c.className='chip';c.innerHTML=\`<span class="emo">\${e}</span>\${n}\`;
    c.onclick=()=>{state.mood=n;\$all('#mood-chips .chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');};
    mc.appendChild(c);
  });
  const sb=\$('#sticker-bar'); sb.innerHTML='';
  STICKERS.forEach(s=>{
    const d=document.createElement('div');d.className='sticker';d.textContent=s;
    d.onclick=()=>insertAtCursor(s);
    sb.appendChild(d);
  });
}

// 替换光标前最近的中文片段（点击英文建议时使用：拿英文替中文）
function replaceTrailingCn(newText){
  const ed = \$('#editor');
  const caret = ed.selectionStart;
  const before = ed.value.slice(0, caret);
  // 与 extractCn 保持同一套正则：中文 + 常见中文标点 的连续片段
  const m = before.match(/[\\u4e00-\\u9fa5，。！？、；：,.!?]+\$/);
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
  const ed=\$('#editor');
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
\$('#editor').addEventListener('input', e=>{ if(e.isComposing) return; onEditorInput(); });
\$('#editor').addEventListener('compositionend', ()=> onEditorInput()); // 中文输入法确认后再次触发

// 从当前行提取中文查询串
function extractCn(line){
  if(!line) return '';
  // 只匹配末尾的中文汉字 + 中文标点，不含英文标点（避免打句号/问号/逗号也弹提示）
  const m = line.match(/[\\u4e00-\\u9fa5，。！？、；：]+\$/);
  if (m) return m[0];
  if (/[\\u4e00-\\u9fa5]/.test(line)) return line;
  return '';
}

function onEditorInput(){
  const ed=\$('#editor');
  const line=ed.value.slice(0, ed.selectionStart).split('\\n').pop(); // 当前行（到光标）
  const query=extractCn(line);
  if(!query){ \$('#suggest-pop').classList.remove('show'); return; }
  const token=++suggestToken;
  // 未配置代理：直接给引导提示，不静默
  if(!state.proxy){
    renderSuggest([], query, '尚未配置有道翻译代理。请到「设置 → 有道翻译代理」填入你的 Cloudflare Workers 地址（部署步骤见 README），即可联网翻译中文。');
    return;
  }
  \$('#suggest-mode').textContent = '有道翻译中…';
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
  const pop=\$('#suggest-pop'), box=\$('#suggest-list');
  box.innerHTML='';
  // 仅提示、无匹配项
  if(tip && (!list || !list.length)){
    box.innerHTML = \`<div class="suggest-tip">💡 \${esc(tip)}</div>\`;
    pop.classList.add('show');
    return;
  }
  if(!list || !list.length){ pop.classList.remove('show'); return; }
  list.slice(0,8).forEach(it=>{
    const div=document.createElement('div');div.className='suggest-item';
    const tagCls = it.from==='online' ? 'tag online':'tag';
    div.innerHTML=\`<span class="\${tagCls}">\${it.label}</span><span class="en">\${esc(it.text)}</span><div class="cn">\${esc(it.cn||query)}</div>\`;
    div.onclick=()=>{ replaceTrailingCn(it.text); \$('#suggest-pop').classList.remove('show'); };
    box.appendChild(div);
  });
  pop.classList.add('show');
}

/* ============================ 语法检测 ============================ */
\$('#btn-grammar').addEventListener('click', async ()=>{
  const text=\$('#editor').value.trim();
  if(!text){toast('先写点什么再检测吧');return;}
  toast('正在检测语法…');
  const {issues,mode}=await checkGrammar(text, state.online);
  state.lastGrammar={issues,text};
  const box=\$('#grammar-result');
  if(!issues.length){
    box.innerHTML=\`<div class="hint">🎉 没有发现明显问题，写得很棒！（\${mode==='online'?'联网精准检测':'离线基础检测'}）</div>\`;
  }else{
    box.innerHTML=\`<ul class="grammar-list">\`+issues.map(it=>{
      const old=it.original?\`<span class="old">\${esc(it.original)}</span>\`:'';
      const neu=it.suggestion?\`→ <span class="new">\${esc(it.suggestion)}</span>\`:'';
      return \`<li><div class="msg">\${esc(it.message)}</div><div>\${old} \${neu}</div></li>\`;
    }).join('')+\`</ul><div class="hint">检测模式：\${mode==='online'?'联网精准':'离线基础'}（共 \${issues.length} 处）</div>\`;
  }
  \$('#mask-grammar').classList.add('show');
});
\$('#btn-grammar-close').addEventListener('click',()=>\$('#mask-grammar').classList.remove('show'));
\$('#btn-fix-all').addEventListener('click',()=>{
  if(!state.lastGrammar) return;
  const fixed=applyFixes(state.lastGrammar.text, state.lastGrammar.issues);
  \$('#editor').value=fixed;
  \$('#mask-grammar').classList.remove('show');
  toast('已一键修正全文 ✨');
});

/* ============================ 保存日记 + 统计 ============================ */
// 拆分统计：自主英文 / AI 辅助英文 / 中文 句子数
function analyzeContent(text){
  const segs=text.split(/[\\n.!?。！？]+/).map(s=>s.trim()).filter(Boolean);
  let en=0,cn=0;
  segs.forEach(s=>{
    const hasCn=/[\\u4e00-\\u9fa5]/.test(s);
    const hasEn=/[a-zA-Z]/.test(s);
    if(hasEn) en++;
    else if(hasCn) cn++;
  });
  const enAi=Math.min(state.aiInserts, en);
  return { enSelf:Math.max(0,en-enAi), enAi, cn, words:text.replace(/\\s/g,'').length };
}

\$('#btn-save').addEventListener('click',()=>{
  const content=\$('#editor').value.trim();
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
  (text.match(/#[\\u4e00-\\u9fa5\\w]+/g)||[]).forEach(t=>set.add(t.slice(1)));
  return Array.from(set);
}

function resetWritePage(){
  \$('#editor').value='';
  state.aiInserts=0; state.weather=''; state.mood='';
  \$all('#weather-chips .chip,#mood-chips .chip').forEach(x=>x.classList.remove('active'));
  \$('#suggest-pop').classList.remove('show');
  \$('#write-tip').textContent='';
}

/* ============================ 历史页 ============================ */
function renderHistory(){
  renderCalendar();
  renderTagFilter();
  renderDiaryList();
}
function renderCalendar(){
  const y=state.calYear,m=state.calMonth;
  \$('#cal-title').textContent=\`\${y} 年 \${m+1} 月\`;
  const grid=\$('#cal-grid');grid.innerHTML='';
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  for(let i=0;i<first;i++){const e=document.createElement('div');e.className='cal-cell empty';grid.appendChild(e);}
  const grouped=groupByDate(getDiaries());
  for(let d=1;d<=days;d++){
    const key=\`\${y}-\${String(m+1).padStart(2,'0')}-\${String(d).padStart(2,'0')}\`;
    const e=document.createElement('div');e.className='cal-cell';e.textContent=d;
    if(grouped[key]){e.classList.add('has');e.title=key+' 有 '+grouped[key].length+' 篇日记';
      e.onclick=()=>{ state.tagFilter=''; \$('#tag-filter').value=''; renderDiaryList(grouped[key]); };}
    grid.appendChild(e);
  }
}
\$('#cal-prev').onclick=()=>{state.calMonth--;if(state.calMonth<0){state.calMonth=11;state.calYear--;}renderCalendar();};
\$('#cal-next').onclick=()=>{state.calMonth++;if(state.calMonth>11){state.calMonth=0;state.calYear++;}renderCalendar();};

function renderTagFilter(){
  const sel=\$('#tag-filter');
  const allTags=new Set();getDiaries().forEach(d=>(d.tags||[]).forEach(t=>allTags.add(t)));
  sel.innerHTML='<option value="">全部标签</option>'+Array.from(allTags).map(t=>\`<option value="\${esc(t)}">#\${esc(t)}</option>\`).join('');
  sel.value=state.tagFilter;
}
\$('#tag-filter').addEventListener('change',e=>{state.tagFilter=e.target.value;renderDiaryList();});

function renderDiaryList(list){
  const box=\$('#diary-list');
  let diaries=list||getDiaries().slice().sort((a,b)=>b.ts-a.ts);
  if(state.tagFilter) diaries=diaries.filter(d=>(d.tags||[]).includes(state.tagFilter));
  if(!diaries.length){box.innerHTML='<div class="hint">还没有日记，去写作页写第一篇吧 ✍️</div>';return;}
  box.innerHTML=diaries.map(d=>\`
    <div class="card diary-item" data-id="\${d.id}">
      <h4>\${d.date}\${d.weather?' · '+iconOf(d.weather,WEATHERS)+' '+d.weather:''}\${d.mood?' · '+iconOf(d.mood,MOODS)+' '+d.mood:''}</h4>
      <div class="diary-meta">
        <span>英文 \${d.stat.enSelf} 句</span><span>AI \${d.stat.enAi}</span><span>中文 \${d.stat.cn}</span><span>\${d.stat.words} 字</span>
        \${(d.tags||[]).map(t=>\`<span class="tag">#\${esc(t)}</span>\`).join('')}
      </div>
      <div class="diary-body">\${esc(d.content)}</div>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn sm" data-act="view">查看/编辑</button>
        <button class="btn sm blue" data-act="txt">导出TXT</button>
        <button class="btn sm green" data-act="pdf">导出PDF</button>
        <button class="btn sm danger" data-act="del">删除</button>
      </div>
    </div>\`).join('');
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
  \$('#modal-view').innerHTML=\`
    <h3>\${d.date} 的日记</h3>
    <div class="diary-meta">\${d.weather?iconOf(d.weather,WEATHERS)+d.weather:''} \${d.mood?iconOf(d.mood,MOODS)+d.mood:''} · 英文\${d.stat.enSelf}/AI\${d.stat.enAi}/中文\${d.stat.cn}</div>
    <textarea class="field" id="view-editor" style="width:100%;min-height:220px">\${esc(d.content)}</textarea>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="btn green" id="view-save">保存修改</button>
      <button class="btn blue" id="view-txt">导出TXT</button>
      <button class="btn ghost" id="view-close">关闭</button>
    </div>\`;
  \$('#mask-view').classList.add('show');
  \$('#view-save').onclick=()=>{
    d.content=\$('#view-editor').value;
    d.tags=parseTags(d.content);
    d.stat=analyzeContentRedo(d);
    upsertDiary(d);
    \$('#mask-view').classList.remove('show');renderHistory();toast('已更新');
  };
  \$('#view-txt').onclick=()=>exportTXT(d);
  \$('#view-close').onclick=()=>\$('#mask-view').classList.remove('show');
}
// 编辑后重算统计（复用 state.aiInserts 不可靠，这里以 AI=0 近似，保留原 enAi）
function analyzeContentRedo(d){
  const s=analyzeContent(d.content);
  s.enAi=Math.min(d.aiAssist||0,s.enSelf+s.enAi);
  return s;
}

\$('#btn-export-all').addEventListener('click',()=>{
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
  \$('#report-stats').innerHTML=\`
    <div class="stat-box"><div class="num">\${list.length}</div><div class="lab">累计日记</div></div>
    <div class="stat-box"><div class="num">\${streak}</div><div class="lab">连续打卡(天)</div></div>
    <div class="stat-box"><div class="num">\${total}</div><div class="lab">累计字数</div></div>
    <div class="stat-box"><div class="num">\${aiTotal}</div><div class="lab">AI 辅助句</div></div>\`;
  // 近 14 天占比
  const days14=[];const grouped=groupByDate(list);
  for(let i=13;i>=0;i--){
    const dt=new Date();dt.setDate(dt.getDate()-i);
    const key=ymd(dt);const arr=grouped[key]||[];
    let en=0,cn=0;arr.forEach(d=>{en+=d.stat.enSelf+d.stat.enAi;cn+=d.stat.cn;});
    days14.push({label:\`\${dt.getMonth()+1}-\${dt.getDate()}\`,en,cn});
  }
  drawEnRatioBar(\$('#chart-ratio'),days14);
  // 成长趋势（有日记的日期，按时间序，累计英文占比）
  const byDay=Object.keys(grouped).sort();
  const trend=byDay.map(k=>{
    let en=0,cn=0;grouped[k].forEach(d=>{en+=d.stat.enSelf+d.stat.enAi;cn+=d.stat.cn;});
    const dt=new Date(k);
    return {label:\`\${dt.getMonth()+1}-\${dt.getDate()}\`,ratio:en+cn?Math.round(en/(en+cn)*100):0};
  });
  drawTrendLine(\$('#chart-trend'),trend.slice(-30));
  // 本月打卡
  const diaryDates=list.map(d=>d.date);
  drawCheckinGrid(\$('#chart-checkin'),diaryDates,state.calYear,new Date().getMonth());
}

/* ============================ 设置页 ============================ */
\$('#btn-save-settings').addEventListener('click',()=>{
  const name=\$('#set-username').value.trim();
  const lvl=\$('#set-level').value;
  const np=\$('#set-pwd-new').value, nc=\$('#set-pwd-confirm').value;
  if(!name){toast('名字不能为空');return;}
  setUser(name);setLevel(lvl);state.level=lvl;
  setYoudaoProxy(\$('#set-proxy').value.trim()); state.proxy=getYoudaoProxy();
  if(np){
    if(np.length<4){toast('新密码至少 4 位');return;}
    if(np!==nc){toast('两次密码不一致');return;}
    setPwd(np);toast('密码已更新');
  }
  \$('#set-pwd-new').value='';\$('#set-pwd-confirm').value='';
  applyEditorPref();
  toast('设置已保存 ✅');
});
\$('#set-online').addEventListener('change',e=>{
  state.online=e.target.checked;setOnline(state.online);
  toast(state.online?'已开启联网增强（仅上传单句中文）':'已关闭，回到离线模式');
});
\$('#set-font').addEventListener('change',e=>{setFont(e.target.value);applyEditorPref();});
\$('#set-linespace').addEventListener('change',e=>{setLineSpace(e.target.value);applyEditorPref();});
function applyEditorPref(){
  const ed=\$('#editor');
  ed.style.fontFamily=getFont()||'inherit';
  const row=getLineSpace()||'34';            // 行距同时驱动“横线纸网格高度”
  ed.style.setProperty('--row', row+'px');
  ed.style.lineHeight=row+'px';
}
\$('#btn-clear').addEventListener('click',()=>{
  if(confirm('确定清空【本日记本】的全部日记与设置？（账号保留，可重新记录）')){
    clearCurrentBook();
    \$('#set-username').value=getUser(); \$('#set-level').value=getLevel();
    \$('#set-online').checked=getOnline(); \$('#set-font').value=getFont();
    \$('#set-linespace').value=getLineSpace(); applyEditorPref();
    toast('本日记本已清空 🧹');
  }
});
\$('#btn-del-book').addEventListener('click',()=>{
  if(confirm('彻底删除本日记本（含账号与全部日记）？此操作不可恢复！')){
    deleteCurrentBook(); lock(); toast('日记本已删除');
  }
});

/* ============================ 导出：TXT / PDF ============================ */
function diaryToText(d){
  return \`【\${d.date}】\${d.weather?' 天气:'+iconOf(d.weather,WEATHERS)+d.weather:''}\${d.mood?' 心情:'+iconOf(d.mood,MOODS)+d.mood:''}\\n\`
    + \`标签: \${(d.tags||[]).map(t=>'#'+t).join(' ') || '无'}\\n\`
    + \`统计: 英文\${d.stat.enSelf}句 / AI辅助\${d.stat.enAi}句 / 中文\${d.stat.cn}句 / \${d.stat.words}字\\n\`
    + \`--------------------------------\\n\${d.content}\\n\\n\`;
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
  root.innerHTML=\`<div class="print-area" style="padding:24px;font-family:serif;color:#333">\`
    +\`<h2 style="text-align:center">\${esc(getUser()||'我的英语日记')}</h2>\`
    +arr.map(d=>\`<div class="print-area" style="margin-bottom:24px;border-bottom:1px dashed #ccc;padding-bottom:12px">
        <h3>\${d.date} \${d.weather?iconOf(d.weather,WEATHERS)+' '+d.weather:''} \${d.mood?iconOf(d.mood,MOODS)+' '+d.mood:''}</h3>
        <div style="font-size:13px;color:#888">\${(d.tags||[]).map(t=>'#'+t).join(' ')}</div>
        <p style="white-space:pre-wrap;line-height:1.8">\${esc(d.content)}</p></div>\`).join('')
    +\`</div>\`;
  setTimeout(()=>{window.print();},50);
  toast('已唤起打印，请选择“另存为 PDF”保存到本地');
}

/* ============================ 通用遮罩关闭 ============================ */
function closeAllMask(){\$all('.mask').forEach(m=>m.classList.remove('show'));}
\$all('.mask').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show');}));

/* ============================ 初始化 ============================ */
renderChips();
// 默认锁定：书桌首页可见，应用隐藏（刷新/关闭后自动回到此状态）
\$('#app').classList.remove('show');
\$('#desk-page').style.display='flex';
`
};

const MIME = {"/":"text/html; charset=utf-8","/css/style.css":"text/css; charset=utf-8","/js/data.js":"application/javascript; charset=utf-8","/js/storage.js":"application/javascript; charset=utf-8","/js/translate.js":"application/javascript; charset=utf-8","/js/charts.js":"application/javascript; charset=utf-8","/js/app.js":"application/javascript; charset=utf-8"};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    // -- API --
    if (path.startsWith('/api/')) {
      try {
        if (path === '/api/register' && request.method === 'POST') return await handleRegister(await request.json(), env);
        if (path === '/api/login' && request.method === 'POST') return await handleLogin(await request.json(), env);
        const user = await auth(request, env);
        if (!user) return json({ error: '未登录或登录已过期，请重新登录' }, 401);
        if (path === '/api/diaries') {
          if (request.method === 'GET') return await handleGetDiaries(user, env);
          if (request.method === 'POST') return await handleSaveDiary(user, await request.json(), env);
        }
        if (path.startsWith('/api/diaries/') && request.method === 'DELETE') return await handleDeleteDiary(user, path.split('/').pop(), env);
        if (path === '/api/settings') {
          if (request.method === 'GET') return await handleGetSettings(user, env);
          if (request.method === 'POST') return await handleSaveSettings(user, await request.json(), env);
        }
        return json({ error: 'not found' }, 404);
      } catch(e) { return json({ error: String(e) }, 500); }
    }

    // -- Static --
    const file = STATIC[path];
    if (file) {
      return new Response(file, { headers: { ...CORS, 'Content-Type': MIME[path] || 'text/html; charset=utf-8' } });
    }
    return new Response(STATIC['/'], { headers: { ...CORS, 'Content-Type': 'text/html; charset=utf-8' } });
  },
};

async function makeToken(username, env) {
  const p = btoa(JSON.stringify({ username, exp: Date.now() + 30*24*3600*1000 }));
  return p + '.' + await hmacSha256(p, env.SECRET || 'diary-secret');
}
async function auth(request, env) {
  const h = (request.headers.get('Authorization')||'').replace(/^Bearer\s+/i, '');
  if(!h) return null;
  const i = h.lastIndexOf('.'); if(i<0) return null;
  const p = h.slice(0,i), s = h.slice(i+1);
  if(s !== await hmacSha256(p, env.SECRET||'diary-secret')) return null;
  try { const d = JSON.parse(atob(p)); if(d.exp < Date.now()) return null; return d.username; } catch{}
  return null;
}
async function hmacSha256(data, secret) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  const s = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(s)));
}
async function handleRegister(body, env) {
  const { username, password, level } = body || {};
  if(!username||!password) return json({error:'用户名和密码不能为空'},400);
  if(username.length<2||username.length>20) return json({error:'用户名需2-20个字符'},400);
  if(password.length<4) return json({error:'密码至少4位'},400);
  if(await env.DIARY_KV.get(`user:${username}`)) return json({error:'该用户名已被注册，请直接登录'},409);
  const salt = crypto.randomUUID();
  const h = await sha256(password+salt);
  await env.DIARY_KV.put(`user:${username}`, JSON.stringify({username,passwordHash:h,salt,level:level||'cet4',createdAt:Date.now()}));
  return json({token:await makeToken(username,env),user:{username,level:level||'cet4'}});
}
async function handleLogin(body, env) {
  const { username, password } = body||{};
  if(!username||!password) return json({error:'用户名和密码不能为空'},400);
  const r = await env.DIARY_KV.get(`user:${username}`);
  if(!r) return json({error:'用户不存在，请先注册'},401);
  const u = JSON.parse(r);
  if(await sha256(password+u.salt)!==u.passwordHash) return json({error:'密码错误'},401);
  return json({token:await makeToken(username,env),user:{username,level:u.level}});
}
async function handleGetDiaries(username, env) {
  const r = await env.DIARY_KV.get(`diary:${username}`);
  return json({diaries:r?JSON.parse(r):[]});
}
async function handleSaveDiary(username, body, env) {
  const d = body&&body.diary; if(!d||!d.id) return json({error:'缺少日记数据'},400);
  const r = await env.DIARY_KV.get(`diary:${username}`);
  const a = r?JSON.parse(r):[];
  const i = a.findIndex(x=>x.id===d.id); if(i>=0) a[i]=d; else a.unshift(d);
  await env.DIARY_KV.put(`diary:${username}`, JSON.stringify(a));
  return json({ok:true});
}
async function handleDeleteDiary(username, id, env) {
  const r = await env.DIARY_KV.get(`diary:${username}`);
  let a = r?JSON.parse(r):[];
  a = a.filter(x=>x.id!==id);
  await env.DIARY_KV.put(`diary:${username}`, JSON.stringify(a));
  return json({ok:true});
}
async function handleGetSettings(username, env) {
  const r = await env.DIARY_KV.get(`settings:${username}`);
  return json({settings:r?JSON.parse(r):{}});
}
async function handleSaveSettings(username, body, env) {
  const {key,value}=body||{}; if(!key) return json({error:'缺少key'},400);
  const r = await env.DIARY_KV.get(`settings:${username}`);
  const s = r?JSON.parse(r):{}; s[key]=value;
  await env.DIARY_KV.put(`settings:${username}`, JSON.stringify(s));
  return json({ok:true});
}
async function sha256(str) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
}
function json(obj, status) {
  status = status || 200;
  return new Response(JSON.stringify(obj), {status, headers:{...CORS,'Content-Type':'application/json; charset=utf-8'}});
}
