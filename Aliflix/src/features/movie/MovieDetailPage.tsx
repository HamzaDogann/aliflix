import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import type { Movie } from "../../types/movie";
import { API } from "../../services/api";
import { usePoster } from "../../hooks/usePoster";
import MovieCard from "../../components/MovieCard/MovieCard";
import { addWatchTime } from "../../services/watchHistory";
import "./MovieDetailPage.scss";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="movie-page__score-big">
      <span className="movie-page__score-big-num">{rating.toFixed(1)}</span>
      <span className="movie-page__score-big-max">/5</span>
      <div className="movie-page__score-big-stars">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = rating >= i;
          const half = !filled && rating >= i - 0.5;
          return (
            <span key={i} className="movie-page__star">
              {filled ? "⭐" : half ? "🌟" : "☆"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Puan dağılımı tahmini (gerçek dağılım API'de yok, avg_rating'den tahmin)
function RatingBars({ avg, count }: { avg: number; count: number }) {
  const bars = [5, 4, 3, 2, 1].map((star) => {
    const dist = Math.exp(-0.8 * Math.abs(star - avg));
    return { star, pct: Math.round(dist * 100) };
  });
  const total = bars.reduce((s, b) => s + b.pct, 0);

  return (
    <div className="movie-page__rating-bar-section">
      <div className="movie-page__section-title">Puan Dağılımı (tahmini)</div>
      <div className="movie-page__rating-bars">
        {bars.map((b) => (
          <div key={b.star} className="movie-page__rating-bar-row">
            <span className="movie-page__rating-bar-label">
              {"⭐".repeat(b.star)}
            </span>
            <div className="movie-page__rating-bar-track">
              <div
                className="movie-page__rating-bar-fill"
                style={{ width: `${Math.round((b.pct / total) * 100)}%` }}
              />
            </div>
            <span className="movie-page__rating-bar-val">
              {Math.round((count * b.pct) / total).toLocaleString("tr-TR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroBg({ movie }: { movie: Movie }) {
  const { url, gradient, onError } = usePoster(0, movie.genres, movie.imdbId);
  if (url)
    return (
      <img className="movie-page__hero-bg" src={url} alt="" onError={onError} />
    );
  return (
    <div className="movie-page__hero-ph" style={{ background: gradient }} />
  );
}

function Poster({ movie }: { movie: Movie }) {
  const { url, gradient, onError } = usePoster(0, movie.genres, movie.imdbId);
  if (url) return <img src={url} alt={movie.title} onError={onError} />;
  return (
    <div className="movie-page__poster-ph" style={{ background: gradient }}>
      🎬
    </div>
  );
}

export default function MovieDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const movie = location.state?.movie as Movie | undefined;

  const [similar, setSimilar] = useState<Movie[]>([]);
  const [watchUrl, setWatchUrl] = useState<string | null>(null);
  const [showWatch, setShowWatch] = useState(false);
  const [watchError, setWatchError] = useState(false);
  const watchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchStartRef = useRef<number>(0);
  const similarScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!movie) return;
    API.similar(movie.movieId, 10)
      .then(setSimilar)
      .catch(() => {});
    window.scrollTo(0, 0);
  }, [movie?.movieId]);

  useEffect(() => {
    const el = similarScrollRef.current;
    if (!el) return;
    const update = () => {
      const rem = el.scrollWidth - el.clientWidth - el.scrollLeft;
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(rem > 8);
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [similar.length]);

  // İzleme süresi takibi
  useEffect(() => {
    if (!movie) return;
    if (showWatch) {
      watchStartRef.current = Date.now();
      // Her 10 saniyede bir kaydet
      watchTimerRef.current = setInterval(() => {
        addWatchTime(movie, 10);
      }, 10_000);
    } else {
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
        watchTimerRef.current = null;
      }
      // Kalan kesirsiz süreyi kaydet
      const elapsed = Math.floor((Date.now() - watchStartRef.current) / 1000);
      const remainder = elapsed % 10;
      if (watchStartRef.current > 0 && remainder > 0) {
        addWatchTime(movie, remainder);
      }
      watchStartRef.current = 0;
    }
    return () => {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    };
  }, [showWatch]);

  if (!movie) {
    return (
      <div style={{ padding: 64, textAlign: "center", color: "#7A9BB5" }}>
        Film bulunamadı.
        <button className="movie-page__empty-back" onClick={() => navigate(-1)}>
          <IoArrowBackOutline
            aria-hidden="true"
            className="movie-page__back-icon"
          />
          <span>Geri dön</span>
        </button>
      </div>
    );
  }

  const handleWatch = async () => {
    if (!movie.imdbId) return;
    if (watchUrl) {
      setShowWatch(true);
      return;
    }
    const data = await API.watchUrl(movie.imdbId).catch(() => null);
    if (data?.embed_url) {
      setWatchUrl(data.embed_url);
      setWatchError(false);
    } else {
      setWatchError(true);
    }
    setShowWatch(true);
  };

  const tags = movie.tags
    ? movie.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];

  if (showWatch) {
    return (
      <div className="watch-page">
        <div className="watch-page__header">
          <span className="watch-page__title">{movie.title}</span>
          <button
            className="watch-page__close"
            onClick={() => setShowWatch(false)}
          >
            <IoArrowBackOutline
              aria-hidden="true"
              className="watch-page__close-icon"
            />
            <span>Filme dön</span>
          </button>
        </div>
        {watchError || !watchUrl ? (
          <div className="watch-page__error">
            <div className="watch-page__error-icon">📽️</div>
            <h2 className="watch-page__error-title">
              Bu Film İçin İçerik Bulunamadı
            </h2>
            <p className="watch-page__error-desc">
              Bu film şu an izleme kaynağımızda mevcut değil.
              <br />
              Farklı bir film keşfetmek ister misin?
            </p>
            <div className="watch-page__error-actions">
              <button
                className="watch-page__error-btn watch-page__error-btn--back"
                onClick={() => navigate("/")}
              >
                <IoArrowBackOutline
                  aria-hidden="true"
                  className="watch-page__error-btn-icon"
                />
                <span>Ana sayfaya dön</span>
              </button>
              <button
                className="watch-page__error-btn watch-page__error-btn--home"
                onClick={() => navigate("/recommend")}
              >
                Öneri Al
              </button>
            </div>
          </div>
        ) : (
          <div className="watch-page__frame">
            <iframe src={watchUrl} allowFullScreen title={movie.title} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="movie-page">
      {/* Hero arka plan */}
      <div className="movie-page__hero">
        <HeroBg movie={movie} />
        <div className="movie-page__hero-overlay" />
        <button className="movie-page__back" onClick={() => navigate(-1)}>
          <IoArrowBackOutline
            aria-hidden="true"
            className="movie-page__back-icon"
          />
          <span>Geri</span>
        </button>
      </div>

      <div className="movie-page__body">
        {/* Sol — poster */}
        <div className="movie-page__poster">
          <Poster movie={movie} />
        </div>

        {/* Sağ — bilgiler */}
        <div className="movie-page__info">
          <h1 className="movie-page__title">{movie.title}</h1>

          {/* Büyük puan gösterimi */}
          <div className="movie-page__rating-row">
            <Stars rating={movie.avg_rating} />
            <div className="movie-page__vote-info">
              <div className="movie-page__vote-info-count">
                {movie.rating_count.toLocaleString("tr-TR")}
              </div>
              <div className="movie-page__vote-info-label">KULLANICI OYU</div>
            </div>
          </div>

          {/* Meta şerit */}
          <div className="movie-page__meta-strip">
            {movie.year && (
              <div className="movie-page__meta-item">
                <div className="movie-page__meta-item-label">Yıl</div>
                <div className="movie-page__meta-item-value">{movie.year}</div>
              </div>
            )}
            <div className="movie-page__meta-item">
              <div className="movie-page__meta-item-label">Veri Seti</div>
              <div className="movie-page__meta-item-value">MovieLens</div>
            </div>
            <div className="movie-page__meta-item">
              <div className="movie-page__meta-item-label">Algoritma</div>
              <div className="movie-page__meta-item-value">KNN (K=10)</div>
            </div>
            {movie.imdbId && (
              <div className="movie-page__meta-item">
                <div className="movie-page__meta-item-label">IMDb ID</div>
                <div className="movie-page__meta-item-value">
                  {movie.imdbId}
                </div>
              </div>
            )}
          </div>

          {/* Türler */}
          <div className="movie-page__genres">
            {movie.genres.split("|").map((g) => (
              <span key={g} className="movie-page__genre">
                {g}
              </span>
            ))}
          </div>

          {/* Öneri nedeni */}
          {movie.reason && (
            <div className="movie-page__reason">💡 {movie.reason}</div>
          )}

          {/* Aksiyon butonları */}
          <div className="movie-page__actions">
            {movie.imdbId && (
              <button
                className="movie-page__btn movie-page__btn--watch"
                onClick={handleWatch}
              >
                ▶ İzle
              </button>
            )}
            <button
              className="movie-page__btn movie-page__btn--secondary"
              onClick={() => navigate(-1)}
            >
              <IoArrowBackOutline
                aria-hidden="true"
                className="movie-page__btn-icon"
              />
              <span>Geri dön</span>
            </button>
          </div>

          {/* Puan dağılımı */}
          <RatingBars avg={movie.avg_rating} count={movie.rating_count} />

          {/* Etiketler */}
          {tags.length > 0 && (
            <div className="movie-page__section">
              <div className="movie-page__section-title">Etiketler</div>
              <div className="movie-page__tags">
                {tags.map((t) => (
                  <span key={t} className="movie-page__tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Benzer filmler — tam genişlik */}
      {similar.length > 0 && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 0 64px" }}>
          <div
            className="movie-page__section-title"
            style={{ padding: "0 32px" }}
          >
            Benzer Filmler (KNN)
          </div>
          <div className="movie-page__similar-viewport">
            <div className="movie-page__similar-grid" ref={similarScrollRef}>
              {similar.map((m) => (
                <MovieCard
                  key={m.movieId}
                  movie={m}
                  onClick={(s) =>
                    navigate("/movie/" + s.movieId, { state: { movie: s } })
                  }
                />
              ))}
            </div>
            <button
              type="button"
              className={`movie-page__similar-arrow movie-page__similar-arrow--prev ${canScrollLeft ? "" : "movie-page__similar-arrow--hidden"}`}
              onClick={() =>
                similarScrollRef.current?.scrollBy({
                  left: -Math.round(similarScrollRef.current.clientWidth * 0.9),
                  behavior: "smooth",
                })
              }
            >
              ‹
            </button>
            <button
              type="button"
              className={`movie-page__similar-arrow movie-page__similar-arrow--next ${canScrollRight ? "" : "movie-page__similar-arrow--hidden"}`}
              onClick={() =>
                similarScrollRef.current?.scrollBy({
                  left: Math.round(similarScrollRef.current.clientWidth * 0.9),
                  behavior: "smooth",
                })
              }
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
