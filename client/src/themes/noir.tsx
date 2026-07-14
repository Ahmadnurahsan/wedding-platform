import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, Calendar, Send, Gift, ChevronDown, Check, CornerDownLeft, Languages, Menu, X, Globe, Maximize, Minimize, Volume2, VolumeX, ExternalLink, Copy, Camera } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { type Language, languageNames, languageFlags } from '../lib/invitation-i18n'
import { useGoogleFonts } from '../hooks/useGoogleFonts'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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

interface NoirThemeProps {
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
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=85',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=85',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=85',
  'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=1200&q=85',
]

const galleryImages = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80',
  'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=600&q=80',
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80',
  'https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&q=80',
]

export function NoirTheme({ data, slug, lang, setLang, guestName, guestCode }: NoirThemeProps) {
  useGoogleFonts(["'Poppins', sans-serif"])

  const [coverOpened, setCoverOpened] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'bride' | 'groom' | 'story'>('bride')
  const [giftTab, setGiftTab] = useState<'envelope' | 'registry'>('envelope')
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [isFs, setIsFs] = useState(false)
  const [heroSlide, setHeroSlide] = useState(0)
  const [bgSlide, setBgSlide] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])
  const mainRef = useRef<HTMLDivElement>(null)

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

  // Dynamic hero slideshow
  useEffect(() => {
    const hi = setInterval(() => setHeroSlide((p) => (p + 1) % heroImages.length), 3000)
    return () => clearInterval(hi)
  }, [])

  // Content background slideshow — changes every 3 seconds
  useEffect(() => {
    const bi = setInterval(() => setBgSlide((p) => (p + 1) % heroImages.length), 3000)
    return () => clearInterval(bi)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // GSAP Animations — smooth with longer duration
  useEffect(() => {
    if (coverOpened) {
      const ctx = gsap.context(() => {
        sectionsRef.current.forEach((el) => {
          if (!el) return
          gsap.fromTo(el,
            { opacity: 0, y: 80 },
            {
              opacity: 1, y: 0,
              duration: 1.4,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none none',
              },
            }
          )
        })
      }, mainRef)
      return () => ctx.revert()
    }
  }, [coverOpened])

  const setSectionRef = useCallback((el: HTMLElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el)
    }
  }, [])

  const toggleFs = useCallback(() => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen().then(() => setIsFs(true)).catch(() => {}) }
    else { document.exitFullscreen().then(() => setIsFs(false)).catch(() => {}) }
  }, [])

  const toggleMusic = useCallback(() => {
    if (audioRef.current) { musicPlaying ? audioRef.current.pause() : audioRef.current.play().catch(() => {}); setMusicPlaying(!musicPlaying) }
  }, [musicPlaying])

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

  const menuItems = [
    { id: 'home', label: 'Home' }, { id: 'couple', label: 'Pengantin' },
    { id: 'event', label: 'Acara' }, { id: 'gallery', label: 'Galeri' },
    { id: 'rsvp-section', label: 'RSVP' }, { id: 'gift', label: 'Hadiah' },
  ]

  if (data?.coverEnabled && !coverOpened) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center px-6"
        style={{ background: '#0a0a0a' }}>
        <div className="absolute inset-0">
          <img src={heroImages[0]} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />
        </div>
        <div className="relative z-10 space-y-10 max-w-lg text-white/85">
          <div className="space-y-4">
            <Heart className="mx-auto h-8 w-8" fill="rgba(255,255,255,0.4)" />
            <p className="text-[13px] tracking-[0.3em] uppercase font-normal opacity-60">Undangan Pernikahan</p>
          </div>
          <div className="space-y-3">
            <h1 className="font-semibold tracking-tight" style={{ fontSize: '54px', lineHeight: '54px' }}>{data.groomNickname || data.groomName || '________'}</h1>
            <p className="font-semibold opacity-40 my-6" style={{ fontSize: '54px', lineHeight: '54px' }}>&</p>
            <h1 className="font-semibold tracking-tight" style={{ fontSize: '54px', lineHeight: '54px' }}>{data.brideNickname || data.brideName || '________'}</h1>
          </div>
          {firstEventDate && (
            <p className="text-[13px] tracking-wider opacity-50 font-normal">
              {new Date(firstEventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          {guestName && <p className="text-base opacity-70 font-bold">Kepada Yth. <br /><span className="font-semibold text-xl">{guestName}</span></p>}
          <button onClick={() => { setCoverOpened(true); setMusicPlaying(true); setTimeout(() => audioRef.current?.play().catch(() => {}), 500) }}
            className="inline-flex items-center gap-3 border border-white/30 px-12 py-5 text-base font-bold tracking-widest bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all rounded-lg">
            BUKA UNDANGAN
          </button>
        </div>
      </div>
    )
  }

  const rightPanelRef = useRef<HTMLDivElement>(null)

  // GSAP scope — use right panel as scroller on desktop
  useEffect(() => {
    if (coverOpened) {
      const scroller = rightPanelRef.current || undefined
      const ctx = gsap.context(() => {
        sectionsRef.current.forEach((el) => {
          if (!el) return
          gsap.fromTo(el,
            { opacity: 0, y: 80 },
            {
              opacity: 1, y: 0,
              duration: 1.4,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                scroller,
                toggleActions: 'play none none none',
              },
            }
          )
        })
      }, mainRef)
      return () => ctx.revert()
    }
  }, [coverOpened])

  // Scroll handler — listen to right panel on desktop, window on mobile
  useEffect(() => {
    const el = rightPanelRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 80)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      const container = rightPanelRef.current
      if (container) {
        const top = el.offsetTop - container.offsetTop
        container.scrollTo({ top, behavior: 'smooth' })
      } else {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div ref={mainRef} className="min-h-screen bg-[#0a0a0a] font-['Poppins',sans-serif] overflow-x-hidden" style={{ color: 'rgb(196,201,203)' }}>
      {data.backgroundMusic && <audio ref={audioRef} src={data.backgroundMusic} loop />}

      {/* Dynamic content background */}
      <div className="fixed inset-0 z-0">
        {heroImages.map((img, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === bgSlide ? 1 : 0 }}>
            <img src={img} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/75" />
          </div>
        ))}
      </div>

      {/* ===== DESKTOP LEFT PANEL — static cover ===== */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-1/2 z-20 flex-col items-center justify-center text-center px-8 bg-[#0a0a0a]">
        <div className="absolute inset-0">
          <img src={heroImages[0]} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />
        </div>
        <div className="relative z-10 space-y-6 text-white/85">
          <Heart className="mx-auto h-8 w-8" fill="rgba(255,255,255,0.4)" />
          <p className="text-[13px] tracking-[0.3em] uppercase font-normal opacity-60">THE WEDDING OF</p>
          <h1 className="font-semibold tracking-tight" style={{ fontSize: '54px', lineHeight: '54px' }}>{data.groomNickname || data.groomName || '________'}</h1>
          <p className="font-semibold opacity-40" style={{ fontSize: '36px', lineHeight: '36px' }}>&</p>
          <h1 className="font-semibold tracking-tight" style={{ fontSize: '54px', lineHeight: '54px' }}>{data.brideNickname || data.brideName || '________'}</h1>
          {firstEventDate && (
            <p className="text-[13px] tracking-wider opacity-50 font-normal">
              {new Date(firstEventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {/* ===== RIGHT PANEL — scrollable mobile-first content ===== */}
      <div ref={rightPanelRef} className="relative z-10 lg:ml-[50%] lg:w-1/2 lg:h-screen lg:overflow-y-auto">

        {/* Language Toggle */}
        <div className="fixed top-6 right-6 z-50 lg:right-8">
          <button onClick={() => { const ls: Language[] = ['id', 'en', 'hi']; const idx = ls.indexOf(lang); setLang(ls[(idx + 1) % ls.length]) }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold bg-white/5 backdrop-blur-md rounded-lg">
            <Languages className="h-4 w-4" /> {languageFlags[lang]} {languageNames[lang]}
          </button>
        </div>

        {/* Sticky Bar */}
        <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 bg-black/80 backdrop-blur-xl lg:left-[50%] ${scrolled ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <p className="text-lg font-bold tracking-wide truncate">{data.groomNickname || data.groomName} & {data.brideNickname || data.brideName}</p>
            <button onClick={() => setMenuOpen(true)} className="p-2 hover:bg-white/10 transition-all rounded-lg"><Menu className="h-6 w-6" /></button>
          </div>
        </div>

        {/* Side Menu */}
        {menuOpen && (
          <div className="fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-black/90 backdrop-blur-xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-10">
                  <p className="font-extrabold text-lg tracking-wider uppercase opacity-50">Menu</p>
                  <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-lg"><X className="h-5 w-5" /></button>
                </div>
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <button key={item.id} onClick={() => scrollToSection(item.id)}
                      className="w-full text-left px-5 py-4 text-lg font-bold hover:bg-white/10 transition-all rounded-lg">{item.label}</button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Floating Controls */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 lg:right-8">
          {data.backgroundMusic && (
            <button onClick={toggleMusic}
              className="flex h-12 w-12 items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all rounded-lg">
              {musicPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
          )}
          <button onClick={toggleFs}
            className="flex h-12 w-12 items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all rounded-lg">
            {isFs ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>

        <button onClick={() => setMenuOpen(true)}
          className={`fixed left-8 bottom-8 z-50 flex h-12 w-12 items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all rounded-lg ${scrolled ? 'flex' : 'hidden'} lg:left-[calc(50%+16px)]`}>
          <Menu className="h-5 w-5" />
        </button>

        <div className="lg:max-w-sm lg:mx-auto lg:py-0">

          {/* ===== HERO (hidden on desktop — shown in left panel) ===== */}
          <section id="home" ref={setSectionRef} className="relative h-screen overflow-hidden lg:hidden">
            {heroImages.map((img, i) => (
              <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === heroSlide ? 1 : 0 }}>
                <img src={img} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />
              </div>
            ))}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center z-10">
              <p className="text-[13px] tracking-[0.35em] uppercase font-normal opacity-40 mb-6">Undangan Pernikahan</p>
              <h1 className="font-semibold tracking-tight" style={{ fontSize: '54px', lineHeight: '54px' }}>{data.groomNickname || data.groomName}</h1>
              <p className="font-semibold opacity-40 my-6" style={{ fontSize: '54px', lineHeight: '54px' }}>&</p>
              <h1 className="font-semibold tracking-tight" style={{ fontSize: '54px', lineHeight: '54px' }}>{data.brideNickname || data.brideName}</h1>
              {firstEventDate && (
                <p className="text-[13px] tracking-[0.2em] opacity-50 font-normal">{new Date(firstEventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              )}
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
              <button onClick={() => scrollToSection('couple')} className="flex flex-col items-center gap-2 text-white/40 hover:text-white/70 transition-all">
                <span className="text-xs tracking-[0.3em] uppercase font-bold">Scroll</span>
                <ChevronDown className="h-5 w-5 animate-bounce" />
              </button>
            </div>
          </section>

          {/* ===== COUPLE ===== */}
          <section id="couple" ref={setSectionRef} className="px-6 py-32 text-left max-w-2xl mx-auto">
            <p className="text-lg tracking-[0.3em] uppercase font-bold opacity-40 mb-5">Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
            <p className="text-xl opacity-50 leading-relaxed mt-6 max-w-lg mx-auto font-bold">
              Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.
            </p>

            <div className="mt-20">
              <div className="flex gap-0">
                {[
                  { key: 'groom' as const, label: data.groomNickname || data.groomName?.split(' ')[0] || 'Pria' },
                  { key: 'bride' as const, label: data.brideNickname || data.brideName?.split(' ')[0] || 'Wanita' },
                  { key: 'story' as const, label: 'Kisah' },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className="py-4 pr-8 text-lg font-extrabold tracking-wider uppercase transition-all"
                    style={{ color: activeTab === tab.key ? '#fff' : '#444' }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab !== 'story' ? (
                <div className="mt-16 space-y-8">
                  <div className="w-full max-w-sm overflow-hidden shadow-lg shadow-black/40 rounded-lg">
                    <img src={activeTab === 'groom'
                      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'
                      : 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80'} alt="" className="w-full object-cover" style={{ aspectRatio: '1/1' }} />
                  </div>
                  <h2 className="text-4xl font-extrabold">{activeTab === 'groom' ? data.groomName : data.brideName}</h2>
                  <p className="text-lg opacity-40 font-bold">{activeTab === 'groom' ? data.groomParent : data.brideParent}</p>
                  <div className="flex gap-3">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-white/10 transition-all rounded-lg">
                      <Camera className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-16 text-left space-y-12">
                  {[
                    { date: '2022', title: 'Pertemuan Pertama', desc: 'Bertemu di sebuah acara pernikahan sahabat bersama.' },
                    { date: '2023', title: 'Mulai Serius', desc: 'Memutuskan untuk membina hubungan yang lebih serius.' },
                    { date: '2024', title: 'Lamaran', desc: 'Dengan restu kedua orang tua, kami bertunangan.' },
                    { date: '2025', title: 'Pernikahan', desc: 'Resmi menjadi pasangan suami istri.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-white/40" />
                        {i < 3 && <div className="w-0.5 flex-1 min-h-[50px] bg-white/10" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-sm opacity-30 font-extrabold tracking-wider uppercase">{item.date}</p>
                        <p className="font-extrabold text-2xl mt-2">{item.title}</p>
                        <p className="text-lg opacity-40 mt-2 font-bold">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ===== COUNTDOWN ===== */}
          <section ref={setSectionRef} className="px-6 py-32 text-left relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <p className="font-semibold tracking-[0.35em] uppercase opacity-40 mb-4" style={{ fontSize: '36px', lineHeight: '36px' }}>Menghitung Hari</p>
              <div className="flex gap-6 md:gap-10 mt-12 md:mt-16">
                {[
                  { v: ct.days, l: 'Hari' }, { v: ct.hours, l: 'Jam' },
                  { v: ct.minutes, l: 'Menit' }, { v: ct.seconds, l: 'Detik' },
                ].map((item) => (
                  <div key={item.l} className="flex flex-col items-start">
                    <span className="text-5xl md:text-8xl font-extrabold tracking-tight text-white/70">{String(item.v).padStart(2, '0')}</span>
                    <span className="text-xs md:text-sm uppercase tracking-[0.25em] mt-2 md:mt-4 opacity-30 font-bold">{item.l}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => {
                if (firstEventDate) {
                  const d = new Date(firstEventDate)
                  window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=Wedding+${data.groomName}+%26+${data.brideName}&dates=${d.toISOString().replace(/[-:]/g, '').split('.')[0]}/${d.toISOString().replace(/[-:]/g, '').split('.')[0]}`, '_blank')
                }
              }} className="mt-10 inline-flex items-center gap-3 border border-white/20 px-8 py-4 text-sm font-extrabold tracking-wider uppercase text-white/60 hover:text-white hover:border-white/40 transition-all bg-white/5 rounded-lg">
                <Calendar className="h-5 w-5" /> Simpan Tanggal
              </button>
            </div>
          </section>

          {/* ===== EVENTS ===== */}
          <section id="event" ref={setSectionRef} className="px-6 py-32">
            <div className="max-w-2xl mx-auto">
              <div className="text-left mb-10">
                <p className="font-semibold tracking-[0.35em] uppercase opacity-90" style={{ fontSize: '36px', lineHeight: '36px' }}>Wedding Event</p>
              </div>

              {/* Main card */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 md:p-14 space-y-6 md:space-y-10">
                {['AKAD NIKAH', 'RESEPSI'].map((title, i) => (
                  <div key={i}>
                    <p className="font-semibold tracking-wider opacity-90 mb-4 md:mb-6" style={{ fontSize: '36px', lineHeight: '36px' }}>{title}</p>
                    <div className="space-y-2 md:space-y-3">
                      <p className="font-bold" style={{ fontSize: '16px', lineHeight: '16px', color: 'rgb(196,201,203)' }}>
                        {firstEventDate && new Date(firstEventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p style={{ fontSize: '16px', lineHeight: '16px', color: 'rgb(196,201,203)' }}>{i === 0 ? '08.00 - 10.00' : '11.00 - 14.00'}</p>
                      <p className="font-bold" style={{ fontSize: '16px', lineHeight: '20px', color: 'rgb(196,201,203)' }}>Hotel Tentrem Yogyakarta</p>
                      <p style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '16px', lineHeight: '24px', color: 'rgb(196,201,203)' }}>Jl. Pangeran Mangkubumi No. 72</p>
                    </div>
                    <button onClick={() => window.open('https://maps.google.com', '_blank')}
                      className="mt-4 md:mt-6 inline-flex items-center gap-2 border border-white/30 px-6 md:px-8 py-3 md:py-4 text-xs md:text-sm font-extrabold tracking-wider uppercase hover:bg-white hover:text-black transition-all rounded-lg">
                      Lihat Lokasi
                    </button>
                  </div>
                ))}

                {/* Dress Code */}
                <div className="pt-2 md:pt-4">
                  <p className="font-semibold tracking-[0.25em] uppercase opacity-80" style={{ fontSize: '16px', lineHeight: '20px' }}>Panduan Busana</p>
                  <p className="mt-3 max-w-lg text-sm md:text-base" style={{ lineHeight: '20px', color: 'rgb(196,201,203)' }}>Kami dengan hormat menganjurkan para tamu kami untuk mengenakan warna-warna ini untuk hari istimewa kami.</p>
                  <div className="flex gap-4 md:gap-6 mt-6 md:mt-8">
                    {['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560', '#0a0a0a'].map((color, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 md:w-12 md:h-12" style={{ background: color }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Wedding card */}
              <div className="mt-6 md:mt-8 text-left p-6 md:p-10 bg-white/15 backdrop-blur-sm rounded-lg">
                <p className="font-bold tracking-wider uppercase opacity-80" style={{ fontSize: '24px', lineHeight: '28px' }}>Live Wedding</p>
                <p className="font-bold mt-3" style={{ fontSize: '16px', lineHeight: '16px', color: 'rgb(196,201,203)' }}>
                  {firstEventDate && new Date(firstEventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="font-bold" style={{ fontSize: '16px', lineHeight: '16px', color: 'rgb(196,201,203)' }}>08.00 - 14.00 WIB</p>
                <p className="mt-4 max-w-md text-sm md:text-base" style={{ lineHeight: '20px', color: 'rgb(196,201,203)' }}>Moment bahagia prosesi pernikahan akan kami tayangkan secara virtual melalui platform berikut ini.</p>
                <button onClick={() => window.open('https://youtube.com', '_blank')}
                  className="mt-6 md:mt-8 inline-flex items-center gap-2 border border-white/30 px-8 py-3 md:py-4 text-sm md:text-base font-extrabold tracking-wider uppercase hover:bg-white hover:text-black transition-all rounded-lg">
                  Live Streaming
                </button>
              </div>
            </div>
          </section>

          {/* ===== GALLERY ===== */}
          <section id="gallery" ref={setSectionRef} className="px-6 py-32">
            <div className="max-w-4xl mx-auto text-left">
              <p className="font-semibold tracking-[0.35em] uppercase opacity-40" style={{ fontSize: '36px', lineHeight: '36px' }}>Momen Kita</p>
              <p className="text-lg opacity-40 mt-3 font-bold">Galeri foto kami</p>
            </div>
            <div className="mt-12 max-w-4xl mx-auto columns-2 md:columns-3 gap-4 space-y-4">
              {(data.media.length > 0 ? data.media : galleryImages).map((item, i) => {
                const url = typeof item === 'string' ? item : item.url
                const caption = typeof item === 'string' ? '' : (item.caption || '')
                return (
                  <div key={i} className="overflow-hidden bg-white/[0.02] rounded-lg">
                    <img src={url} alt={caption} className="w-full object-cover rounded-lg" loading="lazy" style={{ aspectRatio: i % 3 === 0 ? '4/5' : i % 3 === 1 ? '1/1' : '3/4' }} />
                  </div>
                )
              })}
            </div>
          </section>

          {/* ===== QUOTE ===== */}
          <section ref={setSectionRef} className="px-6 py-28 text-left max-w-2xl mx-auto">
            <div className="pt-20">
              <Heart className="mx-auto h-8 w-8 text-white/30" />
              <p className="mt-8 italic text-2xl leading-relaxed opacity-50 font-bold">
                "Love is not about how many days, months, or years you've been together. Love is about how much you love each other every single day."
              </p>
              <p className="mt-6 text-lg font-extrabold opacity-30">{data.groomNickname || data.groomName} & {data.brideNickname || data.brideName}</p>
            </div>
          </section>

          {/* ===== RSVP — smaller form fonts ===== */}
          <section id="rsvp-section" ref={setSectionRef} className="px-6 py-32">
            <div className="max-w-lg mx-auto text-left">
              <p className="font-semibold tracking-[0.35em] uppercase opacity-40" style={{ fontSize: '36px', lineHeight: '36px' }}>RSVP</p>
              <p className="text-lg opacity-40 mt-3 font-bold">Konfirmasi kehadiran</p>

              {rsvpSubmitted ? (
                <div className="mt-12 p-8 md:p-12 bg-white/[0.04] backdrop-blur-sm rounded-lg">
                  <Check className="mx-auto h-12 w-12 text-white/50" />
                  <p className="mt-4 font-extrabold text-2xl">Terima kasih!</p>
                  <p className="text-lg opacity-40 mt-2 font-bold">Konfirmasi kamu sudah diterima.</p>
                </div>
              ) : (
                <div className="mt-12 bg-white/[0.04] backdrop-blur-sm p-6 md:p-10 text-left space-y-4 md:space-y-6 rounded-lg">
                  <Input placeholder="Nama Anda" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)}
                    className="bg-white/5 text-white text-sm md:text-base rounded-lg placeholder:text-white/30 border-0" />
                  <div className="flex gap-3">
                    {['Hadir', 'Tidak Hadir'].map((label) => (
                      <button key={label} onClick={() => setRsvpStatus(label === 'Hadir' ? 'attending' : 'not_attending')}
                        className={`flex-1 py-3 md:py-4 text-sm md:text-base font-extrabold tracking-wider uppercase transition-all rounded-lg ${rsvpStatus === (label === 'Hadir' ? 'attending' : 'not_attending') ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {rsvpStatus === 'attending' && (
                    <div>
                      <label className="text-sm md:text-base">Jumlah Tamu</label>
                      <div className="flex gap-2 md:gap-3 mt-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} onClick={() => setRsvpCount(n)}
                            className={`w-12 h-12 md:w-14 md:h-14 text-sm md:text-lg font-extrabold transition-all rounded-lg ${rsvpCount === n ? 'bg-white text-black' : 'bg-white/5 text-white/60'}`}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <Textarea placeholder="Tulis ucapan & doa..." value={rsvpNote} onChange={(e) => setRsvpNote(e.target.value)}
                    className="bg-white/5 text-white text-sm md:text-base rounded-lg placeholder:text-white/30 border-0" />
                  <button onClick={handleRsvp}
                    className="w-full py-4 md:py-5 text-sm md:text-base font-extrabold tracking-wider uppercase bg-white text-black hover:bg-white/90 transition-all rounded-lg">
                    <Send className="inline h-5 w-5 mr-3" /> Kirim Konfirmasi
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ===== WISHES — smaller form fonts ===== */}
          <section ref={setSectionRef} className="px-6 py-24">
            <div className="max-w-lg mx-auto">
              {wishSubmitted ? (
                <div className="text-left mb-12 p-8 bg-white/[0.03] rounded-lg">
                  <Check className="mx-auto h-10 w-10 text-white/50" />
                  <p className="mt-3 font-extrabold text-xl">Ucapan berhasil dikirim!</p>
                </div>
              ) : (
                <div className="mb-12 bg-white/[0.03] p-6 md:p-8 text-left space-y-3 md:space-y-4 rounded-lg">
                  <Input placeholder="Nama" value={wishName} onChange={(e) => setWishName(e.target.value)}
                    className="bg-white/5 text-white text-sm md:text-base rounded-lg placeholder:text-white/30 border-0" />
                  <Textarea placeholder="Tulis ucapan & doa..." value={wishMessage} onChange={(e) => setWishMessage(e.target.value)}
                    className="bg-white/5 text-white text-sm md:text-base rounded-lg placeholder:text-white/30 border-0" />
                  <button onClick={handleWish}
                    className="w-full py-3 md:py-4 text-sm md:text-base font-extrabold tracking-wider uppercase bg-white/10 text-white/80 hover:bg-white/20 transition-all rounded-lg">
                    <Send className="inline h-5 w-5 mr-3" /> Kirim Ucapan
                  </button>
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {wishes.slice(0, 20).map((w) => (
                  <div key={w.id} className="p-4 md:p-6 text-left text-sm md:text-base bg-white/[0.03] rounded-lg">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-extrabold text-base md:text-lg">{w.name}</p>
                      <button className="flex items-center gap-2 text-sm shrink-0 mt-1 disabled:opacity-30"
                        disabled={likedIds.has(w.id)}
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/public/${slug}/wishes/${w.id}/like`, { method: 'POST' })
                            if (res.ok) { const { likes } = await res.json(); setLikedIds(new Set([...likedIds, w.id])); setWishes(wishes.map((x) => x.id === w.id ? { ...x, likes } : x)) }
                          } catch {}
                        }}>
                        <Heart className={`h-5 w-5 ${likedIds.has(w.id) ? 'fill-white' : ''}`} />
                        {w.likes || 0}
                      </button>
                    </div>
                    <p className="mt-2 opacity-50">{w.message}</p>
                    {w.reply && (
                      <div className="mt-3 ml-3 pl-4 border-l-2 border-white/10">
                        <p className="text-sm flex items-center gap-2 opacity-30"><CornerDownLeft className="h-4 w-4" /> Balasan</p>
                        <p className="mt-1 opacity-50">{w.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
                {wishes.length === 0 && <p className="text-left opacity-20 py-12">Belum ada ucapan. Jadilah yang pertama!</p>}
              </div>
            </div>
          </section>

          {/* ===== GIFT — smaller form fonts ===== */}
          <section id="gift" ref={setSectionRef} className="px-6 py-32">
            <div className="max-w-lg mx-auto text-left">
              <p className="font-semibold tracking-[0.35em] uppercase opacity-40" style={{ fontSize: '36px', lineHeight: '36px' }}>Wedding Gift</p>
              <p className="text-lg opacity-40 mt-3 font-bold">Doa restu adalah kado terindah.</p>

              <div className="flex justify-center gap-3 mt-10">
                {['envelope' as const, 'registry' as const].map((tab) => (
                  <button key={tab} onClick={() => setGiftTab(tab)}
                    className={`px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-extrabold tracking-wider uppercase transition-all rounded-lg ${giftTab === tab ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                    {tab === 'envelope' ? 'E-Amplop' : 'Gift Registry'}
                  </button>
                ))}
              </div>

              {giftTab === 'envelope' ? (
                <div className="mt-10 space-y-3 md:space-y-4">
                  {[
                    { bank: 'BCA', number: '1234567890', name: 'Ahmad & Dessi' },
                    { bank: 'Mandiri', number: '9876543210', name: 'Ahmad & Dessi' },
                    { bank: 'GoPay', number: '081234567890', name: 'Ahmad & Dessi' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/[0.03] p-4 md:p-6 text-left flex items-center justify-between rounded-lg">
                      <div>
                        <p className="text-xs md:text-sm uppercase tracking-wider opacity-30">{item.bank}</p>
                        <p className="text-sm md:text-xl mt-1 font-bold">{item.number}</p>
                        <p className="text-xs md:text-base opacity-30 mt-0.5">a.n. {item.name}</p>
                      </div>
                      <button onClick={() => navigator.clipboard.writeText(`${item.bank} - ${item.number} a.n. ${item.name}`)}
                        className="p-3 bg-white/5 hover:bg-white/10 transition-all rounded-lg">
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-10 bg-white/[0.03] p-8 md:p-12 rounded-lg">
                  <Gift className="mx-auto h-10 w-10 text-white/30" />
                  <p className="mt-6 text-xl font-extrabold">Konfirmasi Hadiah</p>
                  <p className="mt-2 text-sm md:text-base opacity-30">Konfirmasi hadiah melalui WhatsApp</p>
                  <button onClick={() => window.open(`https://wa.me/?text=Halo%20saya%20ingin%20memberikan%20kado%20untuk%20pernikahan%20${data.groomName}%20%26%20${data.brideName}`, '_blank')}
                    className="mt-8 inline-flex items-center gap-3 border border-white/20 px-8 py-4 text-sm md:text-base font-extrabold tracking-wider uppercase hover:bg-white hover:text-black transition-all rounded-lg">
                    <ExternalLink className="h-5 w-5" /> Konfirmasi Via WA
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ===== QR CHECK-IN ===== */}
          {guestName && (
            <section ref={setSectionRef} className="px-6 py-24 text-left">
              <div className="max-w-md mx-auto bg-white/[0.03] p-8 md:p-10 backdrop-blur-sm rounded-lg">
                <p className="text-base md:text-lg tracking-[0.3em] uppercase opacity-40">QR Check-In</p>
                <p className="text-base md:text-lg opacity-50 mt-2">Halo,</p>
                <p className="text-2xl md:text-3xl font-extrabold mt-2">{guestName}</p>
                <div className="my-10 flex justify-center">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${window.location.origin}/inv/${slug}?guest=${guestCode}`}
                    alt="QR Check-in" className="border border-white/10 rounded-lg" />
                </div>
                <p className="text-sm md:text-base opacity-30">Tunjukkan QR ini saat check-in di venue</p>
              </div>
            </section>
          )}

          {/* ===== CLOSING ===== */}
          <section ref={setSectionRef} className="px-6 py-40 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-white/[0.03] to-transparent" />
            <div className="relative z-10 max-w-lg mx-auto">
              <div className="w-28 h-28 mx-auto overflow-hidden shadow-lg shadow-black/40 rounded-lg">
                <img src={heroImages[0]} alt="" className="h-full w-full object-cover" />
              </div>
              <p className="mt-10 font-semibold tracking-[0.35em] uppercase opacity-50" style={{ fontSize: '36px', lineHeight: '36px' }}>Terima Kasih</p>
              <p className="mt-6 text-xl opacity-40">Atas kehadiran dan doa restunya</p>
              <p className="mt-10 text-3xl font-extrabold tracking-tight">{data.groomNickname || data.groomName} & {data.brideNickname || data.brideName}</p>
              <p className="mt-4 text-lg opacity-30">Kami yang berbahagia,</p>
              <p className="mt-10 text-lg opacity-20 max-w-xs mx-auto leading-relaxed">"Wassalamu'alaikum Warahmatullahi Wabarakatuh"</p>
            </div>
          </section>

          {/* ===== FOOTER ===== */}
          <footer className="px-6 py-16 text-left">
            <div className="flex justify-center gap-5 mb-8">
              {[Globe, Globe, Globe].map((Icon, i) => (
                <a key={i} href={['https://instagram.com', 'https://facebook.com', 'https://wa.me'][i]}
                  target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-white/10 transition-all">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-lg opacity-40">Terima kasih atas doa & restu</p>
            <p className="text-base opacity-20 mt-3">&copy; WeddingInvite · {data.title || `${data.groomNickname || data.groomName} & ${data.brideNickname || data.brideName}`}</p>
          </footer>

        </div>
      </div>
    </div>
  )
}
