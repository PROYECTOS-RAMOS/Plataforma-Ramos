'use client'

import React, { useState } from 'react'
import { Link } from 'next-view-transitions'
import Logo from '@/components/marketing/Logo'
import { Menu, X, ChevronRight, User, ShoppingBag } from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/caracteristicas', label: 'Características' },
    { href: '/como-funciona', label: 'Cómo Funciona' },
    { href: '/precios', label: 'Precios' },
    { href: '/faq', label: 'Preguntas' },
    { href: '/nosotros', label: 'Nosotros' },
  ]

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo responsivo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group z-50">
          <Logo size={36} className="sm:hidden block group-hover:scale-105 transition-transform" />
          <Logo size={46} className="hidden sm:block group-hover:scale-105 transition-transform" />
          
          <span className="font-black text-lg sm:text-xl md:text-2xl tracking-tight flex items-center gap-1 sm:gap-1.5 select-none">
            <span className="text-[#EF4444]">Plataforma</span>
            <span className="text-[#3B82F6]">Ramos</span>
          </span>
          
          {/* Ocultar el logo en espejo del lado derecho en celulares pequeños para dar espacio */}
          <Logo size={46} mirror className="hidden md:block group-hover:scale-105 transition-transform" />
        </Link>

        {/* Navigation para pantallas grandes */}
        <nav className="hidden lg:flex items-center gap-7 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="hover:text-blue-600 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTAs para pantallas grandes */}
        <div className="hidden lg:flex items-center gap-4">
          <Link 
            href="/login?mode=signin" 
            className="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50"
          >
            Ingresar
          </Link>
          <Link 
            href="/login?mode=signup" 
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-extrabold uppercase tracking-wider rounded-xl text-white shadow-lg shadow-blue-600/10 transition-all hover:scale-105 active:scale-95 border border-blue-500/20"
          >
            Crear Tienda
          </Link>
        </div>

        {/* Botón de Menú Hamburguesa para Móviles */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors z-50"
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[64px] sm:top-[80px] bg-white z-40 flex flex-col justify-between border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-6 py-8 space-y-5 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Menú de Navegación</span>
            
            <nav className="flex flex-col gap-5 text-sm font-bold uppercase tracking-wider text-slate-800">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-slate-50 hover:text-blue-600 transition-colors"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Acciones del menú inferior móvil */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3.5">
            <Link
              href="/login?mode=signin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 border border-slate-200 hover:bg-white text-center font-bold text-slate-700 rounded-2xl flex items-center justify-center gap-2 bg-white/50 text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Ingresar a mi Cuenta</span>
            </Link>
            
            <Link
              href="/login?mode=signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-center font-extrabold text-white rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-blue-600/10 transition-all border border-blue-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Crear mi Tienda Gratis</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
