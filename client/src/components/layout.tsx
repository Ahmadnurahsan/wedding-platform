import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, LayoutDashboard, Heart, User, Shield } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/', icon: Home, label: 'Beranda', exact: true },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', auth: true },
  { to: '/templates', icon: Heart, label: 'Template' },
  { to: '/profile', icon: User, label: 'Akun' },
  { to: '/admin', icon: Shield, label: 'Admin', admin: true },
]

export function Layout() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            <span className="font-serif font-bold text-lg tracking-tight">WeddingInvite</span>
          </NavLink>
          <div className="flex items-center gap-3">
            <NavLink to="/templates" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Template
            </NavLink>
            {user ? (
              <NavLink to="/profile" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </NavLink>
            ) : (
              <NavLink to="/login" className="text-sm font-semibold text-primary hover:underline">
                Masuk
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 lg:pb-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around py-1">
          {navItems.map(({ to, icon: Icon, label, auth, exact, admin }) => {
            if (auth && !user) return null
            if (admin && user?.role !== 'admin') return null
            const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-2 text-[11px] font-medium transition-all duration-200 relative',
                  isActive ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground',
                )}
              >
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
                  isActive && 'bg-primary/10'
                )}>
                  <Icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                </div>
                <span>{label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
