import pandas as pd
import pickle
import os
from sklearn.neighbors import NearestNeighbors

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROC = os.path.join(BASE, 'data', 'processed')

print("Model yukleniyor...")
with open(os.path.join(BASE, 'model', 'knn_model.pkl'), 'rb') as f:
    payload = pickle.load(f)

model        = payload['model']
matrix       = payload['matrix']
movie_ids    = payload['movie_ids']    # array: index → movieId
movie_to_idx = payload['movie_to_idx'] # dict: movieId → index
movies       = payload['movies']

ratings       = pd.read_csv(os.path.join(PROC, 'ratings_clean.csv'))
avg_ratings   = ratings.groupby('movieId')['rating'].mean().round(2)
rating_counts = ratings.groupby('movieId')['rating'].count()

movie_links = pd.read_csv(os.path.join(PROC, 'movie_links.csv'))
movie_imdb  = movie_links.set_index('movieId')['imdbId'].to_dict()
movie_tmdb  = movie_links.set_index('movieId')['tmdbId'].to_dict()


def _movie_row(mid: int) -> dict | None:
    row = movies[movies['movieId'] == mid]
    if row.empty:
        return None
    r = row.iloc[0]
    return {
        'movieId':      int(mid),
        'title':        str(r['title_clean']),
        'genres':       str(r['genres']),
        'tags':         str(r.get('tags', '')),
        'year':         int(r['year']) if pd.notna(r.get('year')) else None,
        'avg_rating':   float(avg_ratings.get(mid, 0)),
        'rating_count': int(rating_counts.get(mid, 0)),
        'imdbId':       str(movie_imdb.get(mid, '')),
        'tmdbId':       int(movie_tmdb.get(mid, 0)),
    }


def get_similar_movies(movie_id: int, n: int = 10) -> list[dict]:
    """KNN Oklid ile bir filme en cok benzeyen N film."""
    if movie_id not in movie_to_idx:
        return []
    idx = movie_to_idx[movie_id]
    distances, indices = model.kneighbors(
        matrix[idx],
        n_neighbors=n + 1
    )
    results = []
    for dist, i in zip(distances.flatten()[1:], indices.flatten()[1:]):
        mid  = int(movie_ids[i])
        data = _movie_row(mid)
        if data:
            data['distance'] = round(float(dist), 4)
            data['reason']   = f"Benzer izleyici profiline sahip (Oklid: {dist:.2f})"
            results.append(data)
    return results


