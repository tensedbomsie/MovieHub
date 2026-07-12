import { useState } from 'react'
import { searchByCategory, POSTER_BASE } from './lib/tmdb'
import type { Category, TmdbSearchResult } from './types'

const CATEGORY_LABEL: Record<Category, { title: string; placeholder: string }> = {
  movie: { title: 'เพิ่มหนัง', placeholder: 'ชื่อหนัง...' },
  series: { title: 'เพิ่มซีรี่ย์', placeholder: 'ชื่อซีรี่ย์...' },
  anime: { title: 'เพิ่มอนิเมะ', placeholder: 'ชื่ออนิเมะ...' },
}

export default function SearchModal({
  category,
  onClose,
  onSelect,
}: {
  category: Category
  onClose: () => void
  onSelect: (movie: TmdbSearchResult) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TmdbSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const labels = CATEGORY_LABEL[category]

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const r = await searchByCategory(category, query)
      setResults(r)
    } catch {
      setError('ค้นหาไม่สำเร็จ ตรวจสอบ TMDb API key ใน .env.local')
    }
    setLoading(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{labels.title}</h2>
        <p className="modal-sub">ค้นหาชื่อจาก TMDb</p>
        <form onSubmit={runSearch} className="tag-input-row" style={{ marginBottom: '1rem' }}>
          <input
            className="search-input"
            style={{ marginBottom: 0 }}
            autoFocus
            placeholder={labels.placeholder}
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
              {m.poster_path ? (
                <img className="movie-poster" src={`${POSTER_BASE}${m.poster_path}`} alt={m.title} />
              ) : (
                <div className="movie-poster-placeholder">🎬</div>
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
