import pandas as pd
import numpy as np
import pickle, os
from sklearn.neighbors import NearestNeighbors
from scipy.sparse import csr_matrix

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROC = os.path.join(BASE, 'data', 'processed')

print("Veri yukleniyor...")
ratings = pd.read_csv(os.path.join(PROC, 'ratings_clean.csv'))
movies  = pd.read_csv(os.path.join(PROC, 'movies_clean.csv'))

print(f"Rating sayisi: {len(ratings):,}")

# movieId ve userId'yi sifirdan baslayan tam sayı indekslerine esle
# pivot_table() kullanmiyoruz — dense matris olusturup RAM patlatir
movie_ids = ratings['movieId'].unique()
user_ids  = ratings['userId'].unique()

movie_to_idx = {mid: i for i, mid in enumerate(movie_ids)}
user_to_idx  = {uid: i for i, uid in enumerate(user_ids)}

row  = ratings['movieId'].map(movie_to_idx).values
col  = ratings['userId'].map(user_to_idx).values
data = ratings['rating'].values

print(f"Sparse matris olusturuluyor: {len(movie_ids):,} film x {len(user_ids):,} kullanici")
matrix = csr_matrix((data, (row, col)), shape=(len(movie_ids), len(user_ids)))
print(f"Matris boyutu: {matrix.shape}, dolu hucre: {matrix.nnz:,}")

K = 10
print(f"KNN egitiliyor (K={K}, metric=euclidean)...")
model = NearestNeighbors(
    metric='euclidean',
    algorithm='brute',
    n_neighbors=K + 1,
    n_jobs=-1
)
model.fit(matrix)
print("Model egitimi tamamlandi")

model_path = os.path.join(BASE, 'model', 'knn_model.pkl')
with open(model_path, 'wb') as f:
    pickle.dump({
        'model':        model,
        'matrix':       matrix,
        'movie_ids':    movie_ids,   # index → movieId
        'movie_to_idx': movie_to_idx, # movieId → index
        'movies':       movies,
    }, f)

print(f"Model kaydedildi -> model/knn_model.pkl")
