import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, MapPin, Calendar, Clock, Music, Send, Gift, ChevronDown, Check, Image as ImageIcon, CornerDownLeft, Languages, Menu, X, Globe, Maximize, Minimize, Volume2, VolumeX, ExternalLink, Copy, Camera, Play } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { t, type Language, languageNames, languageFlags } from '../lib/invitation-i18n'

interface EventData {
  id: string; title: string; date: string | null; timeStart: string | null; timeEnd: string | null
  locationName: string | null; address: string | null; mapsUrl: string | null
}

interface MediaData { id: string; type: string; url: string; caption: string | null }
interface WishData { id: string; name: string; message: string; reply: string | null; likes: number; createdAt: string }

interface InvitationData {
  id: string; slug: string; title: string | null
  groomName: string | null; groomNickname: string | null; groomParent: string | null
  brideName: string | null; brideNickname: string | null; brideParent: string | null
  primaryColor: string; secondaryColor: string; fontFamily: string
  backgroundMusic: string | null; coverEnabled: boolean; coverMessage: string | null
  events: EventData[]; media: MediaData[]; wishes: WishData[]
}

interface DanilaThemeProps {
  data: InvitationData; slug: string; lang: Language; setLang: (lang: Language) => void
  guestName: string | null; guestCode: string | null
}

