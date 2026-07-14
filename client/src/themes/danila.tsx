import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, MapPin, Calendar, Clock, Music, Send, Gift, ChevronDown, Check, Image as ImageIcon, CornerDownLeft, Languages, Menu, X, Instagram, Facebook, Maximize, Minimize, Play, Volume2, VolumeX, ExternalLink, Copy, Camera } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { t, type Language, languageNames, languageFlags } from '../lib/invitation-i18n'

interface EventData {
  id: string
  title: string
  date: string | null
  timeStart: string | null
  timeEnd: string | null
  locationName: string | null
  address: string | null
  mapsUrl: string | null
}

interface MediaData {
  id: string
  type: string
  url: string
  caption: string | null
}

interface WishData {
  id: string
  name: string
  message: string
  reply: string | null
  likes: number
  createdAt: string
}

interface InvitationData {
  id: string
  slug: string
  title: string | null
  groomName: string | null
  groomNickname: string | null
  groomParent: string | null
  brideName: string | null
  brideNickname: string | null
  brideParent: string | null
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  backgroundMusic: string | null
  coverEnabled: boolean
  coverMessage: string | null
  events: EventData[]
  media: MediaData[]
  wishes: WishData[]
  groomPhoto?: string | null
  bridePhoto?: string | null
}

interface DanilaThemeProps {
  data: InvitationData
  slug: string
  lang: Language
  setLang: (lang: Language) => void
  guestName: string | null
  guestCode: string | null
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-white/10 px-4 py-3 min-w-[68px] backdrop-blur">
      <span className="text-3xl font-bold tracking-wider font-serif">{String(value).padStart(2, '0')}</span>
      <span className="text-[10px] uppercase tracking-widest mt-1 opacity-70">{label}</span>
    </div>
  )
}

function useCountdown(targetDate: string) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const target = new Date(targetDate).getTime()
    const interval = setInterval(() => {
      const diff = target - Date.now()
      if (diff <= 0) { clearInterval(interval); return }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return time
}

const heroImages = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
]

