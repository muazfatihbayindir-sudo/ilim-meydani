// src/app.html + sure verisi + PeerJS -> tek dosyalık index.html
import * as h from 'quran-meta/hafs';
import fs from 'node:fs';
import { feature } from 'topojson-client';

const qj = JSON.parse(fs.readFileSync('node_modules/quran-json/dist/chapters/en/index.json', 'utf8'));
const tr = "Fâtiha,Bakara,Âl-i İmrân,Nisâ,Mâide,En‘âm,A‘râf,Enfâl,Tevbe,Yûnus,Hûd,Yûsuf,Ra‘d,İbrâhîm,Hicr,Nahl,İsrâ,Kehf,Meryem,Tâhâ,Enbiyâ,Hac,Mü’minûn,Nûr,Furkân,Şuarâ,Neml,Kasas,Ankebût,Rûm,Lokmân,Secde,Ahzâb,Sebe’,Fâtır,Yâsîn,Sâffât,Sâd,Zümer,Mü’min,Fussilet,Şûrâ,Zuhruf,Duhân,Câsiye,Ahkâf,Muhammed,Fetih,Hucurât,Kâf,Zâriyât,Tûr,Necm,Kamer,Rahmân,Vâkıa,Hadîd,Mücâdele,Haşr,Mümtehine,Saf,Cuma,Münâfikûn,Teğâbün,Talâk,Tahrîm,Mülk,Kalem,Hâkka,Meâric,Nûh,Cin,Müzzemmil,Müddessir,Kıyâme,İnsân,Mürselât,Nebe’,Nâziât,Abese,Tekvîr,İnfitâr,Mutaffifîn,İnşikâk,Bürûc,Târık,A‘lâ,Gâşiye,Fecr,Beled,Şems,Leyl,Duhâ,İnşirâh,Tîn,Alak,Kadir,Beyyine,Zilzâl,Âdiyât,Kâria,Tekâsür,Asr,Hümeze,Fîl,Kureyş,Mâûn,Kevser,Kâfirûn,Nasr,Tebbet,İhlâs,Felak,Nâs".split(',');
if (tr.length !== 114) throw new Error('sure adı sayısı: ' + tr.length);

// [sıra, ad, ayet sayısı, Mekkî mi, nüzul sırası, başladığı cüz]; iki kaynak birbirini doğrulamalı
const s = [];
for (let n = 1; n <= 114; n++) {
  const m = h.getSurahMeta(n), j = qj[n - 1];
  if (m.ayahCount !== j.total_verses) throw new Error('ayet sayısı uyuşmuyor: ' + n);
  if (m.isMeccan !== (j.type === 'meccan')) throw new Error('Mekkî/Medenî uyuşmuyor: ' + n);
  s.push([n, tr[n - 1], m.ayahCount, m.isMeccan ? 1 : 0, m.surahOrder, h.findJuz(n, 1)]);
}
const sajda = [...new Set(h.SajdaList.map(id => h.findSurahByAyahId(id)))];

// Harita: Natural Earth kıyı çizgileri (world-atlas, 1:50m), 28–52°D / 10–38°K penceresine kırpılır
const BB = [28, 10, 52, 38], MW = 390, MH = 502;
function clip(ring) {
  let out = ring;
  for (const [ax, v, sg] of [[0, BB[0], 1], [0, BB[2], -1], [1, BB[1], 1], [1, BB[3], -1]]) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[i], b = inp[(i + 1) % inp.length], ain = (a[ax] - v) * sg >= 0, bin = (b[ax] - v) * sg >= 0;
      if (ain) out.push(a);
      if (ain !== bin) { const t = (v - a[ax]) / (b[ax] - a[ax]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
  }
  return out;
}
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json', 'utf8'));
const geo = feature(topo, topo.objects.land), polys = (geo.features || [geo]).flatMap(f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates);
let land = '', pts = 0;
for (const poly of polys) for (const ring of poly) {
  const c = clip(ring.slice(0, -1)).map(([lo, la]) => [(lo - BB[0]) / (BB[2] - BB[0]) * MW, (BB[3] - la) / (BB[3] - BB[1]) * MH]);
  const keep = []; for (const q of c) { const l = keep[keep.length - 1]; if (!l || Math.hypot(q[0] - l[0], q[1] - l[1]) >= 0.7) keep.push(q); }
  if (keep.length < 4) continue;
  const xs = keep.map(q => q[0]), ys = keep.map(q => q[1]); if ((Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)) < 5) continue;
  land += 'M' + keep.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('L') + 'Z'; pts += keep.length;
}
if (pts < 200) throw new Error('harita verisi beklenenden küçük: ' + pts);

const src = fs.readFileSync('src/app.html', 'utf8').replace('/*DATA*/null', JSON.stringify({ s, sajda, land }));
if (process.argv[2] === 'artifact') { // sunucusuz tek kişilik sürüm: belge iskeleti ve PeerJS olmadan
  fs.writeFileSync(process.argv[3] || 'artifact.html', src); console.log('artifact yazıldı'); process.exit(0);
}
const peer = fs.readFileSync('node_modules/peerjs/dist/peerjs.min.js', 'utf8').replace(/\/\/# sourceMappingURL=.*$/m, '');
if (peer.includes('</script')) throw new Error('PeerJS satır içine alınamıyor');
const cut = src.indexOf('<div id="app">');
fs.writeFileSync('index.html', `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0a1230">
<meta name="description" content="Sureler, siyer, peygamberler tarihi ve dinî genel kültür üzerine mini oyunlar. Tek başına ya da arkadaşlarınla oda koduyla oyna.">
${src.slice(0, cut)}<script>${peer}</script>
</head>
<body>
${src.slice(cut)}</body>
</html>
`);
console.log('harita noktası:', pts, '· index.html yazıldı:', Math.round(fs.statSync('index.html').size / 1024), 'KB');
