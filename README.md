# İlim Meydanı

Sureler, siyer, peygamberler tarihi ve dinî genel kültür üzerine mini oyunlar. Tek başına bota karşı ya da arkadaşlarınla oda koduyla oynanır.

## Oynamak

`index.html` tek başına çalışan bir sayfadır; GitHub Pages üzerinden yayınlanır. Sunucu ve hesap gerekmez.

**Arkadaşınla oyna:** biri "Oda kur" der, çıkan 5 haneli kodu ya da davet bağlantısını gönderir. 2–10 kişi katılabilir.

| Oyun | Kişi |
|---|---|
| Bilgi Yarışması | 2–10 (çift sayıda oyuncuyla takım da olur) |
| Pingpong | 2 kişi düello; 3–10 kişi eleme ya da takım |
| Numara Avı | 2–10 |
| Izgara | 2 |
| Kart Savaşı | 2 |

Bağlantı tarayıcılar arasında doğrudan kurulur (WebRTC, PeerJS). Oyunu odayı kuran kişinin cihazı yönetir; o sayfayı kapatırsa oda kapanır. İlk tanışma için PeerJS'in herkese açık eşleştirme servisi kullanılır.

## Geliştirme

```
npm install
npm run build      # src/app.html -> index.html
```

- `src/app.html`: arayüz, oyun kuralları ve içerik (tek kaynak dosya).
- `build.mjs`: 114 surenin verisini iki pakette karşılaştırıp sayfaya gömer, PeerJS'i satır içine alır.

Yerelde iki sekmeyle denemek için bir statik sunucu açıp `index.html?local=1` adresini kullanın; bu kipte bağlantı aynı tarayıcının sekmeleri arasında kurulur.

## İçerik notu

Sure verisi (ayet sayısı, Mekkî/Medenî, nüzul sırası, cüz) iki açık kaynak pakette tutarlıdır. Peygamber ve sahâbî etiketleri, Esmâ-i Hüsnâ anlamları, siyer tarihleri ve sorular yaygın kabul gören bilgilerle yazılmıştır; yayından önce bir ilahiyatçı ve Diyanet kaynaklarıyla doğrulanmalıdır.
