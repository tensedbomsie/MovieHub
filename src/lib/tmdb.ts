import type { TmdbSearchResult } from '../types'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export const POSTER_BASE = 'https://image.tmdb.org/t/p/w342'

export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
  if (!query.trim()) return []
  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&language=th-TH&query=${encodeURIComponent(query)}`,
  )
  if (!res.ok) throw new Error('TMDb search failed')
  const data = await res.json()
  return data.results ?? []
}
