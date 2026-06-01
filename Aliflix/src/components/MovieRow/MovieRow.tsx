import type { Movie } from "../../types/movie";
import { useEffect, useRef, useState } from "react";
import MovieCard from "../MovieCard/MovieCard";
import "./MovieRow.scss";

interface Props {
  title: string;
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void;
}

export default function MovieRow({ title, movies, onMovieClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      const el = scrollRef.current;
      if (!el) return;
      const remaining = el.scrollWidth - el.clientWidth - el.scrollLeft;
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(remaining > 8);
    };

    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    const el = scrollRef.current;
    el?.addEventListener("scroll", updateScrollState);

    return () => {
      window.removeEventListener("resize", updateScrollState);
      el?.removeEventListener("scroll", updateScrollState);
    };
  }, [movies.length]);

  const handleScrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: Math.round(el.clientWidth * 0.9), behavior: "smooth" });
  };

  const handleScrollLeft = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: -Math.round(el.clientWidth * 0.9),
      behavior: "smooth",
    });
  };

  if (!movies.length) return null;
  return (
    <div className="movie-row">
      <div className="movie-row__header">
        <h2 className="movie-row__title">{title}</h2>
      </div>
      <div className="movie-row__viewport">
        <div className="movie-row__scroll" ref={scrollRef}>
          {movies.map((m) => (
            <MovieCard key={m.movieId} movie={m} onClick={onMovieClick} />
          ))}
        </div>
        <button
          type="button"
          className={`movie-row__prev ${canScrollLeft ? "" : "movie-row__prev--hidden"}`}
          onClick={handleScrollLeft}
          aria-label={`${title} satırını sola kaydır`}
        >
          ‹
        </button>
        <button
          type="button"
          className={`movie-row__next ${canScrollRight ? "" : "movie-row__next--hidden"}`}
          onClick={handleScrollRight}
          aria-label={`${title} satırını sağa kaydır`}
        >
          ›
        </button>
      </div>
    </div>
  );
}
