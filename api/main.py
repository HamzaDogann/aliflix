from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys, os, urllib.request, urllib.error

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from model.recommender import (
    get_recommendations,
    get_similar_movies,
    get_top_rated,
    get_most_rated,
    get_dataset_stats,
    search_movies,
)

app = FastAPI(title="Aliflix API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/stats")
def stats():
    return get_dataset_stats()


@app.get("/api/top-rated")
def top_rated(n: int = Query(10, ge=1, le=50)):
    return get_top_rated(n)


@app.get("/api/most-rated")
def most_rated(n: int = Query(10, ge=1, le=50)):
    return get_most_rated(n)


@app.get("/api/recommend")
def recommend(
    genre:      str   = Query(None),
    min_rating: float = Query(None, ge=0, le=5),
    max_rating: float = Query(None, ge=0, le=5),
    year_min:   int   = Query(None),
    year_max:   int   = Query(None),
    tag:        str   = Query(None),
    n:          int   = Query(10, ge=5, le=50),
    movie_id:   int   = Query(None),
    user_id:    int   = Query(None),
):
    return get_recommendations(
        genre=genre, min_rating=min_rating, max_rating=max_rating,
        year_min=year_min, year_max=year_max,
        tag=tag, n=n, movie_id=movie_id, user_id=user_id,
    )


@app.get("/api/search")
def search(q: str = Query(..., min_length=1), n: int = Query(10, ge=1, le=20)):
    return search_movies(q, n)


@app.get("/api/similar/{movie_id}")
def similar(movie_id: int, n: int = Query(10, ge=1, le=20)):
    return get_similar_movies(movie_id, n)


@app.get("/api/watch/{imdb_id}")
def watch_url(imdb_id: str):
    embed_url = f"https://streamimdb.ru/embed/movie/{imdb_id}"
    try:
        req = urllib.request.Request(embed_url, method="HEAD",
                                     headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=6) as resp:
            if resp.status == 404:
                raise HTTPException(status_code=404, detail="Content not found")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            raise HTTPException(status_code=404, detail="Content not found")
    except (urllib.error.URLError, Exception):
        pass  # Ağ hatası varsa URL'yi yine de döndür, iframe denesin
    return {"imdb_id": imdb_id, "embed_url": embed_url}
