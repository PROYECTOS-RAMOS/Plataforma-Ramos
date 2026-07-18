import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import React from 'react'

import { CartProvider } from '@/contexts/CartContext'

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ domain: string }>
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { domain } = await params
  const supabase = await createClient()

  // 1. Consultar la tienda por slug o dominio personalizado
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .or(`slug.eq.${domain},custom_domain.eq.${domain}`)
    .eq('is_active', true)
    .single()

  if (!store) {
    notFound()
  }

  // 2. Extraer configuración estética del tema
  const primaryColor = store.theme_settings?.primaryColor || '#0F172A'
  const accentColor = store.theme_settings?.accentColor || '#10B981'

  // Variables de estilo inline para evitar FOUC (Flash of Unstyled Content)
  const themeStyles = {
    '--tenant-primary': primaryColor,
    '--tenant-accent': accentColor,
  } as React.CSSProperties

  return (
    <CartProvider storeId={store.id}>
      <div 
        style={themeStyles} 
        className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[var(--tenant-primary)] selection:text-white"
      >
        {children}
      </div>
    </CartProvider>
  )
}
