"""Gabung semua segmen guide/*.md jadi satu halaman HTML (sidebar per segmen)."""
import json, pathlib, re, html, base64
root = pathlib.Path(__file__).resolve().parent.parent
segs = []
for p in sorted(root.glob('[0-9][0-9]-*.md')):
    txt = p.read_text(encoding='utf-8')
    title = re.search(r'^# (.+)$', txt, re.M).group(1)
    def img(m):
        f = (root / m.group(2)).resolve()
        return '![%s](data:image/png;base64,%s)' % (m.group(1), base64.b64encode(f.read_bytes()).decode())
    txt = re.sub(r'!\[([^\]]*)\]\(([^)]+\.png)\)', img, txt)
    segs.append({'id': p.stem, 'file': p.name, 'title': title, 'md': txt})
groups = [('00', 'Dasar'), ('1', 'NPC utama cewek'), ('2', 'NPC utama cowok'), ('3', 'NPC pendukung & dunia'),
          ('4', 'Obrolan & konsekuensi'), ('5', 'Pelajaran'), ('6', 'Upgrade & uang'), ('7', 'Animasi'), ('8', 'Peta & interior')]
data = json.dumps(segs, ensure_ascii=False).replace('</', '<\\/')
page = r'''<!DOCTYPE html>
<html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lonceng Pulang: Guide Desain</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Lora:wght@600;700&display=swap" rel="stylesheet">
<script>__MARKED__</script>
<style>
:root{--bg:#faf7f1;--panel:#f1ebe0;--ink:#2b2622;--mut:#7a6f64;--acc:#b5532f;--line:#e2d8c8;--code:#efe7da}
@media (prefers-color-scheme:dark){:root{--bg:#1d1a17;--panel:#25211d;--ink:#ece4d8;--mut:#a39888;--acc:#e48a62;--line:#3a332c;--code:#2d2823}}
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{font:15px/1.6 Inter,system-ui,sans-serif;background:var(--bg);color:var(--ink);display:flex}
nav{width:270px;flex:none;background:var(--panel);border-right:1px solid var(--line);overflow-y:auto;height:100vh;position:sticky;top:0;padding:18px 12px}
nav h1{font:700 19px Lora,serif;margin:0 8px 2px}nav .sub{color:var(--mut);font-size:12px;margin:0 8px 12px}
nav input{width:100%;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);margin-bottom:10px;font:inherit}
nav .g{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);margin:14px 8px 4px}
nav a{display:block;padding:5px 8px;border-radius:6px;color:var(--ink);text-decoration:none;font-size:14px}
nav a:hover{background:var(--line)}nav a.on{background:var(--acc);color:#fff}
nav a .n{display:inline-block;width:24px;color:var(--mut);font-variant-numeric:tabular-nums}nav a.on .n{color:#fff}
main{flex:1;overflow-y:auto;height:100vh}
article{max-width:880px;margin:0 auto;padding:36px 40px 80px}
.file{color:var(--mut);font-size:12px;font-family:ui-monospace,monospace}
h1,h2,h3{font-family:Lora,serif;line-height:1.3}h1{font-size:30px;margin:.2em 0 .6em}h2{font-size:22px;margin-top:1.8em;border-bottom:1px solid var(--line);padding-bottom:4px}h3{font-size:17px;margin-top:1.4em}
table{border-collapse:collapse;width:100%;margin:12px 0;font-size:14px;display:block;overflow-x:auto}
th,td{border:1px solid var(--line);padding:6px 9px;text-align:left;vertical-align:top}th{background:var(--panel)}
code{background:var(--code);padding:1px 5px;border-radius:4px;font-size:13px}
pre{background:var(--code);padding:12px 14px;border-radius:8px;overflow-x:auto;white-space:pre-wrap;position:relative}pre code{background:none;padding:0}
pre button{position:absolute;top:6px;right:6px;font:12px Inter;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:6px;padding:2px 8px;cursor:pointer}
blockquote{border-left:3px solid var(--acc);margin:10px 0;padding:2px 14px;color:var(--mut);font-style:italic}
a{color:var(--acc)}article img{max-width:100%;height:auto;border:1px solid var(--line);border-radius:8px;background:#fff;cursor:zoom-in}
#zoom{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:20;overflow:auto;cursor:zoom-out}#zoom.on{display:block}#zoom img{display:block;margin:20px auto;max-width:none;border:none}.pn{display:flex;justify-content:space-between;margin-top:40px;gap:12px}.pn a{padding:8px 12px;border:1px solid var(--line);border-radius:8px;text-decoration:none}
#menu{display:none}
@media (max-width:760px){body{display:block}nav{position:fixed;z-index:5;transform:translateX(-100%);transition:.2s}nav.open{transform:none}
#menu{display:block;position:fixed;top:10px;left:10px;z-index:6;border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:8px;padding:6px 10px;font:inherit}
article{padding:56px 18px 60px}main{height:auto}}
</style></head><body>
<button id="menu">☰ Segmen</button>
<nav id="nav"><h1>Lonceng Pulang</h1><div class="sub">Guide desain · __N__ segmen</div>
<input id="q" placeholder="Cari di semua segmen..." aria-label="Cari"><div id="list"></div></nav>
<div id="zoom"></div><main id="main"><article id="doc"></article></main>
<script>
const SEGS=__DATA__;const GROUPS=__GROUPS__;
const list=document.getElementById('list'),doc=document.getElementById('doc'),q=document.getElementById('q'),nav=document.getElementById('nav');
function grp(id){for(let i=GROUPS.length-1;i>=0;i--){if(id.startsWith(GROUPS[i][0])||(GROUPS[i][0]==='00'&&id<'10'))return GROUPS[i][1]}return''}
function render(f){list.innerHTML='';let last='';const t=f.toLowerCase();
 SEGS.forEach(s=>{if(t&&!s.md.toLowerCase().includes(t))return;const g=grp(s.id);if(g!==last){const d=document.createElement('div');d.className='g';d.textContent=g;list.appendChild(d);last=g}
 const a=document.createElement('a');a.href='#'+s.id;a.innerHTML='<span class="n">'+s.id.slice(0,2)+'</span>'+s.title.replace(/^\d+\.\s*/,'');if(s.id===cur())a.className='on';list.appendChild(a)})}
function cur(){const h=location.hash.slice(1);return SEGS.some(s=>s.id===h)?h:SEGS[0].id}
function show(){const id=cur(),i=SEGS.findIndex(s=>s.id===id),s=SEGS[i];
 doc.innerHTML='<div class="file">guide/'+s.file+'</div>'+marked.parse(s.md);
 doc.querySelectorAll('thead tr').forEach(r=>{if(![...r.cells].some(c=>c.textContent.trim()))r.parentElement.remove()});
 doc.querySelectorAll('pre').forEach(p=>{const b=document.createElement('button');b.textContent='Salin';b.onclick=()=>{navigator.clipboard.writeText(p.innerText.replace(/Salin$/,'')).then(()=>b.textContent='Tersalin',()=>b.textContent='Gagal')};p.appendChild(b)});
 const pv=SEGS[i-1],nx=SEGS[i+1];doc.insertAdjacentHTML('beforeend','<div class="pn">'+(pv?'<a href="#'+pv.id+'">← '+pv.title+'</a>':'<span></span>')+(nx?'<a href="#'+nx.id+'">'+nx.title+' →</a>':'')+'</div>');
 const t=q.value.trim();if(t){const w=document.createTreeWalker(doc,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n.nodeValue.toLowerCase().includes(t.toLowerCase())){n.parentElement.scrollIntoView({block:'center'});break}}}else document.getElementById('main').scrollTop=0;
 render(q.value.trim());nav.classList.remove('open')}
doc.addEventListener('click',e=>{if(e.target.tagName==='IMG'){const z=document.getElementById('zoom');z.innerHTML='';z.appendChild(e.target.cloneNode());z.classList.add('on')}});document.getElementById('zoom').onclick=e=>e.currentTarget.classList.remove('on');
q.oninput=()=>render(q.value.trim());document.getElementById('menu').onclick=()=>nav.classList.toggle('open');
addEventListener('hashchange',show);show();
</script></body></html>'''
marked_js = (pathlib.Path(__file__).resolve().parent / 'marked.min.js').read_text(encoding='utf-8')
page = page.replace('__MARKED__', marked_js).replace('__DATA__', data).replace('__GROUPS__', json.dumps(groups, ensure_ascii=False)).replace('__N__', str(len(segs)))
out = pathlib.Path(__file__).resolve().parent / 'index.html'
out.write_text(page, encoding='utf-8')
print(out, len(page), len(segs))
