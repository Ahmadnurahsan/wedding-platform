import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Heart, Check, ArrowRight, Star, Smartphone, Palette, Shield, Infinity, ChevronDown, Quote, Users, Music, Gift, Image as ImageIcon, ChevronUp, MessageCircle, Menu, X, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'

const features = [
  { icon: Smartphone, title: 'Mobile First', desc: 'Semua tamu bisa buka dari HP manapun, tanpa install aplikasi' },
  { icon: Palette, title: 'Premium Template', desc: '20+ desain eksklusif buatan desainer profesional' },
  { icon: Shield, title: 'QR Check-in', desc: 'Scan QR pas acara, pantau tamu yang sudah datang langsung' },
  { icon: Infinity, title: 'Dashboard Real-time', desc: 'Pantau RSVP, ucapan, gift & kunjungan secara langsung' },
  { icon: Users, title: 'Unlimited Tamu', desc: 'Tanpa batas jumlah tamu di semua paket berbayar' },
  { icon: Music, title: 'Autoplay Music', desc: 'Putar lagu favorit pas tamu buka undangan' },
  { icon: Gift, title: 'Gift Registry', desc: 'Amplop digital, QRIS, dan wishlist kado dalam satu halaman' },
  { icon: MessageCircle, title: 'WA Broadcast', desc: 'Kirim undangan massal ke semua tamu via WhatsApp' },
]

const testimonials = [
  { name: 'Andi & Siti', text: 'Undangannya cantik dan simple banget! Adminnya ramah dan fast respon. Recommend banget!', rating: 5 },
  { name: 'Rizky & Dinda', text: 'Pelayanannya memuaskan banget, dari respon admin sampai hasil undangannya keren. Gak nyesel order disini.', rating: 5 },
  { name: 'Hendra & Melly', text: 'Desainnya elegan, simple tapi mewah. Banyak template pilihannya, puas banget!', rating: 5 },
]

const faqs = [
  { q: 'Bagaimana cara order?', a: 'Kamu bisa langsung registrasi dan buat undangan sendiri tanpa perlu admin. Atau hubungi kami via WhatsApp untuk konsultasi.' },
  { q: 'Berapa lama proses pengerjaan?', a: 'Instant! Kamu bisa langsung edit undangan setelah registrasi. Tinggal pilih template, isi data, dan publish.' },
  { q: 'Apakah bisa custom warna dan font?', a: 'Bisa. Di editor kamu bisa ganti warna primer, sekunder, dan pilih font yang diinginkan secara real-time.' },
  { q: 'Bisa pakai musik sendiri?', a: 'Bisa. Upload file audio atau tempel URL dari YouTube/SoundCloud.' },
  { q: 'Apakah bisa tanpa foto?', a: 'Bisa. Beberapa template cocok untuk undangan tanpa foto.' },
  { q: 'Berapa lama masa aktif undangan?', a: 'Tergantung paket. Mulai dari 1 bulan untuk Basic, 6 bulan untuk Premium, hingga Lifetime.' },
]

const gradientMap: Record<string, string> = {
  'Modern': 'from-rose-200 to-pink-100',
  'Elegan': 'from-amber-200 to-yellow-100',
  'Floral': 'from-emerald-200 to-teal-100',
  'Rustic': 'from-orange-200 to-amber-100',
  'Adat': 'from-red-200 to-rose-100',
}

const iconMap: Record<string, any> = {
  'Modern': Star,
  'Elegan': Star,
  'Floral': ImageIcon,
  'Rustic': Heart,
  'Adat': Star,
}

