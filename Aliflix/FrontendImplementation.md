# Aliflix — Frontend Implementation Plan

Saf HTML/CSS/JS ile 3 sayfalık web arayüzü yol haritası.
Backend `http://localhost:8000` adresinde çalışıyor — frontend sadece `fetch()` ile endpoint'leri çağırır.

---

## Klasör Yapısı

```
frontend/
├── index.html          # Sayfa 1 — Ana Sayfa
├── dataset.html        # Sayfa 2 — Veri Seti Analizi
├── recommend.html      # Sayfa 3 — Öneri Ekranı
├── styles/
│   ├── base.css        # Reset, değişkenler, tipografi, layout
│   ├── components.css  # Kart, tablo, buton, form, badge, modal
│   └── pages.css       # Sayfaya özel stiller
└── js/
    ├── api.js          # Tüm fetch çağrıları tek dosyada
    ├── dataset.js      # Sayfa 2 mantığı
    └── recommend.js    # Sayfa 3 mantığı
```

**Kural:** `styles/` dışında hiçbir yerde CSS yazılmaz — inline style yasak.

---

## `js/api.js` — Backend Köprüsü

Tüm fetch çağrıları bu dosyada toplanır. Diğer JS dosyaları direkt `fetch()` kullanmaz.

```javascript
const BASE = 'http://localhost:8000';

export const API = {
  stats:       ()              => fetch(`${BASE}/api/stats`).then(r => r.json()),
  topRated:    (n = 10)        => fetch(`${BASE}/api/top-rated?n=${n}`).then(r => r.json()),
  mostRated:   (n = 10)        => fetch(`${BASE}/api/most-rated?n=${n}`).then(r => r.json()),
  recommend:   (params)        => fetch(`${BASE}/api/recommend?${new URLSearchParams(params)}`).then(r => r.json()),
  similar:     (movieId, n=5)  => fetch(`${BASE}/api/similar/${movieId}?n=${n}`).then(r => r.json()),
  watchUrl:    (imdbId)        => fetch(`${BASE}/api/watch/${imdbId}`).then(r => r.json()),
};
```

Hata yönetimi — her çağrıyı `try/catch` ile sar, kullanıcıya hata mesajı göster.

---

## Sayfa 1 — `index.html` (Ana Sayfa)

**Backend bağlantısı yok** — tamamen statik içerik.

Göstermesi gerekenler (ödev şartı):
- Proje adı: **Aliflix**
- Kullanılan veri seti: MovieLens
- Kullanılan algoritma: KNN (K=10, Öklid Mesafesi)
- Projenin amacı ve kısa açıklaması

Navigasyon: her 3 sayfaya da link. Tüm sayfalarda aynı nav kullanılmalı (tutarlılık).

---

## Sayfa 2 — `dataset.html` (Veri Seti Analizi)

**Ödev şartları:** kullanıcı sayısı, film sayısı, puanlama sayısı + en çok puanlanan 10 + en yüksek ortalama 10.

### Veri akışı

```
sayfa yüklenince
  → API.stats()          → istatistik kartlarını doldur
  → API.mostRated(10)    → "En Çok Puanlanan" tablosunu doldur
  → API.topRated(10)     → "En Yüksek Ortalama" tablosunu doldur
```

### `js/dataset.js` — temel yapı

```javascript
import { API } from './api.js';

async function init() {
  // İstatistik kartları
  const stats = await API.stats();
  document.getElementById('total-users').textContent   = stats.total_users.toLocaleString('tr-TR');
  document.getElementById('total-movies').textContent  = stats.total_movies.toLocaleString('tr-TR');
  document.getElementById('total-ratings').textContent = stats.total_ratings.toLocaleString('tr-TR');
  document.getElementById('avg-rating').textContent    = stats.avg_rating;
  document.getElementById('sample-original').textContent = stats.sample_info.original_ratings;
  document.getElementById('sample-used').textContent     = stats.sample_info.used_ratings.toLocaleString('tr-TR');

  // En çok puanlanan tablosu
  const mostRated = await API.mostRated(10);
  renderTable('most-rated-table', mostRated);

  // En yüksek ortalama tablosu
  const topRated = await API.topRated(10);
  renderTable('top-rated-table', topRated);
}

function renderTable(tableId, films) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = films.map((f, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${f.title}</td>
      <td>${f.genres.replace(/\|/g, ', ')}</td>
      <td>${f.year ?? '—'}</td>
      <td>⭐ ${f.avg_rating}</td>
      <td>${f.rating_count.toLocaleString('tr-TR')}</td>
    </tr>
  `).join('');
}

