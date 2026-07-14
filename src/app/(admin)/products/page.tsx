import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductsClient from './ProductsClient'

export default async function ProductsPage() {
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

  // 3. Obtener Categorías (ordenadas por posición)
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .order('position', { ascending: true })

  // 4. Obtener Productos (ordenados por posición)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .order('position', { ascending: true })

  return (
    <ProductsClient 
      store={store} 
      initialCategories={categories || []}
      initialProducts={products || []}
    />
  )
}
