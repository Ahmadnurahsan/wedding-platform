import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Heart, MapPin, Calendar, Clock, Music, Send, Gift, ChevronDown, Check, Image as ImageIcon, CornerDownLeft } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { api } from '../lib/api'
import { toast } from 'sonner'

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
  events: { id: string; title: string; date: string | null; timeStart: string | null; timeEnd: string | null; locationName: string | null; address: string | null; mapsUrl: string | null }[]
  media: { id: string; type: string; url: string; caption: string | null }[]
  wishes: { id: string; name: string; message: string; reply: string | null; likes: number; createdAt: string }[]
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const target = new Date(targetDate).getTime()
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const diff = target - now
      if (diff <= 0) {
        setRemaining('Acara sedang berlangsung!')
        clearInterval(interval)
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setRemaining(`${days} hari ${hours} jam ${minutes} menit`)
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div className="text-center">
      <p className="text-sm opacity-80">Menuju hari bahagia</p>
      <p className="mt-1 text-lg font-bold">{remaining}</p>
    </div>
  )
}

function Section({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`min-h-screen flex flex-col items-center justify-center px-6 py-16 ${className}`}>
      {children}
    </section>
  )
}

export function PublicInvitationPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const guestCode = searchParams.get('guest')
  const [guestName, setGuestName] = useState<string | null>(null)
  const [data, setData] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // RSVP form
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'not_attending' | null>(null)
  const [rsvpCount, setRsvpCount] = useState(1)
  const [rsvpNote, setRsvpNote] = useState('')
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)

  // Wish form
  const [wishName, setWishName] = useState('')
  const [wishMessage, setWishMessage] = useState('')
  const [wishes, setWishes] = useState(data?.wishes || [])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [wishSubmitted, setWishSubmitted] = useState(false)

  const [isOpen, setIsOpen] = useState(false)
  const [coverOpened, setCoverOpened] = useState(false)

  useEffect(() => {
    if (!slug) return
    api.get<InvitationData>(`/public/${slug}`)
      .then((inv) => {
        setData(inv)
        setWishes(inv.wishes)
        document.documentElement.style.setProperty('--primary', inv.primaryColor)
        document.documentElement.style.setProperty('--secondary', inv.secondaryColor)
      })
      .catch(() => setError('Undangan tidak ditemukan'))
      .finally(() => setLoading(false))

    if (guestCode) {
      api.get<{ name: string }>(`/public/${slug}/guest/${guestCode}`)
        .then((g) => setGuestName(g.name))
        .catch(() => {})
    }
  }, [slug, guestCode])

  const handleRsvp = async () => {
    if (!rsvpName || !rsvpStatus) return
    try {
      await api.post(`/public/${slug}/rsvp`, {
        name: rsvpName,
        rsvpStatus,
        rsvpCount,
        rsvpNote,
      })
      setRsvpSubmitted(true)
      toast.success('Konfirmasi berhasil dikirim!')
    } catch {
      toast.error('Gagal mengirim konfirmasi')
    }
  }

  const handleWish = async () => {
    if (!wishName || !wishMessage) return
    try {
      const wish = await api.post<{ id: string; name: string; message: string; reply: null; likes: number; createdAt: string }>(
        `/public/${slug}/wishes`, { name: wishName, message: wishMessage },
      )
      setWishes([wish, ...wishes])
      setWishSubmitted(true)
      setWishName('')
      setWishMessage('')
      toast.success('Ucapan berhasil dikirim!')
    } catch {
      toast.error('Gagal mengirim ucapan')
    }
  }

  if (data?.coverEnabled && !coverOpened) {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center px-6"
        style={{ background: `linear-gradient(135deg, ${data.secondaryColor} 0%, ${data.primaryColor}20 100%)`, color: data.primaryColor, fontFamily: data.fontFamily }}
      >
        <div className="space-y-8 max-w-sm">
          <div className="space-y-2">
            <Heart className="mx-auto h-6 w-6" fill={data.primaryColor} />
            <p className="text-sm tracking-[0.2em] uppercase opacity-60">The Wedding of</p>
          </div>
          <div className="space-y-1">
            <h1 className="font-serif text-4xl font-bold">{data.groomNickname || data.groomName || '________'}</h1>
            <p className="font-serif text-2xl opacity-60">&</p>
            <h1 className="font-serif text-4xl font-bold">{data.brideNickname || data.brideName || '________'}</h1>
          </div>
          {data.events?.[0]?.date && (
            <p className="text-sm opacity-70">
              {new Date(data.events[0].date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          {data.coverMessage && (
            <p className="text-xs opacity-60 leading-relaxed">{data.coverMessage}</p>
          )}
          <button
            onClick={() => setCoverOpened(true)}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold shadow-lg transition-all hover:shadow-xl active:scale-95"
            style={{ background: data.primaryColor, color: '#fff' }}
          >
            <Heart className="h-4 w-4" /> Buka Undangan
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--secondary)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary p-6 text-center">
        <div>
          <Heart className="mx-auto h-12 w-12 text-[var(--primary)]" />
          <h1 className="mt-4 font-serif text-2xl font-bold">Undangan Tidak Ditemukan</h1>
          <p className="mt-2 text-muted-foreground">Link undangan mungkin sudah tidak aktif atau belum dipublikasikan.</p>
        </div>
      </div>
    )
  }

  const firstEventDate = data.events?.[0]?.date || ''
  const fontFamily = data.fontFamily

  return (
    <div
      className="min-h-screen"
      style={{
        background: data.secondaryColor,
        color: data.primaryColor,
        fontFamily,
      }}
    >
      {/* Music Player */}
      {data.backgroundMusic && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg backdrop-blur"
            style={{ background: data.primaryColor, color: '#fff' }}
          >
            <Music className="h-5 w-5" />
          </button>
          {isOpen && (
            <div className="absolute bottom-16 right-0 rounded-xl bg-card p-3 shadow-lg">
              <audio src={data.backgroundMusic} controls autoPlay className="h-10 w-48" />
            </div>
          )}
        </div>
      )}

      {/* Hero */}
      <Section className="relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, ${data.primaryColor} 0%, transparent 70%)` }} />
        </div>
        <div className="relative z-10 space-y-6">
          <Heart className="mx-auto h-8 w-8" fill={data.primaryColor} />
          <div>
            <p className="text-sm tracking-widest uppercase opacity-60">The Wedding of</p>
            <h1 className="mt-2 font-serif text-4xl font-bold leading-tight">
              {data.groomNickname || data.groomName || '________'}
            </h1>
            <p className="my-3 font-serif text-2xl">&</p>
            <h1 className="font-serif text-4xl font-bold leading-tight">
              {data.brideNickname || data.brideName || '________'}
            </h1>
          </div>
          {firstEventDate && <Countdown targetDate={firstEventDate} />}
          <ChevronDown className="mx-auto mt-8 h-6 w-6 animate-bounce opacity-60" />
        </div>
      </Section>

      {/* Guest QR Check-in */}
      {guestName && (
        <Section className="text-center">
          <div className="rounded-2xl bg-white/60 p-6 shadow-sm max-w-sm">
            <p className="text-sm opacity-70">Halo,</p>
            <p className="font-serif text-xl font-bold">{guestName}</p>
            <div className="my-4 flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/inv/${slug}?guest=${guestCode}`}
                alt="QR Check-in"
                className="rounded-xl"
              />
            </div>
            <p className="text-xs opacity-60">Tunjukkan QR ini saat check-in di venue</p>
          </div>
        </Section>
      )}

      {/* Couple */}
      <Section className="bg-white/30 text-center">
        <div className="max-w-sm space-y-8">
          <h2 className="font-serif text-2xl font-bold">Kami Berdua</h2>
          <div className="space-y-2">
            <p className="text-xl font-bold">{data.groomName || '________'}</p>
            <p className="text-sm opacity-70">{data.groomParent || ''}</p>
          </div>
          <p className="font-serif text-xl">&</p>
          <div className="space-y-2">
            <p className="text-xl font-bold">{data.brideName || '________'}</p>
            <p className="text-sm opacity-70">{data.brideParent || ''}</p>
          </div>
        </div>
      </Section>

      {/* Events */}
      {data.events.length > 0 && (
        <Section className="text-center">
          <h2 className="font-serif text-2xl font-bold">Acara</h2>
          <div className="mt-8 space-y-6">
            {data.events.map((event) => (
              <div key={event.id} className="rounded-2xl bg-white/50 p-6 text-left shadow-sm">
                <h3 className="font-serif text-lg font-bold">{event.title}</h3>
                <div className="mt-3 space-y-2 text-sm opacity-80">
                  {event.date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0" />
                      {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                  {event.timeStart && (
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      {event.timeStart}{event.timeEnd ? ` - ${event.timeEnd}` : ''}
                    </p>
                  )}
                  {event.locationName && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {event.locationName}
                    </p>
                  )}
                  {event.address && <p className="ml-6 text-xs">{event.address}</p>}
                </div>
                {event.mapsUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => window.open(event.mapsUrl!, '_blank')}
                    style={{ borderColor: data.primaryColor, color: data.primaryColor }}
                  >
                    <MapPin className="mr-1 h-4 w-4" /> Buka Google Maps
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Gallery */}
      {data.media.length > 0 && (
        <Section>
          <h2 className="font-serif text-2xl font-bold text-center">Galeri</h2>
          <div className="mt-6 columns-2 gap-3 space-y-3">
            {data.media.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-xl bg-white/50">
                {m.type === 'image' ? (
                  <img src={m.url} alt={m.caption || ''} className="w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex aspect-square items-center justify-center">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                {m.caption && <p className="p-2 text-xs text-center">{m.caption}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* RSVP */}
      <Section className="bg-white/30">
        <h2 className="font-serif text-2xl font-bold text-center">Konfirmasi Kehadiran</h2>
        <p className="mt-2 text-center text-sm opacity-70">Mohon konfirmasi sebelum acara</p>
        {rsvpSubmitted ? (
          <div className="mt-6 text-center">
            <Check className="mx-auto h-12 w-12" />
            <p className="mt-2 font-semibold">Terima kasih! Konfirmasi kamu sudah diterima.</p>
          </div>
        ) : (
          <div className="mt-6 w-full max-w-sm space-y-4">
            <Input placeholder="Nama kamu" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)}
              style={{ borderColor: data.primaryColor }} />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant={rsvpStatus === 'attending' ? 'default' : 'outline'}
                onClick={() => setRsvpStatus('attending')}
                style={rsvpStatus === 'attending' ? { background: data.primaryColor } : { borderColor: data.primaryColor, color: data.primaryColor }}
              >
                ✅ Hadir
              </Button>
              <Button
                className="flex-1"
                variant={rsvpStatus === 'not_attending' ? 'default' : 'outline'}
                onClick={() => setRsvpStatus('not_attending')}
                style={rsvpStatus === 'not_attending' ? { background: data.primaryColor } : { borderColor: data.primaryColor, color: data.primaryColor }}
              >
                ❌ Tidak
              </Button>
            </div>
            {rsvpStatus === 'attending' && (
              <div className="space-y-2">
                <label className="text-sm">Jumlah tamu</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRsvpCount(n)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm transition-all ${
                        rsvpCount === n ? 'text-white' : 'opacity-60'
                      }`}
                      style={{
                        background: rsvpCount === n ? data.primaryColor : 'transparent',
                        borderColor: data.primaryColor,
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Textarea placeholder="Pesan (opsional)" value={rsvpNote} onChange={(e) => setRsvpNote(e.target.value)}
              style={{ borderColor: data.primaryColor }} />
            <Button className="w-full" onClick={handleRsvp}
              style={{ background: data.primaryColor, color: '#fff' }}>
              <Send className="mr-2 h-4 w-4" /> Kirim Konfirmasi
            </Button>
          </div>
        )}
      </Section>

      {/* Maps */}
      {data.events.some((e) => e.mapsUrl) && (
        <Section className="text-center">
          <h2 className="font-serif text-2xl font-bold">Lokasi</h2>
          <div className="mt-4 w-full max-w-sm overflow-hidden rounded-2xl shadow-sm">
            {data.events.filter((e) => e.mapsUrl).map((event) => (
              <div key={event.id} className="mb-2">
                <p className="mb-1 text-sm font-semibold">{event.title}</p>
                <iframe
                  title={event.title}
                  src={event.mapsUrl!.replace('watch?v=', 'embed/')}
                  className="h-48 w-full rounded-xl"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Wishes */}
      <Section className="bg-white/30">
        <h2 className="font-serif text-2xl font-bold text-center">Ucapan & Doa</h2>
        {wishSubmitted ? (
          <div className="mt-6 text-center">
            <Check className="mx-auto h-8 w-8" />
            <p className="mt-1 font-semibold">Ucapan berhasil dikirim!</p>
          </div>
        ) : (
          <div className="mt-6 w-full max-w-sm space-y-3">
            <Input placeholder="Nama kamu" value={wishName} onChange={(e) => setWishName(e.target.value)}
              style={{ borderColor: data.primaryColor }} />
            <Textarea placeholder="Tulis ucapan & doa..." value={wishMessage} onChange={(e) => setWishMessage(e.target.value)}
              style={{ borderColor: data.primaryColor }} />
            <Button className="w-full" onClick={handleWish}
              style={{ background: data.primaryColor, color: '#fff' }}>
              <Send className="mr-2 h-4 w-4" /> Kirim Ucapan
            </Button>
          </div>
        )}

        <div className="mt-8 w-full max-w-sm space-y-3">
          {wishes.slice(0, 20).map((w) => (
            <div key={w.id} className="rounded-xl bg-white/60 p-3 text-left text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{w.name}</p>
                <button
                  className="flex items-center gap-1 text-xs shrink-0 mt-0.5 disabled:opacity-50"
                  style={{ color: likedIds.has(w.id) ? data.primaryColor : undefined }}
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
              <p className="mt-1 opacity-80">{w.message}</p>
              {w.reply && (
                <div className="mt-2 ml-2 border-l-2 pl-2.5 border-current/20">
                  <p className="text-[11px] flex items-center gap-1 opacity-60">
                    <CornerDownLeft className="h-3 w-3" /> Balasan
                  </p>
                  <p className="text-xs opacity-80">{w.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Gift */}
      <Section className="text-center">
        <h2 className="font-serif text-2xl font-bold">Tanda Kasih</h2>
        <p className="mt-2 text-sm opacity-70">
          Doa restu adalah kado terindah. Jika ingin memberi tanda kasih, dapat melalui:
        </p>
        <div className="mt-6 w-full max-w-sm space-y-3">
          {['BCA - 1234567890 a.n. Andi & Siti', 'Mandiri - 9876543210 a.n. Andi & Siti', 'GoPay / OVO / Dana: 08123456789'].map((bank, i) => (
            <div key={i} className="rounded-xl bg-white/50 p-4 text-left shadow-sm">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">{bank}</p>
              </div>
              <button
                className="mt-2 text-xs underline opacity-70"
                onClick={() => navigator.clipboard.writeText(bank)}
              >
                Salin nomor rekening
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm opacity-60">
        <Heart className="mx-auto h-4 w-4 mb-2" fill={data.primaryColor} />
        <p className="font-serif">Terima kasih atas doa & restu</p>
        <p className="mt-1 text-xs">&copy; WeddingInvite · {data.title || `${data.groomNickname || data.groomName} & ${data.brideNickname || data.brideName}`}</p>
      </footer>
    </div>
  )
}
