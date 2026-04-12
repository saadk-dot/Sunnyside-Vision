import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PRIORITIES_QUESTIONS = [
  { id: 'pv_a', text: 'Do you think the Sunnyside neighborhood has enough good quality public space?', type: 'scale', min_label: 'No', max_label: 'Yes' },
  { id: 'pv_b', text: 'How important are public gathering spaces to you?', type: 'scale', min_label: 'Not important', max_label: 'Very important' },
  { id: 'pv_c', text: 'During nighttime, how would you like the public space to be lit up?', type: 'choice', options: ['Bright and active','Warm and calm','Colorful and artistic','Minimal lighting'] },
  { id: 'pv_d', text: 'Which activities do you do most in public spaces around you?', type: 'multi', options: ['Walking through / commuting','Sitting and taking a break','Meeting friends or family','Eating or grabbing food','Shopping at markets / vendors','Taking kids to play / spending time with children','Exercising (running, biking, stretching)','Attending events (music, festivals, community gatherings)','Other'] },
  { id: 'pv_e', text: "What would make this space feel like 'your neighborhood'?", type: 'choice', options: ['Local art and murals made with the community','Spaces for cultural events and celebrations','Design that reflects local history and identity (signs, stories, symbols)','Support for local businesses and street vendors','Community-led programming (markets, performances, workshops)','Everyday amenities that match local needs (seating, shade, play)','Multilingual wayfinding and welcoming signs','Other'] },
  { id: 'pv_f', text: 'What is one thing every good public space should include?', type: 'text' },
  { id: 'pv_g', text: 'How do you like a space to be designed?', type: 'choice', options: ['Calm, simple, and quiet (muted colors)','Colorful and energetic (bold accents)','Natural and earthy (wood/stone/greenery)','Clean and modern (smooth surfaces, minimal details)','Playful and creative (patterns, art, unexpected elements)','Classic and timeless (neutral palette, durable materials)'] },
]

