import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../App'

const LANGS = [
  { code: 'en', label: 'EN' }, { code: 'es', label: 'ES' },
  { code: 'zh', label: '中文' }, { code: 'ko', label: '한국어' }, { code: 'ar', label: 'العربية' },
]

export default function Nav() {
  const { t, lang, setLang } = useLang()
  const location = useLocation()
  const links = [
    { to: '/', label: 'Map' },
    { to: '/gallery', label: t('nav', 'gallery') },
    { to: '/metrics', label: t('nav', 'metrics') },
    { to: '/about', label: t('nav', 'about') },
  ]
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 'var(--nav-h)',
      background: '#1A1814', zIndex: 1000,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', justifyContent: 'space-between',
      borderBottom: '1px solid #2A2620'
    }}>
      <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: '#F7F4EE' }}>
        Sunnyside <span style={{ color: '#C8873A', fontStyle: 'italic' }}>Vision</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {links.map(link => (
          <Link key={link.to} to={link.to} style={{
            color: location.pathname === link.to ? '#C8873A' : '#A09880',
            fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 6,
            textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'color 0.2s',
            background: location.pathname === link.to ? 'rgba(200,135,58,0.1)' : 'transparent'
          }}>{link.label}</Link>
        ))}
        <div style={{ width: 1, height: 20, background: '#2A2620', margin: '0 8px' }} />
        {LANGS.map(l => (
          <button key={l.code} onClick={() => setLang(l.code)} style={{
            background: lang === l.code ? '#C8873A' : 'transparent',
            border: 'none', color: lang === l.code ? '#1A1814' : '#A09880',
            fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 4,
            transition: 'all 0.15s', textTransform: 'uppercase', letterSpacing: '0.04em'
          }}>{l.label}</button>
        ))}
      </div>
    </nav>
  )
}
