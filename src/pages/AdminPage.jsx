import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'sunnyside2024'

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('sv_admin') === 'true')
  if (!authed) return <AdminLogin onLogin={() => { sessionStorage.setItem('sv_admin','true'); setAuthed(true) }} />
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <AdminSidebar onLogout={() => { sessionStorage.removeItem('sv_admin'); setAuthed(false) }} />
      <div style={{ flex: 1, background: '#F7F4EE', overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/locations" element={<AdminLocations />} />
          <Route path="/locations/:id" element={<AdminLocationDetail />} />
          <Route path="/gallery" element={<AdminGallery />} />
          <Route path="/responses" element={<AdminResponses />} />
          <Route path="/content" element={<AdminContent />} />
        </Routes>
      </div>
    </div>
  )
}

function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  function attempt() {
    if (pw === ADMIN_PASSWORD) { onLogin() }
    else { setError(true); setTimeout(() => setError(false), 2000) }
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A1814' }}>
      <div style={{ background: '#F7F4EE', borderRadius: 16, padding: '48px', width: 380, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 8 }}>Sunnyside Vision</div>
        <div style={{ fontSize: 13, color: '#6B6458', marginBottom: 32, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Panel</div>
        <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && attempt()}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: `1.5px solid ${error ? '#C8873A' : '#DDD8CE'}`, background: '#FDFCF9', fontSize: 15, marginBottom: 16, outline: 'none', color: '#1A1814' }} />
        {error && <p style={{ color: '#C8873A', fontSize: 13, marginBottom: 16 }}>Incorrect password</p>}
        <button onClick={attempt} style={{ width: '100%', padding: '13px', background: '#1A1814', color: '#F7F4EE', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600 }}>Enter Admin</button>
      </div>
    </div>
  )
}

function AdminSidebar({ onLogout }) {
  const loc = useLocation()
  const links = [
    { to: '/admin', label: 'Dashboard', icon: '◈' },
    { to: '/admin/locations', label: 'Locations & Surveys', icon: '📍' },
    { to: '/admin/gallery', label: 'Gallery', icon: '🖼' },
    { to: '/admin/responses', label: 'Responses', icon: '📊' },
    { to: '/admin/content', label: 'Page Content', icon: '✏️' },
  ]
  return (
    <div style={{ width: 240, background: '#1A1814', color: '#F7F4EE', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '28px 24px', borderBottom: '1px solid #2A2620' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600 }}>Sunnyside <span style={{ color: '#C8873A', fontStyle: 'italic' }}>Vision</span></div>
        <div style={{ fontSize: 11, color: '#6B6458', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Panel</div>
      </div>
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 4,
            color: loc.pathname === l.to ? '#C8873A' : '#A09880',
            background: loc.pathname === l.to ? 'rgba(200,135,58,0.1)' : 'transparent',
            fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s'
          }}><span>{l.icon}</span> {l.label}</Link>
        ))}
      </nav>
      <div style={{ padding: '16px 12px', borderTop: '1px solid #2A2620' }}>
        <Link to="/" target="_blank" style={{ display: 'block', padding: '9px 12px', borderRadius: 8, color: '#A09880', fontSize: 13, marginBottom: 8 }}>↗ View Live Site</Link>
        <button onClick={onLogout} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'none', border: '1px solid #2A2620', color: '#6B6458', fontSize: 13, textAlign: 'left', cursor: 'pointer' }}>Log out</button>
      </div>
    </div>
  )
}

