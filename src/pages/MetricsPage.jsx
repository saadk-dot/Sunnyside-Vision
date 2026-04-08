import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../App'

export default function MetricsPage() {
  const { t } = useLang()
  const [responses, setResponses] = useState([])
  const [locations, setLocations] = useState([])
  const [galleryCount, setGalleryCount] = useState(0)

  useEffect(() => {
    Promise.all([
      supabase.from('survey_responses').select('*, locations(name, color)'),
      supabase.from('locations').select('*, survey_questions(*)'),
      supabase.from('gallery').select('id', { count: 'exact' }).eq('approved', true)
    ]).then(([r, l, g]) => {
      if (r.data) setResponses(r.data)
      if (l.data) setLocations(l.data)
      if (g.count !== null) setGalleryCount(g.count)
    })
  }, [])

  const byLocation = locations.map(loc => ({ ...loc, count: responses.filter(r => r.location_id === loc.id).length }))
  const maxCount = Math.max(...byLocation.map(l => l.count), 1)

  return (
    <div style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 32px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 56, marginBottom: 8 }}>{t('metrics', 'title')}</h1>
        <p style={{ fontSize: 17, color: 'var(--muted)', marginBottom: 48 }}>{t('metrics', 'subtitle')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 40 }}>
          {[{ num: responses.length, label: t('metrics','totalResponses') }, { num: galleryCount, label: t('metrics','totalArtworks') }, { num: locations.length, label: 'Locations' }].map(s => (
            <div key={s.label} style={{ background: 'var(--card)', borderRadius: 12, padding: '28px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 64, color: 'var(--accent)', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: '28px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 24 }}>{t('metrics','byLocation')}</h2>
          {byLocation.map(loc => (
            <div key={loc.id} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <div style={{ width: 200, fontSize: 14, fontWeight: 500, flexShrink: 0 }}>{loc.name}</div>
              <div style={{ flex: 1, height: 12, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 999, background: loc.color || 'var(--accent)', width: `${(loc.count / maxCount) * 100}%`, transition: 'width 0.8s ease-out' }} />
              </div>
              <div style={{ width: 32, fontSize: 13, color: 'var(--muted)', textAlign: 'right' }}>{loc.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