export function DanilaTheme({ data, slug, lang, setLang, guestName, guestCode }: DanilaThemeProps) {
  const [coverOpened, setCoverOpened] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'bride' | 'groom' | 'story'>('bride')
  const [giftTab, setGiftTab] = useState<'envelope' | 'registry'>('envelope')
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [heroSlide, setHeroSlide] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // RSVP state
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'not_attending' | null>(null)
  const [rsvpCount, setRsvpCount] = useState(1)
  const [rsvpNote, setRsvpNote] = useState('')
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)

  // Wish state
  const [wishName, setWishName] = useState('')
  const [wishMessage, setWishMessage] = useState('')
  const [wishes, setWishes] = useState(data?.wishes || [])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [wishSubmitted, setWishSubmitted] = useState(false)

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(heroInterval)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }, [])

  const toggleMusic = useCallback(() => {
    if (audioRef.current) {
      if (musicPlaying) { audioRef.current.pause() } else { audioRef.current.play().catch(() => {}) }
      setMusicPlaying(!musicPlaying)
    }
  }, [musicPlaying])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleRsvp = async () => {
    if (!rsvpName || !rsvpStatus) return
    try {
      const { api } = await import('../lib/api')
      await api.post(`/public/${slug}/rsvp`, { name: rsvpName, rsvpStatus, rsvpCount, rsvpNote })
      setRsvpSubmitted(true)
    } catch {}
  }

  const handleWish = async () => {
    if (!wishName || !wishMessage) return
    try {
      const { api } = await import('../lib/api')
      const wish = await api.post<WishData>(`/public/${slug}/wishes`, { name: wishName, message: wishMessage })
      setWishes([wish, ...wishes])
      setWishSubmitted(true)
      setWishName('')
      setWishMessage('')
    } catch {}
  }

  const firstEventDate = data.events?.[0]?.date || ''
  const time = useCountdown(firstEventDate)
  const pc = data.primaryColor
  const sc = data.secondaryColor

  const menuItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'couple', label: 'Bride and Groom', icon: 'heart' },
    { id: 'event', label: 'Wedding Event', icon: 'calendar' },
    { id: 'gallery', label: 'Gallery', icon: 'image' },
    { id: 'rsvp-section', label: 'RSVP', icon: 'clipboard' },
    { id: 'gift', label: 'Gift', icon: 'gift' },
  ]

  if (data?.coverEnabled && !coverOpened) {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center px-6"
        style={{ background: `linear-gradient(135deg, ${sc} 0%, ${pc}30 100%)`, color: pc, fontFamily: data.fontFamily || 'serif' }}
      >
        <div className="space-y-8 max-w-sm">
          <div className="space-y-2">
            <Heart className="mx-auto h-6 w-6" fill={pc} />
            <p className="text-sm tracking-[0.2em] uppercase opacity-60">Undangan Pernikahan</p>
          </div>
          <div className="space-y-1">
            <h1 className="font-serif text-4xl font-bold">{data.groomNickname || data.groomName || '________'}</h1>
            <p className="font-serif text-2xl opacity-60">&</p>
            <h1 className="font-serif text-4xl font-bold">{data.brideNickname || data.brideName || '________'}</h1>
          </div>
          {firstEventDate && (
            <p className="text-sm opacity-70">
              {new Date(firstEventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          {guestName && (
            <p className="text-sm opacity-80">
              Kepada Yth. <br /><span className="font-bold text-base">{guestName}</span>
            </p>
          )}
          <p className="text-xs opacity-60 leading-relaxed italic max-w-xs mx-auto">
            "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang." (Q.S. Ar-Rum: 21)
          </p>
          <button
            onClick={() => { setCoverOpened(true); setMusicPlaying(true); setTimeout(() => audioRef.current?.play().catch(() => {}), 500) }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold shadow-lg transition-all hover:shadow-xl active:scale-95"
            style={{ background: pc, color: '#fff' }}
          >
            <Heart className="h-4 w-4" /> BUKA UNDANGAN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#faf7f2', color: '#3d2b1f', fontFamily: data.fontFamily || 'serif' }}>
      {/* Background Audio */}
      {data.backgroundMusic && <audio ref={audioRef} src={data.backgroundMusic} loop />}

      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => {
            const langs: Language[] = ['id', 'en', 'hi']
            const idx = langs.indexOf(lang)
            setLang(langs[(idx + 1) % langs.length])
          }}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur bg-white/80"
          style={{ color: pc }}
        >
          <Languages className="h-3.5 w-3.5" />
          {languageFlags[lang]} {languageNames[lang]}
        </button>
      </div>

      {/* Sticky Top Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        style={{ background: 'rgba(250, 247, 242, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(61, 43, 31, 0.1)' }}
      >
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <p className="text-sm font-medium truncate">
            <span className="tracking-widest text-[10px] uppercase opacity-60">The Wedding of </span>
            <span className="font-serif">{data.groomNickname || data.groomName} & {data.brideNickname || data.brideName}</span>
          </p>
          <button onClick={() => setMenuOpen(true)} className="p-2" style={{ color: pc }}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Side Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-slide-in-right" style={{ background: sc }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <p className="font-serif text-lg font-bold" style={{ color: pc }}>Menu</p>
                <button onClick={() => setMenuOpen(false)} className="p-1" style={{ color: pc }}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white/40"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Floating Controls */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {data.backgroundMusic && (
          <button
            onClick={toggleMusic}
            className="flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur transition-all hover:scale-105"
            style={{ background: pc, color: '#fff' }}
          >
            {musicPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        )}
        <button
          onClick={toggleFullscreen}
          className="flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur transition-all hover:scale-105 bg-white/80"
          style={{ color: pc }}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
      </div>

      {/* ============ HERO ============ */}
      <section id="home" className="relative h-screen overflow-hidden">
        {heroImages.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === heroSlide ? 1 : 0 }}
          >
            <img src={img} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          </div>
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center z-10">
          <Heart className="h-6 w-6 mb-4" fill="rgba(255,255,255,0.8)" />
          <p className="text-sm tracking-[0.25em] uppercase opacity-80 font-light">Undangan Pernikahan</p>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl font-bold leading-tight tracking-wide">
            {data.groomNickname || data.groomName || '________'}
          </h1>
          <p className="my-4 font-serif text-2xl opacity-70">&</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight tracking-wide">
            {data.brideNickname || data.brideName || '________'}
          </h1>
          {firstEventDate && (
            <p className="mt-6 text-sm tracking-wider opacity-80">
              {new Date(firstEventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          <p className="mt-2 text-xs italic opacity-60 max-w-md">
            "Dan di antara tanda-tanda (kebesaran)-Nya..." (Q.S. Ar-Rum: 21)
          </p>
          <button
            onClick={() => setMenuOpen(true)}
            className="mt-8 flex items-center gap-2 rounded-full border border-white/40 px-6 py-2.5 text-sm font-medium backdrop-blur-sm hover:bg-white/10 transition-all"
          >
            <Menu className="h-4 w-4" /> Lihat Undangan
          </button>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <ChevronDown className="h-6 w-6 text-white/60" />
        </div>
      </section>

      {/* ============ COUPLE ============ */}
      <section id="couple" className="px-6 py-20 text-center" style={{ background: '#fff' }}>
        <div className="max-w-lg mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase opacity-60 mb-2" style={{ color: pc }}>Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
          <p className="text-sm opacity-70 leading-relaxed mt-4 max-w-md mx-auto">
            Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.
          </p>

          <div className="mt-12 space-y-10">
            {/* Tabs */}
            <div className="flex justify-center gap-1 rounded-xl p-1 bg-secondary/50 max-w-xs mx-auto" style={{ background: `${sc}80` }}>
              {[
                { key: 'bride' as const, label: data.brideNickname || data.brideName?.split(' ')[0] || 'Wanita' },
                { key: 'groom' as const, label: data.groomNickname || data.groomName?.split(' ')[0] || 'Pria' },
                { key: 'story' as const, label: 'Kisah Kita' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: activeTab === tab.key ? pc : 'transparent',
                    color: activeTab === tab.key ? '#fff' : pc,
                  }}
                >
                  {tab.key === 'story' ? 'Kisah Kita' : tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab !== 'story' ? (
              <div className="space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 shadow-md" style={{ borderColor: `${pc}40` }}>
                  <img
                    src={activeTab === 'bride' ? (data.bridePhoto || 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80') : (data.groomPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80')}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="font-serif text-2xl font-bold">
                  {activeTab === 'bride' ? data.brideName : data.groomName}
                </h2>
                <p className="text-sm opacity-70">
                  {activeTab === 'bride' ? data.brideParent : data.groomParent}
                </p>
                <div className="flex justify-center gap-2">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-all" style={{ color: pc }}>
                    <Instagram className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-left space-y-6 max-w-sm mx-auto">
                {[
                  { date: '2022', title: 'Pertemuan Pertama', desc: 'Bertemu di sebuah acara pernikahan sahabat bersama.' },
                  { date: '2023', title: 'Mulai Serius', desc: 'Memutuskan untuk membina hubungan yang lebih serius.' },
                  { date: '2024', title: 'Lamaran', desc: 'Dengan restu kedua orang tua, kami bertunangan.' },
                  { date: '2025', title: 'Pernikahan', desc: 'Resmi menjadi pasangan suami istri.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full" style={{ background: pc }} />
                      {i < 3 && <div className="w-px flex-1 min-h-[40px]" style={{ background: `${pc}30` }} />}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs opacity-60 font-medium">{item.date}</p>
                      <p className="font-semibold text-sm mt-0.5">{item.title}</p>
                      <p className="text-xs opacity-70 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ COUNTDOWN ============ */}
      <section className="px-6 py-20 text-center relative overflow-hidden" style={{ background: pc }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 50%, #fff 0%, transparent 50%)` }} />
        </div>
        <div className="relative z-10 max-w-lg mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase opacity-80 text-white mb-2">Menghitung Hari</p>
          <div className="flex justify-center gap-3 mt-6">
            <CountdownBox value={time.days} label="Hari" />
            <CountdownBox value={time.hours} label="Jam" />
            <CountdownBox value={time.minutes} label="Menit" />
            <CountdownBox value={time.seconds} label="Detik" />
          </div>
          <p className="text-xs italic opacity-70 text-white mt-6 max-w-xs mx-auto">
            "Dan Dia menjadikan di antaramu rasa kasih dan sayang." (Q.S. Ar-Rum: 21)
          </p>
          <button
            onClick={() => {
              if (firstEventDate) {
                const d = new Date(firstEventDate)
                const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=Wedding+${data.groomName}+%26+${data.brideName}&dates=${d.toISOString().replace(/[-:]/g, '').split('.')[0]}/${d.toISOString().replace(/[-:]/g, '').split('.')[0]}`
                window.open(url, '_blank')
              }
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/10 transition-all"
          >
            <Calendar className="h-3.5 w-3.5" /> Simpan Tanggal
          </button>
        </div>
      </section>

      {/* ============ EVENTS ============ */}
      <section id="event" className="px-6 py-20" style={{ background: '#fff' }}>
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: pc }}>Wedding Event</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl p-8 shadow-sm border" style={{ borderColor: `${pc}20`, background: `${sc}40` }}>
              <p className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: pc }}>Akad Nikah</p>
              <Calendar className="mx-auto mt-4 h-5 w-5" style={{ color: pc }} />
              <p className="mt-2 text-sm font-medium">
                {firstEventDate && new Date(firstEventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <Clock className="mx-auto mt-3 h-4 w-4" style={{ color: pc }} />
              <p className="mt-1 text-sm">08:00 - 10:00</p>
              <MapPin className="mx-auto mt-3 h-4 w-4" style={{ color: pc }} />
              <p className="mt-1 text-sm font-medium">Hotel Tentrem Yogyakarta</p>
              <p className="mt-1 text-[11px] opacity-60">Jl. Pangeran Mangkubumi No. 72, Yogyakarta</p>
              <button
                onClick={() => window.open('https://maps.google.com', '_blank')}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all"
                style={{ background: pc, color: '#fff' }}
              >
                <MapPin className="h-3.5 w-3.5" /> LIHAT LOKASI
              </button>
            </div>

            <div className="rounded-2xl p-8 shadow-sm border" style={{ borderColor: `${pc}20`, background: `${sc}40` }}>
              <p className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: pc }}>Resepsi</p>
              <Calendar className="mx-auto mt-4 h-5 w-5" style={{ color: pc }} />
              <p className="mt-2 text-sm font-medium">
                {firstEventDate && new Date(firstEventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <Clock className="mx-auto mt-3 h-4 w-4" style={{ color: pc }} />
              <p className="mt-1 text-sm">11:00 - 14:00</p>
              <MapPin className="mx-auto mt-3 h-4 w-4" style={{ color: pc }} />
              <p className="mt-1 text-sm font-medium">Hotel Tentrem Yogyakarta</p>
              <p className="mt-1 text-[11px] opacity-60">Jl. Pangeran Mangkubumi No. 72, Yogyakarta</p>
              <button
                onClick={() => window.open('https://maps.google.com', '_blank')}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all"
                style={{ background: pc, color: '#fff' }}
              >
                <MapPin className="h-3.5 w-3.5" /> LIHAT LOKASI
              </button>
            </div>
          </div>

          {/* Dress Code */}
          <div className="mt-10">
            <p className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: pc }}>Dress Code</p>
            <p className="text-xs opacity-60 mt-1">Dress code untuk para tamu undangan</p>
            <div className="flex justify-center gap-3 mt-4">
              {['#8B4513', '#DAA520', '#2F4F4F', '#800020', '#556B2F', '#4A0E4E'].map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-full border-2 border-white shadow-sm" style={{ background: color }} />
                  <span className="text-[10px] opacity-60 capitalize">{['coklat', 'emas', 'hijau tua', 'merah', 'olive', 'ungu'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ LIVE STREAMING ============ */}
      <section className="px-6 py-16 text-center relative overflow-hidden" style={{ background: `${pc}08` }}>
        <div className="max-w-lg mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: pc }}>Live Streaming</p>
          <p className="text-sm opacity-70 mt-2">Saksikan acara kami secara live</p>
          <button
            onClick={() => window.open('https://instagram.com', '_blank')}
            className="mt-6 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium transition-all"
            style={{ background: pc, color: '#fff' }}
          >
            <Instagram className="h-4 w-4" /> LIVE STREAMING
          </button>
        </div>
      </section>

      {/* ============ PRE-WEDDING VIDEO ============ */}
      <section className="px-6 py-20 text-center" style={{ background: '#fff' }}>
        <div className="max-w-lg mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: pc }}>Pre-Wedding</p>
          <p className="text-sm opacity-70 mt-2">Our Pre-Wedding Story</p>
          <div className="mt-6 aspect-video rounded-2xl overflow-hidden shadow-md">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
              title="Pre-Wedding Video"
              className="h-full w-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ============ GALLERY ============ */}
      <section id="gallery" className="px-6 py-20" style={{ background: `${sc}40` }}>
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: pc }}>Momen Kita</p>
          <p className="text-sm opacity-70 mt-2">Galeri foto kami</p>
        </div>
        <div className="mt-8 max-w-lg mx-auto columns-2 gap-3 space-y-3">
          {(data.media.length > 0 ? data.media : [
            { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80', caption: null },
            { id: '2', type: 'image', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80', caption: null },
            { id: '3', type: 'image', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&q=80', caption: null },
            { id: '4', type: 'image', url: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&q=80', caption: null },
            { id: '5', type: 'image', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=80', caption: null },
            { id: '6', type: 'image', url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&q=80', caption: null },
          ]).map((m) => (
            <div key={m.id} className="overflow-hidden rounded-xl shadow-sm break-inside-avoid">
              <img src={m.url} alt={m.caption || ''} className="w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* ============ QUOTE ============ */}
      <section className="px-6 py-16 text-center" style={{ background: '#fff' }}>
        <div className="max-w-md mx-auto">
          <Heart className="mx-auto h-5 w-5" fill={pc} style={{ color: pc }} />
          <p className="mt-4 italic text-lg leading-relaxed font-serif" style={{ color: pc }}>
            "Love is not about how many days, months, or years you've been together. Love is about how much you love each other every single day."
          </p>
          <p className="mt-4 text-sm font-medium">{data.groomNickname || data.groomName} & {data.brideNickname || data.brideName}</p>
        </div>
      </section>

      {/* ============ RSVP ============ */}
      <section id="rsvp-section" className="px-6 py-20 text-center" style={{ background: `${sc}40` }}>
        <div className="max-w-lg mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: pc }}>RSVP & Ucapan</p>
          <p className="text-sm opacity-70 mt-2">Konfirmasi kehadiran dan berikan ucapan untuk kami</p>

          {rsvpSubmitted ? (
            <div className="mt-8 p-8 rounded-2xl bg-white shadow-sm">
              <Check className="mx-auto h-10 w-10" style={{ color: pc }} />
              <p className="mt-3 font-semibold text-lg">Terima kasih!</p>
              <p className="text-sm opacity-70 mt-1">Konfirmasi kamu sudah diterima.</p>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm text-left space-y-4">
              <Input
                placeholder="Nama Anda"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                style={{ borderColor: `${pc}40` }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setRsvpStatus('attending')}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    background: rsvpStatus === 'attending' ? pc : 'transparent',
                    color: rsvpStatus === 'attending' ? '#fff' : pc,
                    borderColor: pc,
                  }}
                >
                  Hadir
                </button>
                <button
                  onClick={() => setRsvpStatus('not_attending')}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    background: rsvpStatus === 'not_attending' ? pc : 'transparent',
                    color: rsvpStatus === 'not_attending' ? '#fff' : pc,
                    borderColor: pc,
                  }}
                >
                  Tidak Hadir
                </button>
              </div>
              {rsvpStatus === 'attending' && (
                <div>
                  <label className="text-xs font-medium opacity-70">Jumlah Tamu</label>
                  <div className="flex gap-2 mt-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRsvpCount(n)}
                        className="w-10 h-10 rounded-lg border text-sm transition-all"
                        style={{
                          background: rsvpCount === n ? pc : 'transparent',
                          color: rsvpCount === n ? '#fff' : pc,
                          borderColor: pc,
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Textarea
                placeholder="Tulis ucapan & doa..."
                value={rsvpNote}
                onChange={(e) => setRsvpNote(e.target.value)}
                style={{ borderColor: `${pc}40` }}
              />
              <button
                onClick={handleRsvp}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: pc, color: '#fff' }}
              >
                <Send className="inline h-4 w-4 mr-2" /> Kirim Konfirmasi
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============ WISHES ============ */}
      <section className="px-6 py-12" style={{ background: '#fff' }}>
        <div className="max-w-lg mx-auto">
          {wishSubmitted ? (
            <div className="text-center mb-8 p-6 rounded-2xl" style={{ background: `${sc}40` }}>
              <Check className="mx-auto h-8 w-8" style={{ color: pc }} />
              <p className="mt-2 font-semibold">Ucapan berhasil dikirim!</p>
            </div>
          ) : (
            <div className="mb-8 rounded-2xl p-6 text-left space-y-3" style={{ background: `${sc}40` }}>
              <Input
                placeholder="Nama"
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
                className="bg-white"
                style={{ borderColor: `${pc}40` }}
              />
              <Textarea
                placeholder="Tulis ucapan & doa..."
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                className="bg-white"
                style={{ borderColor: `${pc}40` }}
              />
              <button
                onClick={handleWish}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: pc, color: '#fff' }}
              >
                <Send className="inline h-4 w-4 mr-2" /> Kirim Ucapan
              </button>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {wishes.slice(0, 20).map((w) => (
              <div key={w.id} className="rounded-xl p-4 text-left text-sm border" style={{ borderColor: `${pc}10`, background: `${sc}20` }}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{w.name}</p>
                  <button
                    className="flex items-center gap-1 text-xs shrink-0 mt-0.5 disabled:opacity-50"
                    style={{ color: likedIds.has(w.id) ? pc : undefined }}
                    disabled={likedIds.has(w.id)}
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/public/${slug}/wishes/${w.id}/like`, { method: 'POST' })
                        if (res.ok) {
                          const { likes } = await res.json()
                          setLikedIds(new Set([...likedIds, w.id]))
                          setWishes(wishes.map((x) => x.id === w.id ? { ...x, likes } : x))
                        }
                      } catch {}
                    }}
                  >
                    <Heart className={`h-3.5 w-3.5 ${likedIds.has(w.id) ? 'fill-current' : ''}`} />
                    {w.likes || 0}
                  </button>
                </div>
                <p className="mt-1 text-xs opacity-80">{w.message}</p>
                {w.reply && (
                  <div className="mt-2 ml-2 border-l-2 pl-2.5" style={{ borderColor: `${pc}30` }}>
                    <p className="text-[10px] flex items-center gap-1 opacity-60">
                      <CornerDownLeft className="h-3 w-3" /> Balasan
                    </p>
                    <p className="text-xs opacity-80 mt-0.5">{w.reply}</p>
                  </div>
                )}
              </div>
            ))}
            {wishes.length === 0 && (
              <p className="text-center text-sm opacity-50 py-8">Belum ada ucapan. Jadilah yang pertama!</p>
            )}
          </div>
        </div>
      </section>

      {/* ============ GIFT ============ */}
      <section id="gift" className="px-6 py-20 text-center" style={{ background: `${sc}40` }}>
        <div className="max-w-lg mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: pc }}>Wedding Gift</p>
          <p className="text-sm opacity-70 mt-2">
            Doa restu adalah kado terindah. Jika ingin memberi tanda kasih, dapat melalui:
          </p>

          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setGiftTab('envelope')}
              className="px-6 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: giftTab === 'envelope' ? pc : 'transparent',
                color: giftTab === 'envelope' ? '#fff' : pc,
                border: `1px solid ${pc}`,
              }}
            >
              E-Amplop
            </button>
            <button
              onClick={() => setGiftTab('registry')}
              className="px-6 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: giftTab === 'registry' ? pc : 'transparent',
                color: giftTab === 'registry' ? '#fff' : pc,
                border: `1px solid ${pc}`,
              }}
            >
              Gift Registry
            </button>
          </div>

          {giftTab === 'envelope' ? (
            <div className="mt-6 space-y-3">
              {[
                { bank: 'BCA', number: '1234567890', name: 'Ahmad & Dessi' },
                { bank: 'Mandiri', number: '9876543210', name: 'Ahmad & Dessi' },
                { bank: 'GoPay', number: '081234567890', name: 'Ahmad & Dessi' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-white p-4 text-left shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold opacity-60">{item.bank}</p>
                    <p className="font-medium text-sm mt-0.5">{item.number}</p>
                    <p className="text-xs opacity-60">a.n. {item.name}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${item.bank} - ${item.number} a.n. ${item.name}`)}
                    className="p-2 rounded-lg text-xs transition-all"
                    style={{ background: `${pc}10`, color: pc }}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
              <Gift className="mx-auto h-8 w-8" style={{ color: pc }} />
              <p className="mt-2 text-sm font-medium">Konfirmasi Hadiah</p>
              <p className="mt-1 text-xs opacity-60">Konfirmasi hadiah melalui WhatsApp</p>
              <button
                onClick={() => window.open(`https://wa.me/?text=Halo%20saya%20ingin%20memberikan%20kado%20untuk%20pernikahan%20${data.groomName}%20%26%20${data.brideName}`, '_blank')}
                className="mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-medium transition-all"
                style={{ background: pc, color: '#fff' }}
              >
                <ExternalLink className="h-3.5 w-3.5" /> Konfirmasi Via WA
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============ QR CHECK-IN ============ */}
      {guestName && (
        <section className="px-6 py-16 text-center" style={{ background: '#fff' }}>
          <div className="max-w-sm mx-auto rounded-2xl p-8 shadow-md border" style={{ borderColor: `${pc}20` }}>
            <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: pc }}>QR Check-In</p>
            <p className="text-sm opacity-70 mt-1">Halo,</p>
            <p className="font-serif text-xl font-bold mt-1">{guestName}</p>
            <div className="my-6 flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${window.location.origin}/inv/${slug}?guest=${guestCode}`}
                alt="QR Check-in"
                className="rounded-xl shadow-sm"
              />
            </div>
            <p className="text-xs opacity-60">Tunjukkan QR ini saat check-in di venue</p>
          </div>
        </section>
      )}

      {/* ============ CLOSING ============ */}
      <section className="px-6 py-20 text-center relative overflow-hidden" style={{ background: pc }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 70% 30%, #fff 0%, transparent 50%)` }} />
        </div>
        <div className="relative z-10 max-w-lg mx-auto text-white">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-6 text-sm tracking-[0.2em] uppercase font-light">Terima Kasih</p>
          <p className="mt-2 text-lg font-serif">Atas kehadiran dan doa restunya</p>
          <p className="mt-6 font-serif text-xl font-bold">{data.groomNickname || data.groomName} & {data.brideNickname || data.brideName}</p>
          <p className="mt-1 text-xs opacity-70">Kami yang berbahagia,</p>
          <p className="mt-6 text-xs opacity-70 max-w-xs mx-auto leading-relaxed">
            "Wassalamu'alaikum Warahmatullahi Wabarakatuh"
          </p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="px-6 py-8 text-center" style={{ background: '#2c1810', color: '#d4c5b5' }}>
        <div className="flex justify-center gap-4 mb-4">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white/10 transition-all">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white/10 transition-all">
            <Facebook className="h-4 w-4" />
          </a>
          <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white/10 transition-all">
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <p className="text-xs opacity-60 font-serif">
          Terima kasih atas doa & restu
        </p>
        <p className="text-[10px] opacity-40 mt-1">
          &copy; WeddingInvite · {data.title || `${data.groomNickname || data.groomName} & ${data.brideNickname || data.brideName}`}
        </p>
      </footer>

      {/* Floating Menu Button (when scrolled) */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed left-6 bottom-6 z-50 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105"
        style={{ background: pc, color: '#fff', display: scrolled ? 'flex' : 'none' }}
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  )
}
