# Aliflix — Proje Orkestratörü

Veri Madenciliği dönem sonu projesi. KNN algoritması ile kişiselleştirilmiş film önerisi sunan web sistemi.

---

## Sistem Mimarisi

```
MovieLens CSV  →  data/clean.py  →  model/train.py  →  knn_model.pkl
                                                              ↓
Browser  ←──── HTML/CSS/JS ←──── FastAPI (port 8000) ←── recommender.py
```

İki bağımsız katman: **Backend** (Python/FastAPI) ve **Frontend** (HTML/CSS/JS). İkisi arasındaki tek köprü JSON API'dir. Veritabanı yok.

---

## Detay Dökümanları

| Dosya | Kapsam |
|---|---|
| `BackendImplementation.md` | Veri temizleme, KNN eğitimi, FastAPI endpoint'leri, öneri motoru |
| `FrontendImplementation.md` | 3 sayfa yapısı, `api.js` köprüsü, form mantığı, iframe izleme |

---

## Backend → Frontend Veri Akışı

| Endpoint | Hangi sayfa | Ne için |
|---|---|---|
| `GET /api/stats` | Sayfa 2 | Kullanıcı/film/puan sayıları — ödev şartı |
| `GET /api/most-rated?n=10` | Sayfa 2 | En çok puanlanan 10 film tablosu — ödev şartı |
| `GET /api/top-rated?n=10` | Sayfa 2 | En yüksek ortalama 10 film tablosu — ödev şartı |
| `GET /api/recommend?...` | Sayfa 3 | Ana öneri formu (filtre + opsiyonel KNN) |
| `GET /api/similar/{id}` | Sayfa 3 | Film kartı "Benzer Filmler" butonu |
| `GET /api/watch/{imdbId}` | Sayfa 3 | "İzle" butonu → iframe embed URL |

---

## Değerlendirme Ağırlıkları

| Kriter | Puan | Nerede karşılanıyor |
|---|---|---|
| Veri Seti Tanıtma | 10 | Sayfa 2 + Rapor Bölüm 2 |
| Veri Temizleme | 15 | `clean.py` + Sayfa 2 statik metin + Rapor Bölüm 3 |
| Algoritma (KNN) | 25 | `train.py` + K=10 gerekçesi + Rapor Bölüm 4 |
| Öneri Modeli | 20 | `recommender.py` + Sayfa 3 form + Rapor Bölüm 4 |
| Web Arayüzü | 15 | 3 HTML sayfası + responsive CSS |
| Raporlama | 10 | Rapor (5 sayfa + kapak) |
| YZ Beyanı | 5 | Raporda hangi araç, hangi adım, hangi prompt |

---

## Geliştirme Sırası

1. `data/clean.py` çalıştır → işlenmiş CSV'ler hazır
2. `model/train.py` çalıştır → `knn_model.pkl` hazır
3. `uvicorn api.main:app` → API ayakta, Swagger'dan test et
4. `js/api.js` yaz → `console.log` ile her endpoint'i doğrula
5. Sayfa 1 → Sayfa 2 → Sayfa 3 sırasıyla implement et
6. Raporu her adımda not tutarak yaz
