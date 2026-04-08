import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../App'

export default function SurveyPanel({ location, onClose, onSubmit }) {
  const { t } = useLang()
  const [answers, setAnswers] = useState({})
  const [step, setStep] = useState('survey')
  const [generatedImage, setGeneratedImage] = useState(null)
  const [sharedToGallery, setSharedToGallery] = useState(false)

  const questions = location.survey_questions || []
  const image = location.location_images?.[0]?.image_url

  function setAnswer(qid, val) { setAnswers(prev => ({ ...prev, [qid]: val })) }
  function toggleMulti(qid, val) {
    setAnswers(prev => {
      const current = prev[qid] || []
      return { ...prev, [qid]: current.includes(val) ? current.filter(v => v !== val) : [...current, val] }
    })
  }

  const requiredAnswered = questions
    .filter(q => q.question_type === 'choice')
    .every(q => answers[q.id])

  async function generate() {
    setStep('generating')
    await supabase.from('survey_responses').insert({ location_id: location.id, answers })
    await new Promise(r => setTimeout(r, 2000))
    setGeneratedImage(`https://picsum.photos/seed/${Date.now()}/600/600`)
    setStep('result')
  }

  async function shareToGallery() {
    await supabase.from('gallery').insert({ location_id: location.id, image_url: generatedImage, prompt: JSON.stringify(answers), approved: true })
    setSharedToGallery(true)
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, padding: 0 }}>← Back</button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--muted)', lineHeight: 1 }}>✕</button>
      </div>

      {image && (
        <div style={{ marginBottom: 24, borderRadius: 10, overflow: 'hidden', height: 180, position: 'relative' }}>
          <img src={image} alt={location.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,24,20,0.65), transparent)' }} />
          <div style={{ position: 'absolute', bottom: 14, left: 16, fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: 'white' }}>{location.name}</div>
        </div>
      )}
      {!image && <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 16 }}>{location.name}</h2>}

      {step === 'survey' && (
        <>
          {location.description && (
            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(200,135,58,0.08)', borderLeft: '3px solid var(--accent)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              {location.description}
            </div>
          )}

          {questions.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: 14, fontStyle: 'italic', marginBottom: 24 }}>Survey questions coming soon!</p>
          )}

          {questions.sort((a, b) => a.order_num - b.order_num).map((q, i) => (
            <div key={q.id} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 600, marginBottom: 5 }}>Question {i + 1}</div>
              <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 12 }}>{q.question_text}</label>
              {q.question_type === 'text' && (
                <textarea value={answers[q.id] || ''} onChange={e => setAnswer(q.id, e.target.value)} placeholder={t('survey', 'placeholder')}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--bg)', resize: 'vertical', minHeight: 80, fontSize: 14, color: 'var(--ink)', outline: 'none', lineHeight: 1.5 }} />
              )}
              {q.question_type === 'choice' && q.options && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {q.options.map(opt => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)} style={{
                      padding: '11px 14px', borderRadius: 8, textAlign: 'left',
                      border: `1.5px solid ${answers[q.id] === opt ? 'var(--accent)' : 'var(--border)'}`,
                      background: answers[q.id] === opt ? 'rgba(200,135,58,0.1)' : 'var(--bg)',
                      fontSize: 14, color: 'var(--ink)', fontWeight: answers[q.id] === opt ? 600 : 400, transition: 'all 0.15s'
                    }}>{opt}</button>
                  ))}
                </div>
              )}
              {q.question_type === 'multi' && q.options && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {q.options.map(opt => {
                    const sel = (answers[q.id] || []).includes(opt)
                    return (
                      <button key={opt} onClick={() => toggleMulti(q.id, opt)} style={{
                        padding: '11px 14px', borderRadius: 8, textAlign: 'left',
                        border: `1.5px solid ${sel ? 'var(--accent)' : 'var(--border)'}`,
                        background: sel ? 'rgba(200,135,58,0.1)' : 'var(--bg)',
                        fontSize: 14, color: 'var(--ink)', fontWeight: sel ? 600 : 400, transition: 'all 0.15s'
                      }}>{sel ? '✓ ' : ''}{opt}</button>
                    )
                  })}
                </div>
              )}
              {q.question_type === 'scale' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setAnswer(q.id, n)} style={{
                      width: 48, height: 48, borderRadius: 8,
                      border: `1.5px solid ${answers[q.id] === n ? 'var(--accent)' : 'var(--border)'}`,
                      background: answers[q.id] === n ? 'var(--accent)' : 'var(--bg)',
                      color: answers[q.id] === n ? 'white' : 'var(--ink)',
                      fontSize: 16, fontWeight: 600, transition: 'all 0.15s'
                    }}>{n}</button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button onClick={generate} disabled={questions.length > 0 && !requiredAnswered} style={{
            width: '100%', padding: '16px', borderRadius: 10, border: 'none',
            background: (questions.length === 0 || requiredAnswered) ? 'var(--ink)' : 'var(--border)',
            color: (questions.length === 0 || requiredAnswered) ? 'var(--bg)' : 'var(--muted)',
            fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600,
            transition: 'all 0.2s', marginTop: 8,
            cursor: (questions.length === 0 || requiredAnswered) ? 'pointer' : 'not-allowed'
          }}>{t('survey', 'generate')}</button>
        </>
      )}

      {step === 'generating' && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--muted)' }}>{t('survey', 'generating')}</p>
        </div>
      )}

      {step === 'result' && generatedImage && (
        <div>
          <img src={generatedImage} alt="Generated vision" style={{ width: '100%', borderRadius: 12, display: 'block', marginBottom: 20 }} />
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, marginBottom: 8 }}>Your vision for {location.name}</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>Share it with the community!</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {!sharedToGallery ? (
              <button onClick={shareToGallery} style={{ flex: 1, padding: '13px', borderRadius: 8, border: 'none', background: 'var(--green)', color: 'white', fontSize: 14, fontWeight: 600 }}>Add to Community Gallery</button>
            ) : (
              <div style={{ flex: 1, padding: '13px', borderRadius: 8, background: 'rgba(61,107,90,0.1)', border: '1.5px solid var(--green)', fontSize: 14, fontWeight: 600, color: 'var(--green)', textAlign: 'center' }}>✓ Added to Gallery!</div>
            )}
            <button onClick={onClose} style={{ padding: '13px 20px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', fontSize: 14, color: 'var(--muted)' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
