import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Validar autenticación de usuario mediante Supabase Server Client
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?reason=session_expired')
  }

  // 2. Instanciar cliente administrativo (Bypass RLS para evitar falsos negativos en verificación de tienda)
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 3. Cargar perfil del vendedor
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // 4. Cargar la tienda administrada (dueño o colaborador)
  let { data: store } = await adminSupabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!store && user.email) {
    const { data: member } = await adminSupabase
      .from('store_members')
      .select('store_id')
      .eq('email', user.email)
      .eq('status', 'active')
      .maybeSingle()

    if (member?.store_id) {
      const { data: colabStore } = await adminSupabase
        .from('stores')
        .select('*')
        .eq('id', member.store_id)
        .maybeSingle()
      store = colabStore
    }
  }

  // 5. Redirección fidedigna al Onboarding SOLO si se confirma que verdaderamente no existe tienda
  if (!store || !store.slug || !store.whatsapp_phone || !store.category) {
    redirect('/onboarding')
  }

  return (
    <AdminLayoutClient 
      profile={profile || { full_name: user.user_metadata?.full_name || 'Vendedor', avatar_url: user.user_metadata?.avatar_url || null, role: 'user' }} 
      store={store}
    >
      {children}
    </AdminLayoutClient>
  )
}