init();
```

### Veri Temizleme Bölümü

Sayfa 2'de bir bölüm olarak veri temizleme adımları **statik metin** olarak yazılacak — `clean.py` çıktısından alınan ÖNCESİ/SONRASI sayıları buraya konur. Backend'den gelmiyor, rapor notlarından yazılıyor.

---

## Sayfa 3 — `recommend.html` (Öneri Ekranı)

**Ödev şartları:** form alanları, en az 5 öneri, film adı + türü + puanı + neden önerildiği.

### Form alanları (ödev şartı)

| Alan | HTML elemanı | Backend parametresi |
|------|-------------|-------------------|
| Film türü | `<select>` | `genre` |
| Min. puan | `<input type="range" min="0" max="5" step="0.5">` | `min_rating` |
| Yıl aralığı (başlangıç) | `<input type="number">` | `year_min` |
| Yıl aralığı (bitiş) | `<input type="number">` | `year_max` |
| Film sayısı | `<input type="number" min="5" max="50">` | `n` |
| Beğenilen film | `<input type="text">` → movieId seçimi | `movie_id` |
| Kullanıcı ID | `<input type="text">` → UI'da göster, şimdilik backend'e gönderilmiyor |

> **Not:** Kullanıcı ID alanı form'da görünmeli (ödev şartı), ancak backend henüz kullanıcı bazlı öneri desteklemiyor. Alana girilince "bu özellik yakında" gibi bir not gösterilebilir, ya da alan sadece görsel amaçlı bırakılabilir.

### Beğenilen film alanı — movieId nasıl alınır?

Film adı yazıldığında kullanıcı `movieId`'yi bilemez. Şu yöntem önerilir:

```javascript
// Kullanıcı film adı yazar → /api/most-rated veya /api/top-rated
// listesinden eşleştirme yap (autocomplete)
// Basit yaklaşım: sayfa yüklenince popüler 100 filmi çek, datalist'e dök
const films = await API.mostRated(100);
const datalist = document.getElementById('film-suggestions');
films.forEach(f => {
  const opt = document.createElement('option');
  opt.value = f.title;
  opt.dataset.movieId = f.movieId;
  datalist.appendChild(opt);
});
// Kullanıcı seçince data-movie-id'yi hidden input'a yaz
```

### `js/recommend.js` — öneri formu

```javascript
import { API } from './api.js';

document.getElementById('recommend-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading(true);

  const params = {};
  const genre    = document.getElementById('genre').value;
  const minRating = document.getElementById('min-rating').value;
  const yearMin  = document.getElementById('year-min').value;
  const yearMax  = document.getElementById('year-max').value;
  const n        = document.getElementById('film-count').value;
  const movieId  = document.getElementById('movie-id-hidden').value; // autocomplete'ten gelir

  if (genre)     params.genre      = genre;
  if (minRating) params.min_rating = minRating;
  if (yearMin)   params.year_min   = yearMin;
  if (yearMax)   params.year_max   = yearMax;
  if (n)         params.n          = n;
  if (movieId)   params.movie_id   = movieId;

  try {
    const results = await API.recommend(params);
    renderResults(results);
  } catch (err) {
    showError('Öneri alınamadı. Backend çalışıyor mu?');
  } finally {
    showLoading(false);
  }
});

