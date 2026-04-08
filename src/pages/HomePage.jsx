import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang } from '../App'
import SurveyPanel from '../components/SurveyPanel'
import 'leaflet/dist/leaflet.css'

const SUNNYSIDE_CENTER = [40.7440, -73.9226]
const DEFAULT_ZOOM = 15

function makeIcon(color = '#C8873A') {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 18px; height: 18px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 12px rgba(0,0,0,0.35);
      cursor: pointer; position: relative; z-index: 2;
    ">
      <div style="
        position: absolute; width: 38px; height: 38px; border-radius: 50%;
        background: ${color}44; top: 50%; left: 50%;
        transform: translate(-50%,-50%);
        animation: sv-pulse 2s ease-out infinite;
        z-index: 1;
      "></div>
    </div>
    <style>
      @keyframes sv-pulse {
        0% { opacity: .7; transform: translate(-50%,-50%) scale(.4); }
        100% { opacity: 0; transform: translate(-50%,-50%) scale(2.2); }
      }
    </style>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

// Hover card shown on the map
function HoverCard({ location, onSelect }) {
  const image = location.location_images?.[0]?.image_url
  return (
    <div style={{
      width: 260, background: 'white', borderRadius: 12,
      overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
      border: '1px solid #DDD8CE', fontFamily: 'Inter, sans-serif'
    }}>
      {image ? (
        <div style={{ position: 'relative', height: 150 }}>
          <img src={image} alt={location.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)'
          }} />
        </div>
      ) : (
        <div style={{
          height: 100, background: location.color || '#C8873A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32
        }}>📍</div>
      )}
      <div style={{ padding: '14px 16px' }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 18, fontWeight: 600, marginBottom: 6, color: '#1A1814'
        }}>{location.name}</div>
        <p style={{
          fontSize: 13, color: '#6B6458', lineHeight: 1.55,
          marginBottom: 12, display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>{location.description}</p>
        <button onClick={() => onSelect(location)} style={{
          width: '100%', padding: '9px',
          background: '#1A1814', color: 'white',
          border: 'none', borderRadius: 7,
          fontSize: 12, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.07em',
          cursor: 'pointer'
        }}>
          Share Your Vision →
        </button>
      </div>
    </div>
  )
}

// Custom marker with hover popup
function LocationMarker({ location, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const map = useMap()

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={makeIcon(location.color || '#C8873A')}
      eventHandlers={{
        mouseover: () => setHovered(true),
        mouseout: () => setHovered(false),
        click: () => onSelect(location)
      }}
    >
      {hovered && (
        <div style={{
          position: 'absolute',
          zIndex: 1000,
        }}>
        </div>
      )}
    </Marker>
  )
}

export default function HomePage() {
  const { t } = useLang()
  const [locations, setLocations] = useState([])
  const [selected, setSelected] = useState(null)
  const [hoveredLocation, setHoveredLocation] = useState(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })
  const [siteContent, setSiteContent] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadLocations()
    loadContent()
  }, [])

  async function loadLocations() {
    const { data } = await supabase
      .from('locations')
      .select('*, location_images(*)')
      .order('created_at', { ascending: true })
    if (data) setLocations(data)
  }

  async function loadContent() {
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .eq('key', 'homepage')
      .single()
    if (data) setSiteContent(data.content)
  }

  const content = siteContent || {
    what_title: 'What We Are',
    what_body: 'Sunnyside Vision is a community engagement platform inviting residents to imagine and shape the future of their neighborhood\'s public spaces.',
    how_title: 'How It Works',
    how_body: 'Explore locations on the map, answer a few questions about each space, and watch as your responses are transformed into a unique piece of community art.',
    why_title: 'Why We Do It',
    why_body: 'Because the people who live here know this neighborhood best. Your voice, your vision, and your imagination matter in shaping Sunnyside\'s future.'
  }

  return (
    <div style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh' }}>

      {/* MAP — 2/3 of viewport */}
      <div style={{ position: 'relative', height: 'calc(66vh - var(--nav-h))' }}>
        <MapContainer
          center={SUNNYSIDE_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map(loc => (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={makeIcon(loc.color || '#C8873A')}
              eventHandlers={{
                mouseover: (e) => {
                  const containerPoint = e.containerPoint
                  setHoverPos({ x: containerPoint.x, y: containerPoint.y })
                  setHoveredLocation(loc)
                },
                mouseout: () => setHoveredLocation(null),
                click: () => setSelected(loc)
              }}
            />
          ))}
        </MapContainer>

        {/* Floating hover card */}
        {hoveredLocation && (
          <div style={{
            position: 'absolute',
            left: Math.min(hoverPos.x + 16, window.innerWidth - 290),
            top: Math.max(hoverPos.y - 100, 10),
            zIndex: 999,
            pointerEvents: 'none',
            animation: 'cardIn 0.15s ease-out'
          }}>
            <style>{`@keyframes cardIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
            <HoverCard location={hoveredLocation} onSelect={setSelected} />
          </div>
        )}

        {/* Map label */}
        <div style={{
          position: 'absolute', top: 16, left: 16, zIndex: 998,
          background: 'rgba(26,24,20,0.85)', color: 'white',
          padding: '8px 16px', borderRadius: 8,
          fontSize: 12, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          backdropFilter: 'blur(4px)'
        }}>
          Sunnyside, Queens — Explore the Vision
        </div>
      </div>

      {/* SURVEY PANEL — slides in when location selected */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(26,24,20,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out'
        }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}
        >
          <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
          <div style={{
            background: 'var(--card)', borderRadius: 16,
            width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
            animation: 'slideUp 0.25s ease-out'
          }}>
            <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}`}</style>
            <SurveyPanel
              location={selected}
              onClose={() => setSelected(null)}
              onSubmit={() => setSelected(null)}
            />
          </div>
        </div>
      )}

      {/* INTRO BANNER — below map */}
      <div style={{
        background: '#1A1814', color: '#F7F4EE',
        padding: '72px 48px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Eyebrow */}
          <div style={{
            fontSize: 11, textTransform: 'uppercase',
            letterSpacing: '0.18em', color: '#C8873A',
            fontWeight: 600, marginBottom: 16, textAlign: 'center'
          }}>
            Sunnyside Public Realm Vision
          </div>

          {/* Headline */}
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(36px, 4vw, 56px)',
            textAlign: 'center', marginBottom: 64,
            lineHeight: 1.1, color: '#F7F4EE',
            fontWeight: 400
          }}>
            Imagining the future of our neighborhood,<br />
            <em style={{ color: '#C8873A' }}>together.</em>
          </h2>

          {/* Three columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 48
          }}>
            {[
              { title: content.what_title, body: content.what_body, icon: '◈' },
              { title: content.how_title, body: content.how_body, icon: '◎' },
              { title: content.why_title, body: content.why_body, icon: '◇' },
            ].map((col, i) => (
              <div key={i} style={{
                borderTop: '1px solid rgba(200,135,58,0.4)',
                paddingTop: 32
              }}>
                <div style={{
                  fontSize: 24, color: '#C8873A', marginBottom: 16
                }}>{col.icon}</div>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 26, marginBottom: 16,
                  color: '#F7F4EE', fontWeight: 600
                }}>{col.title}</h3>
                <p style={{
                  fontSize: 15, lineHeight: 1.75,
                  color: 'rgba(247,244,238,0.7)'
                }}>{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
