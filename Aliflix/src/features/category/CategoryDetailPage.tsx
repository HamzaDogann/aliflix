import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import type { Movie } from "../../types/movie";
import { API } from "../../services/api";
import { usePoster } from "../../hooks/usePoster";
import MovieCard from "../../components/MovieCard/MovieCard";
import "./CategoryDetailPage.scss";

const GENRE_TR: Record<string, string> = {
  Action: "Aksiyon",
  Adventure: "Macera",
  Animation: "Animasyon",
  Comedy: "Komedi",
  Crime: "Suç",
  Documentary: "Belgesel",
  Drama: "Dram",
  Fantasy: "Fantastik",
  Horror: "Korku",
  Mystery: "Gizem",
  Romance: "Romantik",
  "Sci-Fi": "Bilim Kurgu",
  Thriller: "Gerilim",
  War: "Savaş",
};

function HeroBanner({ movie }: { movie: Movie | null }) {
  const { url, gradient, onError } = usePoster(
    movie?.tmdbId ?? 0,
    movie?.genres ?? "Drama",
    movie?.imdbId,
  );
  if (!movie) return <div className="cat-hero cat-hero--empty" />;
  return (
    <div className="cat-hero">
      {url ? (
        <img className="cat-hero__bg" src={url} alt="" onError={onError} />
      ) : (
        <div className="cat-hero__bg-ph" style={{ background: gradient }} />
      )}
      <div className="cat-hero__overlay" />
    </div>
  );
}

export default function CategoryDetailPage() {
  const { genre = "" } = useParams<{ genre: string }>();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setMovies([]);
    API.recommend({ genre, min_rating: 3.0, n: 20 })
      .then(setMovies)
      .catch(() => {})
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [genre]);

  const bannerMovie = useMemo(() => {
    if (!movies.length) return null;
    const idx = Math.floor(Math.random() * Math.min(5, movies.length));
    return movies[idx];
  }, [movies]);

  const genreTr = GENRE_TR[genre] ?? genre;
  const title = `${genreTr} Filmleri`;

  return (
    <div className="cat-page">
      <HeroBanner movie={bannerMovie} />

      <div className="cat-page__body">
        <div className="cat-page__head">
          <button className="cat-page__back" onClick={() => navigate(-1)}>
            <IoArrowBackOutline
              aria-hidden="true"
              className="cat-page__back-icon"
            />
            <span>Geri</span>
          </button>
          <h1 className="cat-page__title">{title}</h1>
          {!loading && (
            <p className="cat-page__count">{movies.length} film listeleniyor</p>
          )}
        </div>

        {loading ? (
          <div className="cat-page__loading">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="cat-page__skeleton" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <p className="cat-page__empty">Bu kategoride film bulunamadı.</p>
        ) : (
          <div className="cat-page__grid">
            {movies.map((m) => (
              <MovieCard
                key={m.movieId}
                movie={m}
                onClick={() =>
                  navigate("/movie/" + m.movieId, { state: { movie: m } })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
