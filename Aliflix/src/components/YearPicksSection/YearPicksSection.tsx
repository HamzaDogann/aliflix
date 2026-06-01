import { useNavigate } from "react-router-dom";
import type { Movie } from "../../types/movie";
import { usePoster } from "../../hooks/usePoster";
import "./YearPicksSection.scss";

function FeaturedCard({ movie }: { movie: Movie }) {
  const navigate = useNavigate();
  const { url, gradient, onError } = usePoster(movie.tmdbId, movie.genres, movie.imdbId);
  const genres = movie.genres.split("|").slice(0, 3);

  return (
    <div
      className="year-featured"
      onClick={() => navigate("/movie/" + movie.movieId, { state: { movie } })}
    >
      {url ? (
        <img className="year-featured__bg" src={url} alt={movie.title} onError={onError} />
      ) : (
        <div className="year-featured__bg-ph" style={{ background: gradient }} />
      )}
      <div className="year-featured__overlay" />

      <div className="year-featured__body">
        <div className="year-featured__genres">
          {genres.map((g) => (
            <span key={g} className="year-featured__genre">{g}</span>
          ))}
        </div>
        <h3 className="year-featured__title">{movie.title}</h3>
        <div className="year-featured__meta">
          {movie.year && <span className="year-featured__year">{movie.year}</span>}
          <span className="year-featured__rating">⭐ {movie.avg_rating.toFixed(1)}</span>
        </div>
        <button
          className="year-featured__btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/movie/" + movie.movieId, { state: { movie } });
          }}
        >
          ▶ İzlemeye Başla
        </button>
      </div>
    </div>
  );
}

function SmallCard({ movie }: { movie: Movie }) {
  const navigate = useNavigate();
  const { url, gradient, onError } = usePoster(movie.tmdbId, movie.genres, movie.imdbId);

  return (
    <div
      className="year-small"
      onClick={() => navigate("/movie/" + movie.movieId, { state: { movie } })}
    >
      {url ? (
        <img className="year-small__bg" src={url} alt={movie.title} onError={onError} />
      ) : (
        <div className="year-small__bg-ph" style={{ background: gradient }} />
      )}
      <div className="year-small__overlay" />
      <div className="year-small__body">
        <div className="year-small__title">{movie.title}</div>
        <div className="year-small__rating">⭐ {movie.avg_rating.toFixed(1)}</div>
      </div>
    </div>
  );
}

interface Props {
  movies: Movie[];
}

export default function YearPicksSection({ movies }: Props) {
  if (movies.length < 2) return null;
  const padded = movies.length < 5
    ? [...movies, ...movies, ...movies].slice(0, 5)
    : movies;

  const [featured, ...rest] = padded;
  const grid = rest.slice(0, 4);

  return (
    <div className="year-picks">
      <div className="year-picks__header">
        <h2 className="year-picks__title">Son 10 Yılın Efsaneleri</h2>
      </div>
      <div className="year-picks__grid">
        <FeaturedCard movie={featured} />
        <div className="year-picks__small-grid">
          {grid.map((m) => (
            <SmallCard key={m.movieId} movie={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
