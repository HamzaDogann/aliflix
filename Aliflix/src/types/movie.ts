export interface Movie {
  movieId: number;
  title: string;
  genres: string;
  tags: string;
  year: number | null;
  avg_rating: number;
  rating_count: number;
  imdbId: string;
  tmdbId: number;
  distance?: number;
  reason?: string;
}

export interface DatasetStats {
  total_users: number;
  total_movies: number;
  total_ratings: number;
  avg_rating: number;
  algorithm: string;
  dataset: string;
  sample_info: {
    original_ratings: string;
    used_ratings: number;
    film_threshold: number;
    user_threshold: number;
  };
}

export interface RecommendParams {
  genre?: string;
  min_rating?: number;
  max_rating?: number;
  year_min?: number;
  year_max?: number;
  tag?: string;
  n?: number;
  movie_id?: number;
  user_id?: number;
}