export default function SurveyPanel({ location, onClose }) {
  const [step, setStep] = useState('subimage')
  const [subImages, setSubImages] = useState([])
  const [selectedSubImage, setSelectedSubImage] = useState(null)
  const [locationAnswers, setLocationAnswers] = useState({})
  const [priorityAnswers, setPriorityAnswers] = useState({})
  const [generatedImage, setGeneratedImage] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [sharedToGallery, setSharedToGallery] = useState(false)
  const [loadingImages, setLoadingImages] = useState(true)
  const [accuracyRating, setAccuracyRating] = useState(null)
  const [reloadsLeft, setReloadsLeft] = useState(1)
  const [responseId, setResponseId] = useState(null)

  const questions = (location.survey_questions || [])
    .filter(q => q.question_type !== 'subimage')
    .sort((a, b) => a.order_num - b.order_num)

  useEffect(() => { loadSubImages() }, [location.id])

  async function loadSubImages() {
    setLoadingImages(true)
    const { data } = await supabase.from('sub_images').select('*').eq('location_id', location.id).order('order_num')
    if (data && data.length > 0) setSubImages(data)
    else setSubImages([])
    setLoadingImages(false)
  }

  function setLocAnswer(qid, val) { setLocationAnswers(p => ({ ...p, [qid]: val })) }
  function toggleLocMulti(qid, val) {
    setLocationAnswers(p => { const c = p[qid] || []; return { ...p, [qid]: c.includes(val) ? c.filter(v => v !== val) : [...c, val] } })
  }
  function setPriAnswer(qid, val) { setPriorityAnswers(p => ({ ...p, [qid]: val })) }
  function togglePriMulti(qid, val) {
    setPriorityAnswers(p => { const c = p[qid] || []; return { ...p, [qid]: c.includes(val) ? c.filter(v => v !== val) : [...c, val] } })
  }

  const locRequiredDone = questions.filter(q => q.question_type === 'choice').every(q => locationAnswers[q.id])
  const priRequiredDone = PRIORITIES_QUESTIONS.filter(q => q.type === 'choice' || q.type === 'scale').every(q => priorityAnswers[q.id])

  async function generate(isReload = false) {
    if (isReload && reloadsLeft <= 0) return
    setGenerating(true)
    if (!isReload) {
      const { data } = await supabase.from('survey_responses').insert({
        location_id: location.id,
        answers: {
          selected_location: location.name,
          selected_sub_image: selectedSubImage?.image_url,
          selected_sub_image_caption: selectedSubImage?.caption,
          ...locationAnswers, ...priorityAnswers
        }
      }).select().single()
      if (data) setResponseId(data.id)
    } else {
      setReloadsLeft(r => r - 1)
      setAccuracyRating(null)
    }
    await new Promise(r => setTimeout(r, 2500))
    // Placeholder — swap with real image gen API
    setGeneratedImage(`https://picsum.photos/seed/${Date.now()}/600/600`)
    setGenerating(false)
    setStep('result')
  }

  async function saveRating(rating) {
    setAccuracyRating(rating)
    if (responseId) {
      await supabase.from('survey_responses').update({
        answers: {
          selected_location: location.name,
          selected_sub_image: selectedSubImage?.image_url,
          selected_sub_image_caption: selectedSubImage?.caption,
          ...locationAnswers, ...priorityAnswers,
          accuracy_rating: rating
        }
      }).eq('id', responseId)
    }
  }

  async function shareToGallery() {
    await supabase.from('gallery').insert({
      location_id: location.id,
      image_url: generatedImage,
      prompt: JSON.stringify({ ...locationAnswers, ...priorityAnswers }),
      approved: true
    })
    setSharedToGallery(true)
  }

  const progressSteps = ['Choose Photo', 'Location Questions', 'Your Values', 'Result']
  const stepIndex = { subimage: 0, location: 1, priorities: 2, result: 3 }[step] ?? 2
  const showRightPanel = selectedSubImage !== null

  return (
    <div style={{
      display: 'flex', width: '100%', height: '100%',
      fontFamily: 'Inter, sans-serif', borderRadius: 16, overflow: 'hidden'
    }}>

      {/* ── LEFT: Survey Panel ── */}
      <div style={{
        flex: '0 0 520px', overflowY: 'auto',
        padding: '32px 36px',
        borderRight: showRightPanel ? '1px solid #C5D8EF' : 'none'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4A90D9', fontWeight: 600, marginBottom: 3 }}>{location.name}</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 600, color: '#1B3A6B' }}>Share Your Vision</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: '#4A6FA5', cursor: 'pointer', padding: 4, marginTop: 2 }}>✕</button>
        </div>

        {/* Progress */}
        {step !== 'generating' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {progressSteps.map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 3, borderRadius: 2, background: i <= stepIndex ? '#4A90D9' : '#C5D8EF', marginBottom: 5, transition: 'background 0.3s' }} />
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: i <= stepIndex ? '#4A90D9' : '#4A6FA5', fontWeight: i <= stepIndex ? 600 : 400 }}>{s}</div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Sub-image picker */}
        {step === 'subimage' && (
          <div>
            <p style={{ fontSize: 14, color: '#4A6FA5', lineHeight: 1.6, marginBottom: 20 }}>
              Pick the photo that looks most like the exact place you're thinking about. This will be the starting point for your vision!
            </p>
            {loadingImages ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#4A6FA5' }}>Loading photos...</div>
            ) : subImages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(74,144,217,0.06)', borderRadius: 10, border: '1.5px dashed #C5D8EF', marginBottom: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📷</div>
                <p style={{ fontSize: 14, color: '#4A6FA5', lineHeight: 1.6 }}>Photos for this location are coming soon!</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: subImages.length <= 2 ? '1fr 1fr' : '1fr 1fr 1fr',
                gap: 10, marginBottom: 24
              }}>
                {subImages.map((img, i) => {
                  const letter = String.fromCharCode(65 + i)
                  const isSel = selectedSubImage?.id === img.id
                  return (
                    <div key={img.id} onClick={() => setSelectedSubImage(img)} style={{
                      borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                      border: `2.5px solid ${isSel ? '#4A90D9' : '#C5D8EF'}`,
                      transition: 'all 0.15s',
                      boxShadow: isSel ? '0 0 0 3px rgba(74,144,217,0.2)' : 'none'
                    }}>
                      <div style={{ position: 'relative' }}>
                        <img src={img.image_url} alt={img.caption}
                          style={{ width: '100%', height: subImages.length <= 4 ? 110 : 88, objectFit: 'cover', display: 'block' }} />
                        {isSel && (
                          <div style={{ position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: '50%', background: '#4A90D9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>✓</span>
                          </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 6px' }}>{letter}</div>
                      </div>
                      <div style={{ padding: '5px 7px', fontSize: 11, color: '#4A6FA5', lineHeight: 1.3, background: '#EEF4FB' }}>{img.caption}</div>
                    </div>
                  )
                })}
              </div>
            )}
            <button onClick={() => setStep('location')} disabled={!selectedSubImage || subImages.length === 0} style={{
              width: '100%', padding: '14px', borderRadius: 10, border: 'none',
              background: selectedSubImage ? '#1B3A6B' : '#C5D8EF',
              color: selectedSubImage ? '#FFFFFF' : '#4A6FA5',
              fontFamily: 'Cormorant Garamond, serif', fontSize: 19, fontWeight: 600,
              cursor: selectedSubImage ? 'pointer' : 'not-allowed', transition: 'all 0.2s'
            }}>Continue with this photo →</button>
          </div>
        )}

        {/* STEP 2: Location questions */}
        {step === 'location' && (
          <div>
            {selectedSubImage && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, padding: '8px 12px', background: 'rgba(74,144,217,0.08)', borderRadius: 8, border: '1px solid rgba(74,144,217,0.2)' }}>
                <img src={selectedSubImage.image_url} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#4A90D9', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your chosen view</div>
                  <div style={{ fontSize: 12, color: '#1B3A6B', marginTop: 1 }}>{selectedSubImage.caption}</div>
                </div>
                <button onClick={() => setStep('subimage')} style={{ background: 'none', border: 'none', fontSize: 11, color: '#4A6FA5', cursor: 'pointer' }}>Change</button>
              </div>
            )}
            {questions.map((q, i) => (
              <QuestionBlock key={q.id} q={q} index={i} answers={locationAnswers} setAnswer={setLocAnswer} toggleMulti={toggleLocMulti} />
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setStep('subimage')} style={{ padding: '12px 18px', borderRadius: 9, border: '1.5px solid #C5D8EF', background: 'none', fontSize: 14, color: '#4A6FA5', cursor: 'pointer' }}>← Back</button>
              <button onClick={() => setStep('priorities')} disabled={!locRequiredDone} style={{
                flex: 1, padding: '12px', borderRadius: 9, border: 'none',
                background: locRequiredDone ? '#1B3A6B' : '#C5D8EF',
                color: locRequiredDone ? '#FFFFFF' : '#4A6FA5',
                fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600,
                cursor: locRequiredDone ? 'pointer' : 'not-allowed', transition: 'all 0.2s'
              }}>Next: Your Values →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Priorities */}
        {step === 'priorities' && (
          <div>
            <div style={{ marginBottom: 20, padding: '10px 14px', borderLeft: '3px solid #4A90D9', background: 'rgba(74,144,217,0.06)', borderRadius: '0 8px 8px 0', fontSize: 13, color: '#4A6FA5', lineHeight: 1.6 }}>
              A few questions about your values and priorities for public space in Sunnyside.
            </div>
            {PRIORITIES_QUESTIONS.map((q, i) => (
              <QuestionBlock key={q.id} q={{ id: q.id, question_text: q.text, question_type: q.type, options: q.options, min_label: q.min_label, max_label: q.max_label }} index={i} answers={priorityAnswers} setAnswer={setPriAnswer} toggleMulti={togglePriMulti} />
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setStep('location')} style={{ padding: '12px 18px', borderRadius: 9, border: '1.5px solid #C5D8EF', background: 'none', fontSize: 14, color: '#4A6FA5', cursor: 'pointer' }}>← Back</button>
              <button onClick={() => generate(false)} disabled={!priRequiredDone} style={{
                flex: 1, padding: '12px', borderRadius: 9, border: 'none',
                background: priRequiredDone ? '#E8722A' : '#C5D8EF',
                color: priRequiredDone ? 'white' : '#4A6FA5',
                fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600,
                cursor: priRequiredDone ? 'pointer' : 'not-allowed', transition: 'all 0.2s'
              }}>Generate My Vision →</button>
            </div>
          </div>
        )}

        {/* STEP: Result - left panel shows rating + reload */}
        {step === 'result' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#1B3A6B', marginBottom: 6 }}>Your vision is ready!</div>
              <p style={{ fontSize: 13, color: '#4A6FA5', lineHeight: 1.6 }}>Based on: <em>{selectedSubImage?.caption}</em></p>
            </div>

            {/* Accuracy Rating */}
            <div style={{ background: 'rgba(74,144,217,0.06)', borderRadius: 12, padding: '20px', marginBottom: 20, border: '1px solid #C5D8EF' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1B3A6B', marginBottom: 12 }}>
                How accurately does this image match your imagination?
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => saveRating(n)} style={{
                    flex: 1, height: 44, borderRadius: 8, border: 'none',
                    background: accuracyRating >= n ? '#4A90D9' : '#C5D8EF',
                    color: accuracyRating >= n ? 'white' : '#4A6FA5',
                    fontSize: 18, cursor: 'pointer', transition: 'all 0.15s'
                  }}>★</button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4A6FA5' }}>
                <span>Not at all</span>
                <span>{accuracyRating ? `${accuracyRating}/5 stars` : 'Tap to rate'}</span>
                <span>Perfectly</span>
              </div>
            </div>

            {/* Reload */}
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={() => generate(true)}
                disabled={reloadsLeft <= 0 || generating}
                style={{
                  width: '100%', padding: '12px', borderRadius: 9,
                  border: `1.5px solid ${reloadsLeft > 0 ? '#4A90D9' : '#C5D8EF'}`,
                  background: 'none',
                  color: reloadsLeft > 0 ? '#4A90D9' : '#4A6FA5',
                  fontSize: 14, fontWeight: 600, cursor: reloadsLeft > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                {generating ? 'Regenerating...' : reloadsLeft > 0 ? '↺ Regenerate Image' : '↺ No reloads remaining'}
              </button>
              <p style={{ fontSize: 11, color: '#4A6FA5', textAlign: 'center', marginTop: 6 }}>
                You have {reloadsLeft} reload{reloadsLeft !== 1 ? 's' : ''} remaining per session
              </p>
            </div>

            {/* Share to gallery */}
            {!sharedToGallery ? (
              <button onClick={shareToGallery} style={{
                width: '100%', padding: '13px', borderRadius: 8, border: 'none',
                background: '#1B3A6B', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}>Add to Community Gallery</button>
            ) : (
              <div style={{ width: '100%', padding: '13px', borderRadius: 8, background: 'rgba(27,58,107,0.08)', border: '1.5px solid #1B3A6B', fontSize: 14, fontWeight: 600, color: '#1B3A6B', textAlign: 'center' }}>✓ Added to Gallery!</div>
            )}
          </div>
        )}
      </div>

      {/* ── RIGHT: Image Preview Panel ── */}
      {showRightPanel && (
        <div style={{
          flex: '0 0 400px',
          background: '#1B3A6B',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px', position: 'relative'
        }}>
          {/* Label */}
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 16, alignSelf: 'flex-start' }}>
            {step === 'result' && !generating ? 'Your Generated Vision' : step === 'priorities' ? 'Generating after submit...' : 'Your Selected View'}
          </div>

          {/* Image display */}
          <div style={{
            width: '100%', aspectRatio: '1',
            borderRadius: 12, overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            background: '#162F58'
          }}>
            {/* Selected sub-image always shows as base */}
            {selectedSubImage && (
              <img
                src={selectedSubImage.image_url}
                alt={selectedSubImage.caption}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  filter: (generating || step === 'result') && !generatedImage ? 'brightness(0.4)' : 'none',
                  transition: 'filter 0.5s'
                }}
              />
            )}

            {/* Generated image fades in on top */}
            {step === 'result' && generatedImage && !generating && (
              <img
                src={generatedImage}
                alt="Generated vision"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  animation: 'fadeIn 0.8s ease-out'
                }}
              />
            )}

            {/* Loading overlay */}
            {generating && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(27,58,107,0.7)'
              }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#4A90D9', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
                <p style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>Creating your vision…</p>
              </div>
            )}
          </div>

          {/* Caption */}
          <div style={{ marginTop: 14, alignSelf: 'flex-start' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              {step === 'result' && !generating ? 'AI-generated from your answers' : selectedSubImage?.caption}
            </div>
          </div>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg) } }
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          `}</style>
        </div>
      )}
    </div>
  )
}

function QuestionBlock({ q, index, answers, setAnswer, toggleMulti }) {
  const val = answers[q.id]
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A90D9', fontWeight: 600, marginBottom: 4 }}>Question {index + 1}</div>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 10, lineHeight: 1.45, color: '#1B3A6B' }}>{q.question_text}</label>

      {q.question_type === 'text' && (
        <textarea value={val || ''} onChange={e => setAnswer(q.id, e.target.value)} placeholder="Type your answer here..."
          style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #C5D8EF', borderRadius: 8, background: '#EEF4FB', resize: 'vertical', minHeight: 70, fontSize: 13, color: '#1B3A6B', outline: 'none', lineHeight: 1.5 }} />
      )}

      {(q.question_type === 'choice' || q.question_type === 'multi') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(q.options || []).map(opt => {
            const isMulti = q.question_type === 'multi'
            const selected = isMulti ? (val || []).includes(opt) : val === opt
            return (
              <button key={opt} onClick={() => isMulti ? toggleMulti(q.id, opt) : setAnswer(q.id, opt)} style={{
                padding: '9px 12px', borderRadius: 7, textAlign: 'left',
                border: `1.5px solid ${selected ? '#4A90D9' : '#C5D8EF'}`,
                background: selected ? 'rgba(74,144,217,0.12)' : '#FFFFFF',
                fontSize: 13, color: '#1B3A6B', fontWeight: selected ? 600 : 400,
                transition: 'all 0.15s', cursor: 'pointer', lineHeight: 1.4
              }}>{selected ? '✓ ' : ''}{opt}</button>
            )
          })}
        </div>
      )}

      {q.question_type === 'scale' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setAnswer(q.id, n)} style={{
                flex: 1, height: 42, borderRadius: 8,
                border: `1.5px solid ${val === n ? '#4A90D9' : '#C5D8EF'}`,
                background: val === n ? '#4A90D9' : '#FFFFFF',
                color: val === n ? 'white' : '#1B3A6B',
                fontSize: 15, fontWeight: 600, transition: 'all 0.15s', cursor: 'pointer'
              }}>{n}</button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4A6FA5' }}>
            <span>{q.min_label}</span><span>{q.max_label}</span>
          </div>
        </div>
      )}
    </div>
  )
}
