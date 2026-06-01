import pandas as pd
import json
import os

RAW = os.path.join(os.path.dirname(__file__), '..', 'ml-32m')

movies  = pd.read_csv(os.path.join(RAW, 'movies.csv'))
ratings = pd.read_csv(os.path.join(RAW, 'ratings.csv'))
tags    = pd.read_csv(os.path.join(RAW, 'tags.csv'))
links   = pd.read_csv(os.path.join(RAW, 'links.csv'))

stats = {
    "film_sayisi":      int(movies['movieId'].nunique()),
    "kullanici_sayisi": int(ratings['userId'].nunique()),
    "rating_sayisi":    int(len(ratings)),
    "tag_sayisi":       int(len(tags)),
    "rating_dagilimi": {
        "min": float(ratings['rating'].min()),
        "max": float(ratings['rating'].max()),
        "ort": round(float(ratings['rating'].mean()), 2),
    },
    "tur_dagilimi": (
        movies['genres'].str.split('|').explode()
        .value_counts().head(10).to_dict()
    ),
    "sutunlar": {
        "movies":  list(movies.columns),
        "ratings": list(ratings.columns),
        "tags":    list(tags.columns),
        "links":   list(links.columns),
    }
}

print(json.dumps(stats, indent=2, ensure_ascii=False))
