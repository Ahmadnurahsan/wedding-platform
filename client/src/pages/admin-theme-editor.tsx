import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Button } from '../components/ui/button'
import {
  ArrowLeft, Save, Eye, GripVertical, Trash2, EyeOff, Plus, Smartphone,
  Moon, Sun, Palette, ChevronRight, ChevronLeft,
  X,
} from 'lucide-react'
import { componentLibrary, type ThemeComponent, type ComponentType, componentDefault } from '../lib/theme-components'
import { cn } from '../lib/utils'
import { toast } from 'sonner'

/* ─── Canvas Component Renderers ─── */

function ComponentPreview({ component }: { component: ThemeComponent }) {
  const { type, props } = component
  const base = 'w-full px-4 py-3 transition-all'

  switch (type) {
    case 'cover':
      return (
        <div className={cn(base, 'relative min-h-[200px] flex flex-col items-center justify-center text-center bg-gradient-to-b from-primary/20 to-primary/5 rounded-lg overflow-hidden')}>
          {props.image && (
            <img src={props.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="relative z-10 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{props.title || 'UNDANGAN'}</p>
            <p className="text-sm font-bold text-foreground">{props.subtitle || 'Kepada Yth.'}</p>
          </div>
        </div>
      )
    case 'couple':
      return (
        <div className={cn(base, 'text-center space-y-2')}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Mempelai</p>
          <p className="text-sm font-bold">{props.groomName || 'Ahmad'}</p>
          <p className="text-xs text-muted-foreground">&</p>
          <p className="text-sm font-bold">{props.brideName || 'Siti'}</p>
        </div>
      )
    case 'event':
      return (
        <div className={cn(base, 'text-center space-y-1')}>
          <p className="text-xs font-semibold">{props.title || 'Acara'}</p>
          <p className="text-sm">{props.date || '25 Desember 2025'}</p>
          <p className="text-xs text-muted-foreground">{props.timeStart || '09:00'} - {props.timeEnd || '11:00'}</p>
          <p className="text-xs text-muted-foreground">{props.locationName || 'Lokasi'}</p>
        </div>
      )
    case 'countdown':
      return (
        <div className={cn(base, 'flex justify-center gap-3 text-center')}>
          {props.showDays && <div className="flex flex-col"><span className="text-lg font-bold">99</span><span className="text-[10px] text-muted-foreground">{props.daysLabel || 'Hari'}</span></div>}
          {props.showHours && <div className="flex flex-col"><span className="text-lg font-bold">23</span><span className="text-[10px] text-muted-foreground">{props.hoursLabel || 'Jam'}</span></div>}
          {props.showMinutes && <div className="flex flex-col"><span className="text-lg font-bold">59</span><span className="text-[10px] text-muted-foreground">{props.minutesLabel || 'Menit'}</span></div>}
          {props.showSeconds && <div className="flex flex-col"><span className="text-lg font-bold">59</span><span className="text-[10px] text-muted-foreground">{props.secondsLabel || 'Detik'}</span></div>}
        </div>
      )
    case 'text':
      return (
        <div className={cn(base, 'text-center')}>
          <p className="text-sm" style={{ fontSize: props.fontSize || 16 }}>{props.content || 'Teks'}</p>
        </div>
      )
    case 'image':
      return (
        <div className={cn(base, 'flex justify-center')}>
          <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-center">
            {props.src ? <img src={props.src} alt="" className="w-full h-full object-cover rounded-lg" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
          </div>
        </div>
      )
    case 'divider':
      return (
        <div className={cn(base, 'flex justify-center')}>
          <div className="w-1/2 h-px" style={{ borderTop: `${props.thickness || 1}px ${props.style || 'solid'} ${props.color || '#d4a574'}` }} />
        </div>
      )
    case 'button':
      return (
        <div className={cn(base, 'flex justify-center')}>
          <div className="px-4 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg">{props.label || 'Tombol'}</div>
        </div>
      )
    case 'gallery':
      return (
        <div className={cn(base, 'grid grid-cols-2 gap-1')}>
          {[1, 2, 3, 4].slice(0, (props.images || []).length || 3).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded" />
          ))}
        </div>
      )
    case 'map':
      return (
        <div className={cn(base, 'h-20 bg-muted rounded-lg flex items-center justify-center')}>
          <MapPinIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      )
    case 'rsvp':
      return (
        <div className={cn(base, 'text-center space-y-2')}>
          <p className="text-xs font-semibold">{props.title || 'Konfirmasi Kehadiran'}</p>
          <div className="h-6 bg-muted rounded w-3/4 mx-auto" />
          <div className="h-6 bg-muted rounded w-1/2 mx-auto" />
        </div>
      )
    case 'music':
      return (
        <div className={cn(base, 'flex justify-center')}>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs">
            <MusicIcon className="h-3.5 w-3.5" /> Musik Latar
          </div>
        </div>
      )
    case 'video':
      return (
        <div className={cn(base, 'h-24 bg-muted rounded-lg flex items-center justify-center')}>
          <VideoIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      )
    case 'section':
      return (
        <div className={cn(base, 'border border-dashed border-border/60 rounded-lg py-2')} style={{ backgroundColor: props.backgroundColor || 'transparent' }}>
          {props.showTitle && <p className="text-xs text-center text-muted-foreground mb-1">{props.title || 'Section'}</p>}
          <div className="text-[10px] text-muted-foreground text-center">Drop components here</div>
        </div>
      )
    default:
      return <div className={cn(base, 'text-xs text-muted-foreground text-center')}>{type}</div>
  }
}

function ImageIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
}
function MapPinIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
}
function MusicIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>
}
function VideoIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9.75a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
}