function useCountdown(targetDate: string) {
  const [t, set] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const target = new Date(targetDate).getTime()
    const interval = setInterval(() => {
      const diff = target - Date.now()
      if (diff <= 0) { clearInterval(interval); return }
      set({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])
  return t
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
  const [isFs, setIsFs] = useState(false)
  const [heroSlide, setHeroSlide] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const [rsvpName, setRsvpName] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'not_attending' | null>(null)
  const [rsvpCount, setRsvpCount] = useState(1)
  const [rsvpNote, setRsvpNote] = useState('')
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)

  const [wishName, setWishName] = useState('')
  const [wishMessage, setWishMessage] = useState('')
  const [wishes, setWishes] = useState<WishData[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [wishSubmitted, setWishSubmitted] = useState(false)

  useEffect(() => {
    if (data?.wishes) setWishes(data.wishes)
  }, [data])

  useEffect(() => {
    const hi = setInterval(() => setHeroSlide((p) => (p + 1) % heroImages.length), 5000)
    return () => clearInterval(hi)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleFs = useCallback(() => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen().then(() => setIsFs(true)).catch(() => {}) }
    else { document.exitFullscreen().then(() => setIsFs(false)).catch(() => {}) }
  }, [])

  const toggleMusic = useCallback(() => {
    if (audioRef.current) { musicPlaying ? audioRef.current.pause() : audioRef.current.play().catch(() => {}); setMusicPlaying(!musicPlaying) }
  }, [musicPlaying])

  const scrollTo = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

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
      setWishes([wish, ...wishes]); setWishSubmitted(true); setWishName(''); setWishMessage('')
    } catch {}
  }

  const firstEventDate = data.events?.[0]?.date || ''
  const ct = useCountdown(firstEventDate)
  const pc = '#000'
  const sc = '#fafafa'

  const menuItems = [
    { id: 'home', label: 'Home' }, { id: 'couple', label: 'Bride and Groom' },
    { id: 'event', label: 'Wedding Event' }, { id: 'gallery', label: 'Gallery' },
    { id: 'rsvp-section', label: 'RSVP' }, { id: 'gift', label: 'Gift' },
  ]

  if (data?.coverEnabled && !coverOpened) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center px-6 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80)', fontFamily: data.fontFamily || "'Poppins', sans-serif" }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 space-y-8 max-w-sm text-white">
          <div className="space-y-3">
            <Heart className="mx-auto h-6 w-6" fill="rgba(255,255,255,0.6)" />
            <p className="text-xs tracking-[0.25em] uppercase opacity-70 font-light">Undangan Pernikahan</p>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-wide">{data.groomNickname || data.groomName || '________'}</h1>
            <p className="text-2xl opacity-60">&</p>
            <h1 className="text-4xl font-bold tracking-wide">{data.brideNickname || data.brideName || '________'}</h1>
          </div>
          {firstEventDate && (
            <p className="text-sm opacity-70 tracking-wider">
              {new Date(firstEventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          {guestName && <p className="text-sm opacity-80">Kepada Yth. <br /><span className="font-bold text-base">{guestName}</span></p>}
          <p className="text-xs italic opacity-60 leading-relaxed max-w-xs mx-auto">
            "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri..." (Q.S. Ar-Rum: 21)
          </p>
          <button
            onClick={() => { setCoverOpened(true); setMusicPlaying(true); setTimeout(() => audioRef.current?.play().catch(() => {}), 500) }}
            className="inline-flex items-center gap-2 rounded-full px-10 py-3.5 text-sm font-semibold tracking-wider shadow-lg transition-all hover:shadow-xl active:scale-95 bg-white text-black"
          >
            BUKA UNDANGAN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black font-['Poppins',sans-serif]">
      {data.backgroundMusic && <audio ref={audioRef} src={data.backgroundMusic} loop />}

      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button onClick={() => { const ls: Language[] = ['id', 'en', 'hi']; const idx = ls.indexOf(lang); setLang(ls[(idx + 1) % ls.length]) }}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm border border-black/10 bg-white/80 backdrop-blur">
          <Languages className="h-3.5 w-3.5" /> {languageFlags[lang]} {languageNames[lang]}
        </button>
      </div>

      {/* Sticky Bar */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white/95 backdrop-blur border-b border-black/5 ${scrolled ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <p className="text-sm font-medium truncate tracking-wide">{data.groomNickname || data.groomName} & {data.brideNickname || data.brideName}</p>
          <button onClick={() => setMenuOpen(true)} className="p-2"><Menu className="h-5 w-5" /></button>
        </div>
      </div>

      {/* Side Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl animate-slide-in-right">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <p className="font-semibold text-sm tracking-wider uppercase opacity-60">Menu</p>
                <button onClick={() => setMenuOpen(false)} className="p-1"><X className="h-4 w-4" /></button>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button key={item.id} onClick={() => scrollTo(item.id)}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-all">{item.label}</button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Floating Controls */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {data.backgroundMusic && (
          <button onClick={toggleMusic}
            className="flex h-11 w-11 items-center justify-center rounded-full shadow-lg bg-white border border-black/10 transition-all hover:scale-105">
            {musicPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        )}
        <button onClick={toggleFs}
          className="flex h-11 w-11 items-center justify-center rounded-full shadow-lg bg-white border border-black/10 transition-all hover:scale-105">
          {isFs ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
      </div>

      {/* Button Menu bawah kiri pas discroll */}
      <button onClick={() => setMenuOpen(true)}
        className={`fixed left-6 bottom-6 z-50 flex h-11 w-11 items-center justify-center rounded-full shadow-lg bg-black text-white transition-all hover:scale-105 ${scrolled ? 'flex' : 'hidden'}`}>
        <Menu className="h-5 w-5" />
      </button>

      {/* ===== HERO ===== */}
      <section id="home" className="relative h-screen overflow-hidden">
        {heroImages.map((img, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === heroSlide ? 1 : 0 }}>
            <img src={img} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
          </div>
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center z-10">
          <p className="text-xs tracking-[0.3em] uppercase opacity-60 font-light mb-4">Undangan Pernikahan</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide leading-tight">{data.groomNickname || data.groomName}</h1>
          <p className="my-4 text-2xl opacity-60">&</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide leading-tight">{data.brideNickname || data.brideName}</h1>
          {firstEventDate && (
            <p className="mt-6 text-sm tracking-wider opacity-70">{new Date(firstEventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          )}
          <button onClick={() => setMenuOpen(true)}
            className="mt-10 flex items-center gap-2 rounded-full border border-white/30 px-6 py-2.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm hover:bg-white/10 transition-all">
            <Menu className="h-3.5 w-3.5" /> Lihat Undangan
          </button>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10"><ChevronDown className="h-5 w-5 text-white/50" /></div>
      </section>

      {/* ===== COUPLE ===== */}
      <section id="couple" className="px-6 py-20 text-center max-w-lg mx-auto">
        <p className="text-xs tracking-[0.25em] uppercase opacity-50 mb-2">Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
        <p className="text-sm opacity-60 leading-relaxed mt-4 max-w-sm mx-auto">
          Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.
        </p>

        <div className="mt-14">
          {/* Tabs */}
          <div className="flex justify-center gap-0 border-b border-black/10 max-w-xs mx-auto">
            {[
              { key: 'bride' as const, label: data.brideNickname || data.brideName?.split(' ')[0] || 'Wanita' },
              { key: 'groom' as const, label: data.groomNickname || data.groomName?.split(' ')[0] || 'Pria' },
              { key: 'story' as const, label: 'Kisah Kita' },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex-1 py-3 text-xs font-medium tracking-wider uppercase transition-all border-b-2"
                style={{ borderColor: activeTab === tab.key ? '#000' : 'transparent', color: activeTab === tab.key ? '#000' : '#999' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab !== 'story' ? (
            <div className="mt-10 space-y-5">
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-black/10 shadow-sm">
                <img src={activeTab === 'bride'
                  ? 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80'
                  : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'} alt="" className="h-full w-full object-cover" />
              </div>
              <h2 className="text-xl font-bold">{activeTab === 'bride' ? data.brideName : data.groomName}</h2>
              <p className="text-sm opacity-50">{activeTab === 'bride' ? data.brideParent : data.groomParent}</p>
              <div className="flex justify-center gap-2">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-black/10 hover:bg-black/5 transition-all">
                  <Camera className="h-4 w-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-10 text-left max-w-sm mx-auto space-y-8">
              {[
                { date: '2022', title: 'Pertemuan Pertama', desc: 'Bertemu di sebuah acara pernikahan sahabat bersama.' },
                { date: '2023', title: 'Mulai Serius', desc: 'Memutuskan untuk membina hubungan yang lebih serius.' },
                { date: '2024', title: 'Lamaran', desc: 'Dengan restu kedua orang tua, kami bertunangan.' },
                { date: '2025', title: 'Pernikahan', desc: 'Resmi menjadi pasangan suami istri.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-black" />
                    {i < 3 && <div className="w-px flex-1 min-h-[40px] bg-black/10" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs opacity-40 font-medium tracking-wider uppercase">{item.date}</p>
                    <p className="font-semibold text-sm mt-1">{item.title}</p>
                    <p className="text-xs opacity-50 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== COUNTDOWN ===== */}
      <section className="px-6 py-20 text-center bg-black text-white">
        <p className="text-xs tracking-[0.3em] uppercase opacity-60 mb-2 font-light">Menghitung Hari</p>
        <div className="flex justify-center gap-4 mt-8">
          {[
            { v: ct.days, l: 'Hari' }, { v: ct.hours, l: 'Jam' },
            { v: ct.minutes, l: 'Menit' }, { v: ct.seconds, l: 'Detik' },
          ].map((item) => (
            <div key={item.l} className="flex flex-col items-center">
              <span className="text-4xl font-light tracking-widest">{String(item.v).padStart(2, '0')}</span>
              <span className="text-[10px] uppercase tracking-widest mt-2 opacity-50">{item.l}</span>
            </div>
          ))}
        </div>
        <p className="text-xs italic opacity-50 mt-8 max-w-xs mx-auto">
          "Dan Dia menjadikan di antaramu rasa kasih dan sayang." (Q.S. Ar-Rum: 21)
        </p>
        <button onClick={() => {
          if (firstEventDate) {
            const d = new Date(firstEventDate)
            window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=Wedding+${data.groomName}+%26+${data.brideName}&dates=${d.toISOString().replace(/[-:]/g, '').split('.')[0]}/${d.toISOString().replace(/[-:]/g, '').split('.')[0]}`, '_blank')
          }
        }} className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-xs font-medium tracking-wider uppercase text-white/70 hover:text-white hover:border-white/50 transition-all">
          <Calendar className="h-3.5 w-3.5" /> Simpan Tanggal
        </button>
      </section>

      {/* ===== EVENTS ===== */}
      <section id="event" className="px-6 py-20 max-w-lg mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase opacity-50 text-center mb-2">Wedding Event</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {['Akad Nikah', 'Resepsi'].map((title, i) => (
            <div key={i} className="rounded-xl border border-black/10 p-6 text-center hover:shadow-sm transition-all">
              <p className="text-xs tracking-[0.2em] uppercase font-semibold">{title}</p>
              <div className="mt-6 space-y-3 text-sm">
                <div>
                  <Calendar className="mx-auto h-4 w-4 opacity-40" />
                  <p className="mt-1 text-xs opacity-60">
                    {firstEventDate && new Date(firstEventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <Clock className="mx-auto h-4 w-4 opacity-40" />
                  <p className="mt-1 text-xs opacity-60">{i === 0 ? '08:00 - 10:00' : '11:00 - 14:00'}</p>
                </div>
                <div>
                  <MapPin className="mx-auto h-4 w-4 opacity-40" />
                  <p className="mt-1 text-xs font-medium">Hotel Tentrem Yogyakarta</p>
                  <p className="text-[10px] opacity-40">Jl. Pangeran Mangkubumi No. 72</p>
                </div>
              </div>
              <button onClick={() => window.open('https://maps.google.com', '_blank')}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-black/20 px-5 py-2 text-[10px] font-medium tracking-wider uppercase hover:bg-black hover:text-white transition-all">
                <MapPin className="h-3 w-3" /> Lihat Lokasi
              </button>
            </div>
          ))}
        </div>

        {/* Dress Code */}
        <div className="mt-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase font-semibold opacity-60">Dress Code</p>
          <p className="text-xs opacity-40 mt-1">Dress code untuk para tamu undangan</p>
          <div className="flex justify-center gap-4 mt-5">
            {['#1A1A1A', '#444', '#777', '#AAA', '#CCC', '#222'].map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full border border-black/10 shadow-sm" style={{ background: color }} />
                <span className="text-[9px] opacity-40 uppercase tracking-wider">Color {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIVE STREAMING ===== */}
      <section className="px-6 py-16 text-center bg-black/5">
        <div className="max-w-lg mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase opacity-50">Live Streaming</p>
          <p className="text-sm opacity-60 mt-2">Saksikan acara kami secara live</p>
          <button onClick={() => window.open('https://instagram.com', '_blank')}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/20 px-8 py-3 text-xs font-medium tracking-wider uppercase hover:bg-black hover:text-white transition-all">
            <Camera className="h-4 w-4" /> Live Streaming
          </button>
        </div>
      </section>

      {/* ===== PRE-WEDDING VIDEO ===== */}
      <section className="px-6 py-20 text-center max-w-lg mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase opacity-50">Pre Wedding</p>
        <p className="text-sm opacity-60 mt-2">Our Pre-Wedding Story</p>
        <div className="mt-6 aspect-video rounded-xl overflow-hidden shadow-sm border border-black/5">
          <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0" title="Pre-Wedding Video"
            className="h-full w-full" allow="encrypted-media" allowFullScreen />
        </div>
      </section>

      {/* ===== GALLERY ===== */}
      <section id="gallery" className="px-6 py-20 bg-black/5">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase opacity-50">Momen Kita</p>
          <p className="text-sm opacity-60 mt-2">Galeri foto kami</p>
        </div>
        <div className="mt-8 max-w-lg mx-auto columns-2 gap-3 space-y-3">
          {(data.media.length > 0 ? data.media : [
            { id: '1', type: 'image', url: heroImages[0], caption: null },
            { id: '2', type: 'image', url: heroImages[1], caption: null },
            { id: '3', type: 'image', url: heroImages[2], caption: null },
            { id: '4', type: 'image', url: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&q=80', caption: null },
            { id: '5', type: 'image', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=80', caption: null },
            { id: '6', type: 'image', url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&q=80', caption: null },
          ]).map((m) => (
            <div key={m.id} className="overflow-hidden rounded-lg break-inside-avoid shadow-sm border border-black/5">
              <img src={m.url} alt={m.caption || ''} className="w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== QUOTE ===== */}
      <section className="px-6 py-16 text-center max-w-md mx-auto">
        <Heart className="mx-auto h-5 w-5" />
        <p className="mt-6 italic text-base leading-relaxed opacity-70">
          "Love is not about how many days, months, or years you've been together. Love is about how much you love each other every single day."
        </p>
        <p className="mt-4 text-sm font-medium opacity-50">{data.groomNickname || data.groomName} & {data.brideNickname || data.brideName}</p>
      </section>

      {/* ===== RSVP ===== */}
      <section id="rsvp-section" className="px-6 py-20 bg-black/5">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase opacity-50">RSVP & Ucapan</p>
          <p className="text-sm opacity-60 mt-2">Konfirmasi kehadiran dan berikan ucapan untuk kami</p>

          {rsvpSubmitted ? (
            <div className="mt-8 p-8 rounded-xl bg-white border border-black/10 shadow-sm">
              <Check className="mx-auto h-8 w-8" />
              <p className="mt-3 font-semibold">Terima kasih!</p>
              <p className="text-sm opacity-50 mt-1">Konfirmasi kamu sudah diterima.</p>
            </div>
          ) : (
            <div className="mt-8 rounded-xl bg-white border border-black/10 p-6 text-left space-y-4 shadow-sm">
              <Input placeholder="Nama Anda" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)}
                className="border-black/20 text-sm rounded-lg" />
              <div className="flex gap-2">
                {['Hadir', 'Tidak Hadir'].map((label) => (
                  <button key={label} onClick={() => setRsvpStatus(label === 'Hadir' ? 'attending' : 'not_attending')}
                    className={`flex-1 py-3 rounded-xl text-xs font-medium border transition-all ${rsvpStatus === (label === 'Hadir' ? 'attending' : 'not_attending') ? 'bg-black text-white border-black' : 'border-black/20 text-black/60 hover:border-black/40'}`}>
                    {label}
                  </button>
                ))}
              </div>
              {rsvpStatus === 'attending' && (
                <div>
                  <label className="text-xs font-medium opacity-50">Jumlah Tamu</label>
                  <div className="flex gap-2 mt-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRsvpCount(n)}
                        className={`w-10 h-10 rounded-lg border text-xs transition-all ${rsvpCount === n ? 'bg-black text-white border-black' : 'border-black/20 text-black/60'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Textarea placeholder="Tulis ucapan & doa..." value={rsvpNote} onChange={(e) => setRsvpNote(e.target.value)}
                className="border-black/20 text-sm rounded-lg" />
              <button onClick={handleRsvp}
                className="w-full py-3 rounded-xl text-xs font-medium tracking-wider uppercase bg-black text-white hover:bg-black/80 transition-all">
                <Send className="inline h-3.5 w-3.5 mr-2" /> Kirim Konfirmasi
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== WISHES ===== */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-lg mx-auto">
          {wishSubmitted ? (
            <div className="text-center mb-8 p-6 rounded-xl bg-black/5 border border-black/5">
              <Check className="mx-auto h-8 w-8" />
              <p className="mt-2 font-semibold text-sm">Ucapan berhasil dikirim!</p>
            </div>
          ) : (
            <div className="mb-8 rounded-xl bg-black/5 border border-black/5 p-6 text-left space-y-3">
              <Input placeholder="Nama" value={wishName} onChange={(e) => setWishName(e.target.value)}
                className="bg-white border-black/20 text-sm rounded-lg" />
              <Textarea placeholder="Tulis ucapan & doa..." value={wishMessage} onChange={(e) => setWishMessage(e.target.value)}
                className="bg-white border-black/20 text-sm rounded-lg" />
              <button onClick={handleWish}
                className="w-full py-2.5 rounded-xl text-xs font-medium tracking-wider uppercase bg-black text-white hover:bg-black/80 transition-all">
                <Send className="inline h-3.5 w-3.5 mr-2" /> Kirim Ucapan
              </button>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {wishes.slice(0, 20).map((w) => (
              <div key={w.id} className="rounded-xl p-4 text-left text-sm border border-black/5 bg-black/[0.02]">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{w.name}</p>
                  <button className="flex items-center gap-1 text-xs shrink-0 mt-0.5 disabled:opacity-30"
                    disabled={likedIds.has(w.id)}
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/public/${slug}/wishes/${w.id}/like`, { method: 'POST' })
                        if (res.ok) { const { likes } = await res.json(); setLikedIds(new Set([...likedIds, w.id])); setWishes(wishes.map((x) => x.id === w.id ? { ...x, likes } : x)) }
                      } catch {}
                    }}>
                    <Heart className={`h-3.5 w-3.5 ${likedIds.has(w.id) ? 'fill-black' : ''}`} />
                    {w.likes || 0}
                  </button>
                </div>
                <p className="mt-1 text-xs opacity-60">{w.message}</p>
                {w.reply && (
                  <div className="mt-2 ml-2 border-l-2 border-black/10 pl-2.5">
                    <p className="text-[10px] flex items-center gap-1 opacity-40"><CornerDownLeft className="h-3 w-3" /> Balasan</p>
                    <p className="text-xs opacity-60 mt-0.5">{w.reply}</p>
                  </div>
                )}
              </div>
            ))}
            {wishes.length === 0 && <p className="text-center text-sm opacity-30 py-8">Belum ada ucapan. Jadilah yang pertama!</p>}
          </div>
        </div>
      </section>

      {/* ===== GIFT ===== */}
      <section id="gift" className="px-6 py-20 bg-black/5">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase opacity-50">Wedding Gift</p>
          <p className="text-sm opacity-60 mt-2">Doa restu adalah kado terindah. Jika ingin memberi tanda kasih, dapat melalui:</p>

          <div className="flex justify-center gap-2 mt-6">
            {['envelope' as const, 'registry' as const].map((tab) => (
              <button key={tab} onClick={() => setGiftTab(tab)}
                className={`px-6 py-2.5 rounded-full text-xs font-medium tracking-wider uppercase border transition-all ${giftTab === tab ? 'bg-black text-white border-black' : 'border-black/20 text-black/60 hover:border-black/40'}`}>
                {tab === 'envelope' ? 'E-Amplop' : 'Gift Registry'}
              </button>
            ))}
          </div>

          {giftTab === 'envelope' ? (
            <div className="mt-6 space-y-3">
              {[
                { bank: 'BCA', number: '1234567890', name: 'Ahmad & Dessi' },
                { bank: 'Mandiri', number: '9876543210', name: 'Ahmad & Dessi' },
                { bank: 'GoPay', number: '081234567890', name: 'Ahmad & Dessi' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-white border border-black/10 p-4 text-left flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider opacity-40">{item.bank}</p>
                    <p className="font-medium text-sm mt-0.5">{item.number}</p>
                    <p className="text-xs opacity-40">a.n. {item.name}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(`${item.bank} - ${item.number} a.n. ${item.name}`)}
                    className="p-2 rounded-lg border border-black/10 hover:bg-black/5 transition-all">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-white border border-black/10 p-8 shadow-sm">
              <Gift className="mx-auto h-8 w-8 opacity-40" />
              <p className="mt-3 text-sm font-medium">Konfirmasi Hadiah</p>
              <p className="mt-1 text-xs opacity-40">Konfirmasi hadiah melalui WhatsApp</p>
              <button onClick={() => window.open(`https://wa.me/?text=Halo%20saya%20ingin%20memberikan%20kado%20untuk%20pernikahan%20${data.groomName}%20%26%20${data.brideName}`, '_blank')}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/20 px-6 py-2.5 text-xs font-medium tracking-wider uppercase hover:bg-black hover:text-white transition-all">
                <ExternalLink className="h-3.5 w-3.5" /> Konfirmasi Via WA
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== QR CHECK-IN ===== */}
      {guestName && (
        <section className="px-6 py-16 text-center border-b border-black/5">
          <div className="max-w-sm mx-auto rounded-xl border border-black/10 p-8 shadow-sm">
            <p className="text-xs tracking-[0.3em] uppercase opacity-50">QR Check-In</p>
            <p className="text-sm opacity-60 mt-1">Halo,</p>
            <p className="text-xl font-bold mt-1">{guestName}</p>
            <div className="my-6 flex justify-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${window.location.origin}/inv/${slug}?guest=${guestCode}`}
                alt="QR Check-in" className="rounded-lg border border-black/10" />
            </div>
            <p className="text-xs opacity-40">Tunjukkan QR ini saat check-in di venue</p>
          </div>
        </section>
      )}

      {/* ===== CLOSING ===== */}
      <section className="px-6 py-24 text-center bg-black text-white">
        <div className="max-w-lg mx-auto">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border border-white/10 shadow-lg">
            <img src={heroImages[0]} alt="" className="h-full w-full object-cover" />
          </div>
          <p className="mt-6 text-xs tracking-[0.25em] uppercase font-light opacity-70">Terima Kasih</p>
          <p className="mt-3 text-base opacity-60">Atas kehadiran dan doa restunya</p>
          <p className="mt-6 text-xl font-bold tracking-wide">{data.groomNickname || data.groomName} & {data.brideNickname || data.brideName}</p>
          <p className="mt-2 text-xs opacity-40">Kami yang berbahagia,</p>
          <p className="mt-6 text-xs opacity-40 max-w-xs mx-auto leading-relaxed">"Wassalamu'alaikum Warahmatullahi Wabarakatuh"</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="px-6 py-10 text-center bg-black/90 text-white/60">
        <div className="flex justify-center gap-4 mb-4">
          {[Globe, Globe, Globe].map((Icon, i) => (
            <a key={i} href={['https://instagram.com', 'https://facebook.com', 'https://wa.me'][i]}
              target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white/10 transition-all">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
        <p className="text-xs opacity-60">Terima kasih atas doa & restu</p>
        <p className="text-[10px] opacity-30 mt-1">&copy; WeddingInvite · {data.title || `${data.groomNickname || data.groomName} & ${data.brideNickname || data.brideName}`}</p>
      </footer>
    </div>
  )
}
