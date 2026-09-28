/* Gerobak Empire - playable prototype.
 * Scene is rendered at 224x256 on an offscreen canvas and blitted with nearest-neighbour
 * scaling; UI panels are HTML. Progress is kept in localStorage (per browser).
 */
(() => {
  "use strict";

  const W = 224, H = 256, GROUND = 238;
  const SAVE_KEY = "gerobak-empire-proto-v1";
  const DAY_LEN = 120;            // detik untuk satu siklus pagi-siang-sore-malam
  const TOD_TINT = {
    pagi: "rgba(255,220,180,0.08)", siang: null,
    sore: "rgba(255,120,80,0.2)", malam: "rgba(12,14,48,0.58)",
  };
  // Karakter di depan toko ikut kena cahaya toko, jadi digelapkan lebih ringan.
  const CHAR_TINT = { pagi: "rgba(255,220,180,0.06)", siang: null, sore: "rgba(255,140,90,0.12)", malam: "rgba(20,22,60,0.3)" };
  const LIGHT_A = { pagi: 0, siang: 0, sore: 0.45, malam: 1 };
  const UMBRELLAS = ["merah", "biru", "kuning", "hijau"];
  const WALKERS = {
    kucing: { w: 22, h: 16, speed: 16, frames: ["jalan1", "jalan2", "jalan3", "jalan4"], ms: 150, lane: 250, weight: 3, say: "MEONG~", dry: true },
    ayam: { w: 16, h: 16, speed: 9, frames: ["jalan1", "jalan2"], ms: 250, lane: 249, weight: 1, maxStage: 3, day: true, dry: true },
    motor_ojek: { w: 52, h: 40, speed: 72, frames: ["jalan1", "jalan2"], ms: 90, lane: 255, weight: 2, say: "TIN TIN!", rain: true, lamp: true },
    motor_keluarga: { w: 52, h: 40, speed: 60, frames: ["jalan1", "jalan2"], ms: 90, lane: 255, weight: 2, rain: true, lamp: true },
    tukang_sayur: { w: 64, h: 42, speed: 14, frames: ["jalan1", "jalan2", "jalan3", "jalan4"], ms: 180, lane: 254, weight: 2, say: "SAYUUUR!", day: true, rain: true, snd: "sayur" },
    bakso: { speed: 14, n: 4, ms: 180, lane: 254, weight: 2, say: "TING TING TING!", snd: "ting", dry: true },
    // khas kota
    ondel_ngamen: { speed: 10, n: 4, ms: 220, lane: 252, weight: 2, city: "jakarta", say: "TEREJET TEJET!", tapSay: "SAWER!", snd: "tanjidor", dry: true },
    bajaj: { speed: 46, n: 2, ms: 90, lane: 255, weight: 2, city: "jakarta", say: "BREM BREM!", snd: "bajaj", lamp: true },
    delman: { speed: 22, n: 2, ms: 220, lane: 255, weight: 2, city: "bandung", say: "KLOP KLOP!", snd: "klop", day: true, dry: true },
    angklung_ngamen: { speed: 14, n: 4, ms: 180, lane: 252, weight: 2, city: "bandung", say: "KLONG KLONG~", tapSay: "NUHUN!", snd: "angklung", dry: true },
    gebogan: { speed: 11, n: 4, ms: 200, lane: 252, weight: 2, city: "bali", say: "OM SWASTIASTU", snd: "gamelan", day: true, dry: true },
    monyet: { speed: 22, n: 4, ms: 130, lane: 250, weight: 2, city: "bali", say: "UK UK!", pet: "UK UK!", snd: "monyet", dry: true },
    becak: { speed: 18, n: 2, ms: 220, lane: 255, weight: 2, city: "surabaya", say: "KRING KRING!", tapSay: "AYO REK!", snd: "kring", dry: true },
    kerupuk: { speed: 20, n: 2, ms: 200, lane: 255, weight: 2, city: "surabaya", say: "KERUPUK REK!", snd: "kring", day: true, dry: true },
    // khusus event
    balap_karung: { speed: 18, n: 3, ms: 200, lane: 252, weight: 5, event: "kemerdekaan", say: "HOP! HOP!", tapSay: "AYO MENANG!", snd: "hop", day: true, dry: true },
    barongsai: { speed: 16, n: 3, ms: 220, lane: 254, weight: 5, event: "imlek", say: "DUNG DUNG CHANG!", tapSay: "GONG XI!", snd: "tambur" },
  };
  const PETS = { kucing: "MEONG!", ayam: "PETOK!" };
  const PET_SND = { kucing: "meong", ayam: "petok", monyet: "monyet" };
  // Tanggal hari besar yang bergeser tiap tahun (perkiraan kalender resmi).
  const LEBARAN = { 2025: "03-31", 2026: "03-20", 2027: "03-10", 2028: "02-27", 2029: "02-14", 2030: "02-05" };
  const IMLEK = { 2025: "01-29", 2026: "02-17", 2027: "02-06", 2028: "01-26", 2029: "02-13", 2030: "02-03" };
  const GALUNGAN_BASE = Date.UTC(2024, 8, 25);   // Galungan berulang tiap 210 hari (wuku Dungulan)
  const EVENT_GLOW = { lebaran: 1, imlek: 1, natal: 1, tahun_baru: 1 };
  const EVENT_BONUS = 1.2;
  const SINGLE_STRING = { imlek: 1, batik: 1, lebaran: 1 };
  const STAGE_LABEL = { 1: "GEROBAK", 2: "WARUNG", 3: "KEDAI", 4: "RESTO", 5: "ISTANA" };
  const STAGE_BADGE = { 1: "stage1_gerobak", 2: "stage2_warung", 3: "stage3_kedai", 4: "stage4_resto", 5: "stage5_istana" };
  const CITY_COST = [0, 20e3, 400e3, 8e6];
  const STAFF = {
    koki: { name: "Juru Masak", perk: (lv) => `Masak +${lv * 25}% lebih cepat`, base: 40, stage: 1, face: "pelanggan_03" },
    kasir: { name: "Kasir", perk: (lv) => `Pelanggan datang +${lv * 20}%`, base: 90, stage: 2, face: "pelanggan_04" },
    pelayan: { name: "Pelayan", perk: (lv) => `Tap otomatis ${(lv * 0.8).toFixed(1)}/detik`, base: 250, stage: 3, face: "pelanggan_02" },
  };
  const STAFF_MAX = 10;

  let D, sheets = [], S, ui = {};
  const $ = (s) => document.querySelector(s);

  // ------------------------------------------------------------------ utils
  function fmt(n) {
    n = Math.floor(n);
    const u = [[1e12, "T"], [1e9, "M"], [1e6, "JT"], [1e3, "RB"]];
    for (const [d, s] of u) if (n >= d) {
      const v = n / d;
      return (v >= 100 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, "")) + s;
    }
    return String(n);
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function icon(name, k = 2) {
    const m = D.atlas[name];
    if (!m) return "";
    const sh = sheets[m[0]];
    return `<span class="ic" style="width:${m[3] * k}px;height:${m[4] * k}px;background-image:url(${D.sheets[m[0]]});` +
      `background-size:${sh.naturalWidth * k}px ${sh.naturalHeight * k}px;background-position:-${m[1] * k}px -${m[2] * k}px"></span>`;
  }

  // ------------------------------------------------------------------ state
  function freshState() {
    const cities = {};
    D.cityOrder.forEach((c, i) => { cities[c] = { unlocked: i === 0, stage: 1, earned: 0, items: {} }; });
    return {
      v: 1, coins: 20, gems: 0, city: D.cityOrder[0], cities,
      staff: { koki: 0, kasir: 0, pelayan: 0 },
      stats: { served: 0, taps: 0, earned: 0, unlocks: 0, upgrades: 0 },
      missions: [], album: {}, eggBoost: false, last: Date.now(), boostUntil: 0, boostReady: 0,
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return Object.assign(freshState(), JSON.parse(raw));
    } catch (e) { /* storage unavailable */ }
    return null;
  }
  function save() {
    S.last = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  }

  const C = () => S.cities[S.city];
  const cityIdx = () => D.cityOrder.indexOf(S.city);
  const menuOf = (city = S.city) => D.menu[city].menu;
  const itemState = (it) => (C().items[it.id] ||= { lv: 0, bought: false });
  const available = (it) => it.stage <= C().stage;
  const isUnlocked = (it) => available(it) && (it.unlock === "stage" || itemState(it).bought);
  const level = (it) => Math.max(1, itemState(it).lv || 1);
  const activeItems = () => menuOf().filter(isUnlocked);
  const upgradeCost = (it) => Math.round(it.price * 10 * Math.pow(level(it), 1.6));
  const staffCost = (k) => Math.round(STAFF[k].base * Math.pow(3, S.staff[k]) * Math.pow(10, cityIdx()));
  const stageReq = (s) => Math.round(400 * Math.pow(6, s - 1) * Math.pow(10, cityIdx()));

  function comboMult() {
    let m = 1;
    const act = new Set(activeItems().map((i) => i.id));
    for (const c of D.menu[S.city].combos) if (c.items.every((id) => act.has(id))) m *= c.bonus;
    return m;
  }
  const boostOn = () => Date.now() < S.boostUntil;
  const incomeMult = () => (1 + S.gems * 0.02) * comboMult() * (boostOn() ? 2 : 1) * (curEvent ? EVENT_BONUS : 1);

  // ------------------------------------------------------------------ events (hari besar)
  function dateEvent(now) {
    const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate(), md = m * 100 + d;
    const today = Date.UTC(y, m - 1, d);
    const near = (tbl, before, after) => [y - 1, y, y + 1].some((yy) => {
      if (!tbl[yy]) return false;
      const [mm, dd] = tbl[yy].split("-").map(Number);
      const diff = (today - Date.UTC(yy, mm - 1, dd)) / 864e5;
      return diff >= -before && diff <= after;
    });
    if (near(LEBARAN, 7, 7)) return "lebaran";
    if (near(IMLEK, 3, 15)) return "imlek";
    if (S.city === "bali") {
      const k = ((Math.round((today - GALUNGAN_BASE) / 864e5) % 210) + 210) % 210;
      if (k <= 10) return "galungan";
    }
    if (m === 8) return "kemerdekaan";
    if (md >= 1001 && md <= 1004) return "batik";
    if (md >= 1108 && md <= 1112) return "pahlawan";
    if (md >= 1220 && md <= 1227) return "natal";
    if (md >= 1228 || md <= 102) return "tahun_baru";
    if (md >= 419 && md <= 423) return "kartini";
    return null;
  }
  function pickEvent() {
    if (S.forceEvent === "none") return null;
    if (S.forceEvent && D.events[S.forceEvent]) return S.forceEvent;
    return dateEvent(new Date());
  }
  let curEvent = null;
  const evBase = () => curEvent && (D.events[curEvent].pakai || curEvent);
  function checkEvent(announce) {
    const ev = pickEvent();
    if (ev === curEvent) return;
    curEvent = ev;
    if (ev && announce) announceEvent();
  }
  function announceEvent() {
    if (!curEvent) return;
    const e = D.events[curEvent];
    showToast(`ev:${evBase()}:ikon`, e.name, ` ${e.pesan} Pendapatan +${Math.round((EVENT_BONUS - 1) * 100)}%.`);
    Sfx.play("toast");
  }

  // ------------------------------------------------------------------ sound (WebAudio chiptune)
  const Sfx = (() => {
    let ctx = null, master = null, noiseBuf = null, armed = false;
    function ensure() {
      if (!armed) return null;
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = 0.45; master.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const ch = noiseBuf.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    function env(g, t0, dur, vol) {
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    }
    function tone(f, dur, o = {}) {
      const t0 = ctx.currentTime + (o.at || 0);
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = o.type || "square";
      osc.frequency.setValueAtTime(f, t0);
      if (o.slide) osc.frequency.exponentialRampToValueAtTime(f * o.slide, t0 + dur);
      if (o.vib) {
        const l = ctx.createOscillator(), lg = ctx.createGain();
        l.frequency.value = o.vib; lg.gain.value = f * (o.depth || 0.05);
        l.connect(lg).connect(osc.frequency); l.start(t0); l.stop(t0 + dur);
      }
      env(g, t0, dur, o.vol ?? 0.12);
      osc.connect(g).connect(master);
      osc.start(t0); osc.stop(t0 + dur + 0.02);
    }
    function noise(dur, o = {}) {
      const t0 = ctx.currentTime + (o.at || 0);
      const src = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = noiseBuf;
      fl.type = o.ft || "lowpass"; fl.frequency.value = o.f || 1200;
      env(g, t0, dur, o.vol ?? 0.15);
      src.connect(fl).connect(g).connect(master);
      src.start(t0, Math.random() * 0.5); src.stop(t0 + dur + 0.02);
    }
    const seq = (notes, step, o) => notes.forEach((f, i) => f && tone(f, step * 1.3, { ...o, at: i * step }));
    const P = {
      tap: () => tone(rand(560, 720), 0.07, { slide: 1.5, vol: 0.08 }),
      click: () => tone(660, 0.04, { vol: 0.06 }),
      coin: () => { tone(988, 0.07, { vol: 0.07 }); tone(1319, 0.16, { vol: 0.07, at: 0.06 }); },
      buy: () => seq([523, 659, 784, 1047], 0.06, { type: "square", vol: 0.08 }),
      upgrade: () => { tone(392, 0.16, { slide: 2, vol: 0.08 }); tone(1047, 0.1, { vol: 0.06, at: 0.14 }); },
      stage: () => seq([523, 523, 659, 784, 0, 659, 1047], 0.1, { type: "square", vol: 0.09 }),
      boost: () => { tone(200, 0.35, { type: "sawtooth", slide: 4, vol: 0.06 }); noise(0.3, { ft: "highpass", f: 3000, vol: 0.04 }); },
      rare: () => seq([1319, 1568, 2093, 2637], 0.07, { type: "triangle", vol: 0.1 }),
      toast: () => seq([784, 1175], 0.09, { type: "triangle", vol: 0.1 }),
      heart: () => tone(880, 0.18, { type: "sine", slide: 1.5, vol: 0.1 }),
      meong: () => tone(620, 0.42, { type: "sawtooth", slide: 0.7, vib: 9, vol: 0.06 }),
      petok: () => [0, 0.09, 0.18].forEach((at) => tone(900, 0.05, { at, slide: 0.6, vol: 0.07 })),
      monyet: () => [0, 0.14].forEach((at) => tone(500, 0.1, { at, slide: 1.8, vol: 0.08 })),
      horn: () => [0, 0.16].forEach((at) => { tone(440, 0.12, { at, vol: 0.06 }); tone(554, 0.12, { at, vol: 0.05 }); }),
      sayur: () => tone(330, 0.5, { type: "triangle", vib: 6, vol: 0.08 }),
      ting: () => [0, 0.2, 0.4].forEach((at) => { tone(1760, 0.25, { at, type: "sine", vol: 0.08 }); tone(3520, 0.12, { at, type: "sine", vol: 0.03 }); }),
      kring: () => { for (let i = 0; i < 6; i++) tone(i % 2 ? 2400 : 2000, 0.05, { at: i * 0.05, type: "square", vol: 0.04 }); },
      klop: () => [0, 0.15, 0.36, 0.51].forEach((at) => tone(i2f(at), 0.05, { at, type: "triangle", vol: 0.12 })),
      angklung: () => seq([523, 659, 784, 659], 0.16, { type: "triangle", vib: 18, depth: 0.03, vol: 0.1 }),
      tanjidor: () => seq([392, 440, 494, 587, 494, 440], 0.12, { type: "square", vol: 0.06 }),
      gamelan: () => seq([587, 659, 880, 784], 0.2, { type: "sine", vol: 0.1 }),
      bajaj: () => { for (let i = 0; i < 7; i++) noise(0.05, { at: i * 0.07, f: 400, vol: 0.12 }); },
      tambur: () => { [0, 0.2, 0.3].forEach((at) => noise(0.15, { at, f: 180, vol: 0.25 })); noise(0.4, { at: 0.45, ft: "highpass", f: 5000, vol: 0.08 }); },
      hop: () => tone(300, 0.12, { type: "triangle", slide: 2.2, vol: 0.1 }),
      dor: () => { noise(0.5, { f: 900, vol: 0.14 }); noise(0.25, { ft: "highpass", f: 4000, vol: 0.03, at: 0.1 }); },
    };
    function i2f(at) { return at * 10 % 3 < 1.5 ? 420 : 360; }
    return {
      arm() { armed = true; ensure(); },
      play(n) {
        if (!S || S.mute || !P[n] || !ensure()) return;
        try { P[n](); } catch (e) { /* audio unavailable */ }
      },
    };
  })();
  const salePrice = (it) => it.price * level(it) * incomeMult();

  function estRate() {
    const act = activeItems();
    if (!act.length) return 0;
    const avg = act.reduce((a, it) => a + salePrice(it), 0) / act.length;
    const cook = act.reduce((a, it) => a + cookTime(it), 0) / act.length;
    const perSec = Math.min(1 / cook, 1 / spawnInterval());
    return avg * perSec;
  }
  const cookTime = (it) => Math.max(0.8, it.cook_seconds / 1.5 / (1 + S.staff.koki * 0.25));
  const spawnInterval = () => Math.max(1.2, 5 / (1 + S.staff.kasir * 0.2));

  function earn(n) {
    S.coins += n; S.stats.earned += n; C().earned += n;
  }

  // ------------------------------------------------------------------ missions
  const MISSION_TYPES = [
    { t: "served", label: (n) => `Layani ${n} pelanggan`, base: 10 },
    { t: "taps", label: (n) => `Tap untuk masak ${n} kali`, base: 40 },
    { t: "earned", label: (n) => `Kumpulkan ${fmt(n)} koin`, base: 300 },
    { t: "upgrades", label: (n) => `Upgrade menu ${n} kali`, base: 3 },
    { t: "unlocks", label: (n) => `Buka ${n} menu atau karyawan`, base: 1 },
  ];
  function newMission(exclude) {
    const pool = MISSION_TYPES.filter((m) => !exclude.includes(m.t));
    const m = pick(pool);
    const scale = m.t === "earned" ? Math.pow(10, cityIdx()) * Math.pow(4, C().stage - 1) : Math.ceil(C().stage / 2);
    const target = Math.round(m.base * scale);
    const gem = Math.random() < 0.3;
    return { t: m.t, target, start: S.stats[m.t], reward: gem ? { gems: 1 + C().stage } : { coins: Math.round(stageReq(C().stage) * 0.15) } };
  }
  function ensureMissions() {
    while (S.missions.length < 3) S.missions.push(newMission(S.missions.map((m) => m.t)));
  }
  const missionProg = (m) => clamp((S.stats[m.t] - m.start) / m.target, 0, 1);

  // ------------------------------------------------------------------ scene
  const scene = document.createElement("canvas");
  scene.width = W; scene.height = H;
  const sc = scene.getContext("2d");
  const fg = document.createElement("canvas");
  fg.width = W; fg.height = H;
  const fx = fg.getContext("2d");
  let view, vctx, zoom = 2;

  function spr(ctx, name, x, y, a = 1, w, h) {
    const m = D.atlas[name];
    if (!m) return;
    if (a !== 1) ctx.globalAlpha = a;
    ctx.drawImage(sheets[m[0]], m[1], m[2], m[3], m[4], Math.round(x), Math.round(y), w || m[3], h || m[4]);
    if (a !== 1) ctx.globalAlpha = 1;
  }

  function layout() {
    const b = D.buildings[S.city][`stage${C().stage}`];
    const [bw, bh] = b.size;
    const bx = Math.floor((W - bw) / 2);
    const by = C().stage === 5 ? H - bh - 8 : GROUND + 1 - bh;
    return { bx, by, footX: bx + b.vendor_spot[0], footY: by + b.vendor_spot[1] };
  }

  let customers = [], parts = [], texts = [], cooking = null, lastSpawn = 0;
  let walkers = [], nextWalker = 20, fireworks = [], nextFw = 1;
  let heroFlash = 0, clock = 0, rain = false, lastTod = null;
  const clouds = [{ n: "awan_besar", x: 30, y: 22, v: 3 }, { n: "awan_sedang", x: 150, y: 46, v: 5 },
    { n: "awan_kecil", x: 90, y: 12, v: 7 }];

  const isRain = () => rain || S.forceRain;
  function tod() {
    if (S.forceTod) return { cur: S.forceTod, next: S.forceTod, blend: 0 };
    const t = (clock % DAY_LEN) / DAY_LEN * 4;
    const i = Math.floor(t);
    return { cur: D.tods[i], next: D.tods[(i + 1) % 4], blend: clamp((t - i - 0.9) / 0.1, 0, 1) };
  }

  function spawnCustomer() {
    const act = activeItems();
    if (!act.length || customers.filter((c) => c.state !== "leave").length >= 3) return;
    const L = layout();
    const slots = [0, 1, 2].filter((i) => !customers.some((c) => c.slot === i && c.state !== "leave"));
    if (!slots.length) return;
    const boost = S.eggBoost ? 25 : 1;
    let egg = null;
    for (const e of D.easter) if (Math.random() < e.chance * boost) { egg = e; break; }
    const who = egg ? egg.id : pick(D.customers);
    const foods = act.filter((i) => i.kind !== "minuman");
    const it = Math.random() < 0.7 && foods.length ? pick(foods) : pick(act);
    const slot = slots[0];
    customers.push({
      who, egg, it, slot, x: -34, tx: (L.bx >= 60 ? L.bx - 12 : L.footX - 44) - slot * 24, state: "walk", t: 0,
      patience: 14 + S.staff.kasir, waited: 0, umb: pick(UMBRELLAS),
    });
    if (egg) {
      const first = !S.album[egg.id];
      S.album[egg.id] = true;
      showToast(`cust:${egg.id}:tunggu1`, first ? `Pelanggan langka baru: ${egg.name}!` : egg.name, `"${egg.quote}"`);
      Sfx.play("rare");
      if (first) renderPanel();
    }
  }

  function pop(x, y, it, coins, big) {
    parts.push({ k: "burst", x, y, t: 0 });
    parts.push({ k: "coin", x, y, t: 0, dx: rand(-8, 8) });
    if (it) parts.push({ k: "food", x: x + 8, y: y - 6, t: 0, it });
    texts.push({ s: "+" + fmt(coins), x, y: y - 8, t: 0, big });
  }

  function tap(px, py, auto) {
    S.stats.taps += auto ? 0 : 1;
    const act = activeItems();
    const it = cooking ? cooking.c.it : act[0];
    if (!it) return;
    const coins = Math.max(1, Math.round(it.price * 0.15 * level(it) * incomeMult()));
    earn(coins);
    if (cooking) cooking.left -= 0.35;
    heroFlash = 0.15;
    if (!auto) { pop(px, py, it, coins); Sfx.play("tap"); }
    else if (Math.random() < 0.3) { const L = layout(); pop(L.footX + 10, L.footY - 34, it, coins); }
  }

  function serve(c) {
    const pay = salePrice(c.it) * (c.egg ? c.egg.reward : 1);
    earn(pay);
    S.stats.served++;
    c.state = "happy"; c.t = 0;
    pop(c.x + 16, GROUND - 44, c.it, pay, true);
    Sfx.play("coin");
  }

  let autoAcc = 0;
  function update(dt) {
    clock += dt;
    const L = layout();
    // day cycle + weather
    const t = tod();
    if (t.cur !== lastTod) { rain = t.cur === "malam" && Math.random() < 0.35; lastTod = t.cur; }
    for (const cl of clouds) { cl.x += cl.v * dt; if (cl.x > W + 10) cl.x = -60; }
    // spawn
    lastSpawn += dt;
    if (lastSpawn > spawnInterval()) { lastSpawn = 0; spawnCustomer(); }
    // customers
    for (const c of customers) {
      c.t += dt;
      if (c.state === "walk") {
        c.x = Math.min(c.tx, c.x + 30 * dt);
        if (c.x >= c.tx) { c.state = "wait"; c.t = 0; }
      } else if (c.state === "wait") {
        c.waited += dt;
        if (c.waited > c.patience && cooking?.c !== c) { c.state = "angry"; c.t = 0; }
      } else if (c.state === "happy" && c.t > 1.2) { c.state = "leave"; c.t = 0; }
      else if (c.state === "angry" && c.t > 1.2) { c.state = "leave"; c.t = 0; }
      else if (c.state === "leave") c.x -= 34 * dt;
    }
    customers = customers.filter((c) => !(c.state === "leave" && c.x < -40));
    // cooking
    if (!cooking) {
      const next = customers.find((c) => c.state === "wait");
      if (next) cooking = { c: next, left: cookTime(next.it), total: cookTime(next.it) };
    }
    if (cooking) {
      cooking.left -= dt;
      if (cooking.c.state !== "wait") cooking = null;
      else if (cooking.left <= 0) { serve(cooking.c); cooking = null; }
    }
    // auto taps (pelayan)
    if (S.staff.pelayan > 0) {
      autoAcc += dt * S.staff.pelayan * 0.8;
      while (autoAcc >= 1) { autoAcc -= 1; tap(0, 0, true); }
    }
    updateWalkers(dt);
    updateFireworks(dt, t);
    heroFlash = Math.max(0, heroFlash - dt);
    for (const p of parts) p.t += dt;
    parts = parts.filter((p) => p.t < (p.k === "burst" ? 0.3 : p.k === "heart" ? 1.2 : 0.9));
    for (const x of texts) x.t += dt;
    texts = texts.filter((x) => x.t < 1);
  }

  const FW_COLS = ["#ff5a7a", "#f2c94c", "#7cd8e8", "#9fe0a8", "#e0a0ff", "#ffffff"];
  function updateFireworks(dt, t) {
    const ev = evBase();
    const on = (ev === "tahun_baru" || ev === "kemerdekaan") && t.cur === "malam" && C().stage !== 5;
    nextFw -= dt;
    if (on && nextFw <= 0) {
      nextFw = rand(0.8, 2.2);
      const col = ev === "kemerdekaan" ? pick(["#ff4a3a", "#ffffff"]) : pick(FW_COLS);
      fireworks.push({ x: rand(30, W - 30), y: 200, ty: rand(24, 90), t: 0, col, sparks: null });
    }
    for (const f of fireworks) {
      f.t += dt;
      if (!f.sparks) {
        f.y -= 190 * dt;
        if (f.y <= f.ty) {
          f.sparks = Array.from({ length: 22 }, (_, i) => {
            const a = i / 22 * Math.PI * 2, v = rand(26, 40);
            return { vx: Math.cos(a) * v, vy: Math.sin(a) * v };
          });
          f.t = 0;
          Sfx.play("dor");
        }
      }
    }
    fireworks = fireworks.filter((f) => !f.sparks || f.t < 1.4);
  }
  function drawFireworks() {
    for (const f of fireworks) {
      if (!f.sparks) {
        sc.fillStyle = "#fff2a8"; sc.fillRect(Math.round(f.x), Math.round(f.y), 1, 3);
        continue;
      }
      sc.globalAlpha = clamp(1.4 - f.t, 0, 1);
      sc.fillStyle = f.t < 0.12 ? "#ffffff" : f.col;
      for (const p of f.sparks) {
        const x = f.x + p.vx * f.t, y = f.ty + p.vy * f.t + 14 * f.t * f.t;
        const sz = f.t < 0.5 ? 2 : 1;
        sc.fillRect(Math.round(x), Math.round(y), sz, sz);
      }
      sc.globalAlpha = 1;
    }
  }

  function drawDecor(ctx, now, a = 1) {
    const ev = evBase();
    if (!ev) return;
    const f = 1 + Math.floor(now / 600) % 2;
    const n = D.events[ev].tiang;
    if (n && a === 1) {
      const tf = 1 + Math.floor(now / 180) % n;
      const name = `ev:${ev}:tiang${tf}`, m = D.atlas[name];
      const y = GROUND + 3 - m[4];
      sprFlip(ctx, name, 0, y, false);
      sprFlip(ctx, `ev:${ev}:tiang${1 + (tf % n)}`, W - m[3], y, true);
    }
    spr(ctx, `ev:${ev}:untai${f}`, 0, 84, a);
    if (!SINGLE_STRING[ev]) spr(ctx, `ev:${ev}:untai${3 - f}`, 0, 124, a);
  }

  function spawnWalker() {
    const t = tod().cur, stage = C().stage;
    if (stage === 5) return;
    const pool = [];
    for (const [k, d] of Object.entries(WALKERS)) {
      if (isRain() && d.dry) continue;
      if (d.day && t === "malam") continue;
      if (d.maxStage && stage > d.maxStage) continue;
      if (d.city && d.city !== S.city) continue;
      if (d.event && d.event !== evBase()) continue;
      for (let i = 0; i < d.weight; i++) pool.push(k);
    }
    if (!pool.length) return;
    const kind = pick(pool), d = WALKERS[kind], dir = Math.random() < 0.5 ? 1 : -1;
    if (!d.frames) {
      d.frames = Array.from({ length: d.n }, (_, i) => `jalan${i + 1}`);
      const m = D.atlas[`lewat:${kind}:jalan1`];
      d.w = m[3]; d.h = m[4];
    }
    walkers.push({ kind, d, dir, x: dir > 0 ? -d.w : W, t: 0, state: "walk", st: 0, said: false,
      sitAt: kind === "kucing" && Math.random() < 0.5 ? rand(40, 170) : null });
  }

  function updateWalkers(dt) {
    nextWalker -= dt;
    if (nextWalker <= 0) { nextWalker = rand(25, 50); spawnWalker(); }
    for (const w of walkers) {
      w.t += dt; w.st += dt;
      if (w.state === "sit") { if (w.st > 3) { w.state = "walk"; w.st = 0; } continue; }
      if (w.state === "peck") { if (w.st > 1) { w.state = "walk"; w.st = 0; } continue; }
      w.x += w.d.speed * w.dir * dt;
      const cx = w.x + w.d.w / 2;
      if (w.sitAt !== null && Math.abs(cx - w.sitAt) < 2) { w.state = "sit"; w.st = 0; w.sitAt = null; }
      if (w.kind === "ayam" && w.st > 2.5 && Math.random() < dt) { w.state = "peck"; w.st = 0; }
      if (w.d.say && !w.said && cx > 50 && cx < 174) {
        w.said = true;
        texts.push({ s: w.d.say, x: clamp(cx, 40, W - 40), y: w.d.lane - w.d.h - 2, t: 0, col: "#fbf0d8" });
        Sfx.play(w.d.snd || (w.kind.startsWith("motor") ? "horn" : PET_SND[w.kind]));
      }
    }
    walkers = walkers.filter((w) => w.x > -w.d.w - 4 && w.x < W + 4);
  }

  function walkerSprite(w, now) {
    const rainy = isRain() && w.d.rain ? "_hujan" : "";
    let fr = w.d.frames[Math.floor(now / w.d.ms) % w.d.frames.length];
    if (w.state === "sit") fr = "duduk" + (1 + Math.floor(w.st / 0.6) % 2);
    if (w.state === "peck") fr = "matuk" + (1 + Math.floor(w.st / 0.2) % 2);
    return `lewat:${w.kind}${rainy}:${fr}`;
  }

  function sprFlip(ctx, name, x, y, flip) {
    if (!flip) return spr(ctx, name, x, y);
    const m = D.atlas[name];
    if (!m) return;
    ctx.save(); ctx.translate(Math.round(x) + m[3], Math.round(y)); ctx.scale(-1, 1);
    ctx.drawImage(sheets[m[0]], m[1], m[2], m[3], m[4], 0, 0, m[3], m[4]);
    ctx.restore();
  }

  function lightAlpha(t) {
    return LIGHT_A[t.cur] * (1 - t.blend) + LIGHT_A[t.next] * t.blend;
  }

  function draw(now) {
    const L = layout();
    const stage = C().stage;
    const t = tod();
    // background
    if (stage === 5) spr(sc, `env:${S.city}:5:fantasi`, 0, 0);
    else {
      spr(sc, `env:${S.city}:${stage}:${t.cur}`, 0, 0);
      if (t.blend > 0) spr(sc, `env:${S.city}:${stage}:${t.next}`, 0, 0, t.blend);
    }
    const day = stage === 5 || t.cur !== "malam";
    if (day && stage !== 5) {
      for (const cl of clouds) spr(sc, "fx:" + cl.n, cl.x, cl.y, t.cur === "sore" ? 0.8 : 1);
      if (t.cur !== "sore") for (let i = 0; i < 3; i++) {
        const bx = ((clock * 16 + i * 14) % (W + 30)) - 15;
        spr(sc, `fx:burung${1 + (Math.floor(clock * 6) + i) % 3}`, bx, 62 + i * 6 + Math.sin(clock * 2 + i) * 2);
      }
    }
    if (!day) drawFireworks();
    // 1) gedung: digelapkan sesuai waktu, lalu lampunya dinyalakan
    const tintLayer = (color) => {
      if (!color) return;
      fx.globalCompositeOperation = "source-atop";
      fx.fillStyle = color; fx.fillRect(0, 0, W, H);
      fx.globalCompositeOperation = "source-over";
    };
    fx.clearRect(0, 0, W, H);
    const bf = Math.floor(now / 500) % 2 + 1;
    spr(fx, `bld:${S.city}:${stage}:${bf}`, L.bx, L.by);
    drawDecor(fx, now);
    tintLayer(stage === 5 ? null : TOD_TINT[t.cur]);
    const la = stage === 5 ? 0 : lightAlpha(t);
    const glow = la > 0 && EVENT_GLOW[evBase()];
    if (glow) drawDecor(fx, now, la);
    const lightName = `bldL:${S.city}:${stage}:${bf}`;
    if (la > 0 && D.atlas[lightName]) spr(fx, lightName, L.bx, L.by, la);
    sc.drawImage(fg, 0, 0);
    if (la > 0 && (D.atlas[lightName] || glow)) {
      sc.save();
      sc.globalCompositeOperation = "lighter";
      sc.filter = "blur(3px)";
      if (D.atlas[lightName]) spr(sc, lightName, L.bx, L.by, 0.5 * la);
      if (glow) drawDecor(sc, now, 0.6 * la);
      sc.restore();
    }
    // 2) karakter & yang lewat, di depan gedung, dengan tint lebih ringan
    fx.clearRect(0, 0, W, H);
    const evc = evBase();
    for (const c of customers) {
      let fr = "tunggu" + (1 + Math.floor(c.t / 0.6) % 2);
      if (c.state === "walk" || c.state === "leave") fr = "jalan" + (1 + Math.floor(now / 140) % 4);
      if (c.state === "happy") fr = "senang" + (1 + Math.floor(c.t / 0.16) % 3);
      const who = !c.egg && evc && D.atlas[`cust:${c.who}@${evc}:${fr}`] ? `${c.who}@${evc}` : c.who;
      spr(fx, `cust:${who}:${fr}`, c.x, L.footY - 39);
      if (isRain() && stage !== 5) spr(fx, `payung:${c.umb}`, c.x + 8, L.footY - 39 - 6);
    }
    let hf = "idle" + (1 + Math.floor(now / 400) % 2);
    if (cooking) hf = "masak" + (1 + Math.floor(now / 120) % 4);
    if (heroFlash > 0) hf = "tap";
    spr(fx, `hero:${S.city}:${stage}:${hf}`, L.footX - 16, L.footY - 39);
    if (evc) spr(fx, `evhero:${evc}`, L.footX - 16, L.footY - 39 - (hf === "tap" ? 2 : 0));
    if (stage >= 2) spr(fx, `rempi:${boostOn() ? "senang" : "float" + (1 + Math.floor(now / 450) % 2)}`,
      L.footX + 14, L.footY - 52 + Math.round(Math.sin(now / 400)));
    for (const w of walkers) sprFlip(fx, walkerSprite(w, now), w.x, w.d.lane - w.d.h, w.dir < 0);
    tintLayer(stage === 5 ? null : CHAR_TINT[t.cur]);
    sc.drawImage(fg, 0, 0);
    if (la > 0) {
      sc.save();
      sc.globalCompositeOperation = "lighter";
      for (const w of walkers) if (w.d.lamp) {                    // lampu depan motor
        const hx = w.dir > 0 ? w.x + w.d.w : w.x;
        const g = sc.createRadialGradient(hx, w.d.lane - 20, 1, hx + 18 * w.dir, w.d.lane - 14, 22);
        g.addColorStop(0, `rgba(255,236,160,${0.55 * la})`); g.addColorStop(1, "rgba(255,236,160,0)");
        sc.fillStyle = g; sc.fillRect(hx - 30, w.d.lane - 44, 60, 44);
      }
      sc.restore();
    }
    // bubbles (not tinted)
    for (const c of customers) {
      const bx = c.x + 12, by = L.footY - 39 - 20;
      if (c.state === "wait") {
        spr(sc, "bubble:pesan", bx, by);
        spr(sc, `food:${S.city}:${c.it.id}`, bx + 4, by + 1, 1, 14, 14);
        const left = 1 - c.waited / c.patience;
        sc.fillStyle = "#100b13"; sc.fillRect(bx + 1, by + 16, 20, 3);
        sc.fillStyle = left > 0.4 ? "#5fae4a" : "#d8432a"; sc.fillRect(bx + 2, by + 17, Math.round(18 * left), 1);
      } else if (c.state === "happy") spr(sc, "bubble:senang", bx, by);
      else if (c.state === "angry") spr(sc, "bubble:kesal", bx, by);
    }
    if (cooking) {
      const f = 1 - cooking.left / cooking.total;
      const x = L.footX - 14, y = L.footY - 46;
      sc.fillStyle = "#100b13"; sc.fillRect(x, y, 28, 4);
      sc.fillStyle = "#f2c94c"; sc.fillRect(x + 1, y + 1, Math.round(26 * clamp(f, 0, 1)), 2);
    }
    if (!day) for (let i = 0; i < 8; i++) {
      spr(sc, `fx:kunang${1 + (Math.floor(now / 300) + i) % 2}`, (i * 31 + clock * 4) % W, 150 + (i * 17) % 60 + Math.sin(clock + i) * 3);
    }
    if (isRain() && stage !== 5) spr(sc, `fx:hujan${1 + Math.floor(now / 110) % 4}`, 0, 0, 0.9);
    for (const p of parts) {
      const a = p.t < 0.55 ? 1 : 1 - (p.t - 0.55) / 0.35;
      if (p.k === "heart") {
        if (p.t < 0) continue;
        const ha = clamp(1 - (p.t - 0.7) / 0.5, 0, 1);
        const hx = Math.round(p.x + Math.sin(p.t * 8 + p.dx) * 3), hy = Math.round(p.y - 30 * p.t);
        sc.globalAlpha = ha;
        sc.fillStyle = "#2a1c24";
        sc.fillRect(hx - 1, hy - 1, 7, 6); sc.fillRect(hx, hy + 5, 5, 1); sc.fillRect(hx + 1, hy + 6, 3, 1);
        sc.fillStyle = "#ff5a7a";
        sc.fillRect(hx, hy, 2, 1); sc.fillRect(hx + 3, hy, 2, 1); sc.fillRect(hx, hy + 1, 5, 2);
        sc.fillRect(hx + 1, hy + 3, 3, 1); sc.fillRect(hx + 2, hy + 4, 1, 1);
        sc.fillStyle = "#ffc0d0"; sc.fillRect(hx, hy, 1, 1);
        sc.globalAlpha = 1;
      } else if (p.k === "burst") spr(sc, `fx:ledakan${1 + Math.min(3, Math.floor(p.t / 0.075))}`, p.x - 10, p.y - 10);
      else if (p.k === "coin") spr(sc, `fx:koin_putar${1 + Math.floor(p.t / 0.08) % 4}`, p.x - 6 + p.dx * p.t, p.y - 6 - 44 * p.t, a);
      else if (p.k === "food") {
        const s = p.t < 0.15 ? 0.6 + p.t * 3 : 1;
        const sz = Math.round(24 * s), yy = p.y - 30 * Math.sin(Math.min(1, p.t) * Math.PI / 2);
        spr(sc, "fx:lingkar_makanan", p.x + 14 * p.t - sz / 2 - 2, yy - sz / 2 - 2, a, sz + 4, sz + 4);
        spr(sc, `food:${S.city}:${p.it.id}`, p.x + 14 * p.t - sz / 2, yy - sz / 2, a, sz, sz);
      }
    }
    // blit + crisp text
    vctx.imageSmoothingEnabled = false;
    vctx.drawImage(scene, 0, 0, W * zoom, H * zoom);
    vctx.textAlign = "center";
    for (const x of texts) {
      const a = x.t < 0.6 ? 1 : 1 - (x.t - 0.6) / 0.4;
      vctx.globalAlpha = a;
      vctx.font = `${(x.big ? 8 : 6) * zoom}px "Press Start 2P", monospace`;
      vctx.lineWidth = 3; vctx.strokeStyle = "#100b13";
      const y = (x.y - 26 * x.t) * zoom;
      vctx.strokeText(x.s, x.x * zoom, y);
      vctx.fillStyle = x.col || (x.big ? "#fff2a8" : "#f2c94c");
      vctx.fillText(x.s, x.x * zoom, y);
    }
    vctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ HUD & panels
  let tab = 0;
  const TABS = [["ui:tab_racikan", "RACIKAN"], ["ui:tab_karyawan", "KARYAWAN"], ["ui:tab_naik_kelas", "KELAS"], ["ui:tab_misi", "MISI"]];
  const KIND = { makanan: "Makanan", minuman: "Minuman", dessert: "Dessert" };

  function renderTabs() {
    $("#tabs").innerHTML = TABS.map(([ic, l], i) =>
      `<button class="tab" role="tab" aria-selected="${i === tab}" data-tab="${i}">${icon(ic, 1)}${l}<span class="dot" data-dot="${i}" hidden></span></button>`).join("");
  }

  const meter = (cls, frac, label, ic) =>
    `<div class="stat"><span class="k-slot">${icon(ic, 1)}</span><div class="meter ${cls}"><i style="width:calc(${Math.round(clamp(frac, 0, 1) * 100)}% + 6px)"></i><b>${label}</b></div></div>`;

  function cardShell({ portrait, lv, btn, name, sub, stats, cls = "" }) {
    return `<div class="card k-card ${cls}">
      <div class="left">
        <div class="k-portrait">${portrait}</div>
        ${lv ? `<span class="lv k-pill">${lv}</span>` : ""}
        ${btn}
      </div>
      <div class="right">
        <div class="k-plate"><div class="name">${name}</div><div class="sub">${sub}</div></div>
        ${stats}
      </div></div>`;
  }

  function menuCard(it) {
    const tier = `tier-${it.tier}`;
    const maxPrice = Math.max(...menuOf().map((m) => m.price));
    const kind = KIND[it.kind] + (it.tier !== "biasa" ? " " + it.tier : "");
    if (!available(it)) {
      return cardShell({
        cls: `dim ${tier}`, portrait: icon(`food:${S.city}:${it.id}:locked`, 2), name: it.name,
        sub: `${kind} \u00b7 stage ${it.stage}`,
        btn: `<button class="btn off" disabled>${icon("ui:gembok", 1)}STAGE ${it.stage}</button>`,
        stats: meter("orange", it.price / maxPrice, fmt(it.price), "ui:koin") +
          `<div class="sub">Terbuka saat naik ke ${STAGE_LABEL[it.stage].toLowerCase()}.</div>`,
      });
    }
    if (!isUnlocked(it)) {
      return cardShell({
        cls: tier, portrait: icon(`food:${S.city}:${it.id}:locked`, 2), name: it.name,
        sub: `${kind} \u00b7 terkunci`,
        btn: `<button class="btn ${it.tier === "biasa" ? "gold" : "purple"}" data-act="unlock" data-id="${it.id}" data-cost="${it.unlock_cost}">${fmt(it.unlock_cost)}${icon("ui:koin", 1)}</button>`,
        stats: meter("orange", it.price / maxPrice, fmt(it.price), "ui:koin") +
          meter("", 1.5 / cookTime(it), `${cookTime(it).toFixed(1)}s`, "ui:waktu_masak"),
      });
    }
    const lv = level(it);
    return cardShell({
      cls: tier, portrait: icon(`food:${S.city}:${it.id}`, 2), name: it.name, sub: kind,
      lv: `${icon("ui:rating", 0.5)}LV ${lv}`,
      btn: `<button class="btn" data-act="upgrade" data-id="${it.id}" data-cost="${upgradeCost(it)}">${fmt(upgradeCost(it))}${icon("ui:koin", 1)}</button>`,
      stats: meter("orange", salePrice(it) / (maxPrice * 4), "+" + fmt(salePrice(it)), "ui:koin") +
        meter("", 1.5 / cookTime(it), `${cookTime(it).toFixed(1)}s`, "ui:waktu_masak") +
        meter("green", lv / 10, `LV ${lv}`, "ui:upgrade"),
    });
  }

  function staffCard(k, s) {
    const lv = S.staff[k];
    const locked = C().stage < s.stage && lv === 0;
    const portrait = icon(`cust:${s.face}:tunggu1`, 2);
    if (locked) return cardShell({
      cls: "dim", portrait, name: s.name, sub: `Terbuka di stage ${s.stage}`,
      btn: `<button class="btn off" disabled>${icon("ui:gembok", 1)}STAGE ${s.stage}</button>`,
      stats: meter("purple", 0, "LV 0", "ui:upgrade") + `<div class="sub">${s.perk(1)}</div>`,
    });
    const max = lv >= STAFF_MAX;
    return cardShell({
      portrait, name: s.name, sub: lv ? s.perk(lv) : "Belum direkrut", lv: lv ? `LV ${lv}` : "",
      btn: max ? `<button class="btn off" disabled>MAKS</button>` :
        `<button class="btn" data-act="staff" data-id="${k}" data-cost="${staffCost(k)}">${fmt(staffCost(k))}${icon("ui:koin", 1)}</button>`,
      stats: meter("purple", lv / STAFF_MAX, `LV ${lv}/${STAFF_MAX}`, "ui:upgrade") +
        `<div class="sub">Berikutnya: ${s.perk(lv + 1)}</div>`,
    });
  }

  function section(t) {
    return `<div class="section"><div class="k-ribbon"><span class="h-title">${t}</span></div></div>`;
  }

  function renderPanel() {
    const L = $("#list");
    const stage = C().stage;
    if (tab === 0) {
      const act = new Set(activeItems().map((i) => i.id));
      $("#panelTitle").textContent = "RACIKAN";
      $("#panelSub").textContent = `${activeItems().length} menu aktif \u00b7 kombo x${comboMult().toFixed(2)}`;
      L.innerHTML = menuOf().map(menuCard).join("") + section("KOMBO") +
        D.menu[S.city].combos.map((c) => {
          const on = c.items.every((id) => act.has(id));
          return `<div class="row-card k-card ${on ? "" : "dim"}"><span class="k-slot">${icon("ui:kombo", 1)}</span>
            <div><div class="name">${c.name}</div><div class="sub">${c.items.map((id) => menuOf().find((i) => i.id === id).name).join(" + ")}</div></div>
            <span class="lv k-pill" style="position:static">x${c.bonus}</span></div>`;
        }).join("");
    } else if (tab === 1) {
      $("#panelTitle").textContent = "KARYAWAN";
      $("#panelSub").textContent = "Berlaku di semua kota";
      L.innerHTML = Object.entries(STAFF).map(([k, s]) => staffCard(k, s)).join("");
    } else if (tab === 2) {
      $("#panelTitle").textContent = "NAIK KELAS";
      $("#panelSub").textContent = `${D.cities[S.city].name} \u00b7 stage ${stage}/5`;
      const track = `<div class="k-paper"><div class="track">${[1, 2, 3, 4, 5].map((s) =>
        `<div class="st ${s <= stage ? "on" : "off"}"><span class="k-slot">${icon(`ui:${STAGE_BADGE[s]}`, 1)}</span>${STAGE_LABEL[s]}</div>`).join("")}</div></div>`;
      if (stage >= 5) {
        L.innerHTML = track + `<div class="note">Istana Rasa sudah berdiri di ${D.cities[S.city].name}! Buka kota berikutnya lewat peta.</div>`;
      } else {
        const cnt = stage + 1, need = stageReq(stage);
        L.innerHTML = track + section(`MENUJU ${STAGE_LABEL[stage + 1]}`) + `<div class="k-card"><div class="req">
          <div class="lab"><span>Pendapatan di ${D.cities[S.city].name}</span></div>
          <div class="meter gold"><i data-bind="earnedBar"></i><b data-bind="earned"></b></div>
          <div class="lab"><span>Menu aktif</span></div>
          <div class="meter green"><i style="width:calc(${Math.min(100, activeItems().length / cnt * 100)}% + 6px)"></i><b>${activeItems().length}/${cnt}</b></div>
          <div class="lab"><span>Hadiah</span><span>${icon("ui:bintang_rasa", 1)} +${stage * 2} Bintang Rasa</span></div></div></div>
          <button class="btn purple wide" data-act="stageup" data-cost="${need}" data-menu="${cnt}">NAIK KELAS!</button>
          <div class="note">Tiap Bintang Rasa menambah pendapatan +2% di semua kota.</div>`;
      }
    } else {
      $("#panelTitle").textContent = "MISI";
      $("#panelSub").textContent = "Selesaikan untuk hadiah";
      ensureMissions();
      L.innerHTML = S.missions.map((m, i) => {
        const def = MISSION_TYPES.find((x) => x.t === m.t);
        const rw = m.reward.gems ? `${m.reward.gems}${icon("ui:bintang_rasa", 1)}` : `${fmt(m.reward.coins)}${icon("ui:koin", 1)}`;
        return `<div class="row-card k-card"><span class="k-slot">${icon("ui:misi_harian", 1)}</span>
          <div><div class="name">${def.label(m.target)}</div>
          <div class="meter green" style="margin-top:4px"><i data-bind="mbar${i}"></i><b data-bind="mtext${i}"></b></div></div>
          <button class="btn" data-act="claim" data-i="${i}" data-mission="${i}">${rw}</button></div>`;
      }).join("") + section(`ALBUM LANGKA ${Object.keys(S.album).length}/${D.easter.length}`) +
        `<div class="k-paper"><div class="album">${D.easter.map((e) =>
          `<div class="${S.album[e.id] ? "found" : ""}">${icon(`cust:${e.id}:tunggu1`, 1)}<br>${S.album[e.id] ? e.name : "???"}</div>`).join("")}</div></div>`;
    }
    refresh();
  }

  function refresh() {
    $("#hudCoins").innerHTML = `${icon("ui:koin", 1.5)}${fmt(S.coins)}`;
    $("#hudGems").innerHTML = `${icon("ui:bintang_rasa", 1.5)}${S.gems}`;
    $("#hudRate").innerHTML = `${icon("ui:pendapatan", 1)}${fmt(estRate())}/DTK${boostOn() ? " X2" : ""}`;
    $("#hudCity").textContent = `${D.cities[S.city].name} \u00b7 ${STAGE_LABEL[C().stage]}`;
    document.querySelectorAll("[data-cost]").forEach((b) => {
      let ok = S.coins >= +b.dataset.cost;
      if (b.dataset.act === "stageup") ok = C().earned >= +b.dataset.cost && activeItems().length >= +b.dataset.menu;
      b.disabled = !ok;
    });
    document.querySelectorAll("[data-mission]").forEach((b) => { b.disabled = missionProg(S.missions[+b.dataset.mission]) < 1; });
    const bind = (k, fn) => { const el = document.querySelector(`[data-bind="${k}"]`); if (el) fn(el); };
    const stage = C().stage;
    if (stage < 5) {
      bind("earned", (el) => { el.textContent = `${fmt(C().earned)}/${fmt(stageReq(stage))}`; });
      bind("earnedBar", (el) => { el.style.width = `calc(${Math.min(100, C().earned / stageReq(stage) * 100)}% + 6px)`; });
    }
    S.missions.forEach((m, i) => {
      bind(`mtext${i}`, (el) => { el.textContent = `${fmt(Math.min(m.target, S.stats[m.t] - m.start))}/${fmt(m.target)}`; });
      bind(`mbar${i}`, (el) => { el.style.width = `calc(${missionProg(m) * 100}% + 6px)`; });
    });
    const dot = document.querySelector('[data-dot="3"]');
    if (dot) dot.hidden = !S.missions.some((m) => missionProg(m) >= 1);
    $("#btnSound").innerHTML = icon(S.mute ? "ui:suara_off" : "ui:suara_on", 1);
    const be = $("#btnEvent");
    be.hidden = !curEvent;
    if (curEvent && be.dataset.ev !== curEvent) { be.dataset.ev = curEvent; be.innerHTML = icon(`ev:${evBase()}:ikon`, 1); be.title = D.events[curEvent].name; }
    const bt = $("#btnBoost");
    bt.hidden = C().stage < 2;
    const now = Date.now();
    if (boostOn()) { bt.disabled = true; bt.innerHTML = `${icon("ui:boost_rempi", 1)}X2 ${Math.ceil((S.boostUntil - now) / 1000)}s`; }
    else if (now < S.boostReady) { bt.disabled = true; bt.innerHTML = `${icon("ui:boost_rempi", 1)}${Math.ceil((S.boostReady - now) / 1000)}s`; }
    else { bt.disabled = false; bt.innerHTML = `${icon("ui:boost_rempi", 1)}BOOST`; }
  }

  let toastTimer;
  function showToast(ic, title, body) {
    const t = $("#toast");
    t.innerHTML = `${icon(ic, 1.5)}<div><b>${title}</b>${body || ""}</div>`;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3800);
  }

  function modal(title, ribbon, body, closable = true) {
    $("#modalBox").innerHTML = `<div class="bar-title">${title}${closable ? `<button class="x" data-act="close" aria-label="Tutup"><img src="kit/tutup.png" width="36" height="36" alt=""></button>` : ""}</div>
      <div class="modal-body">${ribbon ? `<div class="ribbon-wrap"><div class="k-ribbon"><span class="h-title">${ribbon}</span></div></div>` : ""}${body}</div>`;
    $("#modal").hidden = false;
  }
  const closeModal = () => { $("#modal").hidden = true; };

  function openMap() {
    modal("Peta", "EKSPANSI KOTA", D.cityOrder.map((c, i) => {
      const cs = S.cities[c], here = c === S.city;
      const starters = D.menu[c].menu.filter((m) => m.stage === 1 && m.unlock === "stage");
      const btn = here ? `<button class="btn off" disabled>DI SINI</button>` :
        cs.unlocked ? `<button class="btn blue" data-act="goto" data-city="${c}">PINDAH</button>` :
          `<button class="btn gold" data-act="buycity" data-city="${c}" data-cost="${CITY_COST[i]}">${fmt(CITY_COST[i])}${icon("ui:koin", 1)}</button>`;
      return cardShell({
        cls: cs.unlocked ? "" : "dim",
        portrait: icon(`ui:kota_${c}`, 2) + starters.map((m) => icon(`food:${c}:${m.id}`, 1)).join(""),
        name: D.cities[c].name, sub: D.cities[c].culture, btn,
        lv: cs.unlocked ? `S${cs.stage}` : "",
        stats: `<div class="sub">${D.cities[c].landmark}</div><div class="sub">Mulai: ${starters.map((m) => m.name).join(", ")}</div>`,
      });
    }).join(""));
    refresh();
  }

  function openSettings() {
    modal("Pengaturan", "OPSI", `<div class="k-card">
      <label class="switch" for="eggBoost"><span>Perbanyak pelanggan langka (mode tes, x25)</span>
      <input type="checkbox" id="eggBoost" ${S.eggBoost ? "checked" : ""}></label>
      <label class="switch" for="forceTod"><span>Waktu</span>
      <select id="forceTod">${["", "pagi", "siang", "sore", "malam"].map((v) =>
        `<option value="${v}" ${(S.forceTod || "") === v ? "selected" : ""}>${v || "ikuti siklus"}</option>`).join("")}</select></label>
      <label class="switch" for="forceRain"><span>Paksa hujan</span>
      <input type="checkbox" id="forceRain" ${S.forceRain ? "checked" : ""}></label>
      <label class="switch" for="sound"><span>Efek suara</span>
      <input type="checkbox" id="sound" ${S.mute ? "" : "checked"}></label>
      <label class="switch" for="forceEvent"><span>Hari besar</span>
      <select id="forceEvent">${[["", "ikut tanggal"], ["none", "matikan"], ...Object.entries(D.events).map(([k, e]) => [k, e.name])].map(([v, n]) =>
        `<option value="${v}" ${(S.forceEvent || "") === v ? "selected" : ""}>${n}</option>`).join("")}</select></label></div>
      <p style="font-size:13px">${Object.values(D.events).map((e) => `<b>${e.name}</b>: ${e.tanggal}`).join("<br>")}</p>
      <p>Progres tersimpan di browser ini saja.</p>
      <button class="btn red wide" data-act="reset">MULAI ULANG</button>`);
    $("#eggBoost").addEventListener("change", (e) => { S.eggBoost = e.target.checked; save(); });
    $("#forceTod").addEventListener("change", (e) => { S.forceTod = e.target.value || null; save(); });
    $("#forceRain").addEventListener("change", (e) => { S.forceRain = e.target.checked; save(); });
    $("#sound").addEventListener("change", (e) => { S.mute = !e.target.checked; save(); refresh(); Sfx.play("click"); });
    $("#forceEvent").addEventListener("change", (e) => {
      S.forceEvent = e.target.value || null; save();
      curEvent = undefined; checkEvent(true); customers = []; walkers = []; cooking = null;
    });
  }

  function confirmReset() {
    modal("Konfirmasi", "HAPUS PROGRES?", `<p>Koin, kota, menu dan karyawan akan kembali ke awal.</p>
      <div class="row2"><button class="btn blue" data-act="close">BATAL</button><button class="btn red" data-act="doreset">HAPUS</button></div>`);
  }

  function offlinePopup(secs) {
    const gain = Math.floor(estRate() * Math.min(secs, 8 * 3600) * 0.5);
    if (gain < 1 || secs < 30) return;
    const h = Math.floor(secs / 3600), m = Math.floor(secs % 3600 / 60);
    modal("Selamat datang", "HASIL JUALAN", `<p>Selama kamu pergi (${h ? h + " jam " : ""}${m} menit), gerobakmu tetap jualan:</p>
      <div class="big">${icon("ui:koin_tumpuk", 2)}+${fmt(gain)}</div>
      <div class="row2"><button class="btn" data-act="offline" data-x="1" data-gain="${gain}">AMBIL</button>
      <button class="btn purple" data-act="offline" data-x="2" data-gain="${gain}">X2${icon("ui:iklan_bonus", 1)}</button></div>
      <p style="font-size:13px">Tombol X2 di prototipe ini tidak memutar iklan.</p>`, false);
  }

  // ------------------------------------------------------------------ actions
  function act(el) {
    const a = el.dataset.act;
    const it = el.dataset.id && menuOf().find((i) => i.id === el.dataset.id);
    if (a === "upgrade") {
      const cost = upgradeCost(it);
      if (S.coins < cost) return;
      S.coins -= cost; itemState(it).lv = level(it) + 1; S.stats.upgrades++;
      Sfx.play("upgrade");
    } else if (a === "unlock") {
      if (S.coins < it.unlock_cost) return;
      S.coins -= it.unlock_cost; itemState(it).bought = true; itemState(it).lv = 1; S.stats.unlocks++;
      Sfx.play("buy");
      showToast(`food:${S.city}:${it.id}`, `${it.name} terbuka!`, it.tier !== "biasa" ? ` Menu ${it.tier} siap dijual.` : "");
    } else if (a === "staff") {
      const k = el.dataset.id, cost = staffCost(k);
      if (S.coins < cost) return;
      S.coins -= cost; if (S.staff[k] === 0) S.stats.unlocks++; S.staff[k]++;
      Sfx.play("buy");
    } else if (a === "stageup") {
      const s = C().stage;
      if (C().earned < stageReq(s) || activeItems().length < s + 1) return;
      C().stage = s + 1; S.gems += s * 2; customers = []; walkers = []; cooking = null;
      Sfx.play("stage");
      showToast(`ui:${STAGE_BADGE[s + 1]}`, `Naik kelas: ${STAGE_LABEL[s + 1]}!`, ` +${s * 2} Bintang Rasa. Menu baru terbuka.`);
    } else if (a === "claim") {
      const i = +el.dataset.i, m = S.missions[i];
      if (missionProg(m) < 1) return;
      if (m.reward.gems) S.gems += m.reward.gems; else earn(m.reward.coins);
      S.missions.splice(i, 1); ensureMissions();
      Sfx.play("coin");
    } else if (a === "buycity") {
      const c = el.dataset.city, cost = +el.dataset.cost;
      if (S.coins < cost) return;
      S.coins -= cost; S.cities[c].unlocked = true; S.city = c; customers = []; walkers = []; cooking = null; closeModal();
      Sfx.play("stage"); checkEvent(true);
      showToast(`ui:kota_${c}`, `Selamat datang di ${D.cities[c].name}!`, " Mulai lagi dari gerobak dengan menu khas kota ini.");
    } else if (a === "goto") {
      S.city = el.dataset.city; customers = []; walkers = []; cooking = null; closeModal();
      Sfx.play("click"); checkEvent(true);
    } else if (a === "close") { Sfx.play("click"); closeModal(); return; }
    else if (a === "reset") { Sfx.play("click"); confirmReset(); return; }
    else if (a === "doreset") { S = freshState(); ensureMissions(); closeModal(); save(); renderPanel(); return; }
    else if (a === "offline") { earn(+el.dataset.gain * +el.dataset.x); closeModal(); Sfx.play("coin"); }
    save();
    renderPanel();
  }

  // ------------------------------------------------------------------ boot
  function fit() {
    const app = $("#app");
    const z = Math.min(app.clientWidth / W, Math.max(200, app.clientHeight * 0.58) / H);
    zoom = z >= 2 ? Math.floor(z) : Math.max(1, z);
    view.width = Math.round(W * zoom); view.height = Math.round(H * zoom);
    view.style.width = view.width + "px"; view.style.height = view.height + "px";
  }

  function start(prev) {
    view = $("#scene"); vctx = view.getContext("2d");
    S = prev || load() || freshState();
    D.cityOrder.forEach((c, i) => { S.cities[c] ||= { unlocked: i === 0, stage: 1, earned: 0, items: {} }; });
    ensureMissions();
    renderTabs(); renderPanel(); fit();
    $("#btnMap").innerHTML = icon("ui:peta", 1);
    $("#btnSettings").innerHTML = icon("ui:pengaturan", 1);
    window.addEventListener("resize", fit);
    document.addEventListener("pointerdown", () => Sfx.arm(), { once: true, capture: true });
    $("#btnSound").addEventListener("click", () => { S.mute = !S.mute; save(); refresh(); Sfx.play("click"); });
    $("#btnEvent").addEventListener("click", () => { Sfx.arm(); announceEvent(); });
    checkEvent(false);
    setInterval(() => checkEvent(true), 60000);
    if (curEvent) setTimeout(announceEvent, 1200);
    view.addEventListener("pointerdown", (e) => {
      const r = view.getBoundingClientRect();
      const gx = (e.clientX - r.left) / r.width * W, gy = (e.clientY - r.top) / r.height * H;
      // yang lewat bisa diklik: hewan dapat love, orang/kendaraan menyapa balik
      const hit = [...walkers].reverse().find((w) => gx > w.x - 4 && gx < w.x + w.d.w + 4 &&
        gy > w.d.lane - w.d.h - 6 && gy < w.d.lane + 4);
      if (hit) {
        const cx = clamp(hit.x + hit.d.w / 2, 30, W - 30);
        const animal = PETS[hit.kind] || hit.d.pet;
        if (hit.kind === "kucing") { hit.state = "sit"; hit.st = 0; }
        if (hit.kind === "ayam") { hit.state = "peck"; hit.st = 0; }
        if (animal) {
          for (let i = 0; i < 4; i++) parts.push({ k: "heart", x: cx - 3 + rand(-6, 6), y: hit.d.lane - hit.d.h - 2 - i * 3, t: -i * 0.12, dx: i });
          Sfx.play(PET_SND[hit.kind] || "heart");
        } else Sfx.play(hit.d.snd || "horn");
        const label = animal || hit.d.tapSay || hit.d.say || "HALO!";
        if (!hit.petted) {
          hit.petted = true;
          const bonus = Math.max(1, Math.round(estRate() * 3));
          earn(bonus);
          texts.push({ s: `${label} +${fmt(bonus)}`, x: cx, y: hit.d.lane - hit.d.h + 8, t: 0, col: "#ffb0d8" });
        } else texts.push({ s: label, x: cx, y: hit.d.lane - hit.d.h + 8, t: 0, col: "#fbf0d8" });
      } else tap(gx, gy, false);
      refresh();
    });
    $("#tabs").addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]");
      if (!b) return;
      tab = +b.dataset.tab; renderTabs(); renderPanel(); Sfx.play("click");
    });
    document.addEventListener("click", (e) => { const b = e.target.closest("[data-act]"); if (b && !b.disabled) act(b); });
    $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
    $("#btnMap").addEventListener("click", () => { Sfx.play("click"); openMap(); });
    $("#btnSettings").addEventListener("click", () => { Sfx.play("click"); openSettings(); });
    $("#btnBoost").addEventListener("click", () => {
      if (boostOn() || Date.now() < S.boostReady) return;
      S.boostUntil = Date.now() + 30000; S.boostReady = Date.now() + 120000;
      showToast("rempi:senang", "Rempi bersemangat!", " Pendapatan X2 selama 30 detik.");
      Sfx.play("boost");
      save();
    });
    if (!prev) offlinePopup((Date.now() - (S.last || Date.now())) / 1000);
    $("#loading").hidden = true;
    let last = performance.now(), acc = 0;
    function frame(now) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      update(dt);
      draw(now);
      acc += dt;
      if (acc > 0.25) { acc = 0; refresh(); }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    setInterval(save, 5000);
    window.addEventListener("pagehide", save);
    window.claude?.hot?.snapshot?.(() => ({ state: S }));
  }

  fetch("data.json").then((r) => r.json()).then((data) => {
    D = data;
    return Promise.all(D.sheets.map((src) => new Promise((ok, bad) => {
      const im = new Image(); im.onload = () => ok(im); im.onerror = bad; im.src = src;
    })));
  }).then((ims) => {
    sheets = ims;
    const hot = window.claude?.hot;
    const boot = (d) => start(d && d.state ? d.state : null);
    if (hot?.ready) hot.ready(boot); else boot(hot?.data);
  }).catch((e) => {
    $("#loading").textContent = "GAGAL MEMUAT ASET: " + e;
  });
})();
