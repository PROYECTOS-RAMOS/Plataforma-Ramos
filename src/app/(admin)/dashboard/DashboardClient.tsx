'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { Button } from '@/src/components/ui/button'
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react'

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  total: number
  status: string
  created_at: string
}

interface DashboardClientProps {
  store: {
    id: string
    name: string
    slug: string
  }
  initialMetrics: {
    totalSales: number
    totalOrders: number
    pendingOrders: Order[]
  }
  planLimits: {
    currentProducts: number
    maxProducts: number
    planName: string
  }
}

export default function DashboardClient({ store, initialMetrics, planLimits }: DashboardClientProps) {
  const [metrics, setMetrics] = useState(initialMetrics)
  const [pendingOrders, setPendingOrders] = useState<Order[]>(initialMetrics.pendingOrders)
  const supabase = createClient()

  // Función para reproducir tono de alerta de venta (Bell sound)
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // Re5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15) // La5

      gain.gain.setValueAtTime(0.35, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6)

      osc.connect(gain)
      gain.connect(audioCtx.destination)

      osc.start()
      osc.stop(audioCtx.currentTime + 0.6)
    } catch (e) {
      console.warn('Alerta sonora bloqueada o no soportada', e)
    }
  }

  // Configuración de Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-orders-${store.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${store.id}`,
        },
        (payload) => {
          const newOrder = payload.new as Order
          
          // Reproducir alerta auditiva y toast
          playAlertSound()

          // Agregar al listado de pendientes
          setPendingOrders((prev) => [newOrder, ...prev].slice(0, 5))

          // Recalcular métricas
          setMetrics((prev) => ({
            ...prev,
            totalOrders: prev.totalOrders + 1,
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [store.id, supabase])

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: 'completed' | 'canceled') => {
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId)

    if (!error) {
      // Remover de la vista de pendientes locales
      setPendingOrders((prev) => prev.filter((order) => order.id !== orderId))
      
      // Si se completó, recalcular volumen de ventas
      if (nextStatus === 'completed') {
        const orderValue = pendingOrders.find((o) => o.id === orderId)?.total || 0
        setMetrics((prev) => ({
          ...prev,
          totalSales: prev.totalSales + Number(orderValue),
        }))
      }
    }
  }

  // Formatear precios
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Ticket promedio
  const ticketAverage = metrics.totalOrders > 0 
    ? metrics.totalSales / metrics.totalOrders 
    : 0

  // Barra de progreso del plan
  const planPercentage = Math.min((planLimits.currentProducts / planLimits.maxProducts) * 100, 100)

  return (
    <div className="space-y-8">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Panel de Control</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoreo en vivo de ventas e inventario para la tienda <span className="font-semibold text-slate-900">{store.name}</span>
          </p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Conectado en Vivo</span>
        </div>
      </div>

      {/* Tarjetas KPI de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ventas */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ventas Completadas</span>
            <div className="text-3xl font-black text-slate-900">{formatCurrency(metrics.totalSales)}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Cantidad Pedidos */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pedidos Totales</span>
            <div className="text-3xl font-black text-slate-900">{metrics.totalOrders}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
            <div className="text-3xl font-black text-slate-900">{formatCurrency(ticketAverage)}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid de Estado de Plan y Pedidos Urgentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pedidos Urgentes (Pendientes) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Pedidos Urgentes</h3>
              <p className="text-xs text-slate-500">Pedidos pendientes de confirmación y envío a WhatsApp</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full text-xs font-bold uppercase">
              {pendingOrders.length} por despachar
            </span>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400">
              <CheckCircle className="w-12 h-12 text-slate-200 mb-2" />
              <div className="font-bold text-sm text-slate-700">¡Al día!</div>
              <p className="text-xs text-slate-500 mt-1">No tienes pedidos pendientes de atención.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingOrders.map((order) => {
                const whatsappMessage = `Hola ${order.customer_name}, he visto tu pedido por un valor de ${formatCurrency(order.total)}. ¿Coordinamos la entrega?`
                const whatsappLink = `https://api.whatsapp.com/send?phone=${order.customer_phone.replace('+', '')}&text=${encodeURIComponent(whatsappMessage)}`
                return (
                  <div key={order.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{order.customer_name}</span>
                        <span className="text-xs text-slate-400">#{order.id.slice(0, 8)}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span>Tel: {order.customer_phone}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(order.total)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <a 
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      
                      <Button
                        onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                        variant="outline"
                        className="flex-1 md:flex-initial text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Despachar</span>
                      </Button>

                      <Button
                        onClick={() => handleUpdateOrderStatus(order.id, 'canceled')}
                        variant="ghost"
                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                        title="Cancelar Pedido"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Consumo y Estado del Plan */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Estado de la cuenta</h3>
              <p className="text-xs text-slate-500">Monitoreo de recursos y límites</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Plan Activo</span>
              <div className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <span>{planLimits.planName}</span>
              </div>
            </div>

            {/* Consumo de Productos */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-500">Productos creados</span>
                <span className="font-bold text-slate-900">{planLimits.currentProducts} de {planLimits.maxProducts}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    planPercentage > 85 ? 'bg-red-500' : planPercentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${planPercentage}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400">
                {planPercentage === 100 
                  ? 'Has alcanzado el límite de tu plan. Actualiza para crear más productos.'
                  : `Te quedan ${planLimits.maxProducts - planLimits.currentProducts} ranuras de productos disponibles.`}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <span>Los límites de productos se actualizan automáticamente al guardar o borrar ítems.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
