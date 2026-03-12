import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../App'

export default function MetricsPage() {
  const { t } = useLang()
  const [responses, setResponses] = useState([])
  const [locations, setLocations] = useState([])
  const [galleryCount, setGalleryCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [r, l, g] = await Promise.all([
      supabase.from('survey_responses').select('*, locations(name, color)'),
      supabase.from('locations').select('*, survey_questions(*)'),
      supabase.from('gallery').select('id', { count: 'exact' }).eq('approved', true)
    ])
    if (r.data) setResponses(r.data)
    if (l.data) setLocations(l.data)
    if (g.count !== null) setGalleryCount(g.count)
    setLoading(false)
  }

  const byLocation = locations.map(loc => ({
    ...loc,
    count: responses.filter(r => r.location_id === loc.id).length
  }))
  const maxCount = Math.max(...byLocation.map(l => l.count), 1)

  function getChoiceTally(locationId, questionId, options) {
    const relevant = responses.filter(r => r.location_id === locationId && r.answers?.[questionId])
    const tally = {}
    options?.forEach(opt => tally[opt] = 0)
    relevant.forEach(r => {
      const val = r.answers[questionId]
      if (typeof val === 'string' && tally[val] !== undefined) tally[val]++
    })
    return tally
  }

  return (
    <div style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 32px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 56, marginBottom: 8 }}>
          {t('metrics', 'title')}
        </h1>
        <p style={{ fontSize: 17, color: 'var(--muted)', marginBottom: 48 }}>
          {t('metrics', 'subtitle')}
        </p>

        {/* Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
          {[
            { num: responses.length, label: t('metrics', 'totalResponses') },
            { num: galleryCount, label: t('metrics', 'totalArtworks') },
            { num: locations.length, label: 'Locations' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--card)', borderRadius: 12,
              padding: '28px', border: '1px solid var(--border)', textAlign: 'center'
            }}>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 64, color: 'var(--accent)', lineHeight: 1
              }}>{s.num}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* By Location */}
        <div style={{
          background: 'var(--card)', borderRadius: 16,
          padding: '28px', border: '1px solid var(--border)', marginBottom: 32
        }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 24 }}>
            {t('metrics', 'byLocation')}
          </h2>
          {byLocation.map(loc => (
            <div key={loc.id} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <div style={{ width: 180, fontSize: 14, fontWeight: 500, flexShrink: 0 }}>{loc.name}</div>
              <div style={{ flex: 1, height: 12, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  background: loc.color || 'var(--accent)',
                  width: `${(loc.count / maxCount) * 100}%`,
                  transition: 'width 0.8s ease-out'
                }} />
              </div>
              <div style={{ width: 32, fontSize: 13, color: 'var(--muted)', textAlign: 'right' }}>{loc.count}</div>
            </div>
          ))}
        </div>

        {/* Per-question breakdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {locations.map(loc =>
            loc.survey_questions
              ?.filter(q => q.question_type === 'choice' && q.options?.length > 0)
              .map(q => {
                const tally = getChoiceTally(loc.id, q.id, q.options)
                const maxVal = Math.max(...Object.values(tally), 1)
                return (
                  <div key={q.id} style={{
                    background: 'var(--card)', borderRadius: 16,
                    padding: '24px', border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                      {loc.name}
                    </div>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, marginBottom: 16, lineHeight: 1.3 }}>
                      {q.question_text}
                    </h3>
                    {q.options?.map(opt => (
                      <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ fontSize: 12, width: 120, flexShrink: 0, color: 'var(--ink)' }}>{opt}</div>
                        <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 999,
                            background: loc.color || 'var(--accent)',
                            width: `${(tally[opt] / maxVal) * 100}%`,
                            transition: 'width 0.8s'
                          }} />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', width: 20, textAlign: 'right' }}>{tally[opt]}</div>
                      </div>
                    ))}
                  </div>
                )
              })
          )}
        </div>

        {responses.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
            No survey data yet. Data will appear here as residents participate.
          </div>
        )}
      </div>
    </div>
  )
}