/* ─── Properties Editor ─── */

function PropertiesPanel({
  component,
  onUpdate,
  onClose,
}: {
  component: ThemeComponent
  onUpdate: (props: Record<string, any>) => void
  onClose: () => void
}) {
  const { type, props } = component
  const def = componentLibrary.find(c => c.type === type)
  if (!def) return null

  const renderField = (key: string, value: any) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())

    if (typeof value === 'boolean') {
      return (
        <label key={key} className="flex items-center justify-between py-1.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          <button
            onClick={() => onUpdate({ ...props, [key]: !value })}
            className={cn(
              'relative h-5 w-9 rounded-full transition-colors',
              value ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span className={cn(
              'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm',
              value && 'translate-x-4'
            )} />
          </button>
        </label>
      )
    }

    if (typeof value === 'number') {
      return (
        <div key={key} className="py-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium">{value}</span>
          </div>
          <input
            type="range"
            min={key === 'fontSize' ? 10 : key === 'opacity' ? 0 : 0}
            max={key === 'fontSize' ? 48 : key === 'opacity' ? 100 : key === 'columns' ? 4 : 200}
            value={value}
            onChange={e => onUpdate({ ...props, [key]: Number(e.target.value) })}
            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
      )
    }

    if (key === 'color' || key.toLowerCase().includes('color')) {
      return (
        <div key={key} className="py-1.5">
          <span className="text-xs text-muted-foreground block mb-1">{label}</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={e => onUpdate({ ...props, [key]: e.target.value })}
              className="h-8 w-8 rounded cursor-pointer border-0 p-0"
            />
            <input
              type="text"
              value={value || ''}
              onChange={e => onUpdate({ ...props, [key]: e.target.value })}
              className="flex-1 h-8 text-xs px-2 rounded border border-border/50 bg-transparent"
            />
          </div>
        </div>
      )
    }

    if (key === 'alignment') {
      return (
        <div key={key} className="py-1.5">
          <span className="text-xs text-muted-foreground block mb-1">{label}</span>
          <div className="flex gap-1">
            {['left', 'center', 'right'].map(align => (
              <button
                key={align}
                onClick={() => onUpdate({ ...props, [key]: align })}
                className={cn(
                  'flex-1 h-7 text-xs rounded border transition-colors',
                  value === align ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 text-muted-foreground hover:border-border'
                )}
              >
                {align === 'left' ? '≡' : align === 'center' ? '≡' : '≡'}
              </button>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div key={key} className="py-1.5">
        <span className="text-xs text-muted-foreground block mb-1">{label}</span>
        <input
          type={key === 'url' || key === 'src' ? 'url' : 'text'}
          value={value || ''}
          onChange={e => onUpdate({ ...props, [key]: e.target.value })}
          placeholder={key}
          className="w-full h-8 text-xs px-2 rounded border border-border/50 bg-transparent placeholder:text-muted-foreground/40"
        />
      </div>
    )
  }

  const Icon = def.icon

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
            <Icon className="h-3 w-3 text-primary" />
          </div>
          <span className="text-sm font-semibold">{def.label}</span>
        </div>
        <button onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5">
        {Object.entries(def.defaultProps).map(([key, value]) => {
          const currentValue = props[key] ?? value
          return renderField(key, currentValue)
        })}
      </div>
    </div>
  )
}

/* ─── Theme Editor Page ─── */

export function AdminThemeEditorPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])
  const queryClient = useQueryClient()
  const [components, setComponents] = useState<ThemeComponent[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'light' | 'dark'>('light')
  const [isDirty, setIsDirty] = useState(false)
  const [leftPanel, setLeftPanel] = useState<'palette' | 'none'>('palette')
  const [rightPanel, setRightPanel] = useState<'properties' | 'none'>('properties')

  const { data: theme, isLoading } = useQuery<any>({
    queryKey: ['theme-editor', id],
    queryFn: () => api.get(`/themes/${id}`),
    enabled: !!id,
  })

  useEffect(() => {
    if (theme?.sectionsConfig) {
      try {
        const parsed = JSON.parse(theme.sectionsConfig)
        if (Array.isArray(parsed)) setComponents(parsed)
      } catch { /* ignore */ }
    } else if (theme && !theme.sectionsConfig) {
      setComponents([])
    }
  }, [theme])

  const saveMutation = useMutation({
    mutationFn: (comps: ThemeComponent[]) =>
      api.put(`/admin/themes/${id}`, { sectionsConfig: JSON.stringify(comps) }),
    onSuccess: () => {
      setIsDirty(false)
      queryClient.invalidateQueries({ queryKey: ['theme-editor', id] })
      toast.success('Theme saved')
    },
    onError: () => toast.error('Failed to save theme'),
  })

  const addComponent = useCallback((type: ComponentType) => {
    const comp = componentDefault(type)
    comp.order = components.length
    setComponents(prev => [...prev, comp])
    setSelectedId(comp.id)
    setIsDirty(true)
  }, [components])

  const updateComponent = useCallback((compId: string, props: Record<string, any>) => {
    setComponents(prev => prev.map(c => c.id === compId ? { ...c, props } : c))
    setIsDirty(true)
  }, [])

  const removeComponent = useCallback((compId: string) => {
    setComponents(prev => prev.filter(c => c.id !== compId))
    if (selectedId === compId) setSelectedId(null)
    setIsDirty(true)
  }, [selectedId])

  const toggleVisibility = useCallback((compId: string) => {
    setComponents(prev => prev.map(c => c.id === compId ? { ...c, visible: !c.visible } : c))
    setIsDirty(true)
  }, [])

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(components)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setComponents(items.map((c, i) => ({ ...c, order: i })))
    setIsDirty(true)
  }, [components])

  const selectedComponent = components.find(c => c.id === selectedId)
  const visibleComponents = components.filter(c => c.visible)

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-2rem)] lg:h-[calc(100dvh-3rem)] rounded-xl border border-border/50 overflow-hidden bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/30 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-border/50" />
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
              <Palette className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm font-semibold">{theme?.name || 'Theme Editor'}</span>
          </div>
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded font-medium',
            isDirty ? 'bg-yellow-100 text-yellow-600' : 'bg-green-50 text-green-600'
          )}>
            {isDirty ? 'Unsaved' : 'Saved'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode(viewMode === 'light' ? 'dark' : 'light')}
            className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {viewMode === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </button>
          <div className="h-4 w-px bg-border/50" />
          <Button
            size="sm"
            variant="ghost"
            className="text-xs gap-1.5 h-7"
            onClick={() => {
              const sorted = [...components].sort((a, b) => a.order - b.order)
              saveMutation.mutate(sorted)
            }}
            disabled={!isDirty || saveMutation.isPending}
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Button size="sm" className="text-xs gap-1.5 h-7" onClick={() => toast.info('Preview coming soon')}>
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Component Palette */}
        <div className={cn(
          'hidden lg:flex lg:w-56 xl:w-64 flex-col border-r border-border/50 bg-muted/20 shrink-0',
          leftPanel === 'palette' ? 'flex' : 'hidden',
          'lg:flex'
        )}>
          <div className="px-3 py-2.5 border-b border-border/50">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Components</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {componentLibrary.map((comp) => {
              const Icon = comp.icon
              return (
                <button
                  key={comp.type}
                  onClick={() => addComponent(comp.type)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs hover:bg-muted hover:text-foreground text-muted-foreground transition-colors group cursor-grab active:cursor-grabbing"
                  title={comp.description}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-background border border-border/50 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{comp.label}</div>
                    <div className="text-[10px] text-muted-foreground/60 truncate">{comp.description}</div>
                  </div>
                  <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Mobile: Bottom Sheet / Sidebar Toggle */}
        <div className="lg:hidden fixed bottom-20 left-2 z-50 flex flex-col gap-1">
          <button
            onClick={() => setLeftPanel(leftPanel === 'palette' ? 'none' : 'palette')}
            className={cn(
              'h-9 w-9 flex items-center justify-center rounded-full shadow-lg border border-border/50 transition-colors',
              leftPanel === 'palette' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'
            )}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setRightPanel(rightPanel === 'properties' ? 'none' : 'properties')}
            className={cn(
              'h-9 w-9 flex items-center justify-center rounded-full shadow-lg border border-border/50 transition-colors',
              rightPanel === 'properties' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 flex items-start justify-center overflow-y-auto p-4 lg:p-6 bg-muted/50">
          <div className={cn(
            'w-full max-w-sm rounded-2xl border border-border/50 shadow-xl overflow-hidden transition-colors',
            viewMode === 'dark' ? 'bg-gray-950 text-white' : 'bg-white text-foreground'
          )}>
            {/* Mobile Frame Header */}
            <div className="flex items-center justify-center gap-2 px-4 py-2 border-b border-border/30 bg-muted/20">
              <Smartphone className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-[10px] text-muted-foreground/60 font-medium">375 × 812</span>
            </div>

            {/* Components */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="canvas">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'min-h-[500px] transition-colors',
                      snapshot.isDraggingOver && 'bg-primary/5'
                    )}
                  >
                    {visibleComponents.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                          <Plus className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Belum ada komponen</p>
                        <p className="text-xs text-muted-foreground/60">Klik komponen dari panel sebelah kiri untuk memulai</p>
                      </div>
                    )}
                    {visibleComponents.map((comp, index) => (
                      <Draggable key={comp.id} draggableId={comp.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              'relative group border-b border-border/20 transition-colors',
                              snapshot.isDragging && 'shadow-lg z-50',
                              selectedId === comp.id && 'ring-2 ring-primary ring-inset'
                            )}
                            onClick={() => setSelectedId(comp.id)}
                          >
                            {/* Drag Handle + Actions */}
                            <div className={cn(
                              'absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10',
                              snapshot.isDragging && 'opacity-100'
                            )}>
                              <div
                                {...provided.dragHandleProps}
                                className="h-6 w-6 flex items-center justify-center rounded bg-background border border-border/50 shadow-sm cursor-grab active:cursor-grabbing hover:bg-muted transition-colors"
                              >
                                <GripVertical className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleVisibility(comp.id) }}
                                className="h-6 w-6 flex items-center justify-center rounded bg-background border border-border/50 shadow-sm hover:bg-muted transition-colors"
                              >
                                <EyeOff className="h-3 w-3 text-muted-foreground" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeComponent(comp.id) }}
                                className="h-6 w-6 flex items-center justify-center rounded bg-background border border-border/50 shadow-sm hover:bg-destructive/10 hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                            <ComponentPreview component={comp} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Right: Properties Panel */}
        <div className={cn(
          'hidden lg:flex lg:w-56 xl:w-64 flex-col border-l border-border/50 bg-muted/20 shrink-0',
          rightPanel === 'properties' ? 'flex' : 'hidden',
          'lg:flex'
        )}>
          {selectedComponent ? (
            <PropertiesPanel
              component={selectedComponent}
              onUpdate={(props) => updateComponent(selectedComponent.id, props)}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-2">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Klik komponen di canvas untuk mengedit properti</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Left Panel Drawer */}
      {leftPanel === 'palette' && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setLeftPanel('none')} />
          <div className="absolute left-0 bottom-16 w-64 max-w-[80vw] top-0 bg-background border-r border-border/50 shadow-2xl slide-in-from-left overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-3 border-b border-border/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Components</span>
              <button onClick={() => setLeftPanel('none')} className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {componentLibrary.map((comp) => {
                const Icon = comp.icon
                return (
                  <button
                    key={comp.type}
                    onClick={() => { addComponent(comp.type); setLeftPanel('none') }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-background border border-border/50">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium">{comp.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Right Panel Drawer */}
      {rightPanel === 'properties' && selectedComponent && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRightPanel('none')} />
          <div className="absolute right-0 bottom-16 w-72 max-w-[85vw] top-0 bg-background border-l border-border/50 shadow-2xl slide-in-from-right overflow-y-auto">
            <PropertiesPanel
              component={selectedComponent}
              onUpdate={(props) => updateComponent(selectedComponent.id, props)}
              onClose={() => { setSelectedId(null); setRightPanel('none') }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
