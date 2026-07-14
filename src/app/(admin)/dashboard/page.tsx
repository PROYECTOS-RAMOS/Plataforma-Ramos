import { redirect } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import DashboardClient from './DashboardClient'
import Link from 'next/link'
import { Store } from 'lucide-react'

export default async function DashboardPage() {
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

  // Si no hay tienda activa, mostrar Onboarding
  if (!store) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
        <Store className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900">¡Bienvenido a Plataforma Ramos!</h2>
        <p className="text-slate-500 max-w-md mt-2">
          Antes de acceder al panel, necesitas registrar y configurar la información básica de tu tienda.
        </p>
        <Link 
          href="/settings" 
          className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors shadow-md"
        >
          Crear mi Tienda ahora
        </Link>
      </div>
    )
  }

  // 3. Consultar métricas iniciales
  // Pedidos totales
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store.id)

  // Acumulado de ventas completadas
  const { data: salesData } = await supabase
    .from('orders')
    .select('total')
    .eq('store_id', store.id)
    .eq('status', 'completed')

  const totalSales = (salesData || []).reduce((acc, order) => acc + Number(order.total), 0)

  // Pedidos urgentes (pendientes)
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', store.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  // 4. Consultar contadores del plan actual
  const { count: currentProductsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store.id)

  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('id', store.plan_id)
    .single()

  return (
    <DashboardClient 
      store={store}
      initialMetrics={{
        totalSales,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || [],
      }}
      planLimits={{
        currentProducts: currentProductsCount || 0,
        maxProducts: plan?.max_products || 20,
        planName: plan?.name || 'Plan Gratuito',
      }}
    />
  )
}
