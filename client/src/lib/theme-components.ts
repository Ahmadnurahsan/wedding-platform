import { Type, Image, Video, MousePointerClick, Minus, Timer, Images, MapPin, ClipboardList, Music, Layout, Type as TypeIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ComponentType =
  | 'cover'
  | 'couple'
  | 'event'
  | 'countdown'
  | 'text'
  | 'image'
  | 'divider'
  | 'gallery'
  | 'map'
  | 'rsvp'
  | 'music'
  | 'video'
  | 'button'
  | 'section'

export interface ThemeComponent {
  id: string
  type: ComponentType
  props: Record<string, any>
  order: number
  visible: boolean
  parentId: string | null
}

export interface ComponentDefinition {
  type: ComponentType
  label: string
  icon: LucideIcon
  defaultProps: Record<string, any>
  category: 'content' | 'media' | 'interactive' | 'layout'
  description: string
}

export const componentLibrary: ComponentDefinition[] = [
  {
    type: 'cover',
    label: 'Cover',
    icon: TypeIcon,
    category: 'content',
    description: 'Halaman sampul dengan foto dan pesan pembuka',
    defaultProps: {
      image: '',
      title: 'Undangan Pernikahan',
      subtitle: 'Kepada Yth. Bapak/Ibu/Saudara/i',
      overlay: true,
      overlayOpacity: 40,
      height: 100,
    },
  },
  {
    type: 'couple',
    label: 'Mempelai',
    icon: Type,
    category: 'content',
    description: 'Nama dan info kedua mempelai',
    defaultProps: {
      groomName: 'Ahmad',
      groomNickname: 'Ahmad',
      groomParent: 'Bpk. Abdullah & Ibu Aminah',
      brideName: 'Siti',
      brideNickname: 'Siti',
      brideParent: 'Bpk. Rahmat & Ibu Fatimah',
      showPhoto: true,
      groomPhoto: '',
      bridePhoto: '',
      layout: 'horizontal',
    },
  },
  {
    type: 'event',
    label: 'Acara',
    icon: Timer,
    category: 'content',
    description: 'Detail tanggal, waktu, dan lokasi acara',
    defaultProps: {
      title: 'Akad Nikah',
      date: '2025-12-25',
      timeStart: '09:00',
      timeEnd: '11:00',
      locationName: 'Gedung Serbaguna',
      address: 'Jl. Merdeka No. 123, Jakarta',
      mapsUrl: '',
    },
  },
  {
    type: 'countdown',
    label: 'Countdown',
    icon: Timer,
    category: 'content',
    description: 'Hitung mundur menuju hari H',
    defaultProps: {
      targetDate: '2025-12-25T09:00:00',
      daysLabel: 'Hari',
      hoursLabel: 'Jam',
      minutesLabel: 'Menit',
      secondsLabel: 'Detik',
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
    },
  },
  {
    type: 'text',
    label: 'Teks',
    icon: Type,
    category: 'content',
    description: 'Teks bebas, bisa untuk ayat, quotes, atau pesan',
    defaultProps: {
      content: 'Tulis teks di sini...',
      fontSize: 16,
      fontFamily: 'serif',
      color: '#1a1a1a',
      alignment: 'center',
      fontWeight: 'normal',
      lineHeight: 1.6,
    },
  },
  {
    type: 'image',
    label: 'Gambar',
    icon: Image,
    category: 'media',
    description: 'Upload atau URL gambar',
    defaultProps: {
      src: '',
      alt: '',
      borderRadius: 0,
      aspectRatio: 'auto',
      fit: 'cover',
      caption: '',
    },
  },
  {
    type: 'video',
    label: 'Video',
    icon: Video,
    category: 'media',
    description: 'Video dari YouTube atau file upload',
    defaultProps: {
      url: '',
      autoplay: false,
      loop: false,
      muted: true,
      controls: true,
    },
  },
  {
    type: 'gallery',
    label: 'Galeri',
    icon: Images,
    category: 'media',
    description: 'Kumpulan foto momen spesial',
    defaultProps: {
      images: ['', '', ''],
      columns: 2,
      gap: 8,
      borderRadius: 8,
    },
  },
  {
    type: 'divider',
    label: 'Pemisah',
    icon: Minus,
    category: 'layout',
    description: 'Garis pemisah antar section',
    defaultProps: {
      style: 'solid',
      color: '#d4a574',
      width: 60,
      thickness: 2,
      icon: 'heart',
    },
  },
  {
    type: 'button',
    label: 'Tombol',
    icon: MousePointerClick,
    category: 'interactive',
    description: 'Tombol dengan link (RSVP, WA, Maps)',
    defaultProps: {
      label: 'Klik Disini',
      variant: 'primary',
      url: '',
      icon: '',
      fullWidth: false,
      borderRadius: 8,
    },
  },
  {
    type: 'map',
    label: 'Lokasi',
    icon: MapPin,
    category: 'interactive',
    description: 'Embed peta lokasi acara',
    defaultProps: {
      latitude: -6.2088,
      longitude: 106.8456,
      zoom: 15,
      title: 'Lokasi Acara',
    },
  },
  {
    type: 'rsvp',
    label: 'RSVP',
    icon: ClipboardList,
    category: 'interactive',
    description: 'Form konfirmasi kehadiran',
    defaultProps: {
      title: 'Konfirmasi Kehadiran',
      submitLabel: 'Kirim',
      showPlusOne: true,
      showNote: true,
      required: true,
    },
  },
  {
    type: 'music',
    label: 'Musik',
    icon: Music,
    category: 'media',
    description: 'Pemutar musik latar',
    defaultProps: {
      url: '',
      autoplay: true,
      loop: true,
      showPlayer: true,
      icon: 'music',
    },
  },
  {
    type: 'section',
    label: 'Section',
    icon: Layout,
    category: 'layout',
    description: 'Wadah untuk mengelompokkan komponen',
    defaultProps: {
      title: '',
      padding: 24,
      backgroundColor: 'transparent',
      showTitle: false,
    },
  },
]

export const componentDefault = (type: ComponentType): ThemeComponent => ({
  id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  type,
  props: { ...componentLibrary.find(c => c.type === type)?.defaultProps },
  order: 0,
  visible: true,
  parentId: null,
})

export function renderComponentPreview(type: ComponentType, props: Record<string, any>): string {
  const def = componentLibrary.find(c => c.type === type)
  return `${def?.label || type}: ${JSON.stringify(props).slice(0, 50)}...`
}
