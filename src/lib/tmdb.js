// TMDB image CDN paths and API helpers. All fetch logic lives here.
export const TMDB_W     = "https://image.tmdb.org/t/p/w500";
export const TMDB_BG    = "https://image.tmdb.org/t/p/w1280";
export const TMDB_STILL = "https://image.tmdb.org/t/p/w300";
export const TMDB_KEY   = import.meta.env.VITE_TMDB_KEY;

const BASE = "https://api.themoviedb.org/3";

// Convert a /search/multi result row into our internal item shape.
export function normalizeTMDB(r) {
  if (r.media_type === "person") return null;
  const type = r.media_type;
  const dateStr = type === "tv" ? r.first_air_date : r.release_date;
  return {
    id: r.id, type,
    title: type === "tv" ? r.name : r.title,
    year: parseInt(dateStr?.split("-")[0]) || 0,
    rating: Math.round(r.vote_average * 10) / 10,
    poster: r.poster_path || null,
    backdrop: r.backdrop_path || null,
    overview: r.overview || "",
    genres: [],
    seasons: undefined,
    episodesPerSeason: undefined,
  };
}

export async function searchMulti(query, signal) {
  const url = `${BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
  const data = await fetch(url, { signal }).then(r => r.json());
  return (data.results || []).map(normalizeTMDB).filter(Boolean);
}

export async function fetchTVDetails(id) {
  return fetch(`${BASE}/tv/${id}?api_key=${TMDB_KEY}`).then(r => r.json());
}

export async function fetchTVSeason(id, season) {
  return fetch(`${BASE}/tv/${id}/season/${season}?api_key=${TMDB_KEY}`).then(r => r.json());
}

// Used to rebuild a watch item from a URL on first load when it isn't in CATALOG.
export async function fetchItemById(type, id) {
  const d = await fetch(`${BASE}/${type}/${id}?api_key=${TMDB_KEY}`).then(r => r.json());
  if (!d || d.success === false) return null;
  return {
    id: d.id, type,
    title: type === "tv" ? d.name : d.title,
    year: parseInt((type === "tv" ? d.first_air_date : d.release_date)?.split("-")[0]) || 0,
    rating: Math.round((d.vote_average || 0) * 10) / 10,
    poster: d.poster_path || null,
    backdrop: d.backdrop_path || null,
    overview: d.overview || "",
    genres: (d.genres || []).map(g => g.name),
    seasons: d.number_of_seasons,
  };
}
