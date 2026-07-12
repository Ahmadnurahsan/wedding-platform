import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Users, FileText, TrendingUp, Gift, Calendar, Crown, ArrowLeft, Plus, Palette, Search, Trash2, Eye, X, Check, Shield, Star, Loader2, LayoutDashboard, Tag, Settings, Coins, DollarSign, Link2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'

interface AdminStats {
  totalUsers: number
  totalInvitations: number
  draftInvitations: number
  publishedInvitations: number
  publishedToday: number
  usersLast30DaysCount: number
  invitationsLast30DaysCount: number
  totalWishes: number
  popularTemplates: { name: string; count: number }[]
  revenue: { totalGifts: number; totalAmount: number }
}

interface DailyStat { date: string; users: number; invitations: number }

interface Theme {
  id: string
  name: string
  category: string
  thumbnailUrl: string | null
  isPremium: boolean
  isActive: boolean
  sectionsConfig: string | null
  defaultColors: string | null
  createdAt: string
}

interface AdminUser {
  id: string; name: string; email: string; role: string; phone: string | null; createdAt: string
  _count: { invitations: number }
}

interface UserResponse {
  users: AdminUser[]; total: number; page: number; limit: number; totalPages: number
}

interface InvitationRow {
  id: string; slug: string; title: string | null; status: string; createdAt: string
  user: { name: string; email: string }
  theme: { name: string } | null
  _count: { guests: number; wishes: number; gifts: number }
}

interface InvitationResponse {
  invitations: InvitationRow[]; total: number; page: number; limit: number; totalPages: number
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <Icon className={`mx-auto h-5 w-5 ${color || 'text-primary'}`} />
        <p className="mt-1 text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

function MiniChart({ data }: { data: DailyStat[] }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.users, d.invitations)), 1)
  return (
    <div className="flex items-end gap-[2px] h-20">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-px">
          <div className="w-full rounded-t-sm bg-primary/20" style={{ height: `${(d.invitations / maxVal) * 100}%`, minHeight: d.invitations > 0 ? 2 : 0 }} />
          <div className="w-full rounded-t-sm bg-emerald-400/40" style={{ height: `${(d.users / maxVal) * 100}%`, minHeight: d.users > 0 ? 2 : 0 }} />
        </div>
      ))}
    </div>
  )
}

function AddThemeModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Modern')
  const [isPremium, setIsPremium] = useState(false)
  const [price, setPrice] = useState(50000)
  const [primary, setPrimary] = useState('#D4A574')
  const [secondary, setSecondary] = useState('#F5E6D3')

  const addMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/themes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-themes'] })
      toast.success('Theme added')
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-base">Add Theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Theme name" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="rounded" />
              Premium
            </label>
            {isPremium && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <Input type="number" className="w-20 h-7 text-xs" value={price} onChange={e => setPrice(Number(e.target.value))} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Primary</label>
              <input type="color" value={primary} onChange={e => setPrimary(e.target.value)} className="h-9 w-full rounded-lg border cursor-pointer" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Secondary</label>
              <input type="color" value={secondary} onChange={e => setSecondary(e.target.value)} className="h-9 w-full rounded-lg border cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" disabled={!name} onClick={() => addMutation.mutate({ name, category, isPremium, price, defaultColors: JSON.stringify({ primaryColor: primary, secondaryColor: secondary }) })}>
              {addMutation.isPending ? '...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Coupons Tab ─── */
function CouponsTab() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons', search],
    queryFn: () => api.get(`/admin/coupons?search=${search}`),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Kupon dihapus') },
  })

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari kode kupon..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setShowAdd(true) }}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Kupon Baru
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {(data as any)?.coupons?.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold tracking-wider">{c.code}</span>
                      <Badge className={`text-[10px] h-4 px-1.5 ${c.isActive ? '' : 'bg-muted text-muted-foreground'}`}>
                        {c.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="font-semibold text-foreground">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `Rp${c.discountValue.toLocaleString('id-ID')}`}
                      </span>
                      {c.maxUses > 0 && <span>Digunakan {c.usedCount}/{c.maxUses}x</span>}
                      {c.user && <span>User: {c.user.name}</span>}
                      {c.theme && <span>Tema: {c.theme.name}</span>}
                      {c.expiresAt && <span>Exp: {new Date(c.expiresAt).toLocaleDateString('id-ID')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7"
                      onClick={() => { setEditing(c); setShowAdd(true) }}>
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-destructive"
                      onClick={() => { if (confirm('Hapus kupon ini?')) deleteMutation.mutate(c.id) }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!data || (data as any)?.coupons?.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada kupon</p>
          )}
        </div>
      )}

      {showAdd && <CouponModal editing={editing} onClose={() => setShowAdd(false)} />}
    </>
  )
}

