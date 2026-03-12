import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../App'

export default function GalleryPage() {
  const { t } = useLang()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGallery()
  }, [])

  async function loadGallery() {
    const { data } = await supabase
      .from('gallery')
      .select('*, locations(name, color)')
      .eq('approved', true)
      .order('created_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }

  return (
    <div style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 32px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 56, marginBottom: 8 }}>
          {t('gallery', 'title')}
        </h1>
        <p style={{ fontSize: 17, color: 'var(--muted)', marginBottom: 48 }}>
          {t('gallery', 'subtitle')}
        </p>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading...</div>
        )}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, marginBottom: 16 }}>✦</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 12 }}>
              {t('gallery', 'empty')}
            </h2>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ columns: 3, columnGap: 20 }}>
            {items.map(item => (
              <div key={item.id} style={{
                breakInside: 'avoid', marginBottom: 20,
                borderRadius: 12, overflow: 'hidden',
                background: 'var(--card)', border: '1px solid var(--border)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}>
                <img
                  src={item.image_url}
                  alt={item.locations?.name}
                  style={{ width: '100%', display: 'block' }}
                  onError={e => e.target.src = `https://picsum.photos/seed/${item.id}/400/400`}
                />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{
                    display: 'inline-block', padding: '3px 10px',
                    borderRadius: 20, fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    background: item.locations?.color || 'var(--accent)',
                    color: 'white', marginBottom: 8
                  }}>
                    {item.locations?.name}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {t('gallery', 'by')} — {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
