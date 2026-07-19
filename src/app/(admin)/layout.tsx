import React from 'react'
import { getAdminStoreOrRedirect } from '@/lib/supabase/storeHelper'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile, store } = await getAdminStoreOrRedirect()

  return (
    <AdminLayoutClient 
      profile={profile} 
      store={store}
    >
      {children}
    </AdminLayoutClient>
  )
}
