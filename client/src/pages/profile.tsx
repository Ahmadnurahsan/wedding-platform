import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { LogOut, Mail, Calendar, User, Phone, Save, Copy, Gift, Users, Coins, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../lib/utils'
import { api } from '../lib/api'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)

  const { data: credit } = useQuery<{ balance: number }>({
    queryKey: ['credit-balance'],
    queryFn: () => api.get('/credits/balance'),
    enabled: !!user,
  })

  const { data: transactions } = useQuery<{ transactions: any[]; total: number }>({
    queryKey: ['credit-transactions'],
    queryFn: () => api.get('/credits/transactions?limit=10'),
    enabled: !!user,
  })

  const { data: affiliate } = useQuery({
    queryKey: ['affiliate-me'],
    queryFn: () => api.get('/affiliate/me'),
    enabled: !!user,
  })

  const referralLink = affiliate?.referralCode
    ? `${window.location.origin}/register?ref=${affiliate.referralCode}`
    : ''

  if (!user) {
    navigate('/login')
    return null
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Nama tidak boleh kosong')
      return
    }
    setSaving(true)
    try {
      await api.put('/auth/me', { name, phone })
      toast.success('Profil diperbarui!')
      // Refresh user data would need auth context update
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Berhasil keluar')
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 pt-4">
        <Avatar className="h-20 w-20 ring-4 ring-primary/10">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="font-serif text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit Profil</CardTitle>
          <CardDescription>Perbarui informasi akun kamu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" /> Nama
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" /> No. HP
            </label>
            <Input
              placeholder="08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{user.email}</span>
          </div>
          {user.createdAt && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Bergabung {formatDate(user.createdAt)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-amber-600" /> Saldo Kredit
          </CardTitle>
          <CardDescription>Gunakan kredit untuk membeli tema premium</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-4">
            <div>
              <p className="text-sm text-amber-700 font-medium">Saldo Tersedia</p>
              <p className="text-3xl font-bold text-amber-900">{credit?.balance?.toLocaleString() ?? '...'}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <CreditCard className="h-7 w-7 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {transactions?.transactions && transactions.transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" /> Riwayat Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {transactions.transactions.slice(0, 10).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{tx.description || tx.type}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div className={`flex items-center gap-1 shrink-0 ml-2 font-semibold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.amount > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Affiliate / Referral Program */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" /> Program Afiliasi
            </CardTitle>
          </div>
          <CardDescription>Dapatkan komisi dengan mereferensikan teman</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {affiliate && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-primary/5 p-3 text-center">
                  <Users className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-1 text-lg font-bold">{affiliate.referredUsers || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Referral</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-center">
                  <Coins className="mx-auto h-4 w-4 text-emerald-600" />
                  <p className="mt-1 text-lg font-bold">{affiliate.totalEarned?.toLocaleString() || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Earned</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-center">
                  <TrendingUp className="mx-auto h-4 w-4 text-blue-600" />
                  <p className="mt-1 text-lg font-bold">{affiliate.commissionRate || 10}%</p>
                  <p className="text-[10px] text-muted-foreground">Komisi</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Link Referral Kamu</label>
                <div className="flex gap-1">
                  <Input value={referralLink} readOnly className="text-xs flex-1" />
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"
                    onClick={() => { navigator.clipboard.writeText(referralLink); toast.success('Link disalin!') }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {affiliate.recentCommissions?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Komisi Terbaru</p>
                  <div className="space-y-1.5">
                    {affiliate.recentCommissions.slice(0, 5).map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between text-xs py-1.5 border-b border-border/30">
                        <div className="min-w-0 flex-1">
                          <span className="truncate block">{c.description || 'Komisi'}</span>
                          <span className="text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('id-ID')}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {c.amount > 0 && <span className="font-semibold text-emerald-600">+{c.amount}</span>}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            c.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                            c.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Keluar
      </Button>
    </div>
  )
}
