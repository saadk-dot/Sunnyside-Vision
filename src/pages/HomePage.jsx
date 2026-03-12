import { Link } from 'react-router-dom'
import { useLang } from '../App'

export default function HomePage() {
  const { t } = useLang()

  return (
    <div style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        minHeight: 'calc(100vh - var(--nav-h))',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Left panel */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '80px 60px',
          background: 'var(--bg)'
        }}>
          <div style={{
            fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em',
            color: 'var(--accent)', fontWeight: 600, marginBottom: 20
          }}>
            Sunnyside Public Realm Vision
          </div>

          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(44px, 5vw, 72px)',
            lineHeight: 1.05, marginBottom: 24, color: 'var(--ink)'
          }}>
            {t('home', 'title')}<br />
            <em style={{ color: 'var(--accent)' }}>{t('home', 'titleHighlight')}</em>
          </h1>

          <p style={{
            fontSize: 17, lineHeight: 1.75, color: 'var(--muted)',
            maxWidth: 460, marginBottom: 40
          }}>
            {t('home', 'subtitle')}
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/map" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 8,
              background: 'var(--accent)', color: 'white',
              fontWeight: 600, fontSize: 15,
              transition: 'all 0.2s', border: 'none'
            }}>
              {t('home', 'exploreMap')} →
            </Link>
            <Link to="/gallery" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 8,
              border: '1.5px solid var(--border)',
              color: 'var(--ink)', fontWeight: 500, fontSize: 15,
              transition: 'all 0.2s'
            }}>
              {t('home', 'viewGallery')}
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 48, marginTop: 64 }}>
            {[
              { num: '5+', label: t('home', 'locations') },
              { num: '5', label: t('home', 'languages') },
            ].map(s => (
              <div key={s.label}>
                <div style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 48, color: 'var(--accent)', lineHeight: 1
                }}>{s.num}</div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — image collage */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: '#1A1814'
        }}>
          <img
            src="/images/bliss-46th.jpg"
            alt="Sunnyside"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', opacity: 0.7,
              display: 'block'
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(26,24,20,0.3), transparent)'
          }} />
          <div style={{
            position: 'absolute', bottom: 32, left: 32,
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 14, color: 'rgba(247,244,238,0.7)',
            fontStyle: 'italic'
          }}>
            46th St & Bliss St — Sunnyside, Queens
          </div>
        </div>
      </div>

      {/* About strip */}
      <div style={{
        background: 'var(--ink)', color: 'var(--bg)',
        padding: '60px', textAlign: 'center'
      }}>
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(20px, 2.5vw, 28px)',
          lineHeight: 1.6, maxWidth: 760, margin: '0 auto',
          fontStyle: 'italic', color: 'rgba(247,244,238,0.85)'
        }}>
          {t('about', 'body')}
        </p>
        <Link to="/about" style={{
          display: 'inline-block', marginTop: 32,
          fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--accent)', fontWeight: 600
        }}>
          {t('nav', 'about')} →
        </Link>
      </div>
    </div>
  )
}
