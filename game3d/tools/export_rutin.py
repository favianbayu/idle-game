"""Ekspor rutinitas NPC, kado, dan event hati dari guide (docs/desain-sma/guide/data/npc.json + segmen tokoh)
ke game3d/src/data/rutin.json versi ringkas.

Pakai: python tools/export_rutin.py <folder guide> src/data/rutin.json
"""
import json, os, re, sys

GUIDE, OUT = sys.argv[1], sys.argv[2]
RAKA = os.path.join(os.path.dirname(__file__), '..', 'src', 'raka')
d = json.load(open(os.path.join(GUIDE, 'data', 'npc.json'), encoding='utf-8'))

# id guide -> sid game (logika) dan file model fine-voxel (untuk daftar outfit)
SID = {'om_darto': 'omDarto', 'jaka': 'bangJaka', 'narti': 'buNarti', 'pak_rt': 'rtSlamet', 'ujang': 'pakUjang', 'iyah': 'makIyah',
       'hartini': 'buHartini', 'ratna': 'buRatna', 'hendro': 'pakHendro', 'wawan': 'pakWawan', 'sinta': 'buSinta', 'anton': 'mrAnton',
       'gunadi': 'pakGunadi', 'melati': 'buMelati', 'kyai_mahfud': 'kyaiMahfud', 'abah_karta': 'abahKarta', 'serma_hadi': 'sermaHadi',
       'sudarmaji': 'pakSudarmaji', 'wak_kodir': 'wakKodir', 'romlah': 'buRomlah', 'kang_ujo': 'kangUjo', 'mandor_sabar': 'mandorSabar',
       'pak_yusuf': 'pakYusuf', 'mbak_sri': 'mbakSri', 'mbah_darmo': 'mbahDarmo', 'nek_sumi': 'nekSumi', 'neng_ayu': 'nengAyu'}
FILE = {'om_darto': 'darto', 'pak_rt': 'rtslamet', 'kyai_mahfud': 'mahfud', 'abah_karta': 'karta', 'serma_hadi': 'hadi', 'wak_kodir': 'kodir',
        'kang_ujo': 'ujo', 'mandor_sabar': 'sabar', 'pak_yusuf': 'yusuf', 'mbak_sri': 'sri', 'mbah_darmo': 'darmo', 'nek_sumi': 'sumi', 'neng_ayu': 'ayu'}
SYN = {'sekolah': ['seragam', 'sekolah', 'kemeja', 'dinas', 'korpri', 'kebaya', 'lab', 'jaga'], 'rumah': ['rumah', 'santai', 'piama', 'daster', 'teras', 'darat'],
       'jalan': ['jalan', 'santai', 'denim', 'kaus'], 'olahraga': ['olahraga', 'basket', 'latihan', 'futsal', 'jogging'], 'kerja': ['kerja', 'bengkel', 'toko', 'jualan', 'warung', 'kios'],
       'geng': ['geng', 'lampu', 'nongkrong'], 'balap': ['balap'], 'ngaji': ['ngaji', 'pengajian', 'koko'], 'tidur': ['piama', 'rumah', 'santai']}

