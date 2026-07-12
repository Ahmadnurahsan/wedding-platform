import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Save, ArrowLeft, Palette, Type, Music, Image, Globe, GlobeOff, Users, Trash2, MapPin, MessageCircle, Check, Heart, CornerDownLeft } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { FileUpload } from '../components/file-upload'
import { toast } from 'sonner'

interface Invitation {
  id: string
  slug: string
  title: string | null
  status: string
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
  media: { id: string; type: string; url: string; caption: string | null; orderIndex: number }[]
  wishes: { id: string; name: string; message: string; reply: string | null; likes: number; isApproved: boolean; createdAt: string }[]
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: invitation, isLoading } = useQuery<Invitation>({
    queryKey: ['invitation', id],
    queryFn: () => api.get(`/invitations/${id}`),
    enabled: !!id,
  })

  const [form, setForm] = useState<Record<string, any>>({})
  const [eventsForm, setEventsForm] = useState<Record<string, any>>({})

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/invitations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitation', id] })
      toast.success('Tersimpan!')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Gagal menyimpan'),
  })

  const publishMutation = useMutation({
    mutationFn: (status: string) => api.put(`/invitations/${id}`, { status }),
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ['invitation', id] })
      toast.success(status === 'published' ? 'Undangan ditayangkan!' : 'Undangan diarsipkan')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Gagal'),
  })

  const saveEventsMutation = useMutation({
    mutationFn: (events: any[]) => api.put(`/invitations/${id}/events`, { events }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitation', id] })
      toast.success('Acara tersimpan!')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Gagal menyimpan acara'),
  })

  const deleteMediaMutation = useMutation({
    mutationFn: (mediaId: string) => api.delete(`/invitations/${id}/media/${mediaId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitation', id] })
      toast.success('Media dihapus')
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!invitation) {
    return <p className="text-center text-muted-foreground py-8">Undangan tidak ditemukan</p>
  }

  const handleSave = () => updateMutation.mutate(form)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold truncate max-w-[140px] text-sm">{invitation.title || invitation.slug}</h1>
              <Badge variant={invitation.status === 'published' ? 'success' : 'outline'} className="text-[10px] shrink-0">
                {invitation.status === 'published' ? 'Tayang' : 'Draft'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">/{invitation.slug}</p>
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
            <Link to={`/invitations/${invitation.id}/guests`}>
              <Users className="mr-1 h-3 w-3" /> Tamu
            </Link>
          </Button>
          {invitation.status === 'published' ? (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => publishMutation.mutate('draft')}>
              <GlobeOff className="mr-1 h-3 w-3" /> Archive
            </Button>
          ) : (
            <Button size="sm" className="h-8 text-xs" onClick={() => publishMutation.mutate('published')}>
              <Globe className="mr-1 h-3 w-3" /> Tayang
            </Button>
          )}
          <Button size="sm" className="h-8 text-xs" onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="mr-1 h-3 w-3" />
            {updateMutation.isPending ? '...' : 'Simpan'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content">
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="w-full">
            <TabsTrigger value="content" className="flex-1 text-xs"><Type className="mr-1 h-3.5 w-3.5" /> Konten</TabsTrigger>
            <TabsTrigger value="events" className="flex-1 text-xs"><Image className="mr-1 h-3.5 w-3.5" /> Acara</TabsTrigger>
            <TabsTrigger value="gallery" className="flex-1 text-xs"><Image className="mr-1 h-3.5 w-3.5" /> Galeri</TabsTrigger>
            <TabsTrigger value="style" className="flex-1 text-xs"><Palette className="mr-1 h-3.5 w-3.5" /> Tema</TabsTrigger>
            <TabsTrigger value="music" className="flex-1 text-xs"><Music className="mr-1 h-3.5 w-3.5" /> Musik</TabsTrigger>
            <TabsTrigger value="wishes" className="flex-1 text-xs"><MessageCircle className="mr-1 h-3.5 w-3.5" /> Ucapan</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="content" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Mempelai</CardTitle>
              <p className="text-xs text-muted-foreground">Informasi kedua mempelai yang akan ditampilkan di undangan</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nama Pria</Label>
                  <Input placeholder="Andi" value={form.groomName ?? invitation.groomName ?? ''} onChange={(e) => setForm({ ...form, groomName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Panggilan</Label>
                  <Input placeholder="Andi" value={form.groomNickname ?? invitation.groomNickname ?? ''} onChange={(e) => setForm({ ...form, groomNickname: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Putra dari</Label>
                <Input placeholder="Bpk. Ahmad & Ibu Siti" value={form.groomParent ?? invitation.groomParent ?? ''} onChange={(e) => setForm({ ...form, groomParent: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nama Wanita</Label>
                  <Input placeholder="Siti" value={form.brideName ?? invitation.brideName ?? ''} onChange={(e) => setForm({ ...form, brideName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Panggilan</Label>
                  <Input placeholder="Siti" value={form.brideNickname ?? invitation.brideNickname ?? ''} onChange={(e) => setForm({ ...form, brideNickname: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Putri dari</Label>
                <Input placeholder="Bpk. Budi & Ibu Dewi" value={form.brideParent ?? invitation.brideParent ?? ''} onChange={(e) => setForm({ ...form, brideParent: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cover Page</CardTitle>
              <p className="text-xs text-muted-foreground">Halaman sampul sebelum masuk ke undangan</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Tampilkan Cover Page</Label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.coverEnabled ?? invitation.coverEnabled ?? true}
                  onClick={() => setForm({ ...form, coverEnabled: !(form.coverEnabled ?? invitation.coverEnabled ?? true) })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${(form.coverEnabled ?? invitation.coverEnabled ?? true) ? 'bg-primary' : 'bg-input'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${(form.coverEnabled ?? invitation.coverEnabled ?? true) ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                </button>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Pesan Cover (opsional)</Label>
                <Input placeholder="Kepada Yth. Bapak/Ibu/Saudara/i" value={form.coverMessage ?? invitation.coverMessage ?? ''} onChange={(e) => setForm({ ...form, coverMessage: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4 mt-6">
          {invitation.events.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Belum ada acara.</p>
              </CardContent>
            </Card>
          ) : (
            invitation.events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="text-base">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tanggal</Label>
                    <Input
                      type="date"
                      value={eventsForm[`${event.id}_date`] ?? event.date ?? ''}
                      onChange={(e) => setEventsForm({ ...eventsForm, [`${event.id}_date`]: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Mulai</Label>
                      <Input
                        type="time"
                        value={eventsForm[`${event.id}_timeStart`] ?? event.timeStart ?? ''}
                        onChange={(e) => setEventsForm({ ...eventsForm, [`${event.id}_timeStart`]: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Selesai</Label>
                      <Input
                        type="time"
                        value={eventsForm[`${event.id}_timeEnd`] ?? event.timeEnd ?? ''}
                        onChange={(e) => setEventsForm({ ...eventsForm, [`${event.id}_timeEnd`]: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Lokasi</Label>
                    <Input
                      placeholder="Nama gedung / venue"
                      value={eventsForm[`${event.id}_location`] ?? event.locationName ?? ''}
                      onChange={(e) => setEventsForm({ ...eventsForm, [`${event.id}_location`]: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Alamat</Label>
                    <Textarea
                      placeholder="Alamat lengkap venue"
                      value={eventsForm[`${event.id}_address`] ?? event.address ?? ''}
                      onChange={(e) => setEventsForm({ ...eventsForm, [`${event.id}_address`]: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Google Maps URL</Label>
                    <Input
                      placeholder="https://maps.google.com/..."
                      value={eventsForm[`${event.id}_maps`] ?? event.mapsUrl ?? ''}
                      onChange={(e) => setEventsForm({ ...eventsForm, [`${event.id}_maps`]: e.target.value })}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      const updated = invitation.events.map((ev) => {
                        if (ev.id !== event.id) return ev
                        return {
                          ...ev,
                          date: eventsForm[`${event.id}_date`] ?? ev.date,
                          timeStart: eventsForm[`${event.id}_timeStart`] ?? ev.timeStart,
                          timeEnd: eventsForm[`${event.id}_timeEnd`] ?? ev.timeEnd,
                          locationName: eventsForm[`${event.id}_location`] ?? ev.locationName,
                          address: eventsForm[`${event.id}_address`] ?? ev.address,
                          mapsUrl: eventsForm[`${event.id}_maps`] ?? ev.mapsUrl,
                        }
                      })
                      saveEventsMutation.mutate(updated)
                    }}
                  >
                    <MapPin className="mr-1 h-3 w-3" /> Simpan Acara
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Foto & Video</CardTitle>
              <p className="text-xs text-muted-foreground">Upload foto prewedding atau momen spesial</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload accept="image/*" multiple onUpload={() => {
                queryClient.invalidateQueries({ queryKey: ['invitation', id] })
                toast.success('Foto diupload!')
              }} />
              {invitation.media.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {invitation.media.map((m) => (
                    <div key={m.id} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
                      <img src={m.url} alt="" className="h-full w-full object-cover" />
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        className="absolute right-1.5 top-1.5 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => deleteMediaMutation.mutate(m.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="style" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tema & Warna</CardTitle>
              <p className="text-xs text-muted-foreground">Sesuaikan tampilan undangan dengan seleramu</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Warna Utama</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="h-10 w-10 rounded-xl border border-border/70 cursor-pointer shadow-sm"
                      value={form.primaryColor || invitation.primaryColor}
                      onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    />
                    <span className="text-xs font-mono text-muted-foreground">{form.primaryColor || invitation.primaryColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Warna Sekunder</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="h-10 w-10 rounded-xl border border-border/70 cursor-pointer shadow-sm"
                      value={form.secondaryColor || invitation.secondaryColor}
                      onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    />
                    <span className="text-xs font-mono text-muted-foreground">{form.secondaryColor || invitation.secondaryColor}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Font</Label>
                <select
                  className="flex h-11 w-full rounded-xl border border-border/70 bg-card px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.fontFamily || invitation.fontFamily}
                  onChange={(e) => setForm({ ...form, fontFamily: e.target.value })}
                >
                  <option value="serif">Serif (Classic)</option>
                  <option value="sans-serif">Sans-serif (Modern)</option>
                  <option value="Playfair Display, serif">Playfair Display</option>
                  <option value="Great Vibes, cursive">Great Vibes (Script)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="music" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Musik Latar</CardTitle>
              <p className="text-xs text-muted-foreground">Tambahkan lagu untuk undanganmu</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload accept="audio/*" onUpload={(urls) => setForm({ ...form, backgroundMusic: urls[0] })} />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">atau masukkan URL</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">URL Audio</Label>
                <Input
                  placeholder="https://example.com/music.mp3"
                  value={form.backgroundMusic ?? invitation.backgroundMusic ?? ''}
                  onChange={(e) => setForm({ ...form, backgroundMusic: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="wishes" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" /> Ucapan ({invitation.wishes?.length || 0})
              </CardTitle>
              <p className="text-xs text-muted-foreground">Kelola ucapan dari tamu — approve, balas, atau hapus</p>
            </CardHeader>
            <CardContent>
              {(!invitation.wishes || invitation.wishes.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada ucapan</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {invitation.wishes.map((wish: any) => (
                    <div key={wish.id} className="rounded-xl border border-border/50 p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{wish.name}</p>
                            {wish.isApproved ? (
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-emerald-600 border-emerald-200 bg-emerald-50">Approved</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-amber-600 border-amber-200 bg-amber-50">Pending</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{new Date(wish.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!wish.isApproved && (
                            <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-emerald-500"
                              onClick={async () => {
                                await api.put(`/invitations/${id}/wishes/${wish.id}/approve`)
                                queryClient.invalidateQueries({ queryKey: ['invitation', id] })
                                toast.success('Ucapan disetujui')
                              }}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-destructive"
                            onClick={async () => {
                              if (confirm('Hapus ucapan ini?')) {
                                await api.delete(`/invitations/${id}/wishes/${wish.id}`)
                                queryClient.invalidateQueries({ queryKey: ['invitation', id] })
                                toast.success('Ucapan dihapus')
                              }
                            }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm">{wish.message}</p>
                      {wish.reply && (
                        <div className="ml-3 border-l-2 border-primary/30 pl-3">
                          <p className="text-xs font-medium text-primary flex items-center gap-1">
                            <CornerDownLeft className="h-3 w-3" /> Balasan Anda
                          </p>
                          <p className="text-sm text-muted-foreground">{wish.reply}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-muted-foreground"
                          onClick={() => {
                            const reply = prompt('Balasan untuk ' + wish.name + ':')
                            if (reply?.trim()) {
                              api.put(`/invitations/${id}/wishes/${wish.id}/reply`, { reply }).then(() => {
                                queryClient.invalidateQueries({ queryKey: ['invitation', id] })
                                toast.success('Balasan terkirim')
                              })
                            }
                          }}>
                          <CornerDownLeft className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-muted-foreground"><Heart className="h-3 w-3 inline" /> {wish.likes || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
