'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import {
  LayoutDashboard, Users, School, BookOpen, GraduationCap,
  Package, Monitor, Brain, ClipboardList, Inbox, Award,
  CheckSquare, FolderKanban, ChevronLeft, ChevronRight,
  Search, LogOut, Home, Menu, X, FileText, Camera
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'General',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Gestión',
    items: [
      { href: '/admin/gestion', label: 'Usuarios', icon: Users },
      { href: '/admin/colegios', label: 'Colegios', icon: School },
      { href: '/admin/cursos', label: 'Cursos', icon: GraduationCap },
    ]
  },
  {
    title: 'Contenido',
    items: [
      { href: '/admin/lecciones', label: 'Lecciones', icon: BookOpen },
      { href: '/admin/contenido', label: 'Contenido', icon: FileText },
      { href: '/admin/kits', label: 'Kits', icon: Package },
      { href: '/admin/simuladores', label: 'Simuladores', icon: Monitor },
      { href: '/admin/ia', label: 'Actividades IA', icon: Brain },
      { href: '/admin/experiencias', label: 'Galería de Experiencias', icon: Camera },
    ]
  },
  {
    title: 'Evaluación',
    items: [
      { href: '/admin/tareas', label: 'Tareas', icon: ClipboardList },
      { href: '/admin/entregas', label: 'Entregas', icon: Inbox },
      { href: '/admin/calificaciones', label: 'Calificaciones', icon: Award },
      { href: '/admin/calificar', label: 'Calificar', icon: CheckSquare },
      { href: '/admin/proyectos', label: 'Proyectos', icon: FolderKanban },
    ]
  },
]

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Admin',
  gestion: 'Usuarios',
  colegios: 'Colegios',
  cursos: 'Cursos',
  lecciones: 'Lecciones',
  contenido: 'Contenido',
  kits: 'Kits',
  simuladores: 'Simuladores',
  ia: 'Actividades IA',
  experiencias: 'Galería de Experiencias',
  tareas: 'Tareas',
  entregas: 'Entregas',
  calificaciones: 'Calificaciones',
  calificar: 'Calificar',
  proyectos: 'Proyectos',
  lessons: 'Lessons',
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')

  // Restore sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved === '1') setCollapsed(true)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      localStorage.setItem('admin-sidebar-collapsed', prev ? '0' : '1')
      return !prev
    })
  }

  // Close mobile drawer on navigation
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const breadcrumbs = useMemo(() => {
    const parts = (pathname || '/admin').split('/').filter(Boolean)
    return parts.map((part, i) => ({
      label: ROUTE_LABELS[part] || part.charAt(0).toUpperCase() + part.slice(1),
      href: '/' + parts.slice(0, i + 1).join('/'),
      isLast: i === parts.length - 1,
    }))
  }, [pathname])

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return NAV_GROUPS
    const q = query.toLowerCase()
    return NAV_GROUPS
      .map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(q)) }))
      .filter(g => g.items.length > 0)
  }, [query])

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href)

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 h-14 border-b border-white/10 ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="relative flex-shrink-0">
          <Image src="/chaski.png" alt="ChaskiBots" width={28} height={28} className="rounded-lg ring-1 ring-white/10" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-hack-green ring-2 ring-chaski-dark animate-pulse" />
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-fade-in">
            <p className="text-sm font-bold text-white truncate leading-tight font-mono">ChaskiBots</p>
            <p className="text-[10px] text-white/40 leading-tight font-mono">root@admin:~#</p>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="grep sección..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg bg-white/5 border border-white/10 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/20 focus:bg-white/10 transition-colors placeholder:text-white/30 text-white"
            />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {filteredGroups.map(group => (
          <div key={group.title}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/30 font-mono">// {group.title}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150 ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      active
                        ? 'bg-chaski-primary/10 text-chaski-primary'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {active && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-chaski-primary rounded-full shadow-glow" />
                    )}
                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-chaski-primary' : 'text-white/30 group-hover:text-white/60'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-chaski-primary animate-pop" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-2 space-y-0.5">
        <Link
          href="/"
          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Ir al sitio' : undefined}
        >
          <Home className="w-[18px] h-[18px] text-white/30" />
          {!collapsed && 'Ir al sitio'}
        </Link>
        <button
          onClick={() => { logout(); router.push('/login') }}
          className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && 'Cerrar sesión'}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-chaski-dark border-r border-white/10 sticky top-0 h-screen transition-[width] duration-200 ease-out relative overflow-hidden ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(229,115,97,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(229,115,97,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative flex flex-col h-full">{sidebarContent}</div>
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-chaski-dark border border-white/10 shadow-sm flex items-center justify-center text-white/40 hover:text-chaski-primary hover:border-chaski-primary/40 transition-colors z-10"
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-chaski-dark flex flex-col animate-slide-in-left shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3.5 p-1 rounded-lg text-white/40 hover:bg-white/10 z-10"
            >
              <X className="w-4 h-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-40 h-14 bg-chaski-dark border-b border-white/10 flex items-center gap-3 px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-white/60 hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-[13px] min-w-0 font-mono">
            <span className="text-chaski-primary/50">$</span>
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <span className="text-white/20 flex-shrink-0">/</span>}
                {crumb.isLast ? (
                  <span className="font-semibold text-chaski-primary truncate">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-white/40 hover:text-white/70 transition-colors truncate">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
            <span className="w-1.5 h-3.5 bg-chaski-primary/70 animate-cursor-blink ml-0.5" />
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-chaski-primary to-chaski-accent flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/10">
                  {(user.name || user.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-xs font-semibold text-white">{user.name || user.email}</p>
                  <p className="text-[10px] text-white/40 capitalize font-mono">{user.role}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