# baju guide yang tidak punya padanan langsung di model: dipilih manual dari OUTFITS model
OVR = {'nadia': {'olahraga': 'jalan'}, 'laras': {'malam': 'jalan'}, 'sasha': {'rumah': 'jalan', 'rahasia': 'malam'}, 'arga': {'rumah': 'kerja'},
       'jojo': {'kerja': 'liputan'}, 'bram': {'basket': 'rumah', 'resmi': 'seragam'}, 'om_darto': {'malam': 'santai'}, 'bimo': {'masak': 'koki', 'rumah': 'kaus'},
       'jaka': {'kerja': 'santai'}, 'pak_rt': {'rumah': 'batik', 'kerja': 'batik'}, 'ama': {'rumah': 'dapur'}, 'rio': {'geng': 'jalan'},
       'hartini': {'kerja': 'kebaya', 'rumah': 'kebaya'}, 'ratna': {'kerja': 'blazer'}, 'hendro': {'kerja': 'olahraga', 'rumah': 'batik'},
       'wawan': {'kerja': 'pns', 'rumah': 'batik'}, 'sinta': {'kerja': 'kardigan', 'rumah': 'gamis'}, 'anton': {'kerja': 'kemeja', 'rumah': 'denim'},
       'gunadi': {'kerja': 'rompi', 'rumah': 'kardigan'}, 'melati': {'kerja': 'etnik'}, 'kyai_mahfud': {'rumah': 'koko'}, 'abah_karta': {'silat': 'pangsi'},
       'sudarmaji': {'kerja': 'dinas'}, 'kang_ujo': {'kerja': 'basecamp'}, 'mandor_sabar': {'kerja': 'kebun'}, 'pak_yusuf': {'kerja': 'raceControl'},
       'mbak_sri': {'kerja': 'shift', 'rumah': 'kos'}, 'mbah_darmo': {'rumah': 'pagi'}, 'nek_sumi': {'rumah': 'jamu'}, 'tito': {'rumah': 'bola'}, 'neng_ayu': {'rumah': 'jaket'}}
# kata di teks kegiatan yang langsung memilih baju khusus model (ronda malam, latihan, liputan, rapat, ...)
KW = ['ronda', 'latihan', 'silat', 'liputan', 'pensi', 'rapat', 'wasit', 'senam', 'debat', 'tinju', 'osis', 'lab', 'sawah', 'jamu', 'shift', 'dapur', 'koki', 'wasit']
GURU = {'hartini', 'ratna', 'hendro', 'wawan', 'sinta', 'anton', 'gunadi', 'melati'}

def model_outfits(gid):
    f = os.path.join(RAKA, FILE.get(gid, gid) + '.js')
    if not os.path.exists(f): return []
    src = open(f, encoding='utf-8').read()
    m = re.search(r'export const OUTFITS = \{(.*?)\n\};', src, re.S)
    return re.findall(r'^  ([a-zA-Z]+): \{', m.group(1), re.M) if m else []

def pick_outfit(key, have):
    if not have: return None
    if key in have: return key
    for s in SYN.get(key, []):
        if s in have: return s
    for s in have:
        if s.startswith(key[:4]) or key.startswith(s[:4]): return s
    return None

def area(t):
    if t.startswith('sma'): return 'sma'
    p = d['tempat'][t]
    return 'kota' if 0 <= p['x'] <= 260 and 0 <= p['y'] <= 180 else 'luar'

mins = lambda s: int(s[:2]) * 60 + int(s[3:5])
out = {'t': {k: [v['x'], v['y'], area(k), v['nama']] for k, v in d['tempat'].items()}, 'n': {}, 'S': [], 'k': {}, 'i': {}, 'e': []}
seen = {}
for gid, n in d['npc'].items():
    have = model_outfits(gid)
    outm = {k: OVR.get(gid, {}).get(k) or pick_outfit(k, have) for k in n['outfit']}
    o = {'sid': SID.get(gid, gid), 'nama': n['nama'], 'rumah': n['rumah'], 'moda': n['moda'], 'out': outm, 'd': {}}
    def row_out(day, s):
        keg = s['kegiatan'].lower()
        if s['outfit'] in ('kerja', 'sekolah'):   # guru: Senin batik Korpri, Jumat batik
            if day == 'Sen' and 'korpri' in have: return 'korpri'
            if day == 'Jum' and gid in GURU and 'batik' in have: return 'batik'
        for k in KW if not re.match(r'(rumah|kos|mes_|apartemen)', s['tempat']) else []:
            if k in have and re.search(r'\b' + k, keg): return k
        return None
    for day, slots in n['jadwal'].items():
        rows = [[mins(s['mulai']), mins(s['selesai']), s['tempat'], s['anim'], s['outfit'], s['kegiatan'],
                 (s['rute'] or {}).get('moda'), (s['rute'] or {}).get('menit', 0)] + ([row_out(day, s)] if row_out(day, s) else []) for s in slots]
        key = json.dumps(rows, ensure_ascii=False)
        if key not in seen: seen[key] = len(out['S']); out['S'].append(rows)
        o['d'][day] = seen[key]
    out['n'][gid] = o
    k = n.get('kado') or {}
    out['k'][gid] = [k.get('favorit', []), k.get('suka', []), k.get('biasa', []), k.get('benci', []), k.get('catatan', '')]
