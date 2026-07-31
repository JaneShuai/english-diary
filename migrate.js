// ============================================
// 日记搬家脚本：把本地浏览器的旧日记推到云端
// 使用方式：
//   1. 双击本地 index.html 打开旧日记版本
//   2. F12 → Console → 粘贴本文件全部内容 → 回车
//   3. 看到 "搬家完成" 就说明做好了
// ============================================

(async function(){
  const API = 'https://english-diary.pages.dev';
  const USERNAME = prompt('要搬到哪个云端账号？', 'SJ');
  const PASSWORD = prompt('密码');
  if(!USERNAME || !PASSWORD) return console.log('已取消');

  // 1. 登录云端
  console.log('登录中…');
  let token;
  try {
    const r = await fetch(API + '/api/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({username:USERNAME,password:PASSWORD})
    });
    const d = await r.json();
    if(!r.ok) throw new Error(d.error);
    token = d.token;
  }catch(e){ return console.error('登录失败:',e.message); }
  console.log('登录成功');

  // 2. 读取本地所有日记
  const allKeys = [];
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(k && k.startsWith('diary_d_')) allKeys.push(k);
  }
  if(!allKeys.length) return console.log('本地没有日记数据');
  console.log('找到', allKeys.length, '个账号的日记');

  let total = 0;
  for(const key of allKeys){
    try {
      const raw = localStorage.getItem(key);
      const diaries = JSON.parse(raw);
      if(!Array.isArray(diaries)) continue;
      console.log('正在搬运', diaries.length, '篇日记…');
      for(const diary of diaries){
        await fetch(API + '/api/diaries', {
          method:'POST',
          headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},
          body:JSON.stringify({diary})
        });
        total++;
      }
    }catch(e){ console.warn('跳过',key,e.message); }
  }
  console.log('🎉 搬家完成！共同步', total, '篇日记到云端账号', USERNAME);
  console.log('现在打开 https://english-diary.pages.dev 登录即可看到');
})();