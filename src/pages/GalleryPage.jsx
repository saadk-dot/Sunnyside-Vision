import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../App'

export default function GalleryPage() {
  const { t } = useLang()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('gallery').select('*, locations(name, color)').eq('approved', true).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setItems(data); setLoading(false) })
  }, [])

  return (
    <div style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 32px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 56, marginBottom: 8 }}>{t('gallery', 'title')}</h1>
        <p style={{ fontSize: 17, color: 'var(--muted)', marginBottom: 48 }}>{t('gallery', 'subtitle')}</p>
        {loading && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading...</div>}
        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, marginBottom: 16 }}>✦</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 12 }}>{t('gallery', 'empty')}</h2>
          </div>
        )}
        {!loading && items.length > 0 && (
          <div style={{ columns: 3, columnGap: 20 }}>
            {items.map(item => (
              <div key={item.id} style={{ breakInside: 'avoid', marginBottom: 20, borderRadius: 12, overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border)' }}>
                <img src={item.image_url} alt={item.locations?.name} style={{ width: '100%', display: 'block' }} onError={e => e.target.src = `https://picsum.photos/seed/${item.id}/400/400`} />
                <div style={{ padding: '14px 16px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: item.locations?.color || '#4A90D9', color: 'white', marginBottom: 6 }}>{item.locations?.name}</span>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
