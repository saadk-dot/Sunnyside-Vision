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
    { to: '/analytics', label: 'Analytics' },
    { to: '/about', label: t('nav', 'about') },
  ]
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 'var(--nav-h)',
      background: '#1B3A6B', zIndex: 1000,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', justifyContent: 'space-between',
      borderBottom: '1px solid #162F58'
    }}>
      <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: '#FFFFFF', letterSpacing: '0.02em' }}>
        Sunnyside <span style={{ color: '#4A90D9', fontStyle: 'italic' }}>Vision</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {links.map(link => (
          <Link key={link.to} to={link.to} style={{
            color: location.pathname === link.to ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
            fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 6,
            textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.2s',
            background: location.pathname === link.to ? 'rgba(74,144,217,0.25)' : 'transparent',
            borderBottom: location.pathname === link.to ? '2px solid #4A90D9' : '2px solid transparent'
          }}>{link.label}</Link>
        ))}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', margin: '0 8px' }} />
        {LANGS.map(l => (
          <button key={l.code} onClick={() => setLang(l.code)} style={{
            background: lang === l.code ? '#4A90D9' : 'transparent',
            border: 'none', color: lang === l.code ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
            fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 4,
            transition: 'all 0.15s', textTransform: 'uppercase', letterSpacing: '0.04em'
          }}>{l.label}</button>
        ))}
      </div>
    </nav>
  )
}
