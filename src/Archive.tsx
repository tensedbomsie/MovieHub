import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { POSTER_BASE } from './lib/tmdb'
import { RatingBadge } from './RatingInput'
import SearchModal from './SearchModal'
import EntryModal from './EntryModal'
import type { TmdbSearchResult, WatchEntry, WatchStatus } from './types'

const STATUS_LABEL: Record<WatchStatus, string> = {
  want: 'อยากดู',
  watching: 'กำลังดู',
  watched: 'ดูแล้ว',
}

export default function Archive({ session }: { session: Session }) {
  const [entries, setEntries] = useState<WatchEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<WatchStatus | 'all'>('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [pendingMovie, setPendingMovie] = useState<TmdbSearchResult | null>(null)
  const [editingEntry, setEditingEntry] = useState<WatchEntry | null>(null)

  const refresh = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('watch_entries')
      .select('*')
      .order('updated_at', { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => e.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [entries])

  const filtered = entries.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (tagFilter !== 'all' && !e.tags.includes(tagFilter)) return false
    if (search.trim() && !e.title.toLowerCase().includes(search.trim().toLowerCase())) return false
    return true
  })

  const closeAll = () => {
    setSearchOpen(false)
    setPendingMovie(null)
    setEditingEntry(null)
  }

  const handleSaved = () => {
    closeAll()
    refresh()
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🎬 Archive หนังของฉัน</h1>
        <button className="btn btn-primary" onClick={() => setSearchOpen(true)}>
          + เพิ่มหนัง
        </button>
      </div>

      <input
        className="search-input"
        placeholder="ค้นหาในคลังของฉัน..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filter-bar">
        <button
          className={`btn filter-toggle${statusFilter === 'all' ? ' active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          ทั้งหมด
        </button>
        {(['want', 'watching', 'watched'] as WatchStatus[]).map((s) => (
          <button
            key={s}
            className={`btn filter-toggle${statusFilter === s ? ' active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
        {allTags.length > 0 && (
          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
            <option value="all">ทุกหมวดหมู่</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
      </div>

      {loading && <p className="modal-sub">กำลังโหลด...</p>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          {entries.length === 0 ? 'ยังไม่มีหนังในคลัง กด "+ เพิ่มหนัง" เพื่อเริ่มบันทึกได้เลย' : 'ไม่พบหนังที่ตรงกับตัวกรอง'}
        </div>
      )}

      <div className="movie-grid">
        {filtered.map((entry) => (
          <div key={entry.id} className="card movie-card" onClick={() => setEditingEntry(entry)}>
            {entry.poster_path ? (
              <img className="movie-poster" src={`${POSTER_BASE}${entry.poster_path}`} alt={entry.title} />
            ) : (
              <div className="movie-poster-placeholder">🎬</div>
            )}
            <div className="movie-card-body">
              <span className={`status-badge ${entry.status}`}>{STATUS_LABEL[entry.status]}</span>
              <div className="movie-title">{entry.title}</div>
              <div className="movie-year">
                {entry.release_date ? entry.release_date.slice(0, 4) : ''}
                {entry.watch_date ? ` · ดูเมื่อ ${entry.watch_date}` : ''}
              </div>
              {entry.rating !== null && <RatingBadge value={entry.rating} />}
            </div>
          </div>
        ))}
      </div>

      {searchOpen && (
        <SearchModal
          onClose={closeAll}
          onSelect={(movie) => {
            setSearchOpen(false)
            setPendingMovie(movie)
          }}
        />
      )}

      {pendingMovie && (
        <EntryModal session={session} movie={pendingMovie} onClose={closeAll} onSaved={handleSaved} />
      )}

      {editingEntry && (
        <EntryModal
          session={session}
          movie={{
            id: editingEntry.tmdb_id,
            title: editingEntry.title,
            poster_path: editingEntry.poster_path,
            release_date: editingEntry.release_date,
            overview: editingEntry.overview,
          }}
          existing={editingEntry}
          onClose={closeAll}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
