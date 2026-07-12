import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Send, Upload, QrCode, Crown, Check } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Textarea } from '../components/ui/textarea'

interface Guest {
  id: string
  name: string
  phone: string | null
  whatsapp: string | null
  isVip: boolean
  rsvpStatus: string
  rsvpCount: number
  scannedAt: string | null
  uniqueCode: string | null
}

export function GuestsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [isVip, setIsVip] = useState(false)
  const [bulkText, setBulkText] = useState('')

  const { data: guests } = useQuery<Guest[]>({
    queryKey: ['guests', id],
    queryFn: () => api.get(`/guests/${id}`),
    enabled: !!id,
  })

  const addMutation = useMutation({
    mutationFn: (data: { name: string; phone?: string; whatsapp?: string; isVip?: boolean }) =>
      api.post(`/guests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', id] })
      setAddOpen(false)
      setName('')
      setPhone('')
      setWhatsapp('')
      setIsVip(false)
      toast.success('Tamu ditambahkan')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Gagal'),
  })

  const bulkMutation = useMutation({
    mutationFn: (guests: { name: string; phone?: string; whatsapp?: string }[]) =>
      api.post(`/guests/${id}/bulk`, { guests }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['guests', id] })
      setImportOpen(false)
      setBulkText('')
      toast.success(`${data.count} tamu berhasil diimport`)
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Gagal'),
  })

  const deleteMutation = useMutation({
    mutationFn: (guestId: string) => api.delete(`/guests/${id}/${guestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', id] })
      toast.success('Tamu dihapus')
    },
  })

  const scanMutation = useMutation({
    mutationFn: (guestId: string) => api.post(`/guests/${id}/${guestId}/scan`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', id] })
      toast.success('Tamu check-in!')
    },
  })

  const [searchQuery, setSearchQuery] = useState('')

  const handleAdd = () => {
    if (!name) return
    addMutation.mutate({ name, phone, whatsapp, isVip })
  }

  const handleBulkImport = () => {
    const lines = bulkText.trim().split('\n').filter(Boolean)
    const guests = lines.map((line) => {
      const parts = line.split(',').map((s) => s.trim())
      return { name: parts[0], phone: parts[1] || undefined, whatsapp: parts[2] || undefined }
    }).filter((g) => g.name)
    if (guests.length === 0) {
      toast.error('Format: Nama, No HP, No WA (per baris)')
      return
    }
    bulkMutation.mutate(guests)
  }

  const handleSendWA = (guest: Guest) => {
    if (!guest.whatsapp && !guest.phone) {
      toast.error('Nomor WA tidak tersedia')
      return
    }
    const num = (guest.whatsapp || guest.phone)!.replace(/[^0-9]/g, '')
    const msg = encodeURIComponent(
      `Halo ${guest.name},\n\nDengan hormat, kami mengundang Anda untuk hadir di acara pernikahan kami.\n\nLihat undangan lengkap di: ${window.location.origin}/inv/${id}\n\nMohon konfirmasi kehadiran. Terima kasih!`
    )
    window.open(`https://wa.me/${num.startsWith('62') ? num : '62' + num.slice(1)}?text=${msg}`, '_blank')
  }

  const handleBlastAll = () => {
    const undangan = guests?.filter((g) => g.whatsapp || g.phone) || []
    if (undangan.length === 0) {
      toast.error('Tidak ada tamu dengan nomor WA')
      return
    }
    // Open first WA link — user can tab through
    handleSendWA(undangan[0])
    toast.success(`Buka 1 per 1. ${undangan.length} tamu dengan nomor WA`)
  }

  const getRsvpBadge = (status: string) => {
    switch (status) {
      case 'attending': return <Badge variant="success">✅ Hadir</Badge>
      case 'not_attending': return <Badge variant="destructive">❌ Tidak</Badge>
      default: return <Badge variant="outline">⏳ Pending</Badge>
    }
  }

  const getStatusCounts = () => {
    if (!guests) return { attending: 0, notAttending: 0, pending: 0, vip: 0, scanned: 0, total: 0 }
    return {
      total: guests.length,
      attending: guests.filter((g) => g.rsvpStatus === 'attending').length,
      notAttending: guests.filter((g) => g.rsvpStatus === 'not_attending').length,
      pending: guests.filter((g) => g.rsvpStatus === 'pending').length,
      vip: guests.filter((g) => g.isVip).length,
      scanned: guests.filter((g) => g.scannedAt).length,
    }
  }

  const stats = getStatusCounts()

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-serif text-lg font-bold">Daftar Tamu</h1>
        </div>
        <div className="flex gap-2">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Upload className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Import Tamu</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Format: <strong>Nama, No HP, No WA</strong> (1 tamu per baris)
                </p>
                <Textarea
                  placeholder={`Andi, 08123456789, 08123456789\nSiti, 08198765432\nBudi, 081555777`}
                  rows={8}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                />
                <Button className="w-full" onClick={handleBulkImport} disabled={bulkMutation.isPending}>
                  {bulkMutation.isPending ? 'Importing...' : `Import ${bulkText.trim().split('\n').filter(Boolean).length || 0} Tamu`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Tambah</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Tamu</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Nama tamu" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="No HP" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input placeholder="No WA (untuk blast)" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isVip} onChange={(e) => setIsVip(e.target.checked)} className="h-4 w-4" />
                  <Crown className="h-4 w-4 text-yellow-500" /> Tamu VIP
                </label>
                <Button className="w-full" onClick={handleAdd} disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <Card><CardContent className="p-2"><p className="font-bold text-lg">{stats.total}</p><p className="text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-2"><p className="font-bold text-lg text-green-600">{stats.attending}</p><p className="text-muted-foreground">Hadir</p></CardContent></Card>
        <Card><CardContent className="p-2"><p className="font-bold text-lg text-red-600">{stats.notAttending}</p><p className="text-muted-foreground">Tidak</p></CardContent></Card>
        <Card><CardContent className="p-2"><p className="font-bold text-lg text-yellow-600">{stats.pending}</p><p className="text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-2"><p className="font-bold text-lg">{stats.vip}</p><p className="text-muted-foreground">VIP</p></CardContent></Card>
        <Card><CardContent className="p-2"><p className="font-bold text-lg">{stats.scanned}</p><p className="text-muted-foreground">Scan</p></CardContent></Card>
      </div>

      {/* Check-in Search */}
      {guests && guests.length > 0 && (
        <div className="space-y-2">
          <Input
            placeholder="Cari nama tamu untuk check-in..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 text-base text-center"
          />
          {searchQuery && (
            <div className="space-y-2">
              {guests
                .filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 5)
                .map((g) => (
                  <Card key={g.id} className={`border-2 ${g.scannedAt ? 'border-green-400 bg-green-50' : 'border-primary/30'}`}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-bold text-base">{g.name}</p>
                        <p className="text-xs text-muted-foreground">{g.isVip && '👑 VIP · '}{g.rsvpStatus === 'attending' ? '✅ Hadir' : g.rsvpStatus === 'not_attending' ? '❌ Tidak' : '⏳ ?'}</p>
                      </div>
                      {g.scannedAt ? (
                        <Badge variant="success">Sudah Scan</Badge>
                      ) : (
                        <Button size="sm" className="h-10 px-6" onClick={() => scanMutation.mutate(g.id)}>
                          <Check className="mr-1 h-4 w-4" /> Check-in
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* WA Blast */}
      {guests && guests.length > 0 && (
        <Button className="w-full gap-2" variant="secondary" onClick={handleBlastAll}>
          <Send className="h-4 w-4" /> Kirim WA ke {guests.filter(g => g.whatsapp || g.phone).length} Tamu
        </Button>
      )}

      {/* Guest List */}
      {guests && guests.length > 0 ? (
        <div className="space-y-2">
          {guests.map((guest) => (
            <Card key={guest.id}>
              <CardContent className="flex items-center justify-between p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{guest.name}</p>
                    {guest.isVip && <Crown className="h-3 w-3 shrink-0 text-yellow-500" />}
                    {guest.scannedAt && <Check className="h-3 w-3 shrink-0 text-green-500" />}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {getRsvpBadge(guest.rsvpStatus)}
                    {guest.whatsapp && <span>{guest.whatsapp}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSendWA(guest)} title="Kirim WA">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                  {guest.uniqueCode && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="QR Code"
                      onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/inv/${id}?guest=${guest.uniqueCode}`, '_blank')}
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {!guest.scannedAt && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => scanMutation.mutate(guest.id)} title="Check-in">
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(guest.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="font-semibold">Belum ada tamu</p>
          <p className="text-sm text-muted-foreground">Tambah tamu manual atau import dari file</p>
        </div>
      )}
    </div>
  )
}
