'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tag, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ExternalLink,
  Store
} from 'lucide-react'

interface AdminLayoutClientProps {
  profile: {
    full_name: string
    avatar_url: string | null
  }
  store: {
    id: string
    name: string
    slug: string
    plan_id: string
  } | null
  children: React.ReactNode
}

export default function AdminLayoutClient({ profile, store, children }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pedidos', href: '/orders', icon: ShoppingBag },
    { name: 'Productos', href: '/products', icon: Tag },
    { name: 'Clientes', href: '/customers', icon: Users },
    { name: 'Ajustes', href: '/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const publicStoreUrl = store 
    ? `http://${store.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`
    : '#'

  const isActiveLink = (href: string) => {
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between bg-slate-950 text-slate-200 p-4 border-r border-slate-900">
      <div className="space-y-6">
        {/* Identificación Plataforma */}
        <div className="flex items-center gap-2 px-2 py-3">
          <Store className="w-6 h-6 text-emerald-400" />
          <span className="text-lg font-black tracking-tight text-white">PLATAFORMA RAMOS</span>
        </div>

        {/* Tienda y Plan */}
        {store ? (
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tienda Administrada</div>
            <div className="font-bold text-white text-sm truncate">{store.name}</div>
            <div className="flex justify-between items-center text-xs">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold uppercase">
                {store.plan_id === 'premium' ? 'Plan Pro' : 'Plan Gratis'}
              </span>
              <a 
                href={publicStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <span>Ver Tienda</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sin Tienda Registrada</div>
            <Link href="/settings" className="text-xs font-bold text-emerald-400 hover:underline">
              Crear Tienda ahora
            </Link>
          </div>
        )}

        {/* Menú de Navegación */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActiveLink(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active 
                    ? 'bg-slate-800 text-white border-l-4 border-emerald-400' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Perfil del Vendedor y Logout */}
      <div className="border-t border-slate-900 pt-4 space-y-4">
        <div className="flex items-center gap-3 px-2">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name} 
              className="w-9 h-9 rounded-full object-cover border border-slate-800"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-sm">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white truncate">{profile.full_name}</div>
            <div className="text-xs text-slate-500 truncate">Vendedor</div>
          </div>
        </div>

        <Button 
          onClick={handleLogout}
          variant="ghost" 
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-900 gap-3 px-3"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span>Cerrar sesión</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex flex-col md:flex-row">
      {/* Menú de Cabecera Móvil */}
      <div className="md:hidden bg-slate-950 text-slate-200 border-b border-slate-900 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-emerald-400" />
          <span className="font-bold tracking-tight text-white">RAMOS PANEL</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar de Escritorio */}
      <aside className="hidden md:block w-72 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Móvil (Drawer) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative flex flex-col w-72 max-w-xs h-full bg-slate-950">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Contenido Principal de Trabajo */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto min-w-0 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
