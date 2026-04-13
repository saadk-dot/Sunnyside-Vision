import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../App'

const LOCATIONS = ['All', 'Bliss Plaza', 'Lowery Plaza', 'Under the 7 Train']
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most_liked', label: 'Most Liked' },
]

// Generate a simple session ID for likes
function getSessionId() {
  let id = localStorage.getItem('sv_session')
  if (!id) { id = Math.random().toString(36).slice(2); localStorage.setItem('sv_session', id) }
  return id
}

export default function GalleryPage() {
  const { t } = useLang()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [sortBy, setSortBy] = useState('latest')
  const [sortOpen, setSortOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [likedIds, setLikedIds] = useState(new Set())
  const sessionId = getSessionId()

  useEffect(() => { loadGallery() }, [activeTab, sortBy])
  useEffect(() => { loadMyLikes() }, [])

  async function loadGallery() {
    setLoading(true)
    let query = supabase
      .from('gallery')
      .select('*, locations(name, color)')
      .eq('approved', true)

    if (activeTab !== 'All') {
      const { data: loc } = await supabase.from('locations').select('id').eq('name', activeTab).single()
      if (loc) query = query.eq('location_id', loc.id)
    }

    if (sortBy === 'latest') query = query.order('created_at', { ascending: false })
    else if (sortBy === 'oldest') query = query.order('created_at', { ascending: true })
    else if (sortBy === 'most_liked') query = query.order('likes_count', { ascending: false })

    const { data } = await query
    if (data) setItems(data)
    setLoading(false)
  }

  async function loadMyLikes() {
    const { data } = await supabase
      .from('gallery_likes')
      .select('gallery_id')
      .eq('session_id', sessionId)
    if (data) setLikedIds(new Set(data.map(l => l.gallery_id)))
  }

  async function toggleLike(e, item) {
    e.stopPropagation()
    const alreadyLiked = likedIds.has(item.id)
    const newCount = alreadyLiked ? item.likes_count - 1 : item.likes_count + 1

    // Optimistic update
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, likes_count: newCount } : i))
    if (selected?.id === item.id) setSelected(prev => ({ ...prev, likes_count: newCount }))
    setLikedIds(prev => {
      const next = new Set(prev)
      alreadyLiked ? next.delete(item.id) : next.add(item.id)
      return next
    })

    if (alreadyLiked) {
      await supabase.from('gallery_likes').delete().eq('gallery_id', item.id).eq('session_id', sessionId)
    } else {
      await supabase.from('gallery_likes').insert({ gallery_id: item.id, session_id: sessionId })
    }
    await supabase.from('gallery').update({ likes_count: newCount }).eq('id', item.id)
  }

  function openEntry(item) { setSelected(item) }

  return (
    <div style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px' }}>

        {/* Header */}
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, marginBottom: 6, color: '#1B3A6B' }}>
          Community Gallery
        </h1>
        <p style={{ fontSize: 16, color: '#4A6FA5', marginBottom: 36 }}>
          Visions for Sunnyside's future, imagined by its residents
        </p>

        {/* Tabs + Sort */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 10, padding: 4, border: '1px solid #C5D8EF' }}>
            {LOCATIONS.map(loc => (
              <button key={loc} onClick={() => setActiveTab(loc)} style={{
                padding: '8px 18px', borderRadius: 7, border: 'none',
                background: activeTab === loc ? '#1B3A6B' : 'transparent',
                color: activeTab === loc ? 'white' : '#4A6FA5',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}>{loc}</button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setSortOpen(p => !p)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 16px', borderRadius: 8, border: '1.5px solid #C5D8EF',
              background: 'white', fontSize: 13, fontWeight: 500, color: '#1B3A6B',
              cursor: 'pointer'
            }}>
              Sort: {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
              <span style={{ fontSize: 10 }}>▼</span>
            </button>
            {sortOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', zIndex: 100,
                background: 'white', borderRadius: 10, border: '1px solid #C5D8EF',
                boxShadow: '0 8px 24px rgba(27,58,107,0.15)', overflow: 'hidden', minWidth: 160
              }}>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setSortBy(opt.value); setSortOpen(false) }} style={{
                    display: 'block', width: '100%', padding: '11px 16px',
                    border: 'none', background: sortBy === opt.value ? '#EEF4FB' : 'white',
                    fontSize: 13, color: sortBy === opt.value ? '#1B3A6B' : '#4A6FA5',
                    fontWeight: sortBy === opt.value ? 600 : 400,
                    cursor: 'pointer', textAlign: 'left',
                    borderBottom: '1px solid #EEF4FB'
                  }}>{opt.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gallery grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#4A6FA5' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #C5D8EF', borderTopColor: '#4A90D9', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#1B3A6B', marginBottom: 12 }}>No entries yet</h2>
            <p style={{ color: '#4A6FA5' }}>Be the first to contribute a vision for this location.</p>
          </div>
        ) : (
          <div style={{ columns: 3, columnGap: 20 }}>
            {items.map(item => (
              <GalleryCard
                key={item.id} item={item}
                liked={likedIds.has(item.id)}
                onLike={toggleLike}
                onClick={() => openEntry(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Slide-in detail panel */}
      {selected && (
        <DetailPanel
          item={selected}
          liked={likedIds.has(selected.id)}
          onLike={toggleLike}
          onClose={() => setSelected(null)}
          sessionId={sessionId}
        />
      )}
    </div>
  )
}

// ── Gallery Card ───────────────────────────────────────────────────────────
function GalleryCard({ item, liked, onLike, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        breakInside: 'avoid', marginBottom: 20,
        borderRadius: 14, overflow: 'hidden',
        background: 'white', border: '1px solid #C5D8EF',
        cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 2px 8px rgba(27,58,107,0.08)'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,107,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(27,58,107,0.08)' }}
    >
      <img src={item.image_url} alt={item.locations?.name}
        style={{ width: '100%', display: 'block' }}
        onError={e => e.target.src = `https://picsum.photos/seed/${item.id}/400/400`} />
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
            background: item.locations?.color || '#4A90D9', color: 'white'
          }}>{item.locations?.name}</span>
          <span style={{ fontSize: 12, color: '#4A6FA5' }}>
            {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={e => onLike(e, item)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: liked ? 'rgba(74,144,217,0.1)' : 'none',
              border: `1.5px solid ${liked ? '#4A90D9' : '#C5D8EF'}`,
              borderRadius: 20, padding: '4px 12px',
              cursor: 'pointer', fontSize: 13,
              color: liked ? '#4A90D9' : '#4A6FA5',
              fontWeight: liked ? 600 : 400, transition: 'all 0.15s'
            }}
          >
            <span style={{ fontSize: 14 }}>{liked ? '♥' : '♡'}</span>
            {item.likes_count || 0}
          </button>
          <span style={{ fontSize: 12, color: '#4A6FA5' }}>Click to view</span>
        </div>
      </div>
    </div>
  )
}

