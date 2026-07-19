import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Helper de servidor para obtener de forma garantizada y robusta la tienda
 * asociada al usuario actualmente autenticado (como propietario o colaborador).
 * Evita bloqueos por RLS y desfasamiento de tokens de cookies utilizando el cliente admin.
 */
export async function getAdminStoreOrRedirect() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?reason=session_expired')
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Obtener perfil
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // 2. Obtener tienda por owner_id
  let { data: store } = await adminSupabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle()

  // 3. Si no es propietario, verificar si es colaborador
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

  if (!store) {
    redirect('/onboarding')
  }

  return {
    user,
    profile: profile || { full_name: user.user_metadata?.full_name || 'Vendedor', avatar_url: user.user_metadata?.avatar_url || null, role: 'user' },
    store
  }
}
