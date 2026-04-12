import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ANALYTICS_QUESTIONS } from './AnalyticsPage'

const SECTION_COLORS = {
  'Bliss Plaza': '#4A90D9',
  'Lowery Plaza': '#1B3A6B',
  'Under the 7 Train': '#5B7FA6',
  'All': '#7B5EA7',
}

export default function AdminAnalytics() {
  const [hiddenWidgets, setHiddenWidgets] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const { data } = await supabase
        .from('site_content')
        .select('*')
        .eq('key', 'hidden_widgets')
        .single()
      if (data?.content?.hidden) setHiddenWidgets(data.content.hidden)
    } catch {}
  }

  function toggle(id) {
    setHiddenWidgets(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    )
  }

  async function save() {
    setSaving(true)
    await supabase.from('site_content').upsert(
      { key: 'hidden_widgets', content: { hidden: hiddenWidgets }, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const sections = [...new Set(ANALYTICS_QUESTIONS.map(q => q.section))]

  return (
    <div style={{ padding: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, marginBottom: 4 }}>Analytics Widgets</h1>
          <p style={{ color: '#6B6458' }}>Toggle which charts are visible on the public analytics page</p>
        </div>
        <button onClick={save} disabled={saving} style={{
          padding: '12px 28px', borderRadius: 8,
          background: saved ? '#1B3A6B' : '#1B3A6B',
          color: 'white', border: 'none', fontWeight: 600, fontSize: 14,
          flexShrink: 0, marginTop: 4
        }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div style={{ background: '#FFF8F0', borderRadius: 10, padding: '12px 16px', marginBottom: 32, border: '1px solid #F0D8B8', fontSize: 13, color: '#8B6A3A' }}>
        💡 Toggle any widget OFF to hide it from the public analytics page. Changes take effect after saving.
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <div style={{ background: 'white', borderRadius: 10, padding: '16px 20px', border: '1px solid #DDD8CE', textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, color: '#4A90D9', lineHeight: 1 }}>{ANALYTICS_QUESTIONS.length - hiddenWidgets.length}</div>
          <div style={{ fontSize: 12, color: '#6B6458', marginTop: 4 }}>Visible</div>
        </div>
        <div style={{ background: 'white', borderRadius: 10, padding: '16px 20px', border: '1px solid #DDD8CE', textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, color: '#A09880', lineHeight: 1 }}>{hiddenWidgets.length}</div>
          <div style={{ fontSize: 12, color: '#6B6458', marginTop: 4 }}>Hidden</div>
        </div>
        <div style={{ background: 'white', borderRadius: 10, padding: '16px 20px', border: '1px solid #DDD8CE', textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, color: '#1B3A6B', lineHeight: 1 }}>{ANALYTICS_QUESTIONS.length}</div>
          <div style={{ fontSize: 12, color: '#6B6458', marginTop: 4 }}>Total</div>
        </div>
        <button onClick={() => setHiddenWidgets([])} style={{ padding: '12px 20px', borderRadius: 8, border: '1.5px solid #DDD8CE', background: 'none', fontSize: 13, color: '#6B6458', cursor: 'pointer', alignSelf: 'center' }}>
          Show All
        </button>
        <button onClick={() => setHiddenWidgets(ANALYTICS_QUESTIONS.map(q => q.id))} style={{ padding: '12px 20px', borderRadius: 8, border: '1.5px solid #DDD8CE', background: 'none', fontSize: 13, color: '#6B6458', cursor: 'pointer', alignSelf: 'center' }}>
          Hide All
        </button>
      </div>

      {sections.map(section => {
        const sectionQs = ANALYTICS_QUESTIONS.filter(q => q.section === section)
        const color = SECTION_COLORS[sectionQs[0]?.location] || '#4A90D9'

        return (
          <div key={section} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 4, height: 24, background: color, borderRadius: 2 }} />
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26 }}>{section}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sectionQs.map(q => {
                const isVisible = !hiddenWidgets.includes(q.id)
                return (
                  <div key={q.id} style={{
                    background: 'white', borderRadius: 10, padding: '16px 20px',
                    border: `1.5px solid ${isVisible ? '#DDD8CE' : '#F0EDE6'}`,
                    display: 'flex', alignItems: 'center', gap: 16,
                    opacity: isVisible ? 1 : 0.5, transition: 'all 0.2s'
                  }}>
                    {/* Toggle */}
                    <div
                      onClick={() => toggle(q.id)}
                      style={{
                        width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                        background: isVisible ? color : '#DDD8CE',
                        position: 'relative', flexShrink: 0, transition: 'background 0.2s'
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: 'white',
                        position: 'absolute', top: 3,
                        left: isVisible ? 22 : 3,
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                      }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14, color: '#1B3A6B', marginBottom: 3 }}>{q.question}</div>
                      <div style={{ fontSize: 12, color: '#A09880' }}>
                        {q.location !== 'All' ? q.location : 'All Locations'} ·{' '}
                        {q.type === 'multi' ? 'Multi-select' : q.type === 'scale' ? 'Scale 1–5' : 'Single choice'} ·{' '}
                        {q.options.length} options
                      </div>
                    </div>

                    <div style={{
                      fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 6,
                      background: isVisible ? `${color}18` : '#F0EDE6',
                      color: isVisible ? color : '#A09880'
                    }}>
                      {isVisible ? 'Visible' : 'Hidden'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
