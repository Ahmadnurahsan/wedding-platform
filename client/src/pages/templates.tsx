import { Heart, Sparkles, Flower2, Moon, Loader2, Wallet } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

interface Theme {
  id: string
  name: string
  category: string
  thumbnailUrl: string | null
  isPremium: boolean
  price: number
  defaultColors: string | null
}

const gradientMap: Record<string, string> = {
  'Modern': 'from-rose-200 to-pink-100',
  'Elegan': 'from-amber-200 to-yellow-100',
  'Floral': 'from-emerald-200 to-teal-100',
  'Rustic': 'from-orange-200 to-amber-100',
  'Adat': 'from-red-200 to-rose-100',
}

const iconMap: Record<string, typeof Heart> = {
  'Modern': Moon,
  'Elegan': Sparkles,
  'Floral': Flower2,
  'Rustic': Heart,
  'Adat': Sparkles,
}

export function TemplatesPage() {
  const navigate = useNavigate()

  const { data: themes, isLoading } = useQuery<Theme[]>({
    queryKey: ['themes'],
    queryFn: () => api.get('/themes'),
  })

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Pilih Template</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {themes?.length || 0} tema eksklusif untuk hari spesialmu
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {themes?.map((t) => {
          const Icon = iconMap[t.category] || Heart
          const gradient = gradientMap[t.category] || 'from-rose-200 to-pink-100'
          return (
            <Card key={t.id} className="overflow-hidden border-none shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]">
              <div className={`aspect-[3/4] bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                <Icon className="h-14 w-14 text-white/60" strokeWidth={1} />
                {t.isPremium && (
                  <Badge variant="default" className="absolute right-2 top-2 text-[10px] px-2 py-0.5 shadow-sm">
                    PRO
                  </Badge>
                )}
              </div>
              <CardContent className="p-3.5">
                <h3 className="text-sm font-semibold">{t.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.category}</p>
                {t.isPremium && (
                  <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-amber-600 font-medium">
                    <Wallet className="h-3 w-3" />
                    {t.price?.toLocaleString() || '50.000'} kredit
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={() => navigate(`/template-demo/${t.id}`)}
                  >
                    Demo
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={() => navigate('/register')}
                  >
                    Pakai
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {themes?.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Belum ada template tersedia.
        </div>
      )}
    </div>
  )
}
