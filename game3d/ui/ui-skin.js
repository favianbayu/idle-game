/* Lonceng Pulang · lapisan UI (guide desain-sma/guide/06-ui.md)
 * Dimuat setelah script game. Tidak mengubah logika game: hanya menata ulang elemen yang sudah ada
 * (#area, #jam, #money, #menu, #prompt, #toast, #status, #jurnal, #hatiEv, #shop, #kado, ...),
 * menambah menu utama, bar tombol cepat, panel Pengaturan, dan jurnal model buku + animasi. */
(() => {
  const BASE = (document.currentScript && document.currentScript.src.replace(/[^/]*$/, '')) || 'ui/';
  const U = f => BASE + f;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, attrs = {}, html = '') => { const e = document.createElement(tag); Object.assign(e, attrs); if (html) e.innerHTML = html; return e; };
  const ikon = (n, s = 22) => `<img class="ui-px" src="${U('ikon/' + n + '.png')}" style="width:${s}px;height:${s}px" alt="">`;

  /* ---------- font ---------- */
  document.head.appendChild(el('link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@500;600;700&family=Nunito:wght@600;700;800&family=Patrick+Hand&display=swap' }));

  /* ---------- CSS ---------- */
  const css = `
:root{--k:#fbf3e0;--k2:#f1e3c2;--k3:#e4d0a6;--t:#2a1d17;--t2:#5b4636;--pd:#8a7462;--kn:#f5c431;--mr:#d0473a;--hj:#4f9a52;--br:#3b7dbf;--pk:#e0588f;
  --fj:"Pixelify Sans",monospace;--ft:"Nunito","Trebuchet MS",system-ui,sans-serif;--fa:"Nunito","Trebuchet MS",system-ui,sans-serif;--tl:"Patrick Hand","Nunito",sans-serif;
  --panel:var(--k) url(${U('kertas.png')}) 0 0/256px;}
.ui-px{image-rendering:pixelated;vertical-align:middle}
html body button{font:600 14px var(--fj)!important;color:var(--t)!important;background:var(--k)!important;border:3px solid var(--t)!important;border-radius:8px!important;box-shadow:0 3px 0 var(--t);padding:5px 10px}
html body button.on{background:var(--kn)!important}
html body button:active{transform:translateY(2px);box-shadow:0 1px 0 var(--t)}
.ui-panel{background:var(--panel);color:var(--t);border:3px solid var(--t);border-radius:10px;box-shadow:0 4px 0 var(--t)}
.ui-kunci{display:inline-block;min-width:20px;padding:0 5px;font:600 11px var(--fj);text-align:center;background:#fff;border:2px solid var(--t);border-radius:4px;color:var(--t)}

/* HUD kiri atas */
html body #area{top:max(12px,env(safe-area-inset-top))!important;left:14px!important;background:var(--panel)!important;color:var(--t)!important;font:700 19px var(--fj)!important;
  border:3px solid var(--t);border-radius:10px 10px 0 0;box-shadow:none;padding:7px 14px 4px!important;text-shadow:none!important;min-width:250px}
html body #jam{top:calc(max(12px,env(safe-area-inset-top)) + 38px)!important;left:14px!important;background:var(--panel)!important;color:var(--t2)!important;
  font:800 13px var(--fa)!important;border:3px solid var(--t);border-top:0;border-radius:0 0 10px 10px;box-shadow:0 4px 0 var(--t);padding:0 14px 6px!important;min-width:250px;text-shadow:none!important}
html body #jam i{color:var(--mr)!important;font-style:normal}
html body #money{top:calc(max(12px,env(safe-area-inset-top)) + 72px)!important;left:14px!important;background:var(--panel)!important;color:var(--t)!important;font:800 15px var(--fa)!important;
  border:3px solid var(--t);border-radius:8px;box-shadow:0 3px 0 var(--t);padding:3px 10px!important;text-shadow:none!important}
html body #mapWrap{border:4px solid var(--t)!important;box-shadow:0 4px 0 var(--t)}
html body #fps{opacity:.45}
html body #help{display:none}
html body.ui-bantuan #help{display:block;background:rgba(42,29,23,.78);border-radius:8px;padding:6px 10px;font:700 12px var(--ft);bottom:86px!important;color:var(--k);text-shadow:none}
html body #prompt{background:var(--panel)!important;color:var(--t)!important;font:800 17px var(--ft)!important;border:3px solid var(--t)!important;border-radius:10px!important;box-shadow:0 4px 0 var(--t);padding:7px 16px!important}
html body #toast{background:rgba(42,29,23,.88)!important;color:var(--k)!important;font:800 15px var(--ft)!important;border:2px solid rgba(0,0,0,.6);border-radius:8px!important;text-shadow:none!important}
html body .bubble{font-family:var(--ft);font-weight:700}

/* menu lama disembunyikan, diganti bar + pengaturan */
html body #menu{display:none!important}
#uiBar{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));display:flex;gap:8px;z-index:9}
#uiBar button{width:62px;height:62px;padding:2px 0 0!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;font-size:11px!important}
#uiBar button.utama{background:var(--kn)!important}
#uiBar .ui-kunci{font-size:9px;padding:0 3px;border-width:1px}
body.touch #uiBar{top:calc(max(12px,env(safe-area-inset-top)) + 150px);bottom:auto;flex-direction:column}
body.touch #uiBar .ui-kunci{display:none}
@media (orientation:landscape){body.touch #uiBar{top:max(10px,env(safe-area-inset-top));flex-direction:row;gap:6px}body.touch #uiBar button{width:54px;height:54px;font-size:10px!important}}
body.touch #fpad button,body.touch #pad button{font-size:12px!important;letter-spacing:-.02em;overflow:hidden}

/* panel pengaturan & menu utama */
.ui-layar{position:fixed;inset:0;z-index:60;display:none}
.ui-layar.on{display:block}
.ui-redup{position:absolute;inset:0;background:rgba(20,14,12,.55)}
#uiSet .ui-panel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,520px);padding:18px 22px}
#uiSet h2{margin:0 0 4px;font:700 26px var(--fj)}
#uiSet .sub{font:700 13px var(--ft);color:var(--pd);margin-bottom:12px}
#uiSet .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#uiSet .grid button{text-align:left}
#uiSet .aksi{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}
#uiTitle{z-index:70;background:linear-gradient(180deg,rgba(255,160,80,.55),rgba(120,60,90,.5) 55%,rgba(20,15,30,.85));backdrop-filter:blur(5px)}
body.ui-judul .hud,body.ui-judul #uiBar,body.ui-judul #jam,body.ui-judul #money,body.ui-judul #bubbles,body.ui-judul #pad,body.ui-judul #camPad,body.ui-judul #fpad{visibility:hidden}
#uiTitle .logo{position:absolute;left:6vw;top:7vh;display:flex;align-items:flex-start;gap:12px}
#uiTitle .logo img{height:min(17vh,130px)}
#uiTitle h1{margin:6px 0 0;font:700 clamp(44px,8vh,92px)/.9 var(--fj);color:var(--kn);
  text-shadow:4px 0 0 var(--t),-4px 0 0 var(--t),0 4px 0 var(--t),0 -4px 0 var(--t),4px 4px 0 var(--t),-4px 4px 0 var(--t),4px -4px 0 var(--t),-4px -4px 0 var(--t),0 10px 0 var(--t)}
#uiTitle h1 span{color:var(--k)}
#uiTitle p{margin:14px 0 0 4px;font:800 clamp(14px,2.4vh,20px) var(--ft);color:var(--k);text-shadow:0 2px 0 var(--t)}
#uiTitle .daftar{position:absolute;left:6vw;top:max(46vh,300px);display:flex;flex-direction:column;gap:12px;width:min(380px,80vw)}
#uiTitle .daftar button{font-size:22px!important;padding:9px 20px!important;text-align:left;display:flex;justify-content:space-between;align-items:center}
#uiTitle .daftar button small{font:800 12px var(--fa);opacity:.75}
#uiTitle .daftar button.utama{background:var(--kn)!important}
#uiTitle .raka{position:absolute;right:3vw;bottom:-36vh;height:125vh;image-rendering:pixelated;filter:drop-shadow(6px 0 0 rgba(0,0,0,.35));pointer-events:none}
#uiTitle .kaki{position:absolute;left:6vw;bottom:18px;color:var(--k);font:700 12px var(--ft);opacity:.8}
@media (max-aspect-ratio:1/1){#uiTitle .raka{opacity:.35;right:-20vw}}

/* panel game lain jadi kertas */
html body #status,html body #shop,html body #kado,html body #hatiEv,html body #hatiEv2,html body #bigmap .bm-info{background:var(--panel)!important;color:var(--t)!important;border:3px solid var(--t)!important;border-radius:10px!important;box-shadow:0 4px 0 var(--t)!important;font-family:var(--ft)!important}
html body #hatiEv,html body #hatiEv2{background:#fff0f5!important}
html body #hatiEv b,html body #hatiEv2 b{color:var(--pk)!important;font-family:var(--ft)}
html body #status h3,html body #shop h3,html body #kado h3{font:700 22px var(--fj)!important}

/* ---------- jurnal model buku (1000 x 669, diskalakan) ---------- */
html body #jurnal{width:1000px!important;height:669px!important;max-height:none!important;overflow:visible!important;padding:0!important;border:0!important;border-radius:0!important;
  box-shadow:none!important;background:url(${U('buku_terbuka.png')}) 0 0/100% 100% no-repeat!important;image-rendering:pixelated;
  transform:translate(-50%,-50%) scale(var(--ui-s,1))!important;filter:drop-shadow(0 8px 0 rgba(0,0,0,.45));font:20px/34.4px var(--tl)!important;color:#2b2a4a!important;perspective:2400px}
#jurnal>h3{display:none}
#jurnal>.x{position:absolute!important;right:-6px;top:-8px;float:none!important;z-index:5;width:auto!important;height:auto!important;background:var(--kn)!important}
#jurnal>.tabs{position:absolute;left:150px;top:-36px;display:flex!important;gap:6px!important;margin:0!important;z-index:-1}
#jurnal>.tabs button{width:140px;height:50px;border:0!important;box-shadow:none!important;border-radius:0!important;padding:7px 0 0!important;font:800 15px var(--ft)!important;color:#fff!important;
  background:url(${U('pembatas/kuning_atas.png')}) 0 0/100% 100% no-repeat!important;image-rendering:pixelated;transition:transform .15s;vertical-align:top}
#jurnal>.tabs button:nth-child(1){color:var(--t)!important}
#jurnal>.tabs button:nth-child(2){background-image:url(${U('pembatas/hijau_atas.png')})!important}
#jurnal>.tabs button:nth-child(3){background-image:url(${U('pembatas/pink_atas.png')})!important}
#jurnal>.tabs button:nth-child(4){background-image:url(${U('pembatas/biru_atas.png')})!important}
#jurnal>.tabs button.on{transform:translateY(-10px)}
#jurnal .ui-alir{position:absolute;left:112px;top:62px;width:812px;height:520px;column-width:356px;column-gap:100px;column-fill:auto;overflow:hidden;z-index:1}
#jurnal .ui-alir *{line-height:34.4px}
#jurnal h4{margin:0!important;border:0!important;font:700 20px var(--fj)!important;color:var(--t)!important;break-after:avoid}
#jurnal ul{list-style:none;margin:0!important;padding:0!important}
#jurnal li{margin:0!important}
#jurnal .ok{color:#2f7a3a!important}
#jurnal li.ok{color:#8b88a4!important;text-decoration:line-through}
#jurnal .soon{color:#9a96b0!important}
#jurnal table{font-size:18px;break-inside:auto}
#jurnal td{border-bottom:0!important;padding:0 4px!important}
#jurnal .mode{font-size:12px!important;padding:2px 8px!important}
#jurnal p{margin:0}
#jurnal .ui-alir [style*="font-size"],#jurnal .ui-alir p{font-size:17px!important;opacity:.85}
#jurnal tr td{height:34.4px;padding:0 4px!important}
#jurnal .ui-nav{position:absolute;left:50%;bottom:-22px;transform:translateX(-50%);display:flex;gap:10px;align-items:center;z-index:3;font:800 14px var(--fa);color:var(--k);text-shadow:0 2px 0 var(--t)}
#jurnal .ui-nav button{padding:3px 12px!important}
#jurnal .ui-nomor{position:absolute;bottom:72px;font:16px var(--tl);color:#8b88a4;z-index:1}
#jurnal .ui-nomor.a{left:300px}#jurnal .ui-nomor.b{left:750px}
.ui-sampul{position:absolute;left:497px;top:0;width:503px;height:669px;transform-origin:3px 50%;transform-style:preserve-3d;z-index:10;pointer-events:none;animation:uiBuka .8s cubic-bezier(.45,.05,.35,1) .12s both}
.ui-sampul i{position:absolute;inset:0;backface-visibility:hidden;background:url(${U('buku_sampul.png')}) 0 0/100% 100%;image-rendering:pixelated}
.ui-sampul i+i{transform:rotateY(180deg);background:#7a4428;border:6px solid var(--t);border-radius:18px 6px 6px 18px;box-shadow:inset 0 0 0 10px #8a4d2c;animation:uiPudar .2s .75s both}
.ui-sampul b{position:absolute;left:27%;right:24%;top:35%;height:12%;display:grid;place-items:center;font:28px var(--tl);color:#2b2a4a;backface-visibility:hidden}
@keyframes uiBuka{from{transform:rotateY(0)}to{transform:rotateY(-180deg)}}
@keyframes uiPudar{to{opacity:0}}
#jurnal.ui-anim-buka{animation:uiMuncul .8s cubic-bezier(.3,.7,.3,1) both}
@keyframes uiMuncul{from{opacity:0;transform:translate(calc(-50% - 250px),-46%) scale(calc(var(--ui-s,1)*.82))}12%{opacity:1}to{opacity:1;transform:translate(-50%,-50%) scale(var(--ui-s,1))}}
#jurnal.ui-anim-buka .ui-alir,#jurnal.ui-anim-buka>.tabs,#jurnal.ui-anim-buka .ui-nomor{animation:uiMasuk .3s .7s both}
@keyframes uiMasuk{from{opacity:0}to{opacity:1}}
.ui-lembar{position:absolute;top:46px;height:539px;width:404px;transform-style:preserve-3d;z-index:4;pointer-events:none}
.ui-lembar.maju{left:500px;transform-origin:0 50%;animation:uiBalikM .55s cubic-bezier(.45,.05,.35,1) both}
.ui-lembar.mundur{left:96px;transform-origin:100% 50%;animation:uiBalikK .55s cubic-bezier(.45,.05,.35,1) both}
.ui-lembar i{position:absolute;inset:0;backface-visibility:hidden;background:linear-gradient(90deg,transparent 52px,rgba(232,120,110,.8) 52px 54px,transparent 54px),repeating-linear-gradient(transparent 0 31.4px,#c9d6e6 31.4px 34.4px) 0 21px/100% 100% no-repeat,#fcf2df}
.ui-lembar i+i{transform:rotateY(180deg)}
@keyframes uiBalikM{to{transform:rotateY(-180deg)}}
@keyframes uiBalikK{to{transform:rotateY(180deg)}}
@media (max-aspect-ratio:1/1){#uiTitle h1{font-size:clamp(34px,11vw,64px)}#uiTitle .logo img{height:min(12vh,90px)}#uiTitle .logo{left:5vw;right:5vw}#uiTitle p{font-size:14px}}
`;
  const style = el('style', { id: 'uiSkinCss', textContent: css });
  const pasangCss = () => document.head.appendChild(style); // selalu paling akhir supaya menang dari CSS game
  pasangCss();

  const klik = id => { const b = document.getElementById(id); if (b) b.click(); };

  /* ---------- bar tombol cepat ---------- */
  const bar = el('div', { id: 'uiBar' }, `
    <button data-b="btnJurnal">${ikon('jurnal', 26)}Jurnal<span class="ui-kunci">B</span></button>
    <button data-b="btnStatus">${ikon('mood', 26)}Status<span class="ui-kunci">U</span></button>
    <button data-b="btnKado">${ikon('hati', 26)}Kado<span class="ui-kunci">G</span></button>
    <button data-b="btnBigMap">${ikon('peta', 26)}Peta<span class="ui-kunci">M</span></button>
    <button class="utama" data-set="1">${ikon('pengaturan', 26)}Menu<span class="ui-kunci">P</span></button>`);
  bar.addEventListener('pointerdown', e => e.stopPropagation());
  bar.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.set) bukaSet(); else klik(b.dataset.b); };

  /* ---------- panel pengaturan (berisi tombol lama) ---------- */
  const set = el('div', { id: 'uiSet', className: 'ui-layar' }, `<div class="ui-redup"></div><div class="ui-panel">
    <h2>Pengaturan</h2><div class="sub">Kamera, grafik, tokoh. Shortcut keyboard tetap jalan.</div>
    <div class="grid" id="uiSetGrid"></div>
    <div class="aksi"><button id="uiBantuan">Bantuan kontrol</button><button class="on" id="uiTutupSet">Kembali main</button></div></div>`);
  set.addEventListener('pointerdown', e => e.stopPropagation());
  function bukaSet(on = !set.classList.contains('on')) { set.classList.toggle('on', on); }
  set.querySelector('.ui-redup').onclick = () => bukaSet(false);
  set.querySelector('#uiTutupSet').onclick = () => bukaSet(false);
  set.querySelector('#uiBantuan').onclick = () => document.body.classList.toggle('ui-bantuan');

  /* ---------- menu utama ---------- */
  const title = el('div', { id: 'uiTitle', className: 'ui-layar' }, `
    <div class="logo"><img class="ui-px" src="${U('emblem_lonceng.png')}" alt=""><div><h1>Lonceng<br><span>Pulang</span></h1><p>Tiga tahun di SMA Negeri 3 Wirabumi</p></div></div>
    <div class="daftar">
      <button class="utama" id="uiMain">Main <small id="uiInfo"></small></button>
      <button id="uiTokoh">Tokoh: <small id="uiTokohN">Raka</small></button>
      <button id="uiSetT">Pengaturan</button>
    </div>
    <img class="raka" id="uiPotret" src="${U('portrait/raka_biasa.png')}" alt="">
    <div class="kaki">Enter / Spasi untuk main</div>`);
  title.addEventListener('pointerdown', e => e.stopPropagation());
  const tutupTitle = () => { title.classList.remove('on'); document.body.classList.remove('ui-judul'); };
  title.querySelector('#uiMain').onclick = tutupTitle;
  title.querySelector('#uiSetT').onclick = () => bukaSet(true);
  title.querySelector('#uiTokoh').onclick = () => { klik('btnHero'); setTimeout(syncTokoh, 50); };
  function syncTokoh() {
    const t = ($('#btnHero') || {}).textContent || '';
    const rani = /rani/i.test(t);
    $('#uiTokohN').textContent = rani ? 'Rani' : 'Raka';
    $('#uiPotret').src = U('portrait/' + (rani ? 'rani' : 'raka') + '_biasa.png');
  }
  // selama menu utama tampil, tombol keyboard tidak sampai ke game
  addEventListener('keydown', e => {
    if (title.classList.contains('on')) {
      if (e.code === 'Enter' || e.code === 'Space') tutupTitle();
      e.stopImmediatePropagation(); e.preventDefault(); return;
    }
    if (e.code === 'KeyP' && !/INPUT|TEXTAREA/.test((e.target || {}).tagName || '')) { bukaSet(); }
    if (e.code === 'Escape' && set.classList.contains('on')) { bukaSet(false); e.stopImmediatePropagation(); }
  }, true);

  /* ---------- jurnal: buku, halaman, animasi ---------- */
  let spread = 0, bukaLalu = false, sibukJ = false;
  function skalaJurnal() {
    const J = $('#jurnal'); if (!J) return;
    const s = Math.min(innerWidth * 0.96 / 1000, (innerHeight - 70) * 0.94 / 669, 1.4);
    J.style.setProperty('--ui-s', s.toFixed(3));
  }
  addEventListener('resize', skalaJurnal);
  function tataJurnal(J) {
    if (J.querySelector(':scope > .ui-alir')) return;
    const alir = el('div', { className: 'ui-alir' });
    for (const n of [...J.childNodes]) { if (n.nodeType === 1 && (n.classList.contains('x') || n.classList.contains('tabs') || n.tagName === 'H3')) continue; alir.appendChild(n); }
    J.appendChild(alir);
    const nav = el('div', { className: 'ui-nav' }, `<button data-d="-1">◀</button><span class="ui-hal"></span><button data-d="1">▶</button>`);
    nav.onclick = e => { const b = e.target.closest('button'); if (b) balikJ(+b.dataset.d); };
    J.append(nav, el('div', { className: 'ui-nomor a' }), el('div', { className: 'ui-nomor b' }));
    const maks = () => Math.max(0, Math.ceil(alir.scrollWidth / 912) - 1);
    spread = Math.min(spread, maks());
    alir.scrollLeft = spread * 912;
    J.querySelector('.ui-hal').textContent = `${spread + 1} / ${maks() + 1}`;
    J.querySelector('.ui-nomor.a').textContent = spread * 2 + 1; J.querySelector('.ui-nomor.b').textContent = spread * 2 + 2;
    J._maks = maks;
  }
  function lembar(J, maju) {
    const L = el('div', { className: 'ui-lembar ' + (maju ? 'maju' : 'mundur') }, '<i></i><i></i>');
    J.appendChild(L); setTimeout(() => L.remove(), 600);
  }
  function balikJ(d) {
    const J = $('#jurnal'); if (!J || sibukJ) return; const alir = J.querySelector('.ui-alir'); if (!alir) return;
    const t = spread + d; if (t < 0 || t > J._maks()) return;
    sibukJ = true; lembar(J, d > 0);
    setTimeout(() => { spread = t; alir.scrollLeft = spread * 912; J.querySelector('.ui-hal').textContent = `${spread + 1} / ${J._maks() + 1}`;
      J.querySelector('.ui-nomor.a').textContent = spread * 2 + 1; J.querySelector('.ui-nomor.b').textContent = spread * 2 + 2; }, 270);
    setTimeout(() => sibukJ = false, 560);
  }
  function awasiJurnal() {
    const J = $('#jurnal'); if (!J || J._ui) return; J._ui = true;
    skalaJurnal();
    J.addEventListener('wheel', e => { e.stopPropagation(); if (Math.abs(e.deltaY) > 20) balikJ(e.deltaY > 0 ? 1 : -1); }, { passive: true });
    let tabLalu = null;
    new MutationObserver(() => {
      const tampil = J.style.display === 'block';
      if (tampil && !J.querySelector(':scope > .ui-alir')) {
        const tab = (J.querySelector('.tabs .on') || {}).dataset?.t;
        if (bukaLalu && tab !== tabLalu) { spread = 0; lembar(J, true); }
        tabLalu = tab; tataJurnal(J);
      }
      if (tampil && !bukaLalu) {
        bukaLalu = true; spread = 0; skalaJurnal();
        J.classList.remove('ui-anim-buka'); void J.offsetWidth; J.classList.add('ui-anim-buka');
        const s = el('div', { className: 'ui-sampul' }, `<i></i><i></i><b>Jurnal ${$('#uiTokohN') ? $('#uiTokohN').textContent : 'Raka'}</b>`);
        J.appendChild(s); setTimeout(() => s.remove(), 1000); setTimeout(() => J.classList.remove('ui-anim-buka'), 1100);
      }
      if (!tampil) bukaLalu = false;
    }).observe(J, { childList: true, attributes: true, attributeFilter: ['style'] });
  }

  /* ---------- pasang setelah game siap ---------- */
  function pasang() {
    if (!$('#btnMenu')) return setTimeout(pasang, 200);
    document.body.append(bar, set, title);
    const grid = set.querySelector('#uiSetGrid');
    for (const id of ['btnFollow', 'btnPitch', 'btnReset', 'btnMap', 'btnQuality', 'btnPx', 'btnHero']) { const b = document.getElementById(id); if (b) grid.appendChild(b); }
    const zi = $('#btnZoomIn'); if (zi) grid.appendChild(zi.parentElement);
    syncTokoh();
    const tungguMuat = () => { const l = $('#loading'); if (l && l.style.display !== 'none' && l.isConnected && getComputedStyle(l).display !== 'none') return setTimeout(tungguMuat, 250); title.classList.add('on'); document.body.classList.add('ui-judul'); };
    tungguMuat();
    const cariJ = () => { if ($('#jurnal')) awasiJurnal(); else setTimeout(cariJ, 300); }; cariJ();
    pasangCss(); setTimeout(pasangCss, 3000);
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', pasang); else pasang();
})();