// ── Detail Panel (slides in from right) ────────────────────────────────────
function DetailPanel({ item, liked, onLike, onClose, sessionId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [newName, setNewName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { loadComments() }, [item.id])

  async function loadComments() {
    const { data } = await supabase
      .from('gallery_comments')
      .select('*')
      .eq('gallery_id', item.id)
      .order('created_at', { ascending: false })
    if (data) setComments(data)
  }

  async function submitComment() {
    if (!newComment.trim()) return
    setSubmitting(true)
    await supabase.from('gallery_comments').insert({
      gallery_id: item.id,
      name: newName.trim() || 'Anonymous',
      comment: newComment.trim()
    })
    setNewComment('')
    setNewName('')
    setSubmitting(false)
    loadComments()
  }

  function share() {
    const url = `${window.location.origin}/gallery?entry=${item.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(27,58,107,0.4)',
        zIndex: 500, animation: 'fadeIn 0.2s ease-out'
      }} />
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
      `}</style>

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 520,
        background: 'white', zIndex: 501,
        overflowY: 'auto',
        boxShadow: '-8px 0 40px rgba(27,58,107,0.2)',
        animation: 'slideIn 0.3s ease-out',
        paddingTop: 'var(--nav-h)'
      }}>

        {/* Close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #EEF4FB' }}>
          <div>
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: 20,
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
              background: item.locations?.color || '#4A90D9', color: 'white', marginBottom: 4
            }}>{item.locations?.name}</span>
            <div style={{ fontSize: 12, color: '#4A6FA5' }}>
              {new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: '#4A6FA5', cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        {/* Image */}
        <img src={item.image_url} alt="" style={{ width: '100%', display: 'block' }}
          onError={e => e.target.src = `https://picsum.photos/seed/${item.id}/520/400`} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, padding: '16px 24px', borderBottom: '1px solid #EEF4FB' }}>
          <button onClick={e => onLike(e, item)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 20px', borderRadius: 8,
            border: `1.5px solid ${liked ? '#4A90D9' : '#C5D8EF'}`,
            background: liked ? 'rgba(74,144,217,0.1)' : 'white',
            color: liked ? '#4A90D9' : '#4A6FA5',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
          }}>
            <span style={{ fontSize: 16 }}>{liked ? '♥' : '♡'}</span>
            {item.likes_count || 0} {item.likes_count === 1 ? 'Like' : 'Likes'}
          </button>

          <button onClick={share} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 20px', borderRadius: 8,
            border: '1.5px solid #C5D8EF', background: copied ? '#EEF4FB' : 'white',
            color: copied ? '#4A90D9' : '#4A6FA5',
            fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s'
          }}>
            {copied ? '✓ Link Copied!' : 'Share'}
          </button>
        </div>

        {/* Comments */}
        <div style={{ padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#1B3A6B', marginBottom: 16 }}>
            Comments {comments.length > 0 && <span style={{ fontSize: 14, color: '#4A6FA5', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>({comments.length})</span>}
          </h3>

          {/* Add comment */}
          <div style={{ background: '#EEF4FB', borderRadius: 10, padding: '16px', marginBottom: 20, border: '1px solid #C5D8EF' }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Your name (optional)"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 7, border: '1.5px solid #C5D8EF', fontSize: 13, marginBottom: 8, outline: 'none', background: 'white', color: '#1B3A6B' }}
            />
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this vision..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: 7, border: '1.5px solid #C5D8EF', fontSize: 13, minHeight: 72, resize: 'vertical', outline: 'none', background: 'white', color: '#1B3A6B', lineHeight: 1.5 }}
            />
            <button onClick={submitComment} disabled={!newComment.trim() || submitting} style={{
              marginTop: 8, padding: '9px 24px', borderRadius: 7, border: 'none',
              background: newComment.trim() ? '#1B3A6B' : '#C5D8EF',
              color: newComment.trim() ? 'white' : '#4A6FA5',
              fontSize: 13, fontWeight: 600, cursor: newComment.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s'
            }}>{submitting ? 'Posting...' : 'Post Comment'}</button>
          </div>

          {/* Comment list */}
          {comments.length === 0 ? (
            <p style={{ fontSize: 14, color: '#4A6FA5', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {comments.map(c => (
                <div key={c.id} style={{ padding: '12px 14px', borderRadius: 10, background: 'white', border: '1px solid #C5D8EF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1B3A6B' }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: '#4A6FA5' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#2A3F6B', lineHeight: 1.6, margin: 0 }}>{c.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
