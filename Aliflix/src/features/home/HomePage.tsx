import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Movie, DatasetStats } from "../../types/movie";
import { API } from "../../services/api";
import { getPosterUrl } from "../../services/tmdb";
import MovieRow from "../../components/MovieRow/MovieRow";
import ContinueWatchingRow from "../../components/ContinueWatching/ContinueWatchingRow";
import Top10Row from "../../components/Top10Row/Top10Row";
import PromoSection from "../../components/PromoSection/PromoSection";
import YearPicksSection from "../../components/YearPicksSection/YearPicksSection";
import GenreGrid from "../../components/GenreGrid/GenreGrid";
import "./HomePage.scss";

const fmt = (n: number) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + "M"
    : n >= 1_000
      ? (n / 1_000).toFixed(0) + "K"
      : String(n);

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [mostRated, setMostRated] = useState<Movie[]>([]);
  const [animation, setAnimation] = useState<Movie[]>([]);
  const [horror, setHorror] = useState<Movie[]>([]);
  const [yearPicks, setYearPicks] = useState<Movie[]>([]);

  useEffect(() => {
    API.stats()
      .then(setStats)
      .catch(() => {});
    API.topRated(28)
      .then(setTopRated)
      .catch(() => {});
    API.mostRated(28)
      .then(setMostRated)
      .catch(() => {});
    API.recommend({ genre: "Animation", n: 16 })
      .then(setAnimation)
      .catch(() => {});
    API.recommend({ genre: "Horror", n: 16 })
      .then(setHorror)
      .catch(() => {});
    API.recommend({ year_min: 2015, year_max: 2024, min_rating: 3.8, n: 5 })
      .then(setYearPicks)
      .catch(() => {});
  }, []);

  const goToMovie = (m: Movie) =>
    navigate("/movie/" + m.movieId, { state: { movie: m } });

  const heroMovies = [...topRated, ...mostRated]
    .filter(
      (m, idx, arr) => arr.findIndex((x) => x.movieId === m.movieId) === idx,
    )
    .slice(0, 48);

  const heroTiles: Movie[] = heroMovies.length
    ? heroMovies
    : Array.from(
        { length: 48 },
        (_, i): Movie => ({
          movieId: -1 - i,
          title: "",
          genres: "",
          tags: "",
          year: null,
          avg_rating: 0,
          rating_count: 0,
          imdbId: "",
          tmdbId: 0,
        }),
      );

  return (
    <div className="home">
      <div className="home__hero">
        <div className="home__hero-glow" />
        <div className="home__hero-collage" aria-hidden="true">
          {heroTiles.map((movie, i) => {
            const poster = movie.imdbId ? getPosterUrl(movie.imdbId) : null;
            const tileStyle = poster
              ? { backgroundImage: `url(${poster})` }
              : undefined;

            return (
              <div
                key={`${movie.movieId}-${i}`}
                className={`home__hero-collage-tile home__hero-collage-tile--r${i % 4}`}
                style={tileStyle}
              />
            );
          })}
        </div>
        <div className="home__hero-content">
          <div className="home__hero-label">🎬 MovieLens · KNN · K=10</div>
          <h1 className="home__hero-title">
            Sana Özel
            <br />
            <span>Film Önerileri</span>
          </h1>
          <p className="home__hero-sub">
            32 milyon puanlama verisinden öğrenilmiş KNN algoritması ile
            beğenilerine en yakın filmleri keşfet.
          </p>
          <div className="home__hero-actions">
            <button
              className="home__hero-btn home__hero-btn--primary"
              onClick={() => navigate("/recommend")}
            >
              Öneri Al
            </button>
            <button
              className="home__hero-btn home__hero-btn--secondary"
              onClick={() => navigate("/dataset")}
            >
              Veri Seti
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="home__stats">
          {[
            { value: fmt(stats.total_movies), label: "FİLM" },
            { value: fmt(stats.total_users), label: "KULLANICI" },
            { value: fmt(stats.total_ratings), label: "PUANLAMA" },
            { value: String(stats.avg_rating), label: "ORT. PUAN" },
          ].map((s) => (
            <div key={s.label} className="home__stat">
              <div className="home__stat-value">{s.value}</div>
              <div className="home__stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="home__rows">
        <ContinueWatchingRow />
        <Top10Row movies={topRated} />
        <MovieRow
          title="En Yüksek Puanlı"
          movies={topRated}
          onMovieClick={goToMovie}
        />
        <MovieRow
          title="En Çok Puanlanan"
          movies={mostRated}
          onMovieClick={goToMovie}
        />
        <YearPicksSection movies={yearPicks} />
        <MovieRow
          title="Animasyon'a Ne Dersin?"
          movies={animation}
          onMovieClick={goToMovie}
        />
        <MovieRow
          title="Biraz Korku İstersen?"
          movies={horror}
          onMovieClick={goToMovie}
        />
        <GenreGrid />
        <PromoSection movies={mostRated} />
      </div>
    </div>
  );
}