function CouponModal({ editing, onClose }: { editing: any | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [code, setCode] = useState(editing?.code || '')
  const [discountType, setDiscountType] = useState(editing?.discountType || 'percentage')
  const [discountValue, setDiscountValue] = useState(editing?.discountValue || 10)
  const [maxUses, setMaxUses] = useState(editing?.maxUses || 0)
  const [isActive, setIsActive] = useState(editing?.isActive ?? true)
  const [expiresAt, setExpiresAt] = useState(editing?.expiresAt ? editing.expiresAt.slice(0, 10) : '')
  const [userId, setUserId] = useState(editing?.userId || '')
  const [themeId, setThemeId] = useState(editing?.themeId || '')
  const [userSearch, setUserSearch] = useState('')
  const [themeSearch, setThemeSearch] = useState('')

  const { data: users } = useQuery({ queryKey: ['admin-users-modal', userSearch], queryFn: () => api.get(`/admin/users?search=${userSearch}&limit=10`), enabled: true })
  const { data: themes } = useQuery({ queryKey: ['admin-themes-modal', themeSearch], queryFn: () => api.get(`/admin/themes${themeSearch ? `?search=${themeSearch}` : ''}`), enabled: true })

  const selectedUser = users?.users?.find((u: any) => u.id === userId)
  const selectedTheme = themes?.find((t: any) => t.id === themeId)

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editing ? api.put(`/admin/coupons/${editing.id}`, data) : api.post('/admin/coupons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success(editing ? 'Kupon diperbarui' : 'Kupon dibuat')
      onClose()
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Gagal simpan'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Card className="w-full max-w-md max-h-[85vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-base">{editing ? 'Edit Kupon' : 'Kupon Baru'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="KODE KUPON" value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
          <div className="flex gap-2">
            <select value={discountType} onChange={e => setDiscountType(e.target.value)}
              className="flex-1 h-9 text-xs rounded-lg border border-input bg-background px-3">
              <option value="percentage">Persentase (%)</option>
              <option value="fixed">Nominal (Rp)</option>
            </select>
            <Input type="number" placeholder="Nilai" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="w-24" />
          </div>
          <div className="flex gap-2">
            <Input type="number" placeholder="Max pakai (0 = unlimited)" value={maxUses} onChange={e => setMaxUses(Number(e.target.value))} />
            <Input type="date" placeholder="Kadaluarsa" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
          </div>

          {/* User Selector */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Khusus User (opsional)</label>
            <Input placeholder="Cari user..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="h-8 text-xs" />
            {userSearch && users?.users?.length > 0 && (
              <div className="border border-border/50 rounded-lg max-h-32 overflow-y-auto">
                {users.users.map((u: any) => (
                  <button key={u.id} onClick={() => { setUserId(u.id); setUserSearch('') }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors ${userId === u.id ? 'bg-primary/10 text-primary' : ''}`}>
                    {u.name} ({u.email})
                  </button>
                ))}
              </div>
            )}
            {selectedUser && !userSearch && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg text-xs">
                <span>{selectedUser.name} ({selectedUser.email})</span>
                <button onClick={() => setUserId('')} className="ml-auto text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Khusus Tema (opsional)</label>
            <Input placeholder="Cari tema..." value={themeSearch} onChange={e => setThemeSearch(e.target.value)} className="h-8 text-xs" />
            {themeSearch && themes?.length > 0 && (
              <div className="border border-border/50 rounded-lg max-h-32 overflow-y-auto">
                {themes.filter((t: any) => t.name.toLowerCase().includes(themeSearch.toLowerCase())).map((t: any) => (
                  <button key={t.id} onClick={() => { setThemeId(t.id); setThemeSearch('') }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors ${themeId === t.id ? 'bg-primary/10 text-primary' : ''}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            )}
            {selectedTheme && !themeSearch && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg text-xs">
                <span>{selectedTheme.name}</span>
                <button onClick={() => setThemeId('')} className="ml-auto text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
            Aktif
          </label>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
            <Button className="flex-1" disabled={!code || !discountValue}
              onClick={() => saveMutation.mutate({ code, discountType, discountValue, maxUses, isActive, expiresAt: expiresAt || null, userId: userId || null, themeId: themeId || null })}>
              {saveMutation.isPending ? '...' : editing ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Credits Tab ─── */
function CreditsTab() {
  const queryClient = useQueryClient()
  const [showGive, setShowGive] = useState(false)

  const { data: credits, isLoading } = useQuery({
    queryKey: ['admin-credits'],
    queryFn: () => api.get('/admin/credits'),
  })

  const { data: transactions } = useQuery({
    queryKey: ['admin-credit-transactions'],
    queryFn: () => api.get('/admin/credits/transactions'),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Total {Array.isArray(credits) ? credits.length : 0} user punya saldo</p>
        <Button size="sm" onClick={() => setShowGive(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Beri Credit
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {Array.isArray(credits) && credits.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{c.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{c.user?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">{c.balance.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">credits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Transaction Log */}
      {transactions?.transactions?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Riwayat Transaksi</CardTitle></CardHeader>
          <CardContent className="max-h-60 overflow-y-auto space-y-1">
            {transactions.transactions.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-border/30 text-xs">
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{t.user?.name || 'System'}</span>
                  <span className="text-muted-foreground ml-2">{t.description || t.type}</span>
                </div>
                <span className={`font-semibold shrink-0 ml-2 ${t.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showGive && <GiveCreditModal onClose={() => setShowGive(false)} />}
    </div>
  )
}

function GiveCreditModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [amount, setAmount] = useState(10000)
  const [description, setDescription] = useState('')

  const { data: users } = useQuery({
    queryKey: ['admin-users-give', search],
    queryFn: () => api.get(`/admin/users?search=${search}&limit=10`),
    enabled: search.length > 0,
  })

  const giveMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/credits/give', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-credits'] })
      queryClient.invalidateQueries({ queryKey: ['admin-credit-transactions'] })
      toast.success('Credit diberikan')
      onClose()
    },
    onError: () => toast.error('Gagal memberi credit'),
  })

  const selectedUser = users?.users?.find((u: any) => u.id === selectedUserId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="text-base">Beri Credit</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Cari User</label>
            <Input placeholder="Nama atau email..." value={search} onChange={e => { setSearch(e.target.value); setSelectedUserId('') }} />
            {search && users?.users?.length > 0 && !selectedUserId && (
              <div className="border border-border/50 rounded-lg max-h-32 overflow-y-auto">
                {users.users.map((u: any) => (
                  <button key={u.id} onClick={() => { setSelectedUserId(u.id); setSearch('') }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted">
                    {u.name} ({u.email})
                  </button>
                ))}
              </div>
            )}
            {selectedUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg text-xs">
                <span>{selectedUser.name}</span>
                <button onClick={() => { setSelectedUserId(''); setSearch('') }} className="ml-auto text-muted-foreground"><X className="h-3 w-3" /></button>
              </div>
            )}
          </div>
          <Input type="number" placeholder="Jumlah credit" value={amount} onChange={e => setAmount(Number(e.target.value))} />
          <Input placeholder="Keterangan (opsional)" value={description} onChange={e => setDescription(e.target.value)} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
            <Button className="flex-1" disabled={!selectedUserId || amount <= 0}
              onClick={() => giveMutation.mutate({ userId: selectedUserId, amount, description: description || 'Top up dari admin' })}>
              {giveMutation.isPending ? '...' : 'Beri Credit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Affiliates Tab ─── */
function AffiliatesTab() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('')

  const { data: affiliates } = useQuery({
    queryKey: ['admin-affiliates'],
    queryFn: () => api.get('/admin/affiliates'),
  })

  const { data: commissions } = useQuery({
    queryKey: ['admin-affiliate-commissions', filter],
    queryFn: () => api.get(`/admin/affiliates/commissions${filter ? `?status=${filter}` : ''}`),
  })

  const payMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/affiliates/commissions/${id}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-affiliate-commissions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] })
      toast.success('Commission marked as paid')
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium">Affiliates</p>
        <p className="text-xs text-muted-foreground ml-auto">{Array.isArray(affiliates) ? affiliates.length : 0} total</p>
      </div>

      {Array.isArray(affiliates) && affiliates.length > 0 && (
        <div className="space-y-2">
          {affiliates.map((aff: any) => (
            <Card key={aff.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{aff.user?.name || 'Unknown'}</p>
                      <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">{aff.referralCode}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{aff.referredUsers || 0} referrals</span>
                      <span>{aff._count?.commissions || 0} commissions</span>
                      <span>{aff.commissionRate}% rate</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-bold text-emerald-600">+{aff.totalEarned?.toLocaleString() || 0}</p>
                    <p className="text-[10px] text-muted-foreground">earned</p>
                    <p className="text-xs text-muted-foreground">paid: {aff.totalPaid?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Commissions */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Riwayat Komisi</p>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="h-7 text-xs rounded border border-border/50 bg-background px-2">
          <option value="">Semua</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {commissions?.length > 0 ? (
        <div className="space-y-1">
          {commissions.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{c.affiliate?.user?.name || 'Unknown'}</p>
                    <p className="text-muted-foreground truncate">{c.description || c.status}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {c.amount > 0 && <span className="font-semibold text-emerald-600">+{c.amount}</span>}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      c.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                      c.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                      'bg-muted text-muted-foreground'
                    }`}>{c.status}</span>
                    {c.status === 'pending' && (
                      <Button variant="ghost" size="icon-sm" className="h-6 w-6"
                        onClick={() => payMutation.mutate(c.id)}>
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">Belum ada komisi</p>
      )}
    </div>
  )
}

/* ─── Settings Tab ─── */
function SettingsTab() {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [dirty, setDirty] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get('/admin/settings'),
  })

  useEffect(() => {
    if (data && Object.keys(values).length === 0) {
      setValues(data as Record<string, string>)
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.put('/admin/settings', data),
    onSuccess: () => {
      setDirty(false)
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success('Settings saved')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const defaultKeys = [
    { key: 'site_name', label: 'Site Name', placeholder: 'WeddingInvite' },
    { key: 'site_description', label: 'Site Description', placeholder: 'Buat undangan digital' },
    { key: 'contact_email', label: 'Contact Email', placeholder: 'hello@weddinginvite.com' },
    { key: 'contact_phone', label: 'Contact Phone', placeholder: '+62 812 3456 7890' },
    { key: 'contact_whatsapp', label: 'WhatsApp Number', placeholder: '6281234567890' },
    { key: 'address', label: 'Address', placeholder: 'Jakarta, Indonesia' },
    { key: 'social_instagram', label: 'Instagram', placeholder: '@weddinginvite' },
    { key: 'social_facebook', label: 'Facebook', placeholder: 'weddinginvite' },
    { key: 'social_twitter', label: 'Twitter / X', placeholder: '@weddinginvite' },
    { key: 'currency', label: 'Currency', placeholder: 'IDR' },
    { key: 'default_locale', label: 'Default Locale', placeholder: 'id' },
  ]

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>

  return (
    <div className="space-y-3 max-w-lg">
      <p className="text-sm text-muted-foreground">Konfigurasi umum aplikasi</p>
      {defaultKeys.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="text-xs text-muted-foreground block mb-1">{label}</label>
          <Input
            placeholder={placeholder}
            value={values[key] ?? ''}
            onChange={e => {
              setValues(prev => ({ ...prev, [key]: e.target.value }))
              setDirty(true)
            }}
          />
        </div>
      ))}
      <p className="text-xs text-muted-foreground pt-2">Kosongkan jika tidak ingin menggunakan</p>
      <Button
        onClick={() => saveMutation.mutate(values)}
        disabled={!dirty || saveMutation.isPending}
        className="w-full"
      >
        {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </Button>
    </div>
  )
}

export function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard')
  }, [user, navigate])

  const [searchUser, setSearchUser] = useState('')
  const [searchInv, setSearchInv] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddTheme, setShowAddTheme] = useState(false)

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats'),
    enabled: user?.role === 'admin',
  })

  const { data: dailyStats } = useQuery<DailyStat[]>({
    queryKey: ['admin-daily-stats'],
    queryFn: () => api.get('/admin/stats/daily?days=14'),
    enabled: user?.role === 'admin',
  })

  const { data: themes } = useQuery<Theme[]>({
    queryKey: ['admin-themes'],
    queryFn: () => api.get('/admin/themes'),
    enabled: user?.role === 'admin',
  })

  const { data: usersData } = useQuery<UserResponse>({
    queryKey: ['admin-users', searchUser],
    queryFn: () => api.get(`/admin/users?search=${searchUser}`),
    enabled: user?.role === 'admin',
  })

  const { data: invData } = useQuery<InvitationResponse>({
    queryKey: ['admin-invitations', searchInv, statusFilter],
    queryFn: () => api.get(`/admin/invitations?search=${searchInv}&status=${statusFilter}`),
    enabled: user?.role === 'admin',
  })

  const deleteThemeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/themes/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-themes'] }); toast.success('Theme deleted') },
  })

  const togglePremiumMutation = useMutation({
    mutationFn: ({ id, isPremium }: { id: string; isPremium: boolean }) => api.put(`/admin/themes/${id}`, { isPremium }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-themes'] }); toast.success('Updated') },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => {
      const theme = themes?.find(t => t.id === id)
      return api.put(`/admin/themes/${id}`, { isActive: !theme?.isActive })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-themes'] }); toast.success('Toggled') },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User deleted') },
  })

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.put(`/admin/users/${id}/role`, { role }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Role updated') },
  })

  const deleteInvMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/invitations/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-invitations'] }); toast.success('Invitation deleted') },
  })

  const togglePublishMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/invitations/${id}/publish`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-invitations'] }); toast.success('Status toggled') },
  })

  const [sidebarTab, setSidebarTab] = useState('overview')

  if (!user || user.role !== 'admin') return (
    <div className="flex h-40 items-center justify-center">
      <p className="text-sm text-muted-foreground">Akses terbatas untuk admin</p>
    </div>
  )

  const sidebarItems = [
    { value: 'overview', icon: Eye, label: 'Overview' },
    { value: 'themes', icon: Palette, label: 'Themes' },
    { value: 'coupons', icon: Tag, label: 'Kupon' },
    { value: 'credits', icon: Coins, label: 'Credits' },
    { value: 'affiliates', icon: Link2, label: 'Afiliasi' },
    { value: 'users', icon: Users, label: 'Users' },
    { value: 'invitations', icon: FileText, label: 'Undangan' },
    { value: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h1 className="font-serif text-xl font-bold">Admin Panel</h1>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <nav className="hidden lg:flex flex-col gap-1 w-48 shrink-0 sticky top-20 self-start">
          {sidebarItems.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setSidebarTab(value)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left ${
                sidebarTab === value
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          <Tabs value={sidebarTab} onValueChange={setSidebarTab}>
            {/* Mobile tabs - hidden on desktop */}
            <div className="lg:hidden overflow-x-auto -mx-4 px-4">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1 text-xs"><Eye className="mr-1 h-3 w-3" /> Overview</TabsTrigger>
                <TabsTrigger value="themes" className="flex-1 text-xs"><Palette className="mr-1 h-3 w-3" /> Themes</TabsTrigger>
                <TabsTrigger value="coupons" className="flex-1 text-xs"><Tag className="mr-1 h-3 w-3" /> Kupon</TabsTrigger>
                <TabsTrigger value="credits" className="flex-1 text-xs"><Coins className="mr-1 h-3 w-3" /> Credits</TabsTrigger>
                <TabsTrigger value="affiliates" className="flex-1 text-xs"><Link2 className="mr-1 h-3 w-3" /> Afiliasi</TabsTrigger>
                <TabsTrigger value="users" className="flex-1 text-xs"><Users className="mr-1 h-3 w-3" /> Users</TabsTrigger>
                <TabsTrigger value="invitations" className="flex-1 text-xs"><FileText className="mr-1 h-3 w-3" /> Undangan</TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 text-xs"><Settings className="mr-1 h-3 w-3" /> Settings</TabsTrigger>
              </TabsList>
            </div>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} />
            <StatCard icon={FileText} label="Total Undangan" value={stats?.totalInvitations || 0} />
            <StatCard icon={TrendingUp} label="Users 30hr" value={stats?.usersLast30DaysCount || 0} color="text-emerald-500" />
            <StatCard icon={Calendar} label="Published Today" value={stats?.publishedToday || 0} color="text-amber-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={FileText} label="Draft" value={stats?.draftInvitations || 0} />
            <StatCard icon={FileText} label="Published" value={stats?.publishedInvitations || 0} />
            <StatCard icon={Gift} label="Total Wishes" value={stats?.totalWishes || 0} />
            <StatCard icon={TrendingUp} label="Undangan 30hr" value={stats?.invitationsLast30DaysCount || 0} color="text-emerald-500" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Growth (14 hari){' '}
                <span className="text-xs text-muted-foreground font-normal">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/20 align-middle mr-1" /> undangan
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-400/40 align-middle ml-2 mr-1" /> users
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyStats ? <MiniChart data={dailyStats} /> : <div className="h-20 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" /> Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">Rp{(stats?.revenue.totalAmount || 0).toLocaleString('id-ID')}</p>
                  <p className="text-xs text-muted-foreground">Total Gift Amount</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.revenue.totalGifts || 0}</p>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {stats?.popularTemplates && stats.popularTemplates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" /> Template Terpopuler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.popularTemplates.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{t.name}</span>
                      <span className="font-semibold">{t.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── THEMES ── */}
        <TabsContent value="themes" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{themes?.length || 0} themes</p>
            <Button size="sm" onClick={() => setShowAddTheme(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Theme
            </Button>
          </div>
          {themes?.map(theme => (
            <Card key={theme.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="h-14 w-14 shrink-0 rounded-xl border flex items-center justify-center text-xs font-bold"
                      style={{ background: theme.defaultColors ? (JSON.parse(theme.defaultColors)?.secondaryColor || '#f5f5f5') : '#f5f5f5' }}
                    >
                      <Palette className="h-5 w-5" style={{ color: theme.defaultColors ? (JSON.parse(theme.defaultColors)?.primaryColor || '#D4A574') : '#D4A574' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{theme.name}</p>
                        {theme.isPremium && <Badge className="text-[10px] h-4 px-1.5">PRO</Badge>}
                        {!theme.isActive && <Badge variant="outline" className="text-[10px] h-4 px-1.5">Disabled</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{theme.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link to={`/admin/themes/editor/${theme.id}`}>
                      <Button variant="ghost" size="icon-sm" className="h-7 w-7" title="Design Editor">
                        <LayoutDashboard className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7"
                      onClick={() => togglePremiumMutation.mutate({ id: theme.id, isPremium: !theme.isPremium })}>
                      <Star className={`h-3.5 w-3.5 ${theme.isPremium ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7"
                      onClick={() => toggleActiveMutation.mutate({ id: theme.id })}>
                      {theme.isActive ? <Eye className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-destructive"
                      onClick={() => { if (confirm('Delete theme?')) deleteThemeMutation.mutate(theme.id) }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!themes || themes.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No themes yet</p>
          )}
          {showAddTheme && <AddThemeModal onClose={() => setShowAddTheme(false)} />}
        </TabsContent>

        {/* ── USERS ── */}
        <TabsContent value="users" className="space-y-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-9" value={searchUser} onChange={e => setSearchUser(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">{usersData?.total || 0} users</p>
          {usersData?.users.map(u => (
            <Card key={u.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{u.name}</p>
                      {u.role === 'admin' && <Shield className="h-3 w-3 text-yellow-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                      <span>{u._count.invitations} undangan</span>
                      <span>{new Date(u.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7"
                      onClick={() => changeRoleMutation.mutate({ id: u.id, role: u.role === 'admin' ? 'user' : 'admin' })}>
                      <Shield className={`h-3.5 w-3.5 ${u.role === 'admin' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-destructive"
                      onClick={() => { if (confirm(`Delete user ${u.name}?`)) deleteUserMutation.mutate(u.id) }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── INVITATIONS ── */}
        <TabsContent value="invitations" className="space-y-4 mt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9" value={searchInv} onChange={e => setSearchInv(e.target.value)} />
            </div>
            <select
              className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <p className="text-xs text-muted-foreground">{invData?.total || 0} undangan</p>
          {invData?.invitations.map(inv => (
            <Card key={inv.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{inv.title || inv.slug}</p>
                      <Badge variant={inv.status === 'published' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1.5">
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{inv.user.name} &lt;{inv.user.email}&gt;</p>
                    {inv.theme && <p className="text-[11px] text-muted-foreground">Theme: {inv.theme.name}</p>}
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>{inv._count.guests} tamu</span>
                      <span>{inv._count.wishes} ucapan</span>
                      <span>{inv._count.gifts} gift</span>
                      <span>{new Date(inv.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" className={`h-7 w-7 ${inv.status === 'published' ? 'text-emerald-500' : ''}`}
                      onClick={() => togglePublishMutation.mutate(inv.id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-destructive"
                      onClick={() => { if (confirm('Delete invitation?')) deleteInvMutation.mutate(inv.id) }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {invData?.invitations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No invitations found</p>
          )}
        </TabsContent>

        {/* ── COUPONS ── */}
        <TabsContent value="coupons" className="space-y-4 mt-6">
          <CouponsTab />
        </TabsContent>

        {/* ── AFFILIATES ── */}
        <TabsContent value="affiliates" className="space-y-4 mt-6">
          <AffiliatesTab />
        </TabsContent>

        {/* ── CREDITS ── */}
        <TabsContent value="credits" className="space-y-4 mt-6">
          <CreditsTab />
        </TabsContent>

        {/* ── SETTINGS ── */}
        <TabsContent value="settings" className="space-y-4 mt-6">
          <SettingsTab />
        </TabsContent>
      </Tabs>
      </div>
    </div>
    </div>
  )
}
