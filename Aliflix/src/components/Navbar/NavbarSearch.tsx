import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../services/api";
import { getPosterUrl, posterGradient } from "../../services/tmdb";
import type { Movie } from "../../types/movie";

function SearchResultCard({
  movie,
  index,
  onClick,
}: {
  movie: Movie;
  index: number;
  onClick: (m: Movie) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const url = movie.imdbId ? getPosterUrl(movie.imdbId) : null;
  const gradient = posterGradient(movie.genres);
  const firstGenre = movie.genres.split("|")[0];

  return (
    <div
      className="search__result"
      style={{ "--delay": `${index * 38}ms` } as React.CSSProperties}
      onClick={() => onClick(movie)}
    >
      <div className="search__result-poster">
        {url && !imgErr ? (
          <img src={url} alt={movie.title} onError={() => setImgErr(true)} />
        ) : (
          <div
            className="search__result-poster-fallback"
            style={{ background: gradient }}
          >
            <span>{movie.title.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="search__result-info">
        <div className="search__result-title">{movie.title}</div>
        <div className="search__result-meta">
          <span className="search__result-genre">{firstGenre}</span>
          {movie.year && (
            <span className="search__result-year">{movie.year}</span>
          )}
        </div>
        <div className="search__result-rating">
          <span className="search__result-star">★</span>
          {movie.avg_rating.toFixed(1)}
        </div>
      </div>
    </div>
  );
}

export default function NavbarSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await API.search(q, 10);
      setResults(data);
      setOpen(data.length > 0);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleSelect = (movie: Movie) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    navigate(`/movie/${movie.movieId}`, { state: { movie } });
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    clearTimeout(timerRef.current);
  };

  return (
    <div className="search" ref={wrapperRef}>
      <div
        className={`search__input-wrap${open && results.length ? " search__input-wrap--open" : ""}`}
      >
        <svg
          className="search__icon"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search__input"
          type="text"
          placeholder="Bir film arayın..."
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
          spellCheck={false}
        />
        {loading && <div className="search__spinner" />}
        {query && !loading && (
          <button className="search__clear" onClick={handleClear}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="search__dropdown">
          {results.map((movie, i) => (
            <SearchResultCard
              key={movie.movieId}
              movie={movie}
              index={i}
              onClick={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
