import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import React from 'react'
import MasterLayoutClient from './MasterLayoutClient'

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Validar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/master/login')
  }

  // 2. Validar rol de Super Admin desde la nueva tabla master_admins
  const { data: adminProfile } = await supabase
    .from('master_admins')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!adminProfile) {
    redirect('/master/login')
  }

  // Mapeamos para mantener la compatibilidad con el componente cliente
  const compatibleProfile = {
    ...adminProfile,
    role: 'super_admin'
  }

  return (
    <MasterLayoutClient profile={compatibleProfile}>
      {children}
    </MasterLayoutClient>
  )
}
