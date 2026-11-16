// Uang jajan & belanja: dompet pemain (Rupiah), jendela toko (beli = langsung dimakan/dipakai, efek ke nyawa & nyali),
// jual ikan hasil mancing, dan daftar dagangan tiap jenis toko (Indomurah, warung, gerobak jajanan).
const rp = n => 'Rp' + n.toLocaleString('id-ID');
export const FISH_PRICE = { Nila: 8000, Mujair: 6000, Lele: 7000, 'Ikan mas': 12000, Gurame: 18000, Patin: 15000 };
// [nama, harga, efek { hp, ny }, ikon warna]
export const CATALOG = {
  indomurah: [['Roti sobek cokelat', 8000, { hp: 4 }, '#c8843a'], ['Susu kotak stroberi', 6000, { hp: 3 }, '#f28ab0'], ['Teh botol dingin', 5000, { hp: 2 }, '#3a8a4a'],
    ['Air mineral 600ml', 4000, { hp: 2 }, '#7ac0e8'], ['Mi cup pedas', 7000, { hp: 4 }, '#e8302a'], ['Kopi kaleng', 9000, { ny: 15 }, '#5a3a22'], ['Cokelat batang', 7000, { hp: 2, ny: 5 }, '#6a3a1a'],
    ['Minuman isotonik', 7000, { hp: 3, ny: 5 }, '#3a7ac0'], ['Es krim cone', 8000, { hp: 2 }, '#f2e2b0'], ['Plester luka', 5000, { hp: 5 }, '#e8c8a0']],
  warung: [['Es teh manis', 3000, { hp: 2 }, '#c8782a'], ['Gorengan bakwan', 1000, { hp: 1 }, '#d8a040'], ['Pisang goreng', 2000, { hp: 1 }, '#e8b040'], ['Kerupuk', 1000, { hp: 1 }, '#f2e2b0'],
    ['Kopi sachet seduh', 3000, { ny: 8 }, '#4a2a1a'], ['Mi rebus telur', 9000, { hp: 5 }, '#f2c230'], ['Nasi bungkus', 10000, { hp: 6 }, '#8ab85a'], ['Permen jahe', 500, {}, '#e8e0c0']],
  bakso: [['Bakso urat', 12000, { hp: 6 }, '#a87a5a'], ['Bakso kecil', 8000, { hp: 4 }, '#a87a5a'], ['Es jeruk', 4000, { hp: 2 }, '#f2a22a']],
  siomay: [['Siomay komplit', 10000, { hp: 5 }, '#d8c8a0'], ['Batagor', 8000, { hp: 4 }, '#d8a040']],
  cendol: [['Es cendol', 6000, { hp: 3 }, '#5ab85a'], ['Es doger', 7000, { hp: 3 }, '#f28ab0']],
  gorengan: [['Tahu isi', 1000, { hp: 1 }, '#e8c870'], ['Tempe mendoan', 1000, { hp: 1 }, '#c8a050'], ['Cireng', 1000, { hp: 1 }, '#f2e2c0'], ['Risol', 2000, { hp: 1 }, '#d89040']],
  martabak: [['Martabak manis cokelat', 25000, { hp: 8, ny: 10 }, '#6a3a1a'], ['Martabak telor', 22000, { hp: 8 }, '#e8c050']],
  cilok: [['Cilok bumbu kacang', 5000, { hp: 3 }, '#e8e0d0'], ['Cimol', 5000, { hp: 2 }, '#f2f2e8']],
  sate: [['Sate ayam 10 tusuk', 15000, { hp: 6 }, '#a8582a'], ['Lontong', 3000, { hp: 2 }, '#8ab85a']],
  bengkel: [['Servis sepeda onthel (+10% laju)', 30000, { up: 'sepeda' }, '#2f5a3e'], ['Ganti knalpot & karbu motor (+10% laju)', 75000, { up: 'motor' }, '#c83a3a'], ['Ganti oli motor', 35000, {}, '#c8a020'], ['Tambal ban', 10000, {}, '#1a1a1a']],
  kopi: [['Kopi tubruk Om Darto', 0, { ny: 10 }, '#3a2214'], ['Teh tubruk', 0, { hp: 2 }, '#a85a2a']],
};

