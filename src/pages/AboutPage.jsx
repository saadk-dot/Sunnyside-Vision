import { useLang } from '../App'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  const { t } = useLang()
  return (
    <div style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#4A90D9', fontWeight: 600, marginBottom: 16 }}>Community Engagement Platform</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 56, marginBottom: 32, lineHeight: 1.05 }}>{t('about', 'title')}</h1>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--muted)', marginBottom: 28 }}>{t('about', 'body')}</p>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--muted)', marginBottom: 48 }}>Residents are invited to explore key public spaces across the neighborhood, answer questions about each space, and generate AI artwork that reflects the community's collective vision for Sunnyside's future.</p>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/" style={{ padding: '14px 32px', borderRadius: 8, background: '#4A90D9', color: 'white', fontWeight: 600, fontSize: 15 }}>Explore the Map →</Link>
          <Link to="/gallery" style={{ padding: '14px 32px', borderRadius: 8, border: '1.5px solid var(--border)', color: 'var(--ink)', fontWeight: 500, fontSize: 15 }}>View Gallery</Link>
        </div>
      </div>
    </div>
  )
}