function renderResults(films) {
  const container = document.getElementById('results');
  if (!films.length) {
    container.innerHTML = '<p class="no-result">Kriterlere uygun film bulunamadı. Filtreleri genişletin.</p>';
    return;
  }
  container.innerHTML = films.map(f => `
    <div class="film-card">
      <div class="film-card__header">
        <span class="film-card__title">${f.title}</span>
        <span class="film-card__year">${f.year ?? ''}</span>
      </div>
      <div class="film-card__meta">
        <span class="badge">${f.genres.replace(/\|/g, ' · ')}</span>
        <span class="rating">⭐ ${f.avg_rating} <small>(${f.rating_count.toLocaleString('tr-TR')} oy)</small></span>
      </div>
      <p class="film-card__reason">${f.reason}</p>
      <div class="film-card__actions">
        <button class="btn btn--secondary" onclick="loadSimilar(${f.movieId})">Benzer Filmler</button>
        ${f.imdbId ? `<button class="btn btn--primary" onclick="openWatch('${f.imdbId}')">▶ İzle</button>` : ''}
      </div>
    </div>
  `).join('');
}
```

### Benzer Filmler — `/api/similar/{movie_id}`

Film kartındaki "Benzer Filmler" butonuna basılınca:

```javascript
async function loadSimilar(movieId) {
  const films = await API.similar(movieId, 5);
  // Modal veya ayrı panel içinde renderResults(films) çağır
}
```

### Film İzleme — `/api/watch/{imdb_id}` → iframe

```javascript
async function openWatch(imdbId) {
  const data = await API.watchUrl(imdbId);
  // data.embed_url → modal içindeki iframe'in src'sine set et
  document.getElementById('watch-iframe').src = data.embed_url;
  document.getElementById('watch-modal').classList.add('active');
}
```

Modal kapatılınca `iframe.src = ''` yap — aksi hâlde video arka planda çalmaya devam eder.

---

## Stil Rehberi (`styles/`)

### `base.css` — değişkenler

```css
:root {
  --color-bg:        #0f0f13;
  --color-surface:   #1a1a24;
  --color-border:    #2e2e3e;
  --color-accent:    #e50914;   /* Netflix kırmızısı referans — isteğe bağlı değiştir */
  --color-text:      #e8e8f0;
  --color-muted:     #8888aa;
  --radius:          8px;
  --transition:      0.2s ease;
}
```

Üç sayfa da aynı değişkenleri kullanmalı — renk/font tutarlılığı buradan sağlanır.

### Responsive kuralı

```css
/* base.css içinde */
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

@media (max-width: 768px) {
  .grid-cards { grid-template-columns: 1fr; }
  table { font-size: 0.85rem; }
}
```

---

## Geliştirme Sırası

1. `styles/base.css` + nav HTML — 3 sayfayı birbirine bağla
2. Sayfa 1 — statik içerik yaz
3. `js/api.js` — tüm fetch fonksiyonlarını yaz, `console.log` ile test et
4. Sayfa 2 — istatistik kartları + iki tablo
5. Sayfa 3 — form + `renderResults` + film kartı bileşeni
6. Benzer filmler modalı + izle modalı (iframe)
7. Responsive test (mobil görünüm)
8. `styles/components.css` ile görsel cilalama

---

## Backend Çalışmazsa Ne Yaparsın?

API çağrıları başarısız olursa kullanıcıya boş ekran gösterme:

```javascript
async function safeCall(fn, fallback = []) {
  try { return await fn(); }
  catch { return fallback; }
}

// Kullanım:
const stats = await safeCall(API.stats, { total_users: '—', total_movies: '—', total_ratings: '—' });
```

---

## Ödev Kontrol Listesi (Frontend)

- [ ] 3 sayfa çalışıyor ve birbirine link var
- [ ] Sayfa 2: kullanıcı, film, puanlama sayısı gösteriliyor (`/api/stats`)
- [ ] Sayfa 2: en çok puanlanan 10 film tablosu (`/api/most-rated`)
- [ ] Sayfa 2: en yüksek ortalama 10 film tablosu (`/api/top-rated`)
- [ ] Sayfa 2: veri temizleme adımları statik metin olarak yazıldı
- [ ] Sayfa 3: tüm form alanları mevcut (tür, puan, yıl, sayı, beğenilen film, kullanıcı ID)
- [ ] Sayfa 3: en az 5 film sonuç gösteriliyor
- [ ] Sayfa 3: her kart — film adı, türü, puanı, neden önerildiği
- [ ] Sayfa 3: "Benzer Filmler" çalışıyor (`/api/similar`)
- [ ] Sayfa 3: "İzle" butonu iframe modal açıyor (`/api/watch`)
- [ ] Tüm CSS `styles/` klasöründe — inline style yok
- [ ] Mobil uyumlu (en az 375px genişlikte düzgün görünüyor)
- [ ] 3 sayfa arasında görsel tutarlılık var