function AdminHome() {
  const [stats, setStats] = useState({ locations: 0, responses: 0, gallery: 0 })
  useEffect(() => {
    Promise.all([
      supabase.from('locations').select('id', { count: 'exact' }),
      supabase.from('survey_responses').select('id', { count: 'exact' }),
      supabase.from('gallery').select('id', { count: 'exact' })
    ]).then(([l, r, g]) => setStats({ locations: l.count || 0, responses: r.count || 0, gallery: g.count || 0 }))
  }, [])
  return (
    <div style={{ padding: '48px' }}>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#6B6458', marginBottom: 40 }}>Welcome to the Sunnyside Vision admin panel.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 40 }}>
        {[{ num: stats.locations, label: 'Map Locations', to: '/admin/locations', color: '#C8873A' }, { num: stats.responses, label: 'Survey Responses', to: '/admin/responses', color: '#3D6B5A' }, { num: stats.gallery, label: 'Gallery Items', to: '/admin/gallery', color: '#5B7FA6' }].map(s => (
          <Link key={s.label} to={s.to} style={{ background: 'white', borderRadius: 12, padding: '28px', border: '1px solid #DDD8CE', textDecoration: 'none', color: '#1A1814', display: 'block' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 56, color: s.color, lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: 14, color: '#6B6458', marginTop: 8 }}>{s.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function AdminLocations() {
  const [locations, setLocations] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { load() }, [])
  async function load() {
    const { data } = await supabase.from('locations').select('*, survey_questions(*), location_images(*)').order('created_at')
    if (data) setLocations(data)
  }
  async function deleteLocation(id) {
    if (!confirm('Delete this location and all its data?')) return
    await supabase.from('locations').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ padding: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, marginBottom: 4 }}>Locations</h1>
          <p style={{ color: '#6B6458' }}>Manage map pins, photos, and survey questions</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: '12px 24px', borderRadius: 8, background: '#C8873A', color: 'white', border: 'none', fontWeight: 600, fontSize: 14 }}>+ Add Location</button>
      </div>
      {showAdd && <AddLocationForm onSave={() => { setShowAdd(false); load() }} onCancel={() => setShowAdd(false)} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {locations.map(loc => (
          <div key={loc.id} style={{ background: 'white', borderRadius: 12, padding: '20px 24px', border: '1px solid #DDD8CE', display: 'flex', alignItems: 'center', gap: 20 }}>
            {loc.location_images?.[0]?.image_url ? (
              <img src={loc.location_images[0].image_url} alt={loc.name} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
            ) : (
              <div style={{ width: 80, height: 60, borderRadius: 8, background: '#F0EDE6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📍</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: loc.color || '#C8873A' }} />
                <span style={{ fontWeight: 600, fontSize: 16 }}>{loc.name}</span>
                <span style={{ fontSize: 12, color: '#6B6458', background: '#F0EDE6', padding: '2px 8px', borderRadius: 12 }}>{loc.survey_questions?.length || 0} questions</span>
              </div>
              <p style={{ fontSize: 13, color: '#6B6458', lineHeight: 1.5 }}>{loc.description}</p>
              <p style={{ fontSize: 12, color: '#A09880', marginTop: 4 }}>📍 {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button onClick={() => navigate(`/admin/locations/${loc.id}`)} style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #DDD8CE', background: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Edit</button>
              <button onClick={() => deleteLocation(loc.id)} style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #FFCCCC', background: '#FFF5F5', fontSize: 13, color: '#C0392B', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddLocationForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', description: '', latitude: '', longitude: '', color: '#C8873A' })
  const [saving, setSaving] = useState(false)
  async function save() {
    if (!form.name || !form.latitude || !form.longitude) return alert('Name, latitude and longitude are required')
    setSaving(true)
    await supabase.from('locations').insert({ name: form.name, description: form.description, x_position: parseFloat(form.latitude), y_position: parseFloat(form.longitude), latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude), color: form.color })
    setSaving(false); onSave()
  }
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '28px', border: '1.5px solid #C8873A', marginBottom: 24 }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, marginBottom: 20 }}>New Location</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[{ label: 'Location Name', key: 'name', placeholder: 'e.g. Skillman Ave Plaza' }, { label: 'Pin Color (hex)', key: 'color', placeholder: '#C8873A' }, { label: 'Latitude', key: 'latitude', placeholder: '40.7440' }, { label: 'Longitude', key: 'longitude', placeholder: '-73.9226' }].map(f => (
          <div key={f.key}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B6458', marginBottom: 6 }}>{f.label}</label>
            <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #DDD8CE', fontSize: 14, outline: 'none' }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B6458', marginBottom: 6 }}>Description</label>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of this location..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #DDD8CE', fontSize: 14, minHeight: 80, resize: 'vertical', outline: 'none' }} />
      </div>
      <div style={{ marginTop: 12, padding: '10px 14px', background: '#F7F4EE', borderRadius: 8, fontSize: 12, color: '#6B6458' }}>
        💡 <strong>Finding coordinates:</strong> Go to <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" style={{ color: '#C8873A' }}>openstreetmap.org</a>, right-click any spot → "Show address" to get the latitude/longitude.
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button onClick={save} disabled={saving} style={{ padding: '11px 28px', borderRadius: 8, background: '#1A1814', color: 'white', border: 'none', fontWeight: 600, fontSize: 14 }}>{saving ? 'Saving...' : 'Create Location'}</button>
        <button onClick={onCancel} style={{ padding: '11px 20px', borderRadius: 8, border: '1.5px solid #DDD8CE', background: 'none', fontSize: 14 }}>Cancel</button>
      </div>
    </div>
  )
}

function AdminLocationDetail() {
  const { pathname } = useLocation()
  const id = pathname.split('/').pop()
  const [loc, setLoc] = useState(null)
  const [questions, setQuestions] = useState([])
  const [images, setImages] = useState([])
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showAddQ, setShowAddQ] = useState(false)
  const fileRef = useRef()

  useEffect(() => { load() }, [id])
  async function load() {
    const { data } = await supabase.from('locations').select('*').eq('id', id).single()
    if (data) { setLoc(data); setForm(data) }
    const { data: qs } = await supabase.from('survey_questions').select('*').eq('location_id', id).order('order_num')
    if (qs) setQuestions(qs)
    const { data: imgs } = await supabase.from('location_images').select('*').eq('location_id', id)
    if (imgs) setImages(imgs)
  }
  async function saveLocation() {
    setSaving(true)
    await supabase.from('locations').update({ name: form.name, description: form.description, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude), color: form.color, x_position: parseFloat(form.latitude), y_position: parseFloat(form.longitude) }).eq('id', id)
    setSaving(false); alert('Saved!')
  }
  async function uploadImage(file) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `locations/${id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('images').upload(path, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
      await supabase.from('location_images').insert({ location_id: id, image_url: urlData.publicUrl })
      load()
    }
    setUploading(false)
  }
  async function deleteImage(imgId) {
    await supabase.from('location_images').delete().eq('id', imgId); load()
  }
  async function deleteQuestion(qId) {
    await supabase.from('survey_questions').delete().eq('id', qId); load()
  }

  if (!loc) return <div style={{ padding: 48, color: '#6B6458' }}>Loading...</div>

  return (
    <div style={{ padding: '48px' }}>
      <Link to="/admin/locations" style={{ fontSize: 13, color: '#6B6458', marginBottom: 24, display: 'inline-block' }}>← Back to Locations</Link>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, marginBottom: 32 }}>Edit: {loc.name}</h1>

      <div style={{ background: 'white', borderRadius: 12, padding: '28px', border: '1px solid #DDD8CE', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, marginBottom: 20 }}>Location Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[{ label: 'Name', key: 'name' }, { label: 'Pin Color (hex)', key: 'color' }, { label: 'Latitude', key: 'latitude' }, { label: 'Longitude', key: 'longitude' }].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B6458', marginBottom: 6 }}>{f.label}</label>
              <input value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #DDD8CE', fontSize: 14, outline: 'none' }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B6458', marginBottom: 6 }}>Description</label>
          <textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #DDD8CE', fontSize: 14, minHeight: 80, resize: 'vertical', outline: 'none' }} />
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#F7F4EE', borderRadius: 8, fontSize: 12, color: '#6B6458' }}>
          💡 To move this pin on the map, update the Latitude and Longitude. Go to <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" style={{ color: '#C8873A' }}>openstreetmap.org</a>, right-click any location → "Show address" to get coordinates.
        </div>
        <button onClick={saveLocation} disabled={saving} style={{ marginTop: 20, padding: '11px 28px', borderRadius: 8, background: '#1A1814', color: 'white', border: 'none', fontWeight: 600 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: '28px', border: '1px solid #DDD8CE', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24 }}>Location Photos</h2>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '9px 20px', borderRadius: 8, background: '#C8873A', color: 'white', border: 'none', fontWeight: 600, fontSize: 13 }}>{uploading ? 'Uploading...' : '+ Upload Photo'}</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {images.map(img => (
            <div key={img.id} style={{ position: 'relative' }}>
              <img src={img.image_url} alt="" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              <button onClick={() => deleteImage(img.id)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: 4, width: 24, height: 24, fontSize: 14, cursor: 'pointer' }}>✕</button>
            </div>
          ))}
          {images.length === 0 && <p style={{ color: '#A09880', fontSize: 14, fontStyle: 'italic' }}>No photos yet.</p>}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: '28px', border: '1px solid #DDD8CE' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24 }}>Survey Questions</h2>
          <button onClick={() => setShowAddQ(true)} style={{ padding: '9px 20px', borderRadius: 8, background: '#3D6B5A', color: 'white', border: 'none', fontWeight: 600, fontSize: 13 }}>+ Add Question</button>
        </div>
        {showAddQ && <AddQuestionForm locationId={id} onSave={() => { setShowAddQ(false); load() }} onCancel={() => setShowAddQ(false)} orderNum={questions.length} />}
        {questions.map((q, i) => <QuestionRow key={q.id} question={q} index={i} onDelete={() => deleteQuestion(q.id)} onUpdate={load} />)}
        {questions.length === 0 && !showAddQ && <p style={{ color: '#A09880', fontSize: 14, fontStyle: 'italic' }}>No questions yet.</p>}
      </div>
    </div>
  )
}

function QuestionRow({ question, index, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...question, options: question.options?.join(', ') || '' })
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    await supabase.from('survey_questions').update({ question_text: form.question_text, question_type: form.question_type, options: form.options ? form.options.split(',').map(s => s.trim()).filter(Boolean) : null, order_num: form.order_num }).eq('id', question.id)
    setSaving(false); setEditing(false); onUpdate()
  }
  const typeLabels = { choice: 'Multiple Choice', multi: 'Multi-Select', text: 'Open Text', scale: 'Scale 1–5' }
  if (editing) return (
    <div style={{ background: '#F7F4EE', borderRadius: 10, padding: '20px', marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.5fr', gap: 12, marginBottom: 12 }}>
        <div><label style={lbl}>Question Text</label><input value={form.question_text} onChange={e => setForm(p => ({...p,question_text:e.target.value}))} style={inp} /></div>
        <div><label style={lbl}>Type</label><select value={form.question_type} onChange={e => setForm(p => ({...p,question_type:e.target.value}))} style={inp}><option value="choice">Multiple Choice</option><option value="multi">Multi-Select</option><option value="text">Open Text</option><option value="scale">Scale 1–5</option></select></div>
        <div><label style={lbl}>Order</label><input type="number" value={form.order_num} onChange={e => setForm(p => ({...p,order_num:parseInt(e.target.value)}))} style={inp} /></div>
      </div>
      {(form.question_type === 'choice' || form.question_type === 'multi') && (
        <div style={{ marginBottom: 12 }}><label style={lbl}>Options (comma separated)</label><input value={form.options} onChange={e => setForm(p => ({...p,options:e.target.value}))} placeholder="Option 1, Option 2, Option 3" style={inp} /></div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={save} disabled={saving} style={{ padding: '8px 20px', borderRadius: 7, background: '#1A1814', color: 'white', border: 'none', fontWeight: 600, fontSize: 13 }}>{saving ? 'Saving...' : 'Save'}</button>
        <button onClick={() => setEditing(false)} style={{ padding: '8px 16px', borderRadius: 7, border: '1.5px solid #DDD8CE', background: 'none', fontSize: 13 }}>Cancel</button>
      </div>
    </div>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 0', borderBottom: '1px solid #F0EDE6' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#6B6458', flexShrink: 0 }}>{index + 1}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{question.question_text}</div>
        <div style={{ fontSize: 12, color: '#A09880' }}>{typeLabels[question.question_type]}{question.options?.length > 0 && ` — ${question.options.join(', ')}`}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={() => setEditing(true)} style={{ padding: '6px 14px', borderRadius: 7, border: '1.5px solid #DDD8CE', background: 'none', fontSize: 12 }}>Edit</button>
        <button onClick={onDelete} style={{ padding: '6px 14px', borderRadius: 7, border: '1.5px solid #FFCCCC', background: '#FFF5F5', color: '#C0392B', fontSize: 12 }}>Delete</button>
      </div>
    </div>
  )
}

function AddQuestionForm({ locationId, onSave, onCancel, orderNum }) {
  const [form, setForm] = useState({ question_text: '', question_type: 'choice', options: '' })
  const [saving, setSaving] = useState(false)
  async function save() {
    if (!form.question_text) return
    setSaving(true)
    await supabase.from('survey_questions').insert({ location_id: locationId, question_text: form.question_text, question_type: form.question_type, options: form.options ? form.options.split(',').map(s => s.trim()).filter(Boolean) : null, order_num: orderNum })
    setSaving(false); onSave()
  }
  return (
    <div style={{ background: '#F7F4EE', borderRadius: 10, padding: '20px', marginBottom: 20, border: '1.5px solid #3D6B5A' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
        <div><label style={lbl}>Question Text</label><input value={form.question_text} onChange={e => setForm(p => ({...p,question_text:e.target.value}))} placeholder="What do you imagine here?" style={inp} /></div>
        <div><label style={lbl}>Question Type</label><select value={form.question_type} onChange={e => setForm(p => ({...p,question_type:e.target.value}))} style={inp}><option value="choice">Multiple Choice</option><option value="multi">Multi-Select</option><option value="text">Open Text</option><option value="scale">Scale 1–5</option></select></div>
      </div>
      {(form.question_type === 'choice' || form.question_type === 'multi') && (
        <div style={{ marginBottom: 12 }}><label style={lbl}>Options (comma separated)</label><input value={form.options} onChange={e => setForm(p => ({...p,options:e.target.value}))} placeholder="Green space, Seating area, Public art, Market stalls" style={inp} /></div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={save} disabled={saving} style={{ padding: '9px 24px', borderRadius: 7, background: '#3D6B5A', color: 'white', border: 'none', fontWeight: 600, fontSize: 13 }}>{saving ? 'Saving...' : 'Add Question'}</button>
        <button onClick={onCancel} style={{ padding: '9px 16px', borderRadius: 7, border: '1.5px solid #DDD8CE', background: 'none', fontSize: 13 }}>Cancel</button>
      </div>
    </div>
  )
}

function AdminGallery() {
  const [items, setItems] = useState([])
  useEffect(() => { load() }, [])
  async function load() {
    const { data } = await supabase.from('gallery').select('*, locations(name)').order('created_at', { ascending: false })
    if (data) setItems(data)
  }
  async function deleteItem(id) { await supabase.from('gallery').delete().eq('id', id); load() }
  async function toggleApprove(id, current) { await supabase.from('gallery').update({ approved: !current }).eq('id', id); load() }

  return (
    <div style={{ padding: '48px' }}>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, marginBottom: 8 }}>Gallery</h1>
      <p style={{ color: '#6B6458', marginBottom: 40 }}>Manage community submitted artworks</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {items.map(item => (
          <div key={item.id} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #DDD8CE' }}>
            <img src={item.image_url} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} onError={e => e.target.src = `https://picsum.photos/seed/${item.id}/400/200`} />
            <div style={{ padding: '14px' }}>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{item.locations?.name}</div>
              <div style={{ fontSize: 12, color: '#A09880', marginBottom: 12 }}>{new Date(item.created_at).toLocaleDateString()}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleApprove(item.id, item.approved)} style={{ flex: 1, padding: '7px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: 'none', background: item.approved ? '#E8F5E9' : '#FFF3E0', color: item.approved ? '#2E7D32' : '#E65100', cursor: 'pointer' }}>{item.approved ? '✓ Visible' : '○ Hidden'}</button>
                <button onClick={() => deleteItem(item.id)} style={{ padding: '7px 12px', borderRadius: 7, border: '1.5px solid #FFCCCC', background: '#FFF5F5', color: '#C0392B', fontSize: 12, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p style={{ color: '#A09880', fontStyle: 'italic' }}>No gallery items yet.</p>}
    </div>
  )
}

function AdminResponses() {
  const [responses, setResponses] = useState([])
  useEffect(() => {
    supabase.from('survey_responses').select('*, locations(name)').order('created_at', { ascending: false })
      .then(({ data }) => data && setResponses(data))
  }, [])
  return (
    <div style={{ padding: '48px' }}>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, marginBottom: 8 }}>Survey Responses</h1>
      <p style={{ color: '#6B6458', marginBottom: 40 }}>{responses.length} total responses</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {responses.map(r => (
          <div key={r.id} style={{ background: 'white', borderRadius: 10, padding: '18px 22px', border: '1px solid #DDD8CE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{r.locations?.name}</span>
              <span style={{ fontSize: 12, color: '#A09880' }}>{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(r.answers || {}).map(([k, v]) => (
                <div key={k} style={{ fontSize: 12, background: '#F0EDE6', padding: '4px 10px', borderRadius: 6, color: '#4A4438' }}>{Array.isArray(v) ? v.join(', ') : String(v)}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {responses.length === 0 && <p style={{ color: '#A09880', fontStyle: 'italic' }}>No responses yet.</p>}
    </div>
  )
}

// ── Page Content Editor ───────────────────────────────────────────────────
function AdminContent() {
  const [content, setContent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('site_content').select('*').eq('key', 'homepage').single()
      .then(({ data }) => {
        if (data) setContent(data.content)
        else setContent({ what_title: 'What We Are', what_body: '', how_title: 'How It Works', how_body: '', why_title: 'Why We Do It', why_body: '' })
      })
  }, [])

  async function save() {
    setSaving(true)
    const { error } = await supabase.from('site_content').upsert({ key: 'homepage', content, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    setSaving(false)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  if (!content) return <div style={{ padding: 48, color: '#6B6458' }}>Loading...</div>

  const fields = [
    { label: 'What We Are — Title', key: 'what_title', multiline: false },
    { label: 'What We Are — Body', key: 'what_body', multiline: true },
    { label: 'How It Works — Title', key: 'how_title', multiline: false },
    { label: 'How It Works — Body', key: 'how_body', multiline: true },
    { label: 'Why We Do It — Title', key: 'why_title', multiline: false },
    { label: 'Why We Do It — Body', key: 'why_body', multiline: true },
  ]

  return (
    <div style={{ padding: '48px' }}>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, marginBottom: 8 }}>Page Content</h1>
      <p style={{ color: '#6B6458', marginBottom: 40 }}>Edit the intro text shown below the map on the homepage</p>
      <div style={{ background: 'white', borderRadius: 12, padding: '32px', border: '1px solid #DDD8CE', maxWidth: 720 }}>
        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B6458', marginBottom: 8 }}>{f.label}</label>
            {f.multiline ? (
              <textarea value={content[f.key] || ''} onChange={e => setContent(p => ({...p, [f.key]: e.target.value}))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #DDD8CE', fontSize: 14, minHeight: 100, resize: 'vertical', outline: 'none', lineHeight: 1.6 }} />
            ) : (
              <input value={content[f.key] || ''} onChange={e => setContent(p => ({...p, [f.key]: e.target.value}))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #DDD8CE', fontSize: 14, outline: 'none' }} />
            )}
          </div>
        ))}
        <button onClick={save} disabled={saving} style={{ padding: '12px 32px', borderRadius: 8, background: '#1A1814', color: 'white', border: 'none', fontWeight: 600, fontSize: 15 }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Content'}
        </button>
      </div>
    </div>
  )
}

const lbl = { display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B6458', marginBottom: 5 }
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #DDD8CE', fontSize: 14, outline: 'none', background: 'white', color: '#1A1814' }