export function makeShop({ player, toast, fight }) {
  player.uang ??= 25000;
  const css = document.createElement('style');
  css.textContent = `#shop{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,360px);max-height:84vh;overflow:auto;background:#fffbe8;color:#2a2014;border:3px solid #2a2014;border-radius:10px;padding:10px 12px;display:none;z-index:21;font:13px 'Trebuchet MS',system-ui,sans-serif}
  #shop h3{margin:0 0 2px;font-size:16px}#shop .sub{font-size:11px;opacity:.75;margin-bottom:6px}#shop .it{display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #e6dcc0}
  #shop .ic{width:18px;height:18px;border-radius:4px;border:2px solid #2a2014;flex:none}#shop .nm{flex:1}#shop .ef{font-size:10px;opacity:.7}#shop button{padding:3px 8px;font-size:12px}#shop .x{position:absolute;right:8px;top:6px}
  #money{position:fixed;left:max(12px,env(safe-area-inset-left));top:calc(max(12px,env(safe-area-inset-top)) + 34px);background:rgba(30,26,18,.65);color:#ffe9a0;font:bold 12px 'Trebuchet MS',system-ui;padding:3px 8px;border-radius:6px;pointer-events:none}`;
  document.head.appendChild(css);
  const el = document.createElement('div'); el.id = 'shop'; document.body.appendChild(el);
  const money = document.createElement('div'); money.id = 'money'; document.body.appendChild(money);
  el.addEventListener('pointerdown', e => e.stopPropagation());
  let cur = null;
  const showMoney = () => { money.textContent = '💰 ' + rp(player.uang); };
  function apply(ef) {
    const fx = player.fx; if (!fx) return;
    if (ef.hp) fx.hp = Math.min(fight.maxHP(), fx.hp + ef.hp);
    if (ef.ny) fx.nyali = Math.min(100, fx.nyali + ef.ny);
    if (ef.up) { const u = player.upg || (player.upg = {}); u[ef.up] = Math.min(5, (u[ef.up] || 0) + 1); }
  }
  function render() {
    const { title, sub, items, sellFish } = cur;
    let h = `<button class="x">✕</button><h3>${title}</h3><div class="sub">${sub || ''} · Uangmu: <b>${rp(player.uang)}</b> · Nyawa ${Math.ceil(player.fx?.hp ?? 0)}/${fight.maxHP()}</div>`;
    items.forEach(([nm, pr, ef, c], i) => {
      const efs = [ef.hp && `+${ef.hp} nyawa`, ef.ny && `+${ef.ny} nyali`, ef.up && `level sekarang ${(player.upg || {})[ef.up] || 0}/5`].filter(Boolean).join(' · ') || 'biar awet';
      h += `<div class="it"><span class="ic" style="background:${c}"></span><span class="nm">${nm}<br><span class="ef">${efs}</span></span><b>${pr ? rp(pr) : 'gratis'}</b><button data-i="${i}" ${player.uang < pr ? 'disabled' : ''}>Beli</button></div>`;
    });
    if (sellFish) {
      const inv = player.inv || {}, fish = Object.entries(inv).filter(([k, v]) => v > 0 && FISH_PRICE[k]);
      h += `<div class="sub" style="margin-top:8px"><b>Jual ikan hasil mancing</b></div>` + (fish.length ? fish.map(([k, v]) => `<div class="it"><span class="nm">${k} × ${v}</span><b>${rp(FISH_PRICE[k])}/ekor</b><button data-f="${k}">Jual</button></div>`).join('') : '<div class="ef">Belum punya ikan. Mancing dulu di kolam pancing atau dermaga rakit.</div>');
    }
    el.innerHTML = h;
    el.querySelector('.x').addEventListener('pointerdown', e => { e.stopPropagation(); close(); });
    el.querySelectorAll('button[data-i]').forEach(b => b.addEventListener('pointerdown', e => { e.stopPropagation(); buy(+b.dataset.i); }));
    el.querySelectorAll('button[data-f]').forEach(b => b.addEventListener('pointerdown', e => { e.stopPropagation(); sell(b.dataset.f); }));
  }
  function buy(i) {
    const [nm, pr, ef] = cur.items[i]; if (player.uang < pr) { toast('Uangnya kurang...'); return; }
    player.uang -= pr; apply(ef); showMoney(); toast(`${nm} ${pr ? 'dibeli' : 'dikasih Om'}. ${cur.thanks || 'Makasih ya!'}`); render();
  }
  function sell(k) { const inv = player.inv; if (!inv[k]) return; inv[k]--; player.uang += FISH_PRICE[k]; showMoney(); toast(`${k} terjual ${rp(FISH_PRICE[k])}`); render(); }
  function open(o) { cur = o; el.style.display = 'block'; render(); }
  function close() { el.style.display = 'none'; cur = null; }
  showMoney();
  return { open, close, get isOpen() { return !!cur; }, earn(n, why) { player.uang += n; showMoney(); toast(`${why} +${rp(n)}`); }, showMoney, rp };
}
