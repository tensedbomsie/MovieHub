import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Login from './Login'
import Archive from './Archive'
import AppSwitcher from './AppSwitcher'
import type { Category } from './types'
import './App.css'

const TABS: { id: Category; label: string }[] = [
  { id: 'movie', label: '🎬 หนัง' },
  { id: 'series', label: '📺 ซีรี่ย์' },
  { id: 'anime', label: '🎌 อนิเมะ' },
]

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [checked, setChecked] = useState(false)
  const [category, setCategory] = useState<Category>('movie')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecked(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (!checked) return null
  if (!session) return <Login />

  return (
    <div className="app-shell">
      <nav className="top-nav glass">
        <a className="hub-link" href="https://tensedbomsie.github.io/SatoruHUB/" title="กลับไป Satoru HUB">
          🏠
        </a>
        <AppSwitcher current="Movie Hub" />
        <span className="brand">Movie Hub</span>
        <div className="nav-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={category === t.id ? 'active' : ''}
              onClick={() => setCategory(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="spacer" />
        <span className="user-email">{session.user.email}</span>
        <button onClick={() => supabase.auth.signOut()}>ออกจากระบบ</button>
      </nav>
      <main className="app-main" key={category}>
        <Archive session={session} category={category} />
      </main>
    </div>
  )
}

export default App
