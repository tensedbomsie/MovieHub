import type { Category, TmdbSearchResult } from '../types'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export const POSTER_BASE = 'https://image.tmdb.org/t/p/w342'

const ENDPOINT_BY_CATEGORY: Record<Category, string> = {
  movie: 'search/movie',
  series: 'search/tv',
  anime: 'search/tv',
}

type RawResult = {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  release_date?: string
  first_air_date?: string
  overview: string | null
  popularity?: number
}

export async function searchByCategory(category: Category, query: string): Promise<TmdbSearchResult[]> {
  if (!query.trim()) return []
  const endpoint = ENDPOINT_BY_CATEGORY[category]
  const res = await fetch(
    `${BASE_URL}/${endpoint}?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}`,
  )
  if (!res.ok) throw new Error('TMDb search failed')
  const data = await res.json()
  const raw: RawResult[] = data.results ?? []
  const normalized: (TmdbSearchResult & { popularity?: number })[] = raw.map((r) => ({
    id: r.id,
    title: r.title ?? r.name ?? '',
    poster_path: r.poster_path,
    release_date: r.release_date ?? r.first_air_date ?? null,
    overview: r.overview,
    popularity: r.popularity,
  }))
  return normalized.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
}
