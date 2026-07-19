import { createClient } from '@/lib/supabase/server'
import { getAdminStoreOrRedirect } from '@/lib/supabase/storeHelper'
import CustomersClient from './CustomersClient'

export default async function CustomersPage() {
  const { store } = await getAdminStoreOrRedirect()
  const supabase = await createClient()

  // Obtener listado inicial de clientes de la tienda
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  return (
    <CustomersClient 
      store={store} 
      initialCustomers={customers || []} 
    />
  )
}
