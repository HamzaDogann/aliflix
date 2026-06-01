// Ücretsiz poster servisi — API key gerekmez, sadece imdbId yeterli
// URL: https://images.metahub.space/poster/medium/{imdbId}/img

const BASE = 'https://images.metahub.space/poster/medium';

export function getPosterUrl(imdbId: string): string | null {
  if (!imdbId || imdbId === 'tt0000000') return null;
  return `${BASE}/${imdbId}/img`;
}

// Tür bazlı gradient — poster yüklenemezse gösterilir
const GENRE_GRADIENTS: Record<string, string> = {
  Drama:       'linear-gradient(135deg,#1a2233 0%,#0d1520 100%)',
  Crime:       'linear-gradient(135deg,#1a0d0d 0%,#0d0606 100%)',
  Action:      'linear-gradient(135deg,#0d1020 0%,#050810 100%)',
  'Sci-Fi':    'linear-gradient(135deg,#0e1830 0%,#070d1a 100%)',
  Thriller:    'linear-gradient(135deg,#101820 0%,#080d10 100%)',
  Animation:   'linear-gradient(135deg,#0a1520 0%,#050c14 100%)',
  Comedy:      'linear-gradient(135deg,#2a1520 0%,#180d12 100%)',
  Fantasy:     'linear-gradient(135deg,#1a1508 0%,#0d0c05 100%)',
  Adventure:   'linear-gradient(135deg,#0d1a10 0%,#060d08 100%)',
  Horror:      'linear-gradient(135deg,#1a0808 0%,#0d0404 100%)',
  Romance:     'linear-gradient(135deg,#2a1020 0%,#150810 100%)',
  Documentary: 'linear-gradient(135deg,#1a1a1a 0%,#0a0a0a 100%)',
};

export function posterGradient(genres: string): string {
  const first = genres.split('|')[0];
  return GENRE_GRADIENTS[first] ?? 'linear-gradient(135deg,#1a2233 0%,#0d1520 100%)';
}
