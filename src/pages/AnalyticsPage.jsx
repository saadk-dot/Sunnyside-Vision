import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// All measurable questions definition
export const ANALYTICS_QUESTIONS = [
  // BLISS PLAZA
  {
    id: 'bp_b', location: 'Bliss Plaza', section: 'Location',
    question: 'What do you usually do at Bliss Plaza?',
    field: 'bp_b', type: 'multi',
    options: ['Passing through','Sitting and resting','Meeting people','Waiting for the subway','Biking through','I rarely use Bliss Plaza','Other']
  },
  {
    id: 'bp_c', location: 'Bliss Plaza', section: 'Location',
    question: 'What do you like about Bliss Plaza?',
    field: 'bp_c', type: 'multi',
    options: ['Convenient on my daily route','Feels open and spacious','There are places to sit or pause','Feels active and lively','Has shade / weather protection','Connects to subway and nearby streets','Has a neighborhood character / local energy','Accessible for strollers, carts, or mobility devices','I don\'t currently like anything about it','Other']
  },
  {
    id: 'bp_d', location: 'Bliss Plaza', section: 'Location',
    question: 'What currently makes Bliss Plaza uncomfortable or difficult for you?',
    field: 'bp_d', type: 'multi',
    options: ['Unclear what I am allowed to do here','Too noisy from traffic/train','Feels unsafe','Too dark/poorly lit','Messy/not clean/poorly maintained','Not enough seating','Lack of greenery','Hard to navigate (crowded, narrow, conflicts with bikes/cars)','Other']
  },
  {
    id: 'bp_e', location: 'Bliss Plaza', section: 'Location',
    question: 'If you were to redefine the main purpose of Bliss Plaza, what would it be?',
    field: 'bp_e', type: 'single',
    options: ['A safer, clearer place for you to pass through','A neighborhood gathering space where you can linger','A calm resting space for you to take a break','A flexible space for community events and pop-ups','A permanent market space','A family-friendly space with room for kids','A space that reflects local culture and identity','A greener public space that feels like a park','Other']
  },
  {
    id: 'bp_f', location: 'Bliss Plaza', section: 'Location',
    question: 'What events would you like to see happening in Bliss Plaza?',
    field: 'bp_f', type: 'multi',
    options: ['Local food vendors / kiosks','Community events (music, performances, gatherings)','Public art / murals / cultural features','More space for kids/teens','Markets or seasonal pop-ups','Bike parking and charging','Other']
  },
  {
    id: 'bp_g', location: 'Bliss Plaza', section: 'Location',
    question: 'Where do you imagine people spend the most time in Bliss Plaza?',
    field: 'bp_g', type: 'single',
    options: ['Center of the plaza','Edges near planters','Near subway entrances']
  },
  {
    id: 'bp_h', location: 'Bliss Plaza', section: 'Location',
    question: 'What would make Bliss Plaza feel more welcoming?',
    field: 'bp_h', type: 'multi',
    options: ['Trees and plants','Lighting','Colorful design or art','Public seating','Open gathering space','Accessibility features','Other']
  },
  {
    id: 'bp_i', location: 'Bliss Plaza', section: 'Location',
    question: 'How do you imagine people move through Bliss Plaza?',
    field: 'bp_i', type: 'single',
    options: ['Pedestrians only (no vehicles inside the plaza zone)','Pedestrians first, bikes allowed at slow speed','Separate space for walking and biking','Clear walking path with permanent areas to stop and sit','Keep current movement patterns but make them safer and clearer','Other']
  },
  // PRIORITIES & VALUES
  {
    id: 'pv_a', location: 'All', section: 'Priorities & Values',
    question: 'Do you think Sunnyside has enough good quality public space?',
    field: 'pv_a', type: 'scale',
    options: ['1','2','3','4','5'],
    labels: { min: 'No', max: 'Yes' }
  },
  {
    id: 'pv_b', location: 'All', section: 'Priorities & Values',
    question: 'How important are public gathering spaces to you?',
    field: 'pv_b', type: 'scale',
    options: ['1','2','3','4','5'],
    labels: { min: 'Not important', max: 'Very important' }
  },
  {
    id: 'pv_c', location: 'All', section: 'Priorities & Values',
    question: 'During nighttime, how would you like the public space to be lit up?',
    field: 'pv_c', type: 'single',
    options: ['Bright and active','Warm and calm','Colorful and artistic','Minimal lighting']
  },
  {
    id: 'pv_d', location: 'All', section: 'Priorities & Values',
    question: 'Which activities do you do most in public spaces around you?',
    field: 'pv_d', type: 'multi',
    options: ['Walking through / commuting','Sitting and taking a break','Meeting friends or family','Eating or grabbing food','Shopping at markets / vendors','Taking kids to play / spending time with children','Exercising (running, biking, stretching)','Attending events (music, festivals, community gatherings)','Other']
  },
  {
    id: 'pv_e', location: 'All', section: 'Priorities & Values',
    question: "What would make this space feel like 'your neighborhood'?",
    field: 'pv_e', type: 'single',
    options: ['Local art and murals made with the community','Spaces for cultural events and celebrations','Design that reflects local history and identity','Support for local businesses and street vendors','Community-led programming (markets, performances, workshops)','Everyday amenities that match local needs (seating, shade, play)','Multilingual wayfinding and welcoming signs','Other']
  },
  {
    id: 'pv_g', location: 'All', section: 'Priorities & Values',
    question: 'How do you like a space to be designed?',
    field: 'pv_g', type: 'single',
    options: ['Calm, simple, and quiet (muted colors)','Colorful and energetic (bold accents)','Natural and earthy (wood/stone/greenery)','Clean and modern (smooth surfaces, minimal details)','Playful and creative (patterns, art, unexpected elements)','Classic and timeless (neutral palette, durable materials)']
  },
]

