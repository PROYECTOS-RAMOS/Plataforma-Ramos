import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
  const supabase = await createClient()

  // 1. Obtener sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Obtener tienda (dueño o colaborador)
  let { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!store) {
    const { data: member } = await supabase
      .from('store_members')
      .select('store_id')
      .eq('email', user.email)
      .eq('status', 'active')
      .single()

    if (member) {
      const { data: colabStore } = await supabase
        .from('stores')
        .select('*')
        .eq('id', member.store_id)
        .single()
      store = colabStore
    }
  }

  if (!store) {
    redirect('/dashboard')
  }

  // 3. Obtener listado inicial de pedidos
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  return (
    <OrdersClient 
      store={store} 
      initialOrders={orders || []} 
    />
  )
}