def get_recommendations(
    genre:      str   = None,
    min_rating: float = None,
    max_rating: float = None,
    year_min:   int   = None,
    year_max:   int   = None,
    tag:        str   = None,
    n:          int   = 10,
    movie_id:   int   = None,
    user_id:    int   = None,
) -> list[dict]:
    df = movies.copy()
    df['avg_rating']   = df['movieId'].map(avg_ratings).fillna(0)
    df['rating_count'] = df['movieId'].map(rating_counts).fillna(0)
    df['imdbId']       = df['movieId'].map(movie_imdb).fillna('')

    knn_reason = None
    user_score_map = None
    # Kullanici-id bazli oneriler (komsu kullanicilarin agirlikli puanlarina gore)
    if user_id is not None:
        user_ids = ratings['userId'].unique()
        user_to_idx = {uid: i for i, uid in enumerate(user_ids)}
        if user_id in user_to_idx:
            uidx = user_to_idx[user_id]
            k_search = min(max(50, n * 10), len(user_ids) - 1)
            try:
                user_matrix = matrix.T
                user_model = NearestNeighbors(metric='euclidean', algorithm='brute', n_jobs=-1)
                user_model.fit(user_matrix)
                distances, indices = user_model.kneighbors(user_matrix[uidx], n_neighbors=min(k_search + 1, user_matrix.shape[0]))
                neigh_idxs = indices.flatten()[1:]
                neigh_uids = [int(user_ids[i]) for i in neigh_idxs]
                weights = 1.0 / (distances.flatten()[1:] + 1e-6)
                neigh_df = pd.DataFrame({'userId': neigh_uids, 'weight': weights})
                # ratings merged with neighbor weights
                r = ratings.merge(neigh_df, on='userId', how='inner')
                # weighted score per movie
                score = r.groupby('movieId').apply(lambda g: (g['rating'] * g['weight']).sum() / g['weight'].sum())
                score = score.rename('score').reset_index()
                # exclude movies the user already rated
                seen = set(ratings[ratings['userId'] == user_id]['movieId'].unique())
                score = score[~score['movieId'].isin(seen)]
                user_score_map = score.set_index('movieId')['score'].to_dict()
            except Exception:
                user_score_map = None
    if movie_id is not None and movie_id in movie_to_idx:
        idx      = movie_to_idx[movie_id]
        k_search = min(n * 5, len(movie_ids))
        distances, indices = model.kneighbors(
            matrix[idx],
            n_neighbors=k_search + 1
        )
        neighbor_ids = [int(movie_ids[i]) for i in indices.flatten()[1:]]
        df = df[df['movieId'].isin(neighbor_ids) & (df['movieId'] != movie_id)]
        dist_map = {
            int(movie_ids[i]): round(float(d), 4)
            for d, i in zip(distances.flatten()[1:], indices.flatten()[1:])
        }
        knn_reason = dist_map

    if genre:
        genre_list = [g.strip() for g in genre.split(',') if g.strip()]
        pattern = '|'.join(genre_list)
        df = df[df['genres'].str.contains(pattern, case=False, na=False)]
    if min_rating is not None:
        df = df[df['avg_rating'] >= min_rating]
    if max_rating is not None:
        df = df[df['avg_rating'] <= max_rating]
    if year_min is not None:
        df = df[df['year'] >= year_min]
    if year_max is not None:
        df = df[df['year'] <= year_max]
    if tag:
        df = df[df['tags'].str.contains(tag, case=False, na=False)]

    # Eğer kullanıcı bazlı skorlar hesaplandıysa, bu skora göre sırala
    if user_score_map is not None:
        df = df[df['movieId'].isin(user_score_map.keys())]
        df['user_score'] = df['movieId'].map(user_score_map).fillna(0)
        df = df.sort_values('user_score', ascending=False).head(n)
    else:
        df = df.nlargest(n, 'avg_rating')

    results = []
    for _, r in df.iterrows():
        mid = int(r['movieId'])
        if user_score_map is not None and mid in user_score_map:
            sc = user_score_map.get(mid, 0)
            reason = f"Kullanici benzerligi skoruna gore oneri (skor: {sc:.2f})"
        elif knn_reason is not None:
            dist   = knn_reason.get(mid, 0)
            reason = f"Begendigniz filme benzer izleyici profili (Oklid: {dist:.2f})"
        else:
            reason = "Kriterlerinize en uygun film"
        results.append({
            'movieId':      mid,
            'title':        str(r['title_clean']),
            'genres':       str(r['genres']),
            'tags':         str(r.get('tags', '')),
            'year':         int(r['year']) if pd.notna(r.get('year')) else None,
            'avg_rating':   float(r['avg_rating']),
            'rating_count': int(r['rating_count']),
            'imdbId':       str(r['imdbId']),
            'reason':       reason,
        })
    return results


def get_top_rated(n: int = 10) -> list[dict]:
    top_ids = avg_ratings.nlargest(n).index
    return [row for mid in top_ids for row in [_movie_row(mid)] if row]


def get_most_rated(n: int = 10) -> list[dict]:
    top_ids = rating_counts.nlargest(n).index
    return [row for mid in top_ids for row in [_movie_row(mid)] if row]


def search_movies(q: str, n: int = 10) -> list[dict]:
    df = movies.copy()
    df['avg_rating']   = df['movieId'].map(avg_ratings).fillna(0)
    df['rating_count'] = df['movieId'].map(rating_counts).fillna(0)
    df['imdbId']       = df['movieId'].map(movie_imdb).fillna('')
    df['tmdbId']       = df['movieId'].map(movie_tmdb).fillna(0)

    mask = df['title_clean'].str.contains(q.strip(), case=False, na=False, regex=False)
    df   = df[mask].nlargest(n, 'rating_count')

    results = []
    for _, r in df.iterrows():
        mid = int(r['movieId'])
        results.append({
            'movieId':      mid,
            'title':        str(r['title_clean']),
            'genres':       str(r['genres']),
            'tags':         str(r.get('tags', '')),
            'year':         int(r['year']) if pd.notna(r.get('year')) else None,
            'avg_rating':   float(r['avg_rating']),
            'rating_count': int(r['rating_count']),
            'imdbId':       str(r['imdbId']),
            'tmdbId':       int(r['tmdbId']),
        })
    return results


def get_dataset_stats() -> dict:
    return {
        "total_users":   int(ratings['userId'].nunique()),
        "total_movies":  int(movies['movieId'].nunique()),
        "total_ratings": int(len(ratings)),
        "avg_rating":    round(float(ratings['rating'].mean()), 2),
        "algorithm":     "KNN (K=10, Oklid Mesafesi)",
        "dataset":       "MovieLens",
        "sample_info": {
            "original_ratings": "~32.000.000",
            "used_ratings":      int(len(ratings)),
            "film_threshold":   75,
            "user_threshold":   30,
        }
    }
