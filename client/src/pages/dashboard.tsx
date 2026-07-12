import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Users, MessageCircle, Gift, Eye, TrendingUp, QrCode, Crown, ExternalLink } from 'lucide-react'
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

export function DashboardPage() {
  const { user } = useAuth()
  const [createOpen, setCreateOpen] = useState(false)
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')

  const { data: invitations, refetch } = useQuery<Invitation[]>({
    queryKey: ['invitations'],
    queryFn: () => api.get('/invitations'),
  })

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold">Halo, {user?.name}</h1>
          <p className="text-sm text-muted-foreground">
            {invitations?.length || 0} undangan •{' '}
            {invitations?.filter(i => i.status === 'published').length || 0} tayang
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Buat
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

      {/* Invitations List */}
      {invitations && invitations.length > 0 ? (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <Card key={inv.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{inv.title || inv.slug}</h3>
                      <Badge
                        variant={inv.status === 'published' ? 'success' : 'outline'}
                        className="shrink-0 text-[10px]"
                      >
                        {inv.status === 'published' ? 'Tayang' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
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

                {/* Actions */}
                <div className="mt-3 flex gap-2">
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

                {/* Stats Details */}
                {selectedInv === inv.id && stats && (
                  <div className="mt-3 rounded-xl bg-muted/50 p-4 space-y-3 animate-in">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ringkasan Tamu</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.attending}</p>
                        <p className="text-[10px] text-muted-foreground">Hadir</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-500">{stats.notAttending}</p>
                        <p className="text-[10px] text-muted-foreground">Tidak</p>
                      </div>
                      <div className="text-center">
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
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-card py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-lg">Belum ada undangan</p>
            <p className="mt-1 text-sm text-muted-foreground">Buat undangan pertama kamu sekarang, gratis!</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2 mt-2">
            <Plus className="h-4 w-4" /> Buat Undangan
          </Button>
        </div>
      )}
    </div>
  )
}
