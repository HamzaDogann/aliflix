import type { Movie } from "../types/movie";

export interface WatchEntry {
  movieId: number;
  movie: Movie;
  watchedSeconds: number;
  lastWatched: number;
}

const KEY = "aliflix_watch_history";
// 100 dk izlenirse "bitti" sayılır, listeden çıkar
const COMPLETE_SECONDS = 100 * 60;
const MAX_MOVIE_SECONDS = 120 * 60;

function load(): WatchEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persist(entries: WatchEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function addWatchTime(movie: Movie, seconds: number) {
  const entries = load();
  const idx = entries.findIndex((e) => e.movieId === movie.movieId);
  if (idx >= 0) {
    entries[idx].watchedSeconds = Math.min(
      entries[idx].watchedSeconds + seconds,
      MAX_MOVIE_SECONDS,
    );
    entries[idx].lastWatched = Date.now();
    entries[idx].movie = movie;
  } else {
    entries.unshift({
      movieId: movie.movieId,
      movie,
      watchedSeconds: Math.min(seconds, MAX_MOVIE_SECONDS),
      lastWatched: Date.now(),
    });
  }
  persist(entries);
}

export function removeWatchEntry(movieId: number) {
  persist(load().filter((e) => e.movieId !== movieId));
}

export function getActiveEntries(): WatchEntry[] {
  return load()
    .filter((e) => e.watchedSeconds < COMPLETE_SECONDS)
    .sort((a, b) => b.lastWatched - a.lastWatched)
    .slice(0, 10);
}

export function watchedPercent(watchedSeconds: number): number {
  return Math.min(Math.round((watchedSeconds / MAX_MOVIE_SECONDS) * 100), 100);
}
