import pandas as pd, os
BASE = os.path.dirname(os.path.abspath(__file__))
PROC = os.path.join(BASE, "data", "processed")
RAW  = os.path.join(BASE, "ml-32m")

movies_clean = pd.read_csv(os.path.join(PROC, "movies_clean.csv"))
links = pd.read_csv(os.path.join(RAW, "links.csv"))
links["imdbId_fmt"] = links["imdbId"].fillna(0).astype(int).apply(lambda x: f"tt{x:07d}")

movie_links = (
    movies_clean[["movieId"]]
    .merge(links[["movieId","imdbId_fmt","tmdbId"]], on="movieId", how="left")
    .rename(columns={"imdbId_fmt": "imdbId"})
)
movie_links["tmdbId"] = movie_links["tmdbId"].fillna(0).astype(int)
movie_links.to_csv(os.path.join(PROC, "movie_links.csv"), index=False)
print(f"Guncellendi: {len(movie_links)} film, tmdbId eklendi")
