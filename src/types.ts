export type WatchStatus = 'want' | 'watching' | 'watched'

export type Category = 'movie' | 'series' | 'anime'

export type Reflection = {
  id: string
  date: string
  text: string
}

export type WatchEntry = {
  id: string
  owner: string
  tmdb_id: number
  title: string
  poster_path: string | null
  release_date: string | null
  overview: string | null
  status: WatchStatus
  rating: number | null
  review: string | null
  watch_date: string | null
  tags: string[]
  reflections: Reflection[]
  poster_hidden: boolean
  category: Category
  created_at: string
  updated_at: string
}

export type TmdbSearchResult = {
  id: number
  title: string
  poster_path: string | null
  release_date: string | null
  overview: string | null
}
