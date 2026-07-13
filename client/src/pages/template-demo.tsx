import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Heart, MapPin, Calendar, Clock, Gift, ChevronDown, ArrowLeft, Loader2, Music, Play, ImageIcon, Minus, CheckSquare } from 'lucide-react'
import { api } from '../lib/api'

interface ThemeComponent {
  id: string
  type: string
  props: Record<string, any>
  order: number
  visible: boolean
}

interface Theme {
  id: string
  name: string
  category: string
  isPremium: boolean
  defaultColors: string
  sectionsConfig: string
  thumbnailUrl: string | null
}

function ComponentRenderer({ comp, primary, secondary }: { comp: ThemeComponent; primary: string; secondary: string }) {
  const { type, props } = comp
  const font = props.fontFamily || 'serif'

  switch (type) {
    case 'cover':
      return (
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center overflow-hidden" style={{ fontFamily: font }}>
          {props.image && (
            <img src={props.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className={`absolute inset-0 ${props.overlay ? `bg-black/${props.overlayOpacity || 40}` : ''}`} />
          <div className="relative z-10 space-y-6">
            <Heart className="mx-auto h-8 w-8" fill={primary} style={{ color: primary }} />
            <p className="text-sm tracking-widest uppercase opacity-80">{props.subtitle || 'Kepada Yth.'}</p>
            <h1 className="font-serif text-3xl font-bold leading-tight">{props.title || 'Undangan'}</h1>
            <ChevronDown className="mx-auto mt-8 h-6 w-6 animate-bounce opacity-60" />
          </div>
        </section>
      )

    case 'couple':
      return (
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center" style={{ background: secondary, fontFamily: font }}>
          <div className="max-w-sm space-y-8">
            <h2 className="font-serif text-2xl font-bold" style={{ color: primary }}>Kami Berdua</h2>
            {props.groomPhoto && <img src={props.groomPhoto} alt="" className="mx-auto h-24 w-24 rounded-full object-cover shadow-md" />}
            <div className="space-y-2">
              <p className="text-xl font-bold">{props.groomName || 'Pria'}</p>
              <p className="text-sm opacity-70">{props.groomParent}</p>
            </div>
            <p className="font-serif text-xl">&</p>
            {props.bridePhoto && <img src={props.bridePhoto} alt="" className="mx-auto h-24 w-24 rounded-full object-cover shadow-md" />}
            <div className="space-y-2">
              <p className="text-xl font-bold">{props.brideName || 'Wanita'}</p>
              <p className="text-sm opacity-70">{props.brideParent}</p>
            </div>
          </div>
        </section>
      )

    case 'event':
      return (
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center" style={{ fontFamily: font }}>
          <h2 className="font-serif text-2xl font-bold" style={{ color: primary }}>Acara</h2>
          <div className="mt-8 w-full max-w-sm space-y-4">
            <div className="rounded-2xl p-6 text-left shadow-sm" style={{ background: `${secondary}80` }}>
              <h3 className="font-serif text-lg font-bold">{props.title || 'Acara'}</h3>
              <div className="mt-3 space-y-2 text-sm opacity-80">
                {props.date && <p className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0" />{new Date(props.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                {props.timeStart && <p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" />{props.timeStart}{props.timeEnd ? ` - ${props.timeEnd}` : ''}</p>}
                {props.locationName && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" />{props.locationName}</p>}
                {props.address && <p className="ml-6 text-xs">{props.address}</p>}
              </div>
              {props.mapsUrl && (
                <a href={props.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium" style={{ borderColor: primary, color: primary }}>
                  <MapPin className="h-3.5 w-3.5" /> Google Maps
                </a>
              )}
            </div>
          </div>
        </section>
      )

    case 'gallery':
      return (
        <section className="px-6 py-16 text-center" style={{ background: secondary, fontFamily: font }}>
          <h2 className="font-serif text-2xl font-bold" style={{ color: primary }}>Galeri</h2>
          {props.images && props.images.length > 0 && (
            <div className="mt-6 mx-auto max-w-sm" style={{ columns: props.columns || 2, gap: props.gap || 8 }}>
              {props.images.filter(Boolean).map((img: string, i: number) => (
                <img key={i} src={img} alt="" className="w-full rounded-lg mb-2 object-cover" style={{ borderRadius: props.borderRadius || 8 }} />
              ))}
            </div>
          )}
          {(!props.images || props.images.every((i: string) => !i)) && (
            <div className="mt-8 flex flex-col items-center gap-2 opacity-40">
              <ImageIcon className="h-10 w-10" />
              <p className="text-sm">Galeri foto</p>
            </div>
          )}
        </section>
      )

    case 'image':
      return props.src ? (
        <section className="px-6 py-8 text-center" style={{ fontFamily: font }}>
          <img src={props.src} alt={props.alt || ''} className="mx-auto max-h-96 w-auto rounded-lg object-cover shadow-md" style={{ borderRadius: props.borderRadius || 0 }} />
          {props.caption && <p className="mt-2 text-xs opacity-60">{props.caption}</p>}
        </section>
      ) : null

    case 'text':
      return (
        <section className="px-6 py-12 text-center" style={{ fontFamily: font }}>
          <p style={{ fontSize: props.fontSize || 16, color: props.color, textAlign: props.alignment || 'center', fontWeight: props.fontWeight, lineHeight: props.lineHeight }}>{props.content}</p>
        </section>
      )

    case 'divider':
      return (
        <section className="px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <span style={{ width: props.width || 60, height: props.thickness || 2, background: props.color || primary, display: 'inline-block' }} />
            {props.icon === 'heart' && <Heart className="h-4 w-4" style={{ color: props.color || primary }} fill={props.color || primary} />}
            {props.icon === 'minus' && <Minus className="h-4 w-4" style={{ color: props.color || primary }} />}
            <span style={{ width: props.width || 60, height: props.thickness || 2, background: props.color || primary, display: 'inline-block' }} />
          </div>
        </section>
      )

    case 'countdown':
      return (
        <section className="px-6 py-16 text-center" style={{ background: secondary, fontFamily: font }}>
          <h2 className="font-serif text-2xl font-bold" style={{ color: primary }}>Hitung Mundur</h2>
          <div className="mt-6 flex justify-center gap-4">
            {['Hari', 'Jam', 'Menit', 'Detik'].map((label) => (
              <div key={label} className="flex flex-col items-center rounded-xl bg-white/60 px-4 py-3 shadow-sm min-w-[64px]">
                <span className="text-2xl font-bold" style={{ color: primary }}>00</span>
                <span className="text-[10px] opacity-60">{label}</span>
              </div>
            ))}
          </div>
        </section>
      )

    case 'music':
      return props.url ? (
        <section className="px-6 py-8 text-center">
          <div className="mx-auto flex max-w-xs items-center gap-3 rounded-xl border p-3 shadow-sm">
            <Music className="h-5 w-5" style={{ color: primary }} />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Music Player</p>
              <p className="text-[10px] opacity-60">Klik untuk putar</p>
            </div>
            <Play className="h-4 w-4" style={{ color: primary }} />
          </div>
        </section>
      ) : null

    case 'video':
      return props.url ? (
        <section className="px-6 py-8 text-center">
          <video src={props.url} controls={props.controls} autoPlay={props.autoplay} loop={props.loop} muted={props.muted} className="mx-auto max-h-80 w-full rounded-lg shadow-md" />
        </section>
      ) : null

    case 'button':
      return (
        <section className="px-6 py-4 text-center" style={{ fontFamily: font }}>
          <a href={props.url} target="_blank" rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors ${props.fullWidth ? 'w-full max-w-xs' : ''}`}
            style={{ background: props.variant === 'primary' ? primary : 'transparent', color: props.variant === 'primary' ? '#fff' : primary, border: props.variant === 'primary' ? 'none' : `1px solid ${primary}`, borderRadius: props.borderRadius || 8 }}>
            {props.label || 'Tombol'}
          </a>
        </section>
      )

    case 'map':
      return (
        <section className="px-6 py-12 text-center" style={{ fontFamily: font }}>
          <h2 className="font-serif text-xl font-bold mb-4" style={{ color: primary }}>{props.title || 'Lokasi'}</h2>
          <div className="mx-auto h-48 max-w-sm rounded-lg bg-muted flex items-center justify-center text-sm opacity-60">
            <MapPin className="h-6 w-6 mr-2" /> Maps Embed
          </div>
        </section>
      )

    case 'rsvp':
      return (
        <section className="px-6 py-16 text-center" style={{ background: secondary, fontFamily: font }}>
          <h2 className="font-serif text-2xl font-bold" style={{ color: primary }}>{props.title || 'Konfirmasi Kehadiran'}</h2>
          <div className="mx-auto mt-6 max-w-sm rounded-xl bg-white/60 p-6 shadow-sm">
            <div className="flex items-center gap-2 rounded-lg border p-3 text-sm opacity-60">
              <CheckSquare className="h-4 w-4" />
              Form RSVP
            </div>
          </div>
        </section>
      )

    case 'section':
      return (
        <section className="px-6 py-12 text-center" style={{ background: props.backgroundColor || 'transparent', fontFamily: font }}>
          {props.showTitle && props.title && <h2 className="font-serif text-xl font-bold mb-6" style={{ color: primary }}>{props.title}</h2>}
          <div className="text-sm opacity-40">Section container</div>
        </section>
      )

    default:
      return null
  }
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

  let colors: Record<string, string> = { primaryColor: '#D4A574', secondaryColor: '#F5E6D3' }
  try { colors = JSON.parse(theme.defaultColors || '{}') } catch {}

  const primary = colors.primaryColor || '#D4A574'
  const secondary = colors.secondaryColor || '#F5E6D3'

  let components: ThemeComponent[] = []
  try { components = JSON.parse(theme.sectionsConfig || '[]') } catch {}
  const visibleComponents = components.filter((c) => c.visible).sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen" style={{ background: secondary, color: primary }}>
      <Link to="/templates" className="fixed top-4 left-4 z-50 flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur" style={{ color: primary }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali
      </Link>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur" style={{ color: primary }}>
        {theme.name}
      </div>

      {visibleComponents.length > 0 ? (
        visibleComponents.map((comp) => (
          <ComponentRenderer key={comp.id} comp={comp} primary={primary} secondary={secondary} />
        ))
      ) : (
        <>
          {/* Fallback hardcoded demo */}
          <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, ${primary} 0%, transparent 70%)` }} />
            </div>
            <div className="relative z-10 space-y-6">
              <Heart className="mx-auto h-8 w-8" fill={primary} />
              <div>
                <p className="text-sm tracking-widest uppercase opacity-60">The Wedding of</p>
                <h1 className="mt-2 font-serif text-4xl font-bold leading-tight">Andi</h1>
                <p className="my-3 font-serif text-2xl">&</p>
                <h1 className="font-serif text-4xl font-bold leading-tight">Siti</h1>
              </div>
              <p className="text-sm opacity-80">17 Agustus 2026</p>
              <ChevronDown className="mx-auto mt-8 h-6 w-6 animate-bounce opacity-60" />
            </div>
          </section>
          <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center bg-white/30">
            <div className="max-w-sm space-y-8">
              <h2 className="font-serif text-2xl font-bold">Kami Berdua</h2>
              <div className="space-y-2"><p className="text-xl font-bold">Andi Pratama</p><p className="text-sm opacity-70">Putra dari Bpk. Ahmad & Ibu Siti</p></div>
              <p className="font-serif text-xl">&</p>
              <div className="space-y-2"><p className="text-xl font-bold">Siti Nurhaliza</p><p className="text-sm opacity-70">Putri dari Bpk. Budi & Ibu Dewi</p></div>
            </div>
          </section>
        </>
      )}

      <footer className="py-8 text-center text-sm opacity-60">
        <Heart className="mx-auto h-4 w-4 mb-2" fill={primary} />
        <p className="font-serif">Terima kasih atas doa & restu</p>
        <p className="mt-1 text-xs">&copy; WeddingInvite · Demo Template</p>
      </footer>
    </div>
  )
}