const SECTION_COLORS = {
  'Bliss Plaza': '#4A90D9',
  'Lowery Plaza': '#1B3A6B',
  'Under the 7 Train': '#5B7FA6',
  'All': '#7B5EA7',
}

export default function AnalyticsPage() {
  const [responses, setResponses] = useState([])
  const [hiddenWidgets, setHiddenWidgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalResponses, setTotalResponses] = useState(0)

  useEffect(() => {
    loadData()
    loadWidgetSettings()
  }, [])

  async function loadData() {
    const { data } = await supabase
      .from('survey_responses')
      .select('*, locations(name)')
    if (data) {
      setResponses(data)
      setTotalResponses(data.length)
    }
    setLoading(false)
  }

  async function loadWidgetSettings() {
    try {
      const { data } = await supabase
        .from('site_content')
        .select('*')
        .eq('key', 'hidden_widgets')
        .single()
      if (data?.content?.hidden) setHiddenWidgets(data.content.hidden)
    } catch {}
  }

  function getTally(questionId, options, responses) {
    const tally = {}
    options.forEach(o => tally[o] = 0)
    responses.forEach(r => {
      const val = r.answers?.[questionId]
      if (!val) return
      if (Array.isArray(val)) {
        val.forEach(v => { if (tally[v] !== undefined) tally[v]++ })
      } else {
        const key = String(val)
        if (tally[key] !== undefined) tally[key]++
      }
    })
    return tally
  }

  const visibleQuestions = ANALYTICS_QUESTIONS.filter(q => !hiddenWidgets.includes(q.id))
  const sections = [...new Set(visibleQuestions.map(q => q.section))]

  if (loading) return (
    <div style={{ paddingTop: 'var(--nav-h)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: '#4A90D9', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        Loading analytics...
      </div>
    </div>
  )

  return (
    <div style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#4A90D9', fontWeight: 600, marginBottom: 12 }}>
            Community Data
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 56, marginBottom: 8 }}>
            Analytics
          </h1>
          <p style={{ fontSize: 17, color: 'var(--muted)' }}>
            What Sunnyside residents are imagining for their neighborhood
          </p>
        </div>

        {/* Overview stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 56 }}>
          {[
            { num: totalResponses, label: 'Total Responses', color: '#4A90D9' },
            { num: responses.filter(r => r.answers?.selected_location === 'Bliss Plaza').length, label: 'Bliss Plaza', color: '#4A90D9' },
            { num: responses.filter(r => r.answers?.selected_location === 'Lowery Plaza').length, label: 'Lowery Plaza', color: '#1B3A6B' },
            { num: responses.filter(r => r.answers?.selected_location === 'Under the 7 Train').length, label: 'Under the 7 Train', color: '#5B7FA6' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card)', borderRadius: 12, padding: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, color: s.color, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Questions by section */}
        {sections.map(section => {
          const sectionQs = visibleQuestions.filter(q => q.section === section)
          const sectionColor = SECTION_COLORS[sectionQs[0]?.location] || '#4A90D9'

          return (
            <div key={section} style={{ marginBottom: 64 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{ width: 4, height: 32, background: sectionColor, borderRadius: 2 }} />
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36 }}>{section}</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                {sectionQs.map(q => {
                  const tally = getTally(q.field, q.options, responses)
                  const maxVal = Math.max(...Object.values(tally), 1)
                  const total = Object.values(tally).reduce((a, b) => a + b, 0)

                  return (
                    <div key={q.id} style={{ background: 'var(--card)', borderRadius: 16, padding: '28px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: sectionColor, fontWeight: 600, marginBottom: 8 }}>
                        {q.location !== 'All' ? q.location : 'All Locations'} · {q.type === 'multi' ? 'Multi-select' : q.type === 'scale' ? 'Scale' : 'Single choice'}
                      </div>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, marginBottom: 20, lineHeight: 1.4, color: 'var(--ink)' }}>
                        {q.question}
                      </h3>

                      {q.type === 'scale' ? (
                        <ScaleChart tally={tally} labels={q.labels} color={sectionColor} total={total} />
                      ) : (
                        <BarChart tally={tally} maxVal={maxVal} total={total} color={sectionColor} />
                      )}

                      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
                        {total} response{total !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {visibleQuestions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            <p style={{ fontSize: 18 }}>All widgets are currently hidden. Enable them from the admin panel.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function BarChart({ tally, maxVal, total, color }) {
  return (
    <div>
      {Object.entries(tally).map(([opt, count]) => {
        const pct = maxVal > 0 ? (count / maxVal) * 100 : 0
        const responsePct = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div key={opt} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.4, flex: 1, paddingRight: 8 }}>{opt}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{count} ({responsePct}%)</span>
            </div>
            <div style={{ height: 8, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 999, background: color, width: `${pct}%`, transition: 'width 0.8s ease-out' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ScaleChart({ tally, labels, color, total }) {
  const maxVal = Math.max(...Object.values(tally), 1)
  const avg = total > 0
    ? (Object.entries(tally).reduce((sum, [k, v]) => sum + (parseInt(k) * v), 0) / total).toFixed(1)
    : '—'

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-end' }}>
        {['1','2','3','4','5'].map(n => {
          const count = tally[n] || 0
          const heightPct = maxVal > 0 ? (count / maxVal) * 80 : 0
          return (
            <div key={n} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{count}</div>
              <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ width: '70%', background: color, borderRadius: '4px 4px 0 0', height: `${heightPct}px`, minHeight: count > 0 ? 4 : 0, transition: 'height 0.8s ease-out' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginTop: 6 }}>{n}</div>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
        <span>{labels?.min}</span>
        <span style={{ fontWeight: 600, color: color }}>Avg: {avg}</span>
        <span>{labels?.max}</span>
      </div>
    </div>
  )
}
