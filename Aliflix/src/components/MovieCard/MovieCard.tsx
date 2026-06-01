import type { Movie } from "../../types/movie";
import { usePoster } from "../../hooks/usePoster";
import "./MovieCard.scss";

interface Props {
  movie: Movie;
  onClick?: (movie: Movie) => void;
}

export default function MovieCard({ movie, onClick }: Props) {
  const { url, gradient, onError } = usePoster(
    movie.tmdbId,
    movie.genres,
    movie.imdbId,
  );
  const firstGenre = movie.genres.split("|")[0];

  return (
    <div className="movie-card" onClick={() => onClick?.(movie)}>
      <div className="movie-card__poster">
        {url ? (
          <img src={url} alt={movie.title} loading="lazy" onError={onError} />
        ) : (
          <div
            className="movie-card__poster-placeholder"
            style={{ background: gradient }}
          >
            <span className="movie-card__poster-icon">🎬</span>
            <span className="movie-card__poster-abbr">
              {movie.title
                .split(" ")
                .slice(0, 3)
                .map((w) => w[0])
                .join("")}
            </span>
          </div>
        )}
        <span className="movie-card__poster-rating">⭐ {movie.avg_rating}</span>
        <div className="movie-card__overlay">
          <div className="movie-card__title">{movie.title}</div>
          <div className="movie-card__meta">
            {movie.year && (
              <span className="movie-card__year">{movie.year}</span>
            )}
            <span className="movie-card__genre">{firstGenre}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
