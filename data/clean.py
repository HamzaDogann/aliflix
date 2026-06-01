import pandas as pd
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW  = os.path.join(BASE, 'ml-32m')
PROC = os.path.join(BASE, 'data', 'processed')

print("Yükleniyor... (32M satır için 1-2 dk sürebilir)")
movies  = pd.read_csv(os.path.join(RAW, 'movies.csv'))
ratings = pd.read_csv(os.path.join(RAW, 'ratings.csv'))
tags    = pd.read_csv(os.path.join(RAW, 'tags.csv'))
links   = pd.read_csv(os.path.join(RAW, 'links.csv'))

print("\n=== ÖNCESİ ===")
print(f"Film     : {len(movies):,}")
print(f"Rating   : {len(ratings):,}")
print(f"Kullanıcı: {ratings['userId'].nunique():,}")
print(f"Tag      : {len(tags):,}")

# Eksik veri ve tekrar
movies.dropna(subset=['title', 'genres'], inplace=True)
movies.drop_duplicates(subset=['movieId'], inplace=True)
ratings.dropna(inplace=True)
ratings.drop_duplicates(inplace=True)
tags.dropna(subset=['tag'], inplace=True)
tags.drop_duplicates(inplace=True)

# Gereksiz sütunlar
ratings.drop(columns=['timestamp'], inplace=True)
tags.drop(columns=['timestamp'], inplace=True)

# Örneklem — 32M → 2-3M
FILM_ESIGI = 75
USER_ESIGI = 30

film_counts = ratings['movieId'].value_counts()
popular_ids = film_counts[film_counts >= FILM_ESIGI].index
ratings = ratings[ratings['movieId'].isin(popular_ids)]

user_counts = ratings['userId'].value_counts()
active_ids  = user_counts[user_counts >= USER_ESIGI].index
ratings = ratings[ratings['userId'].isin(active_ids)]

print(f"\n=== ÖRNEKLEM SONRASI ===")
print(f"Film     : {ratings['movieId'].nunique():,}")
print(f"Rating   : {len(ratings):,}  ← hedef 2-3M")
print(f"Kullanıcı: {ratings['userId'].nunique():,}")

# Film özelliklerini zenginleştir
movies['year']        = movies['title'].str.extract(r'\((\d{4})\)')[0].astype(float)
movies['title_clean'] = movies['title'].str.replace(r'\s*\(\d{4}\)', '', regex=True).str.strip()
movies['genre_list']  = movies['genres'].str.split('|')

# Tags — film başına birleştir
tags_filtered = tags[tags['movieId'].isin(popular_ids)]
tags_grouped = (
    tags_filtered.groupby('movieId')['tag']
    .apply(lambda x: ', '.join(x.str.lower().unique()))
    .reset_index()
    .rename(columns={'tag': 'tags'})
)
movies = movies.merge(tags_grouped, on='movieId', how='left')
movies['tags'] = movies['tags'].fillna('')

# IMDb ID formatla
links['imdbId_fmt'] = (
    links['imdbId'].fillna(0).astype(int)
    .apply(lambda x: f"tt{x:07d}")
)

# movieId → imdbId eşleşme tablosu (küçük dosya, ratings ile merge YOK)
movie_links = (
    movies[movies['movieId'].isin(popular_ids)][['movieId']]
    .merge(links[['movieId', 'imdbId_fmt']], on='movieId', how='left')
    .rename(columns={'imdbId_fmt': 'imdbId'})
)

# Kaydet
os.makedirs(PROC, exist_ok=True)

movies[movies['movieId'].isin(popular_ids)].to_csv(os.path.join(PROC, 'movies_clean.csv'), index=False)
ratings.to_csv(os.path.join(PROC, 'ratings_clean.csv'), index=False)
tags_grouped.to_csv(os.path.join(PROC, 'tags_clean.csv'), index=False)
movie_links.to_csv(os.path.join(PROC, 'movie_links.csv'), index=False)

print(f"\n✓ Temizleme tamamlandı → data/processed/")
print(f"  Eşikler: film ≥ {FILM_ESIGI} rating, kullanıcı ≥ {USER_ESIGI} rating")
