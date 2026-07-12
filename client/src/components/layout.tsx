import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, LayoutDashboard, Heart, User, Shield, Menu, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { Button } from './ui/button'

const navItems = [
  { to: '/', icon: Home, label: 'Beranda', exact: true },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', auth: true },
  { to: '/templates', icon: Heart, label: 'Template' },
  { to: '/admin', icon: Shield, label: 'Admin', admin: true },
]

export function Layout() {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <div className="flex min-h-dvh bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border/50 lg:bg-background lg:sticky lg:top-0 lg:h-screen lg:shrink-0">
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight">WeddingInvite</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label, auth, exact, admin }) => {
            if (auth && !user) return null
            if (admin && user?.role !== 'admin') return null
            const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <Icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                {label}
              </NavLink>
            )
          })}
        </nav>
        <div className="border-t border-border/50 p-4">
          {user ? (
            <NavLink to="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-medium truncate">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            </NavLink>
          ) : (
            <NavLink to="/login">
              <Button variant="outline" className="w-full justify-start gap-2">
                <User className="h-4 w-4" /> Masuk
              </Button>
            </NavLink>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <NavLink to="/" className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <Heart className="h-4 w-4 text-primary" />
              </div>
            </NavLink>
            <div className="flex-1" />
            {user && (
              <NavLink to="/profile" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </NavLink>
            )}
          </div>
        </header>

        {/* Mobile Menu Sheet (outside header to avoid backdrop-filter fixed bug) */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-0 z-50 h-full w-72 max-w-[80vw] border-r border-border/50 bg-background shadow-2xl lg:hidden slide-in-from-left">
              <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
                <span className="font-serif font-bold text-lg">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="px-3 py-3 space-y-1">
                {navItems.map(({ to, icon: Icon, label, auth, exact, admin }) => {
                  if (auth && !user) return null
                  if (admin && user?.role !== 'admin') return null
                  const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      )}
                    >
                      <Icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                      {label}
                    </NavLink>
                  )
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 p-4">
                {user ? (
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </NavLink>
                ) : (
                  <NavLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <User className="h-4 w-4" /> Masuk
                    </Button>
                  </NavLink>
                )}
              </div>
            </div>
          </>
        )}

        {/* Page Content */}
        <main className="flex-1 px-4 pb-28 pt-6 lg:px-8 lg:pb-8 lg:pt-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
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
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground/60 hover:text-muted-foreground',
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
    </div>
  )
}
