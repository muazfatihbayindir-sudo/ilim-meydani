// src/app.html + sure verisi + PeerJS -> tek dosyalık index.html
import * as h from 'quran-meta/hafs';
import fs from 'node:fs';

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

const src = fs.readFileSync('src/app.html', 'utf8').replace('/*DATA*/null', JSON.stringify({ s, sajda }));
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
console.log('index.html yazıldı:', Math.round(fs.statSync('index.html').size / 1024), 'KB');
