import { useState } from 'react';
import { getPosterUrl, posterGradient } from '../services/tmdb';

export function usePoster(_tmdbId: number, genres: string, imdbId?: string) {
  // imdbId üzerinden direkt URL — fetch yok, API key yok
  const url = imdbId ? getPosterUrl(imdbId) : null;
  const [hasError, setHasError] = useState(false);

  return {
    url:      hasError ? null : url,
    gradient: posterGradient(genres),
    onError:  () => setHasError(true),   // img onError'a bağla
  };
}