out['i'] = {k: [v['nama'], v['harga'], v['toko'], v['kategori']] for k, v in d['item'].items()}

# teks adegan & pilihan dari segmen tokoh
seg_text = {}
for f in os.listdir(GUIDE):
    m = re.match(r'(\d\d)-.*\.md$', f)
    if m: seg_text[int(m.group(1))] = open(os.path.join(GUIDE, f), encoding='utf-8').read()
clean = lambda s: re.sub(r'\s+', ' ', re.sub(r'[*`_]', '', s)).strip()

def scene(ev):
    txt = seg_text.get(ev['segmen'], ''); title = ev['judul'].split(' / ')[0]
    # format tokoh utama: ### N hati: "Judul" + Adegan + Pilihan
    m = re.search(r'###\s*%d hati:[^\n]*"%s' % (ev['hati'], re.escape(title)), txt)
    if m:
        blk = txt[m.end():].split('\n###')[0].split('\n## ')[0]
        ad = re.search(r'\*\*Adegan[^*]*\*\*:(.*?)(?=\n- \*\*|\Z)', blk, re.S); pl = re.search(r'\*\*Pilihan\*\*:(.*?)(?=\n- \*\*|\Z)', blk, re.S)
        ch = [[clean(c[0]), int(c[1])] for c in re.findall(r'"([^"]+)"\s*\(([+-]\d+)', pl.group(1))] if pl else []
        if pl and not ch:   # 8 hati: pilihan jalur (romance / sahabat), tanpa poin
            ch = [[clean(re.sub(r'\s*\([^)]*\)\s*$', '', c)).strip('"'), 0] for c in re.split(r'\s+/\s+', clean(pl.group(1)).rstrip('.'))]
        hs = re.search(r'\*\*Hasil\*\*:(.*?)(?=\n- \*\*|\Z)', blk, re.S)
        return (clean(ad.group(1)) if ad else '') + (' Hasil: ' + clean(hs.group(1)) if hs and ev['hati'] >= 8 else ''), ch
    # format pendukung: N: "Judul". teks   atau   N "Judul" (teks)
    m = re.search(r'%d:?\s*"%s"[.,]?\s*' % (ev['hati'], r'\s+'.join(map(re.escape, title.split()))), txt)
    if m:
        rest = txt[m.end():]
        if rest.startswith('('): t = rest[1:rest.find(')')]
        else: t = re.split(r'\n\s*- \d:|\n- \*\*|\n##|,?\s*\d "', rest)[0]
        return clean(t)[:420], []
    return '', []

for ev in d['event']:
    ad, ch = scene(ev)
    j0, j1 = ev['jam'].split('-') if ev.get('jam') else ('00.00', '24.00')
    out['e'].append([ev['npc'], ev['hati'], ev['judul'], ev['tempat'], ev['hari'], mins(j0), mins(j1) if j1 != '00.30' else 24 * 60 + 30, ev['bab_min'], ev['syarat'], ad, ch])

json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(OUT, os.path.getsize(OUT), 'bytes,', len(out['n']), 'npc,', len(out['S']), 'jadwal unik,', len(out['e']), 'event,',
      sum(1 for e in out['e'] if e[9]), 'dengan adegan')
