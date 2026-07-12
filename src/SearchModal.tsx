import { useState } from 'react'
import { searchMovies, POSTER_BASE } from './lib/tmdb'
import type { TmdbSearchResult } from './types'

export default function SearchModal({
  showPosters,
  onClose,
  onSelect,
}: {
  showPosters: boolean
  onClose: () => void
  onSelect: (movie: TmdbSearchResult) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TmdbSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const r = await searchMovies(query)
      setResults(r)
    } catch {
      setError('ค้นหาไม่สำเร็จ ตรวจสอบ TMDb API key ใน .env.local')
    }
    setLoading(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>เพิ่มหนัง</h2>
        <p className="modal-sub">ค้นหาชื่อหนังจาก TMDb</p>
        <form onSubmit={runSearch} className="tag-input-row" style={{ marginBottom: '1rem' }}>
          <input
            className="search-input"
            style={{ marginBottom: 0 }}
            autoFocus
            placeholder="ชื่อหนัง..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
          </button>
        </form>
        {error && <p className="login-error">{error}</p>}
        <div className="tmdb-result-grid">
          {results.map((m) => (
            <div key={m.id} className="card tmdb-result-card" onClick={() => onSelect(m)}>
              {showPosters && m.poster_path ? (
                <img className="movie-poster" src={`${POSTER_BASE}${m.poster_path}`} alt={m.title} />
              ) : (
                <div className="movie-poster-placeholder">{showPosters ? '🎬' : '🙈'}</div>
              )}
              <div className="movie-title">{m.title}</div>
            </div>
          ))}
        </div>
        {!loading && results.length === 0 && query && !error && (
          <p className="modal-sub">ไม่พบผลลัพธ์</p>
        )}
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  )
}
