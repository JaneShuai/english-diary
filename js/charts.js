/* =========================================================================
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
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
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
