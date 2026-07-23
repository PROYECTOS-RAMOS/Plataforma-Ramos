'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollLock } from '@/hooks/useScrollLock'
import { 
  TrendingUp, 
  Store, 
  Users, 
  CreditCard, 
  ShieldAlert, 
  Menu, 
  X, 
  LogOut, 
  ArrowLeftRight,
  ShieldCheck
} from 'lucide-react'

interface MasterLayoutClientProps {
  profile: {
    full_name: string | null
    avatar_url: string | null
    role: string
  }
  children: React.ReactNode
}

export default function MasterLayoutClient({ profile, children }: MasterLayoutClientProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  // Bloquear el scroll de la página de fondo cuando el menú lateral móvil está abierto
  useScrollLock(mobileMenuOpen)

  // Cerrar el menú lateral automáticamente al cambiar de página
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navigation = [
    { name: 'Métricas', href: '/master/dashboard', icon: TrendingUp },
    { name: 'Tiendas', href: '/master/stores', icon: Store },
    { name: 'Usuarios', href: '/master/users', icon: Users },
    { name: 'Pagos y Suscripciones', href: '/master/payments', icon: CreditCard },
    { name: 'Auditoría y Ajustes', href: '/master/settings', icon: ShieldCheck },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/master/login'
  }

  const isActiveLink = (href: string) => {
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between bg-slate-900 text-slate-100 p-5 border-r border-slate-800/80">
      <div className="space-y-6">
        {/* Cabecera Master */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-md">
            M
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight leading-none">PANEL MASTER</h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Plataforma Ramos</span>
          </div>
        </div>

        {/* Links de Navegación */}
        <nav className="space-y-1.5 pt-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActiveLink(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Usuario Master */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <div className="font-extrabold text-white truncate">{profile.full_name || 'Administrador'}</div>
            <div className="text-indigo-400 font-bold uppercase text-[9px] tracking-wider">
              Super Administrador
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg text-[11px] font-bold transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Volver a vista Vendedor</span>
          </Link>
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-950/20 gap-2 px-3 h-8 text-[11px] font-bold"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* Menú de Cabecera Móvil */}
      <div className="md:hidden bg-slate-900 text-slate-200 border-b border-slate-800/60 px-4 py-3 flex justify-between items-center z-40 sticky top-0">
        <div className="flex items-center gap-2 text-indigo-400 font-black">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs tracking-wider uppercase">PANEL MASTER</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Escritorio (Fijo) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[260px] z-40">
        <SidebarContent />
      </aside>

      {/* Sidebar Móvil (Drawer animado) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop oscuro */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70" 
              onClick={() => setMobileMenuOpen(false)} 
            />
            {/* Sidebar deslizante */}
            <motion.aside 
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative flex flex-col w-[260px] h-full bg-slate-900 border-r border-slate-800 z-10"
            >
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Contenido Principal de Trabajo */}
      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen">
        <main className="flex-1 p-6 md:p-10 bg-slate-950 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
