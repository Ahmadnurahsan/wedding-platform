import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Heart, MapPin, Calendar, Clock, Gift, ChevronDown, ArrowLeft, Loader2 } from 'lucide-react'
import { api } from '../lib/api'

interface Theme {
  id: string
  name: string
  category: string
  isPremium: boolean
  defaultColors: string
  sectionsConfig: string
}

const dummyCouple = {
  groomName: 'Andi Pratama',
  groomNickname: 'Andi',
  groomParent: 'Putra dari Bpk. Ahmad & Ibu Siti',
  brideName: 'Siti Nurhaliza',
  brideNickname: 'Siti',
  brideParent: 'Putri dari Bpk. Budi & Ibu Dewi',
}

const dummyEvents = [
  {
    id: '1',
    title: 'Akad Nikah',
    date: '2026-08-17',
    timeStart: '08:00',
    timeEnd: '10:00',
    locationName: 'Masjid Agung Al-Ikhlas',
    address: 'Jl. Merdeka No. 123, Jakarta Pusat',
    mapsUrl: 'https://maps.google.com',
  },
  {
    id: '2',
    title: 'Resepsi',
    date: '2026-08-17',
    timeStart: '11:00',
    timeEnd: '16:00',
    locationName: 'Hotel Indonesia',
    address: 'Jl. MH Thamrin No. 1, Jakarta Pusat',
    mapsUrl: 'https://maps.google.com',
  },
]

const dummyWishes = [
  { id: '1', name: 'Teman 1', message: 'Selamat menempuh hidup baru! Semoga sakinah mawaddah warahmah.', reply: null, likes: 3, createdAt: '2026-07-01' },
  { id: '2', name: 'Teman 2', message: 'Barakallah! Semoga menjadi keluarga yang bahagia dunia akhirat.', reply: 'Aamiin, terima kasih doanya!', likes: 5, createdAt: '2026-07-02' },
]

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

  let colors: Record<string, string> = { primaryColor: '#D4A574', secondaryColor: '#F5E6D3' }
  try {
    colors = JSON.parse(theme.defaultColors || '{}')
  } catch {}

  const primary = colors.primaryColor || '#D4A574'
  const secondary = colors.secondaryColor || '#F5E6D3'
  const fontFamily = 'serif'

  return (
    <div className="min-h-screen" style={{ background: secondary, color: primary, fontFamily }}>
      <Link
        to="/templates"
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur"
        style={{ color: primary }}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali
      </Link>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur"
        style={{ color: primary }}>
        {theme.name}
      </div>

      {/* Hero */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, ${primary} 0%, transparent 70%)` }} />
        </div>
        <div className="relative z-10 space-y-6">
          <Heart className="mx-auto h-8 w-8" fill={primary} />
          <div>
            <p className="text-sm tracking-widest uppercase opacity-60">The Wedding of</p>
            <h1 className="mt-2 font-serif text-4xl font-bold leading-tight">{dummyCouple.groomNickname}</h1>
            <p className="my-3 font-serif text-2xl">&</p>
            <h1 className="font-serif text-4xl font-bold leading-tight">{dummyCouple.brideNickname}</h1>
          </div>
          <p className="text-sm opacity-80">17 Agustus 2026</p>
          <ChevronDown className="mx-auto mt-8 h-6 w-6 animate-bounce opacity-60" />
        </div>
      </section>

      {/* Couple */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center bg-white/30">
        <div className="max-w-sm space-y-8">
          <h2 className="font-serif text-2xl font-bold">Kami Berdua</h2>
          <div className="space-y-2">
            <p className="text-xl font-bold">{dummyCouple.groomName}</p>
            <p className="text-sm opacity-70">{dummyCouple.groomParent}</p>
          </div>
          <p className="font-serif text-xl">&</p>
          <div className="space-y-2">
            <p className="text-xl font-bold">{dummyCouple.brideName}</p>
            <p className="text-sm opacity-70">{dummyCouple.brideParent}</p>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold">Acara</h2>
        <div className="mt-8 space-y-6">
          {dummyEvents.map((event) => (
            <div key={event.id} className="rounded-2xl bg-white/50 p-6 text-left shadow-sm max-w-sm">
              <h3 className="font-serif text-lg font-bold">{event.title}</h3>
              <div className="mt-3 space-y-2 text-sm opacity-80">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  {event.timeStart} - {event.timeEnd}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {event.locationName}
                </p>
                <p className="ml-6 text-xs">{event.address}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium"
                  style={{ borderColor: primary, color: primary }}
                >
                  <MapPin className="h-3.5 w-3.5" /> Google Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wishes */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center bg-white/30">
        <h2 className="font-serif text-2xl font-bold">Ucapan & Doa</h2>
        <p className="mt-2 text-sm opacity-70 max-w-sm">Tamu dapat mengirimkan ucapan dan doa secara langsung</p>
        <div className="mt-8 w-full max-w-sm space-y-3">
          {dummyWishes.map((w) => (
            <div key={w.id} className="rounded-xl bg-white/60 p-3 text-left text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{w.name}</p>
                <span className="flex items-center gap-1 text-xs opacity-60">
                  <Heart className="h-3 w-3" /> {w.likes}
                </span>
              </div>
              <p className="mt-1 opacity-80">{w.message}</p>
              {w.reply && (
                <div className="mt-2 ml-2 border-l-2 pl-2.5 border-current/20">
                  <p className="text-[11px] opacity-60">Balasan</p>
                  <p className="text-xs opacity-80">{w.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Gift */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold">Tanda Kasih</h2>
        <p className="mt-2 text-sm opacity-70 max-w-sm">Doa restu adalah kado terindah. Jika ingin memberi tanda kasih, dapat melalui:</p>
        <div className="mt-6 w-full max-w-sm space-y-3">
          {['BCA - 1234567890 a.n. Andi & Siti', 'Mandiri - 9876543210 a.n. Andi & Siti'].map((bank, i) => (
            <div key={i} className="rounded-xl bg-white/50 p-4 text-left shadow-sm">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">{bank}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm opacity-60">
        <Heart className="mx-auto h-4 w-4 mb-2" fill={primary} />
        <p className="font-serif">Terima kasih atas doa & restu</p>
        <p className="mt-1 text-xs">&copy; WeddingInvite · Demo Template</p>
      </footer>
    </div>
  )
}
