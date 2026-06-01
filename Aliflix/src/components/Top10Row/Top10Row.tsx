import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Movie } from "../../types/movie";
import { usePoster } from "../../hooks/usePoster";
import "./Top10Row.scss";

function Top10Card({
  movie,
  rank,
  onClick,
}: {
  movie: Movie;
  rank: number;
  onClick: () => void;
}) {
  const { url, gradient, onError } = usePoster(
    movie.tmdbId,
    movie.genres,
    movie.imdbId,
  );
  const firstGenre = movie.genres.split("|")[0];

  return (
    <div className="top10-item" onClick={onClick}>
      <span className="top10-item__rank">{rank}</span>
      <div className="top10-item__card">
        <div className="top10-item__poster">
          {url ? (
            <img src={url} alt={movie.title} loading="lazy" onError={onError} />
          ) : (
            <div
              className="top10-item__poster-ph"
              style={{ background: gradient }}
            >
              <span>🎬</span>
              <span className="top10-item__poster-abbr">
                {movie.title.split(" ").slice(0, 3).map((w) => w[0]).join("")}
              </span>
            </div>
          )}
          <span className="top10-item__rating">⭐ {movie.avg_rating}</span>
          <div className="top10-item__overlay">
            <div className="top10-item__overlay-title">{movie.title}</div>
            <div className="top10-item__overlay-meta">
              {movie.year && <span className="top10-item__overlay-year">{movie.year}</span>}
              <span className="top10-item__overlay-genre">{firstGenre}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Top10Row({ movies }: { movies: Movie[] }) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const top10 = movies.slice(0, 10);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const rem = el.scrollWidth - el.clientWidth - el.scrollLeft;
      setCanLeft(el.scrollLeft > 8);
      setCanRight(rem > 8);
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [top10.length]);

  if (!top10.length) return null;

  return (
    <div className="top10-row">
      <div className="top10-row__header">
        <h2 className="top10-row__title">Günün TOP 10 Filmi</h2>
      </div>
      <div className="top10-row__viewport">
        <div className="top10-row__scroll" ref={scrollRef}>
          {top10.map((movie, i) => (
            <Top10Card
              key={movie.movieId}
              movie={movie}
              rank={i + 1}
              onClick={() =>
                navigate("/movie/" + movie.movieId, { state: { movie } })
              }
            />
          ))}
        </div>
        {canLeft && (
          <button
            className="top10-row__arrow top10-row__arrow--left"
            onClick={() =>
              scrollRef.current?.scrollBy({
                left: -Math.round(scrollRef.current.clientWidth * 0.9),
                behavior: "smooth",
              })
            }
          >
            ‹
          </button>
        )}
        {canRight && (
          <button
            className="top10-row__arrow top10-row__arrow--right"
            onClick={() =>
              scrollRef.current?.scrollBy({
                left: Math.round(scrollRef.current.clientWidth * 0.9),
                behavior: "smooth",
              })
            }
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
