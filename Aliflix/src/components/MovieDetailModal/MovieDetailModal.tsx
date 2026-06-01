import { useState, useEffect } from "react";
import type { Movie } from "../../types/movie";
import { API } from "../../services/api";
import { usePoster } from "../../hooks/usePoster";
import MovieCard from "../MovieCard/MovieCard";
import { IoArrowBackOutline } from "react-icons/io5";
import "./MovieDetailModal.scss";

interface Props {
  movie: Movie;
  onClose: () => void;
}

function HeroBg({ movie }: { movie: Movie }) {
  const { url, gradient, onError } = usePoster(
    movie.tmdbId,
    movie.genres,
    movie.imdbId,
  );
  if (url)
    return (
      <img
        className="movie-detail__hero-bg"
        src={url}
        alt=""
        onError={onError}
      />
    );
  return (
    <div
      className="movie-detail__hero-placeholder"
      style={{ background: gradient }}
    />
  );
}

function PosterThumb({ movie }: { movie: Movie }) {
  const { url, gradient, onError } = usePoster(
    movie.tmdbId,
    movie.genres,
    movie.imdbId,
  );
  if (url) return <img src={url} alt={movie.title} onError={onError} />;
  return (
    <div className="movie-detail__poster-ph" style={{ background: gradient }}>
      🎬
    </div>
  );
}

export default function MovieDetailModal({ movie, onClose }: Props) {
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [watchUrl, setWatchUrl] = useState<string | null>(null);
  const [showWatch, setShowWatch] = useState(false);

  useEffect(() => {
    API.similar(movie.movieId, 6)
      .then(setSimilar)
      .catch(() => {});
  }, [movie.movieId]);

  const handleWatch = async () => {
    if (!movie.imdbId) return;
    if (watchUrl) {
      setShowWatch(true);
      return;
    }
    const data = await API.watchUrl(movie.imdbId).catch(() => null);
    if (data) {
      setWatchUrl(data.embed_url);
      setShowWatch(true);
    }
  };

  if (showWatch && watchUrl) {
    return (
      <div className="watch-modal">
        <div className="watch-modal__header">
          <span className="watch-modal__title">{movie.title}</span>
          <button
            className="watch-modal__close"
            onClick={() => setShowWatch(false)}
          >
            <IoArrowBackOutline
              aria-hidden="true"
              className="watch-modal__close-icon"
            />
            <span>Geri</span>
          </button>
        </div>
        <div className="watch-modal__frame">
          <iframe src={watchUrl} allowFullScreen title={movie.title} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="movie-detail">
        <div className="movie-detail__hero">
          <HeroBg movie={movie} />
          <div className="movie-detail__hero-overlay" />
          <button className="movie-detail__close" onClick={onClose}>
            ✕
          </button>
          <div className="movie-detail__poster">
            <PosterThumb movie={movie} />
          </div>
        </div>

        <div className="movie-detail__body">
          <h2 className="movie-detail__title">{movie.title}</h2>
          <div className="movie-detail__meta">
            {movie.year && (
              <span className="movie-detail__year">{movie.year}</span>
            )}
            <span className="movie-detail__rating">⭐ {movie.avg_rating}</span>
            <span className="movie-detail__count">
              {movie.rating_count.toLocaleString("tr-TR")} oy
            </span>
          </div>

          <div className="movie-detail__genres">
            {movie.genres.split("|").map((g) => (
              <span key={g} className="movie-detail__genre-chip">
                {g}
              </span>
            ))}
          </div>

          {movie.reason && (
            <div className="movie-detail__reason">💡 {movie.reason}</div>
          )}

          <div className="movie-detail__actions">
            {movie.imdbId && (
              <button className="btn btn--primary" onClick={handleWatch}>
                ▶ İzle
              </button>
            )}
            <button className="btn btn--secondary" onClick={onClose}>
              Kapat
            </button>
          </div>

          {similar.length > 0 && (
            <>
              <div className="movie-detail__section-title">Benzer Filmler</div>
              <div className="movie-detail__similar-row">
                {similar.map((m) => (
                  <MovieCard key={m.movieId} movie={m} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
