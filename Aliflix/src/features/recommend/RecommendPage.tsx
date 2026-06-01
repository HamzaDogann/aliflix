import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import type { Movie } from "../../types/movie";
import { API } from "../../services/api";
import MovieCard from "../../components/MovieCard/MovieCard";
import searchAnimation from "../../assets/animation/SearchLottie.json";
import "./RecommendPage.scss";

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
  "Romance", "Sci-Fi", "Thriller", "War",
];

export default function RecommendPage() {
  const navigate = useNavigate();

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [count, setCount] = useState(10);
  const [userId, setUserId] = useState("");
  const [movieQuery, setMovieQuery] = useState("");
  const [movieId, setMovieId] = useState<number | null>(null);

  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);

  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    API.mostRated(200).then(setAllMovies).catch(() => {});
  }, []);

  useEffect(() => {
    if (!movieQuery.trim()) { setSuggestions([]); return; }
    const q = movieQuery.toLowerCase();
    setSuggestions(allMovies.filter((m) => m.title.toLowerCase().includes(q)).slice(0, 8));
  }, [movieQuery, allMovies]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node))
        setShowSuggest(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params: Record<string, string | number> = { n: count };
      if (selectedGenres.length > 0) params.genre = selectedGenres.join(",");
      if (minRating > 0) params.min_rating = minRating;
      if (maxRating < 5) params.max_rating = maxRating;
      if (yearMin) params.year_min = Number(yearMin);
      if (yearMax) params.year_max = Number(yearMax);
      if (movieId) params.movie_id = movieId;
      if (userId) params.user_id = Number(userId);
      setResults(await API.recommend(params));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [selectedGenres, minRating, maxRating, yearMin, yearMax, count, movieId, userId]);

  const handleReset = () => {
    setSelectedGenres([]); setMinRating(0); setMaxRating(5);
    setYearMin(""); setYearMax(""); setCount(10);
    setMovieQuery(""); setMovieId(null);
    setResults([]); setSearched(false);
  };

  return (
    <div className="recommend">

      {/* ── Filter panel ── */}
      <aside className="rec-filter">
        <div className="rec-filter__title">Kriterler</div>

        <form onSubmit={handleSubmit}>

          {/* Tür */}
          <div className="rec-filter__field">
            <label className="rec-filter__label">
              Film Türü
              {selectedGenres.length > 0 && (
                <span className="rec-filter__label-val">{selectedGenres.length} seçili</span>
              )}
            </label>
            <div className="rec-filter__genre-pills">
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`rec-filter__genre-pill${selectedGenres.includes(g) ? " rec-filter__genre-pill--active" : ""}`}
                  onClick={() => toggleGenre(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Min puan */}
          <div className="rec-filter__field">
            <label className="rec-filter__label">
              Min. Puan
              <span className="rec-filter__label-val">
                {minRating > 0 ? minRating.toFixed(1) : "—"}
              </span>
            </label>
            <input
              type="range"
              className="rec-filter__range"
              min={0} max={5} step={0.5}
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
            />
          </div>

          {/* Max puan */}
          <div className="rec-filter__field">
            <label className="rec-filter__label">
              Max. Puan
              <span className="rec-filter__label-val">
                {maxRating < 5 ? maxRating.toFixed(1) : "—"}
              </span>
            </label>
            <input
              type="range"
              className="rec-filter__range"
              min={0} max={5} step={0.5}
              value={maxRating}
              onChange={(e) => setMaxRating(Number(e.target.value))}
            />
          </div>

          <hr className="rec-filter__divider" />

          {/* Yıl */}
          <div className="rec-filter__field">
            <label className="rec-filter__label">Yıl Aralığı</label>
            <div className="rec-filter__year-row">
              <input
                className="rec-filter__input"
                type="number"
                placeholder="1970"
                min={1900} max={2025}
                value={yearMin}
                onChange={(e) => setYearMin(e.target.value)}
              />
              <input
                className="rec-filter__input"
                type="number"
                placeholder="2024"
                min={1900} max={2025}
                value={yearMax}
                onChange={(e) => setYearMax(e.target.value)}
              />
            </div>
          </div>

          {/* Film sayısı */}
          <div className="rec-filter__field">
            <label className="rec-filter__label">
              Film Sayısı
              <span className="rec-filter__label-val">{count}</span>
            </label>
            <input
              type="range"
              className="rec-filter__range"
              min={5} max={50} step={5}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>

          <hr className="rec-filter__divider" />

          {/* Beğenilen film */}
          <div className="rec-filter__field">
            <label className="rec-filter__label">Beğenilen Film</label>
            <div className="rec-filter__autocomplete" ref={suggestRef}>
              <input
                className="rec-filter__input"
                type="text"
                placeholder="Film adı yazın..."
                value={movieQuery}
                autoComplete="off"
                onChange={(e) => {
                  setMovieQuery(e.target.value);
                  setMovieId(null);
                  setShowSuggest(true);
                }}
                onFocus={() => movieQuery && setShowSuggest(true)}
              />
              {showSuggest && suggestions.length > 0 && (
                <div className="rec-filter__autocomplete-list">
                  {suggestions.map((m) => (
                    <div
                      key={m.movieId}
                      className="rec-filter__autocomplete-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setMovieQuery(m.title);
                        setMovieId(m.movieId);
                        setShowSuggest(false);
                      }}
                    >
                      {m.title}
                      {m.year && (
                        <span className="rec-filter__autocomplete-item-year">
                          {m.year}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {movieId && (
              <div className="rec-filter__hint">Seçildi (ID: {movieId})</div>
            )}
          </div>

          {/* Kullanıcı ID */}
          <div className="rec-filter__field">
            <label className="rec-filter__label">Kullanıcı ID</label>
            <input
              className="rec-filter__input"
              type="text"
              placeholder="örn. 12345"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            {userId && (
              <div className="rec-filter__hint rec-filter__hint--muted">
                Kullanıcı bazlı öneri etkin
              </div>
            )}
          </div>

          <button type="submit" className="rec-filter__submit" disabled={loading}>
            {loading ? "Hesaplanıyor..." : "Öneri Al"}
          </button>
          <button type="button" className="rec-filter__reset" onClick={handleReset}>
            Sıfırla
          </button>
        </form>
      </aside>

      {/* ── Results ── */}
      <main className="rec-main">
        <div className="rec-main__header">
          <h1 className="rec-main__title">Film Önerileri</h1>
        </div>

        {loading && (
          <div className="rec-loading">KNN hesaplanıyor...</div>
        )}

        {!loading && !searched && (
          <div className="rec-empty">
            <Lottie
              animationData={searchAnimation}
              loop
              className="rec-empty__lottie"
            />
            <div className="rec-empty__text">
              Kriterlerinizi seçin ve "Öneri Al" butonuna basın
            </div>
            <div className="rec-empty__sub">
              KNN algoritması size en uygun filmleri bulacak
            </div>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="rec-empty">
            <div className="rec-empty__circle" />
            <div className="rec-empty__text">Kriterlere uygun film bulunamadı</div>
            <div className="rec-empty__sub">Filtreleri genişletin veya sıfırlayın</div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="rec-grid">
              {results.map((m) => (
                <MovieCard
                  key={m.movieId}
                  movie={m}
                  onClick={() => navigate("/movie/" + m.movieId, { state: { movie: m } })}
                />
              ))}
            </div>
            <div className="rec-main__count-row">
              <span className="rec-main__count">{results.length} sonuç</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
