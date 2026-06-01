import type { Movie, DatasetStats, RecommendParams } from '../types/movie';

const BASE = 'http://localhost:8000';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const API = {
  stats: () => get<DatasetStats>('/api/stats'),

  topRated: (n = 10) => get<Movie[]>(`/api/top-rated?n=${n}`),

  mostRated: (n = 10) => get<Movie[]>(`/api/most-rated?n=${n}`),

  recommend: (params: RecommendParams) => {
    const clean: Record<string, string> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') clean[k] = String(v);
    });
    return get<Movie[]>(`/api/recommend?${new URLSearchParams(clean)}`);
  },

  search: (q: string, n = 10) =>
    get<Movie[]>(`/api/search?q=${encodeURIComponent(q)}&n=${n}`),

  similar: (movieId: number, n = 6) =>
    get<Movie[]>(`/api/similar/${movieId}?n=${n}`),

  watchUrl: (imdbId: string) =>
    get<{ imdb_id: string; embed_url: string }>(`/api/watch/${imdbId}`),
};
