import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { POSTER_BASE } from './lib/tmdb'
import RatingInput from './RatingInput'
import type { Reflection, TmdbSearchResult, WatchEntry, WatchStatus } from './types'

const STATUS_OPTIONS: { id: WatchStatus; label: string }[] = [
  { id: 'want', label: 'อยากดู' },
  { id: 'watching', label: 'กำลังดู' },
  { id: 'watched', label: 'ดูแล้ว' },
]

export default function EntryModal({
  session,
  movie,
  existing,
  onClose,
  onSaved,
}: {
  session: Session
  movie: TmdbSearchResult
  existing?: WatchEntry
  onClose: () => void
  onSaved: () => void
}) {
  const [status, setStatus] = useState<WatchStatus>(existing?.status ?? 'want')
  const [rating, setRating] = useState<number | null>(existing?.rating ?? null)
  const [review, setReview] = useState(existing?.review ?? '')
  const [watchDate, setWatchDate] = useState(existing?.watch_date ?? '')
  const [tags, setTags] = useState<string[]>(existing?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [reflections, setReflections] = useState<Reflection[]>(existing?.reflections ?? [])
  const [reflectionInput, setReflectionInput] = useState('')
  const [saving, setSaving] = useState(false)

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t))

  const addReflection = () => {
    const text = reflectionInput.trim()
    if (!text) return
    setReflections([
      ...reflections,
      { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), text },
    ])
    setReflectionInput('')
  }

  const removeReflection = (id: string) => setReflections(reflections.filter((r) => r.id !== id))

  const save = async () => {
    setSaving(true)
    const payload = {
      owner: session.user.id,
      tmdb_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      overview: movie.overview,
      status,
      rating,
      review: review || null,
      watch_date: watchDate || null,
      tags,
      reflections,
      updated_at: new Date().toISOString(),
    }
    if (existing) {
      await supabase.from('watch_entries').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('watch_entries').insert(payload)
    }
    setSaving(false)
    onSaved()
  }

  const remove = async () => {
    if (!existing) return
    if (!window.confirm(`ลบ "${movie.title}" ออกจาก archive ใช่ไหม?`)) return
    await supabase.from('watch_entries').delete().eq('id', existing.id)
    onSaved()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="entry-header">
          {movie.poster_path ? (
            <img className="movie-poster" src={`${POSTER_BASE}${movie.poster_path}`} alt={movie.title} />
          ) : (
            <div className="movie-poster-placeholder">🎬</div>
          )}
          <div className="entry-header-info">
            <h2>{movie.title}</h2>
            <p>{movie.release_date ? movie.release_date.slice(0, 4) : 'ไม่ทราบปี'}</p>
            <p>{movie.overview}</p>
          </div>
        </div>

        <div className="entry-form">
          <div className="status-picker">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={status === s.id ? 'active' : ''}
                onClick={() => setStatus(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: '0.3rem' }}>คะแนน (เต็ม 10)</div>
            <RatingInput value={rating} onChange={setRating} />
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: '0.3rem' }}>วันที่ดู</div>
            <input type="date" value={watchDate} onChange={(e) => setWatchDate(e.target.value)} />
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: '0.3rem' }}>หมวดหมู่ / แท็ก</div>
            <div className="tag-input-row" style={{ marginBottom: '0.5rem' }}>
              <input
                placeholder="เช่น สยองขวัญ, กับเพื่อน, ในโรง"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <button type="button" className="btn" onClick={addTag}>เพิ่ม</button>
            </div>
            <div className="tag-list">
              {tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                  <button type="button" className="tag-remove" onClick={() => removeTag(t)}>✕</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: '0.3rem' }}>รีวิวหลังดูจบ / ออกจากโรง</div>
            <textarea
              className="review-textarea"
              placeholder="ความรู้สึกทันทีหลังดูจบ..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: '0.3rem' }}>
              ความรู้สึกเมื่อเวลาผ่านไป
            </div>
            <div className="tag-input-row" style={{ marginBottom: '0.6rem' }}>
              <input
                placeholder="กลับมาคิดถึงหนังเรื่องนี้แล้วรู้สึกยังไง..."
                value={reflectionInput}
                onChange={(e) => setReflectionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addReflection()
                  }
                }}
              />
              <button type="button" className="btn" onClick={addReflection}>บันทึก</button>
            </div>
            {reflections.length > 0 && (
              <div className="reflection-list">
                {[...reflections].reverse().map((r) => (
                  <div key={r.id} className="reflection-row">
                    <span className="reflection-date">{r.date}</span>
                    <span className="reflection-text">{r.text}</span>
                    <button type="button" className="tag-remove" onClick={() => removeReflection(r.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          {existing && (
            <button className="btn btn-danger" onClick={remove} style={{ marginRight: 'auto' }}>
              ลบ
            </button>
          )}
          <button className="btn" onClick={onClose}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}
