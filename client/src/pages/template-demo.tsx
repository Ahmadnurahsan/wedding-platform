import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Heart, ArrowLeft, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import { getThemeComponent } from '../themes'
import type { InvitationData } from '../themes'

interface Theme {
  id: string
  name: string
  category: string
  isPremium: boolean
  defaultColors: string
  sectionsConfig: string
  thumbnailUrl: string | null
}

const mockData: InvitationData = {
  id: 'demo', slug: 'demo', title: 'Demo Undangan',
  groomName: 'Andi Pratama', groomNickname: 'Andi', groomParent: 'Putra dari Bpk. Ahmad & Ibu Siti',
  brideName: 'Siti Nurhaliza', brideNickname: 'Siti', brideParent: 'Putri dari Bpk. Budi & Ibu Dewi',
  primaryColor: '#000000', secondaryColor: '#fafafa', fontFamily: "'Poppins', sans-serif",
  backgroundMusic: null, coverEnabled: true, coverMessage: 'Kepada Yth.',
  events: [{ id: '1', title: 'Akad & Resepsi', date: '2026-08-17', timeStart: '08:00', timeEnd: '14:00', locationName: 'Hotel Tentrem Yogyakarta', address: 'Jl. Pangeran Mangkubumi No. 72', mapsUrl: 'https://maps.google.com' }],
  media: [], wishes: [],
}

export function TemplateDemoPage() {
  const { id } = useParams<{ id: string }>()
  const [theme, setTheme] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get<Theme>(`/themes/${id}`)
      .then(setTheme)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!theme) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Template tidak ditemukan
      </div>
    )
  }

  const ThemeComponent = getThemeComponent(theme.name)
  if (ThemeComponent) {
    const mData = { ...mockData }
    let colors: Record<string, string> = { primaryColor: '#000000', secondaryColor: '#fafafa' }
    try { colors = JSON.parse(theme.defaultColors || '{}') } catch {}
    mData.primaryColor = colors.primaryColor || '#000000'
    mData.secondaryColor = colors.secondaryColor || '#fafafa'
    return (
      <div className="relative">
        <Link to="/templates" className="fixed top-4 left-4 z-[100] flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali
        </Link>
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
          {theme.name}
        </div>
        <ThemeComponent data={mData} slug="demo" lang="id" setLang={() => {}} guestName={null} guestCode={null} />
      </div>
    )
  }

  return (
    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
      Theme component not found: {theme.name}
    </div>
  )
}
