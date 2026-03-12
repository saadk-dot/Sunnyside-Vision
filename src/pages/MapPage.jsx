import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import { useLang } from '../App'
import SurveyPanel from '../components/SurveyPanel'
import 'leaflet/dist/leaflet.css'

// Sunnyside, Queens center
const SUNNYSIDE_CENTER = [40.7440, -73.9226]
const DEFAULT_ZOOM = 15

// Custom pin icon
function makeIcon(color = '#C8873A') {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 12px rgba(0,0,0,0.35);
      cursor:pointer;position:relative;
    ">
      <div style="
        position:absolute;width:36px;height:36px;border-radius:50%;
        background:${color}33;top:50%;left:50%;
        transform:translate(-50%,-50%);
        animation:pulse 2s ease-out infinite;
      "></div>
    </div>
    <style>
      @keyframes pulse{0%{opacity:.7;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-50%) scale(2)}}
    </style>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export default function MapPage() {
  const { t } = useLang()
  const [locations, setLocations] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLocations()
  }, [])

  async function loadLocations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('locations')
      .select(`*, survey_questions(*), location_images(*)`)
      .order('created_at', { ascending: true })
    if (!error && data) setLocations(data)
    setLoading(false)
  }

  return (
    <div style={{ paddingTop: 'var(--nav-h)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px', background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, lineHeight: 1 }}>{t('map', 'title')}</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{t('map', 'subtitle')}</p>
        </div>
        {selected && (
          <button onClick={() => setSelected(null)} style={{
            padding: '8px 20px', borderRadius: 8,
            border: '1.5px solid var(--border)', background: 'none',
            fontSize: 14, color: 'var(--muted)'
          }}>
            {t('survey', 'back')}
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Map */}
        <div style={{ flex: selected ? '0 0 55%' : '1', transition: 'flex 0.3s ease', position: 'relative' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
              Loading map...
            </div>
          ) : (
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
                  eventHandlers={{ click: () => setSelected(loc) }}
                >
                  <Popup>
                    <div style={{ width: 240, fontFamily: 'Inter, sans-serif' }}>
                      {loc.location_images?.[0]?.image_url && (
                        <img
                          src={loc.location_images[0].image_url}
                          alt={loc.name}
                          style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                        />
                      )}
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{
                          fontFamily: 'Cormorant Garamond, serif',
                          fontSize: 18, fontWeight: 600, marginBottom: 6
                        }}>{loc.name}</div>
                        <p style={{ fontSize: 13, color: '#6B6458', lineHeight: 1.5, marginBottom: 10 }}>
                          {loc.description}
                        </p>
                        <button
                          onClick={() => setSelected(loc)}
                          style={{
                            width: '100%', padding: '8px',
                            background: '#C8873A', color: 'white',
                            border: 'none', borderRadius: 6,
                            fontSize: 12, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '0.06em'
                          }}
                        >
                          {t('map', 'clickToCreate')}
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Survey Panel */}
        {selected && (
          <div style={{
            flex: '0 0 45%', overflowY: 'auto',
            background: 'var(--card)', borderLeft: '1px solid var(--border)'
          }}>
            <SurveyPanel
              location={selected}
              onClose={() => setSelected(null)}
              onSubmit={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
