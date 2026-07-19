import { createClient } from '@/lib/supabase/server'
import { getAdminStoreOrRedirect } from '@/lib/supabase/storeHelper'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
  const { store } = await getAdminStoreOrRedirect()
  const supabase = await createClient()

  // Obtener listado inicial de pedidos
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