export function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const { data: themes } = useQuery<any[]>({
    queryKey: ['themes-landing'],
    queryFn: () => api.get('/themes'),
  })

  return (
    <div className="min-h-dvh bg-background">
      {/* ── PROMO BAR ── */}
      <div className="relative z-50 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border-b border-primary/10">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Promo Ramadhan — Diskon 50% untuk semua paket!</span>
          <span className="sm:hidden">Promo Ramadhan — Diskon 50%!</span>
          <Link to="/register" className="ml-1 underline underline-offset-2 font-semibold hover:text-primary/80 transition-colors">
            Klaim Sekarang
          </Link>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="flex sm:hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-sm">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="font-serif font-bold text-lg tracking-tight">WeddingInvite</span>
            </Link>
          </div>
          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Template
            </Link>
            <Link to="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Fitur
            </Link>
            <Link to="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Harga
            </Link>
            <Link to="/#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-sm">Masuk</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="text-sm shadow-sm">
                    <Heart className="mr-1 h-3.5 w-3.5" /> Buat Undangan
                  </Button>
                </Link>
              </div>
            )}
          </div>
          {/* Mobile right */}
          <div className="flex sm:hidden items-center gap-2">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </button>
            ) : (
              <Link to="/register">
                <Button size="sm" className="text-xs shadow-sm px-3">
                  <Heart className="mr-1 h-3 w-3" /> Buat
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Sheet (outside nav to avoid backdrop-filter fixed bug) */}
      {mobileNavOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:hidden" onClick={() => setMobileNavOpen(false)} />
          <div className="fixed left-0 top-0 z-50 h-full w-72 max-w-[80vw] border-r border-border/50 bg-background shadow-2xl sm:hidden slide-in-from-left">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
              <span className="font-serif font-bold text-lg">Menu</span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="px-3 py-3 space-y-1">
              <Link to="/templates" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                <Star className="h-4 w-4" /> Template
              </Link>
              <Link to="/#features" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                <Sparkles className="h-4 w-4" /> Fitur
              </Link>
              <Link to="/#pricing" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                <ArrowRight className="h-4 w-4" /> Harga
              </Link>
              <Link to="/#faq" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                <MessageCircle className="h-4 w-4" /> FAQ
              </Link>
            </nav>
            <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 p-4">
              {!user && (
                <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                  <Button variant="outline" className="w-full gap-2"><Heart className="h-4 w-4" /> Masuk</Button>
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-[400px] w-[400px] rounded-full bg-primary/[0.02] blur-3xl" />
        </div>
        <div className="mx-auto max-w-5xl px-4 py-20 sm:py-28 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium tracking-wide">
            Platform Undangan Digital Premium
          </Badge>
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-tight">
            Mudah Bikin Undangan
            <br />
            <span className="text-primary">Digital Impian</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Desain premium, dashboard lengkap, dan fitur terlengkap untuk hari spesialmu. 
            Tanpa ribet, tanpa harus bisa coding.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="xl" className="w-full gap-2 text-base shadow-lg shadow-primary/20 sm:px-8">
                <Heart className="h-5 w-5" /> Buat Undangan Gratis
              </Button>
            </Link>
            <Link to="/templates" className="w-full sm:w-auto">
              <Button variant="outline" size="xl" className="w-full gap-2 text-base sm:px-8">
                Lihat Template <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> No CC Required</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> 20+ Template Premium</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Support 24/7</span>
          </div>
          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground animate-bounce">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="border-y border-border/50 bg-secondary/30 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">Tentang Kami</h2>
          <div className="mt-2 mx-auto w-12 h-0.5 rounded-full bg-primary/40" />
          <p className="mt-6 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            WeddingInvite adalah platform undangan digital yang berdiri sejak 2025. 
            Menawarkan desain eksklusif dan minimalis dengan pengalaman seamless dalam 
            satu genggaman. Semua template dirancang oleh desainer profesional dan 
            dioptimalkan untuk tampilan mobile.
          </p>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">Kenapa Pilih Kami?</h2>
            <div className="mt-2 mx-auto w-12 h-0.5 rounded-full bg-primary/40" />
            <p className="mt-4 text-sm text-muted-foreground">Fitur lengkap yang bikin undanganmu makin berkesan</p>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {features.slice(0, 4).map((f) => (
              <Card key={f.title} className="border-none bg-secondary/40 shadow-none hover:bg-secondary/60 transition-colors">
                <CardContent className="flex flex-col items-center gap-3 p-5 sm:p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{f.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {features.slice(4, 8).map((f) => (
              <Card key={f.title} className="border-none bg-secondary/40 shadow-none hover:bg-secondary/60 transition-colors">
                <CardContent className="flex flex-col items-center gap-3 p-5 sm:p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{f.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATE SHOWCASE ── */}
      <section className="border-y border-border/50 bg-secondary/30 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">Pilih Template</h2>
            <div className="mt-2 mx-auto w-12 h-0.5 rounded-full bg-primary/40" />
            <p className="mt-4 text-sm text-muted-foreground">20+ template premium siap pakai</p>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {themes?.slice(0, 8).map((t) => {
              const Icon = iconMap[t.category] || Heart
              const gradient = gradientMap[t.category] || 'from-rose-200 to-pink-100'
              let colors: Record<string, string> = { primaryColor: '#D4A574', secondaryColor: '#F5E6D3' }
              try { colors = JSON.parse(t.defaultColors || '{}') } catch {}
              return (
                <Card key={t.id} className="group overflow-hidden border-border/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                  <div className={`aspect-[3/4] bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Icon className="h-12 w-12 text-white/40" strokeWidth={1} />
                      </div>
                    </div>
                    {t.isPremium && (
                      <Badge className="absolute right-2 top-2 text-[10px] px-2 py-0.5 shadow-sm bg-amber-500 hover:bg-amber-500 text-white">
                        PREMIUM
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Link to={`/template-demo/${t.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary" className="shadow-lg text-xs">
                          <Eye className="mr-1 h-3 w-3" /> Preview
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <CardContent className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold truncate">{t.name}</h3>
                        <p className="text-xs text-muted-foreground">{t.category}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <div className="h-4 w-4 rounded-full border" style={{ background: colors.primaryColor }} />
                        <div className="h-4 w-4 rounded-full border" style={{ background: colors.secondaryColor }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {themes && themes.length > 0 && (
            <div className="mt-8 text-center">
              <Link to="/templates">
                <Button variant="outline" className="gap-2">
                  Lihat Semua Template <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">Pilih Paket</h2>
            <div className="mt-2 mx-auto w-12 h-0.5 rounded-full bg-primary/40" />
            <p className="mt-4 text-sm text-muted-foreground">Mulai dari gratis, upgrade kapan aja</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {/* Basic */}
            <Card className="border-border/50 hover:border-primary/20 transition-all duration-200">
              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">Rp49K</span>
                    <span className="text-sm text-muted-foreground">/1 bln</span>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {['1 Undangan', 'Unlimited Tamu', 'Semua Template', 'RSVP & Wishes', 'WA Manual', 'Statistik Tamu'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant="outline" className="w-full">Pilih Basic</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium */}
            <Card className="relative overflow-hidden border-primary/30 ring-1 ring-primary/20 shadow-lg shadow-primary/5 scale-[1.02]">
              <div className="absolute right-0 top-0 bg-primary px-4 py-1 text-xs font-medium text-primary-foreground rounded-bl-xl shadow-sm z-10">
                TERLARIS
              </div>
              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Premium</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">Rp79K</span>
                    <span className="text-sm text-muted-foreground">/6 bln</span>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {['Unlimited Tamu', 'WA Blast 50', 'QR Check-in', 'Tamu VIP', 'Gallery Foto', 'Custom Warna & Font'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className="w-full shadow-lg shadow-primary/20">Pilih Premium</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Lifetime */}
            <Card className="border-border/50 hover:border-primary/20 transition-all duration-200">
              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lifetime</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">Rp149K</span>
                    <span className="text-sm text-muted-foreground">/selamanya</span>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {['Unlimited Tamu', 'WA Blast 200', 'Custom Domain', 'Prioritas Support', 'Semua Fitur Premium', 'Update Gratis'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant="outline" className="w-full">Pilih Lifetime</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="border-y border-border/50 bg-secondary/30 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">Kata Mereka</h2>
          <div className="mt-2 mx-auto w-12 h-0.5 rounded-full bg-primary/40" />
          <p className="mt-4 text-sm text-muted-foreground">Apa kata pengantin yang sudah pakai WeddingInvite</p>
        </div>
        <div className="mt-10 mx-auto max-w-5xl px-4 grid sm:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <Card key={i} className="border-border/50 bg-background">
              <CardContent className="p-5 space-y-3">
                <Quote className="h-6 w-6 text-primary/30" />
                <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-semibold">{t.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <div className="text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">FAQ</h2>
            <div className="mt-2 mx-auto w-12 h-0.5 rounded-full bg-primary/40" />
            <p className="mt-4 text-sm text-muted-foreground">Temukan jawaban dari pertanyaan yang sering diajukan</p>
          </div>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-border/50 overflow-hidden">
                <button
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-medium"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent">
        <div className="mx-auto max-w-lg px-4 text-center">
          <Heart className="mx-auto h-8 w-8 text-primary" fill="currentColor" />
          <h2 className="mt-4 font-serif text-2xl sm:text-3xl font-bold">Siap Bikin Undangan?</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
            Gratis coba, gak perlu kartu kredit. Bisa upgrade kapan aja.
          </p>
          <Link to="/register">
            <Button size="xl" className="mt-6 w-full sm:w-auto gap-2 shadow-lg shadow-primary/20 text-base px-10">
              <Heart className="h-5 w-5" /> Mulai Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-4 w-4 text-primary" />
            <span className="font-serif font-bold">WeddingInvite</span>
          </div>
          <p className="text-xs">&copy; 2026 WeddingInvite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

const Eye = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
