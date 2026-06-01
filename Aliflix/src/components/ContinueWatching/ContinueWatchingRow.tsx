import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveEntries, removeWatchEntry, watchedPercent } from "../../services/watchHistory";
import type { WatchEntry } from "../../services/watchHistory";
import { usePoster } from "../../hooks/usePoster";
import "./ContinueWatchingRow.scss";

function ContinueCard({
  entry,
  onRemove,
}: {
  entry: WatchEntry;
  onRemove: (id: number) => void;
}) {
  const navigate = useNavigate();
  const { url, gradient, onError } = usePoster(
    entry.movie.tmdbId,
    entry.movie.genres,
    entry.movie.imdbId,
  );
  const pct = watchedPercent(entry.watchedSeconds);
  const mins = Math.floor(entry.watchedSeconds / 60);

  return (
    <div
      className="cw-card"
      onClick={() =>
        navigate("/movie/" + entry.movie.movieId, {
          state: { movie: entry.movie },
        })
      }
    >
      <div className="cw-card__poster">
        {url ? (
          <img src={url} alt={entry.movie.title} loading="lazy" onError={onError} />
        ) : (
          <div className="cw-card__poster-ph" style={{ background: gradient }}>
            🎬
          </div>
        )}

        <button
          className="cw-card__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(entry.movie.movieId);
          }}
          title="Listeden kaldır"
        >
          ✕
        </button>

        <div className="cw-card__overlay">
          <div className="cw-card__title">{entry.movie.title}</div>
          <div className="cw-card__meta">{mins}. dakikada kaldı</div>
          <div className="cw-card__progress-track">
            <div className="cw-card__progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContinueWatchingRow() {
  const [entries, setEntries] = useState<WatchEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const refresh = () => setEntries(getActiveEntries());

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

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
  }, [entries.length]);

  if (!entries.length) return null;

  const handleRemove = (id: number) => {
    removeWatchEntry(id);
    refresh();
  };

  return (
    <div className="cw-row">
      <div className="cw-row__header">
        <h2 className="cw-row__title">
          <span className="cw-row__dot" />
          İzlemeye Devam Et
        </h2>
      </div>
      <div className="cw-row__viewport">
        <div className="cw-row__scroll" ref={scrollRef}>
          {entries.map((e) => (
            <ContinueCard key={e.movieId} entry={e} onRemove={handleRemove} />
          ))}
        </div>
        {canLeft && (
          <button
            className="cw-row__arrow cw-row__arrow--left"
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
            className="cw-row__arrow cw-row__arrow--right"
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
