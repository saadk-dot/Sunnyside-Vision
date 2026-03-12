import { Routes, Route } from 'react-router-dom'
import { useState, createContext, useContext } from 'react'
import { translations } from './lib/translations'
import Nav from './components/Nav'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import GalleryPage from './pages/GalleryPage'
import MetricsPage from './pages/MetricsPage'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'

export const LangContext = createContext()
export const useLang = () => useContext(LangContext)

export default function App() {
  const [lang, setLang] = useState('en')
  const t = (section, key) => translations[lang]?.[section]?.[key] || translations['en']?.[section]?.[key] || key
  const isRTL = lang === 'ar'

  return (
    <LangContext.Provider value={{ lang, setLang, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <Routes>
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/*" element={
            <>
              <Nav />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/metrics" element={<MetricsPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </LangContext.Provider>
  )
}
