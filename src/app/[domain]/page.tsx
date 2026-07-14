import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StorefrontClient from './StorefrontClient'

interface TenantPageProps {
  params: Promise<{ domain: string }>
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { domain } = await params
  const supabase = await createClient()

  // 1. Obtener la tienda activa
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .or(`slug.eq.${domain},custom_domain.eq.${domain}`)
    .eq('is_active', true)
    .single()

  if (!store) {
    notFound()
  }

  // 2. Obtener Categorías activas
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('position', { ascending: true })

  // 3. Obtener Productos con sus Opciones y Valores de opciones
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      product_options (
        *,
        product_option_values (
          *
        )
      )
    `)
    .eq('store_id', store.id)
    .eq('is_available', true)
    .order('position', { ascending: true })

  // 4. Obtener Reglas de envío activas
  const { data: shippingRules } = await supabase
    .from('shipping_rules')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)

  return (
    <StorefrontClient 
      store={store}
      categories={categories || []}
      products={(products as any) || []}
      shippingRules={shippingRules || []}
    />
  )
}
