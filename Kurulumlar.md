# Kurulum Rehberi — Aliflix

Projeyi GitHub'dan çektikten sonra sıfırdan ayağa kaldırmak için adımlar. İki bağımsız katman var: **Backend** (Python / FastAPI) ve **Frontend** (React / Vite). Sırayla yap.

## Gereksinimler

- **Python 3.12** (3.10+ olur)
- **Node.js 18+** ve **npm**
- ~10 GB boş disk (ham veri + işlenmiş veri + model dosyası için)

---

## ⚠️ Önce Oku: Büyük Dosyalar GitHub'da YOK

GitHub 100 MB üzeri dosyaları kabul etmez. Bu yüzden şu dosyalar repoda **gelmez** ve senin kendinde üretmen gerekir:

| Dosya | Boyut | Nasıl elde edilir |
|---|---|---|
| `ml-32m/ratings.csv` | ~837 MB | MovieLens'ten indir (aşağıda) |
| `data/processed/ratings_clean.csv` | ~484 MB | `data/clean.py` üretir |
| `model/knn_model.pkl` | ~711 MB | `model/train.py` üretir |

Yani: **veri setini indir → temizle → modeli eğit.** Adımlar aşağıda.

---

## 1. Ham Veri Setini İndir (MovieLens ml-32m)

1. https://grouplens.org/datasets/movielens/ adresinden **ml-32m.zip** dosyasını indir.
2. Zip'i aç, içindeki dosyaları proje kökündeki `ml-32m/` klasörüne koy. Klasör şöyle görünmeli:

```
ml-32m/
├── movies.csv
├── ratings.csv
├── tags.csv
└── links.csv
```

---

## 2. Backend (Python) Kurulumu

Proje kökünde (`FilmOneriSistemi/`) terminal aç.

### 2a. Sanal ortam (venv) oluştur ve aktive et

```powershell
python -m venv venv
.\venv\Scripts\Activate
```

> macOS/Linux'ta: `source venv/bin/activate`

### 2b. Python paketlerini kur

```powershell
pip install -r requirements.txt
```

Kurulan paketler: `fastapi`, `uvicorn`, `pandas`, `numpy`, `scikit-learn`, `scipy`, `python-multipart`.

### 2c. Veriyi temizle

```powershell
python data/clean.py
```

`ml-32m/` ham verisini okur, temizler ve `data/processed/` altına işlenmiş CSV'leri yazar. (32M satır için 1-2 dk sürer.)

### 2d. tmdbId bilgisini ekle (ZORUNLU)

```powershell
python add_tmdbid.py
```

`movie_links.csv` dosyasına `tmdbId` sütununu ekler. **Bu adım atlanırsa API açılırken `KeyError: 'tmdbId'` hatası verir ve hiç başlamaz** — çünkü `recommender.py` bu sütunu okur.

### 2e. KNN modelini eğit

```powershell
python model/train.py
```

Sparse matris kurar, KNN'i eğitir ve `model/knn_model.pkl` (~711 MB) dosyasını üretir. Biraz RAM ve zaman ister.

### 2e. API'yi başlat

```powershell
uvicorn api.main:app --reload
```

API artık `http://127.0.0.1:8000` adresinde ayakta. Swagger arayüzü: `http://127.0.0.1:8000/docs` — buradan endpoint'leri test edebilirsin.

---

## 3. Frontend (React / Vite) Kurulumu

**Backend ayakta kalsın**, yeni bir terminal aç ve `Aliflix/` klasörüne gir.

```powershell
cd Aliflix
npm install
npm run dev
```

Vite dev sunucusu açılır (genelde `http://localhost:5173`). Tarayıcıda bu adresi aç.

> **Not:** Frontend, API adresini `http://localhost:8000` olarak sabit kullanır (`src/services/api.ts`) — ek ayar gerekmez. Backend bu portta çalışmıyorsa öneri/istatistik sayfaları boş gelir. Posterler `metahub.space` üzerinden çekilir, TMDB API anahtarı gerekmez.

---

## Özet — Sıralı Komutlar

```powershell
# 0) ml-32m.zip indir, ml-32m/ klasörüne aç

# 1) Backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
python data/clean.py
python add_tmdbid.py
python model/train.py
uvicorn api.main:app --reload

# 2) Frontend (yeni terminal)
cd Aliflix
npm install
npm run dev
```

Hepsi tamamsa: backend `:8000`, frontend `:5173` — tarayıcıdan siteyi gez.
