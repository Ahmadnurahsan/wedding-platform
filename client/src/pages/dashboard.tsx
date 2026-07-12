import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Users, MessageCircle, Gift, Eye, TrendingUp, QrCode, Crown, ExternalLink, Heart, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { toast } from 'sonner'

interface Invitation {
  id: string
  slug: string
  title: string | null
  status: string
  visitCount: number
  createdAt: string
  publishedAt: string | null
  _count: { guests: number; wishes: number; gifts: number }
}

interface Stats {
  totalVisits: number
  totalGuests: number
  attending: number
  notAttending: number
  pending: number
  wishesCount: number
  totalGifts: number
  totalGiftAmount: number
  scanned: number
  vipAttending: number
}

const statusColors = {
  published: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  draft: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
} as const

export function DashboardPage() {
  const { user } = useAuth()
  const [createOpen, setCreateOpen] = useState(false)
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')

  const { data: invitations, refetch } = useQuery<Invitation[]>({
    queryKey: ['invitations'],
    queryFn: () => api.get('/invitations'),
  })

  const totalStats = {
    total: invitations?.length || 0,
    published: invitations?.filter(i => i.status === 'published').length || 0,
    totalGuests: invitations?.reduce((a, i) => a + i._count.guests, 0) || 0,
    totalVisits: invitations?.reduce((a, i) => a + i.visitCount, 0) || 0,
  }

  const [selectedInv, setSelectedInv] = useState<string | null>(null)
  const { data: stats } = useQuery<Stats>({
    queryKey: ['stats', selectedInv],
    queryFn: () => api.get(`/stats/${selectedInv}`),
    enabled: !!selectedInv,
  })

  const handleCreate = async () => {
    if (!slug) {
      toast.error('Link undangan harus diisi')
      return
    }
    try {
      await api.post('/invitations', { slug, title })
      toast.success('Undangan berhasil dibuat!')
      setCreateOpen(false)
      setSlug('')
      setTitle('')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat')
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold">
              Selamat datang, {user?.name?.split(' ')[0] || 'Pengguna'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola semua undangan pernikahanmu di sini
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Buat Undangan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Undangan Baru</DialogTitle>
                <p className="text-sm text-muted-foreground">Buat undangan digital untuk hari spesialmu</p>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link undangan</label>
                  <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-card px-3 text-sm text-muted-foreground shadow-sm">
                    <span className="shrink-0 text-xs">weddinginvite.com/</span>
                    <Input
                      placeholder="andi-siti"
                      className="border-0 pl-0 shadow-none"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Judul (opsional)</label>
                  <Input
                    placeholder="Andi & Siti"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <Button className="w-full h-11" onClick={handleCreate}>
                  Buat Undangan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Undangan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.published}</p>
                <p className="text-xs text-muted-foreground">Sedang Tayang</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.totalVisits.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Dilihat</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.totalGuests.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Tamu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations List */}
      {invitations && invitations.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold">Daftar Undangan</h2>
          </div>
          {invitations.map((inv) => {
            const sc = statusColors[inv.status as keyof typeof statusColors] || statusColors.draft
            return (
              <Card key={inv.id} className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-2 w-2 rounded-full shrink-0 ${sc.dot}`} />
                          <h3 className="font-semibold truncate">{inv.title || inv.slug}</h3>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${sc.bg}`}>
                            {inv.status === 'published' ? 'Tayang' : 'Draft'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Dibuat {formatDate(inv.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Mini Stats */}
                    <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> {inv.visitCount}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> {inv._count.guests}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" /> {inv._count.wishes}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Gift className="h-3.5 w-3.5" /> {inv._count.gifts}
                      </span>
                    </div>
                  </div>

                  {/* Actions Divider */}
                  <div className="border-t border-border/50 px-4 py-3">
                    <div className="flex gap-2">
                      {inv.status === 'published' && (
                        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" asChild>
                          <Link to={`/inv/${inv.slug}`} target="_blank">
                            <ExternalLink className="mr-1 h-3 w-3" /> Lihat
                          </Link>
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" asChild>
                        <Link to={`/invitations/${inv.id}/guests`}>
                          <Users className="mr-1 h-3 w-3" /> Tamu
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => setSelectedInv(selectedInv === inv.id ? null : inv.id)}>
                        <TrendingUp className="mr-1 h-3 w-3" /> Statistik
                      </Button>
                      <Button size="sm" className="flex-1 h-8 text-xs" asChild>
                        <Link to={`/editor/${inv.id}`}>Edit</Link>
                      </Button>
                    </div>
                  </div>

                  {/* Stats Details */}
                  {selectedInv === inv.id && stats && (
                    <div className="border-t border-border/50 p-4 bg-muted/30 space-y-3 animate-in">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ringkasan Tamu</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center rounded-xl bg-white p-3 shadow-sm border border-border/30">
                          <p className="text-2xl font-bold text-emerald-600">{stats.attending}</p>
                          <p className="text-[10px] text-muted-foreground">Hadir</p>
                        </div>
                        <div className="text-center rounded-xl bg-white p-3 shadow-sm border border-border/30">
                          <p className="text-2xl font-bold text-red-500">{stats.notAttending}</p>
                          <p className="text-[10px] text-muted-foreground">Tidak</p>
                        </div>
                        <div className="text-center rounded-xl bg-white p-3 shadow-sm border border-border/30">
                          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                          <p className="text-[10px] text-muted-foreground">Pending</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t border-border/50 pt-3">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Dilihat: <strong>{stats.totalVisits}</strong></span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Diundang: <strong>{stats.totalGuests}</strong></span>
                        <span className="flex items-center gap-1"><QrCode className="h-3 w-3" /> Scan: <strong>{stats.scanned}</strong></span>
                        <span className="flex items-center gap-1"><Crown className="h-3 w-3" /> VIP Hadir: <strong>{stats.vipAttending}</strong></span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> Ucapan: <strong>{stats.wishesCount}</strong></span>
                        <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> Gift: <strong>{stats.totalGifts}</strong></span>
                      </div>
                      {stats.totalGiftAmount > 0 && (
                        <p className="text-sm font-semibold text-primary border-t border-border/50 pt-3">
                          Total Gift: Rp{stats.totalGiftAmount.toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border/60 bg-card py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
            <Heart className="h-10 w-10 text-primary/60" />
          </div>
          <div>
            <p className="font-serif text-xl font-bold">Belum ada undangan</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              Buat undangan digital pertama kamu, gratis dan mudah!
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 mt-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Buat Undangan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Undangan Baru</DialogTitle>
                <p className="text-sm text-muted-foreground">Buat undangan digital untuk hari spesialmu</p>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link undangan</label>
                  <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-card px-3 text-sm text-muted-foreground shadow-sm">
                    <span className="shrink-0 text-xs">weddinginvite.com/</span>
                    <Input
                      placeholder="andi-siti"
                      className="border-0 pl-0 shadow-none"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Judul (opsional)</label>
                  <Input
                    placeholder="Andi & Siti"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <Button className="w-full h-11" onClick={handleCreate}>
                  Buat Undangan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}
