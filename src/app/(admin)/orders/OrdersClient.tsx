'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  shipping_price: number
  subtotal: number
  total: number
  status: string
  created_at: string
}

interface OrderItem {
  id: string
  product_title: string
  price: number
  quantity: number
  selected_options: any[]
}

interface OrdersClientProps {
  store: {
    id: string
    name: string
    slug: string
    currency_code?: string
  }
  initialOrders: Order[]
}

export default function OrdersClient({ store, initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  // Detalle del pedido seleccionado
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([])
  const [loadingItems, setLoadingItems] = useState<boolean>(false)

  const supabase = createClient()

  // Reactividad en tiempo real de nuevos pedidos
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-orders-list-${store.id}`)
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
          setOrders((prev) => [newOrder, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${store.id}`,
        },
        (payload) => {
          const updatedOrder = payload.new as Order
          setOrders((prev) => prev.map((o) => o.id === updatedOrder.id ? updatedOrder : o))
          setSelectedOrder((current) => current && current.id === updatedOrder.id ? updatedOrder : current)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [store.id, supabase])

  // Cargar ítems al seleccionar un pedido
  useEffect(() => {
    if (!selectedOrder) return

    const fetchOrderItems = async () => {
      setLoadingItems(true)
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', selectedOrder.id)

      if (!error) {
        setSelectedOrderItems(data || [])
      }
      setLoadingItems(false)
    }

    fetchOrderItems()
  }, [selectedOrder, supabase])

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: 'completed' | 'canceled') => {
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId)

    if (!error) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o))
    }
  }

  const formatCurrency = (amount: number) => {
    const currency = store.currency_code || 'PEN'
    if (currency === 'PEN') {
      return `S/ ${amount.toFixed(2)}`
    }
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // Filtrado y búsqueda
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Mensaje estructurado de WhatsApp
  const generateWhatsAppLink = (order: Order, items: OrderItem[]) => {
    let itemsText = ''
    items.forEach((item) => {
      const optionsLabel = item.selected_options.length > 0 
        ? ` (${item.selected_options.map(o => o.value).join(', ')})`
        : ''
      itemsText += `• ${item.quantity}x ${item.product_title}${optionsLabel} - ${formatCurrency(item.price * item.quantity)}\n`
    })

    const message = `*DETALLES DEL PEDIDO #${order.id.slice(0, 8)}*\n\n` +
      `👤 *Cliente:* ${order.customer_name}\n` +
      `📞 *WhatsApp:* ${order.customer_phone}\n\n` +
      `📦 *Productos:*\n${itemsText}\n` +
      `💵 *Subtotal:* ${formatCurrency(order.subtotal)}\n` +
      `🚚 *Envío:* ${formatCurrency(order.shipping_price)}\n` +
      `💰 *Total:* ${formatCurrency(order.total)}\n\n` +
      `Coordinemos el despacho y el método de pago correspondiente. ¡Muchas gracias!`

    return `https://api.whatsapp.com/send?phone=${order.customer_phone.replace('+', '')}&text=${encodeURIComponent(message)}`
  }

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order)
  }

  // Eliminar Pedido
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('¿Estás seguro de eliminar permanentemente este pedido?')) return

    // 1. Eliminar ítems de pedido
    await supabase.from('order_items').delete().eq('order_id', orderId)
    // 2. Eliminar pedido
    const { error } = await supabase.from('orders').delete().eq('id', orderId)

    if (!error) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
      setSelectedOrder(null)
    }
  }

  return (
    <div className="space-y-6 font-body-base text-on-surface">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Gestión de Pedidos</h2>
          <p className="text-sm text-on-surface-variant mt-1">Administra, filtra y revisa el estado de todos los pedidos entrantes.</p>
        </div>
      </div>

      {/* Controles: Buscar y Filtros Rápidos */}
      <div className="bg-white border border-border-subtle rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              filterStatus === 'all'
                ? 'bg-slate-900 border-transparent text-white shadow-xs'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos
          </button>
          
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${
              filterStatus === 'pending'
                ? 'bg-amber-500 border-transparent text-white shadow-xs'
                : 'border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'pending' ? 'bg-white' : 'bg-amber-500'}`}></span>
            <span>Pendiente</span>
          </button>

          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 border-transparent text-white shadow-xs'
                : 'border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'completed' ? 'bg-white' : 'bg-emerald-500'}`}></span>
            <span>Completado</span>
          </button>

          <button
            onClick={() => setFilterStatus('canceled')}
            className={`px-4 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${
              filterStatus === 'canceled'
                ? 'bg-rose-600 border-transparent text-white shadow-xs'
                : 'border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'canceled' ? 'bg-white' : 'bg-rose-500'}`}></span>
            <span>Cancelado</span>
          </button>
        </div>

        <div className="relative w-full md:max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente o teléfono..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-[40px] text-slate-200 mx-auto mb-2 block">receipt_long</span>
            <div className="font-bold text-sm text-slate-700">No hay pedidos disponibles</div>
            <p className="text-xs text-slate-500 mt-1">Los pedidos recibidos desde la tienda pública aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead className="bg-slate-50 border-b border-border-subtle text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID Pedido</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4 text-right">Monto Total</th>
                  <th className="px-6 py-4 text-center">Estado Logístico</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-border-subtle text-slate-800">
                {filteredOrders.map((order) => {
                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => handleSelectOrder(order)}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{order.customer_name}</div>
                        <div className="text-slate-400 text-[10px]">{order.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600 text-sm">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          order.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : order.status === 'canceled'
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.status === 'completed' ? 'bg-emerald-500' : order.status === 'canceled' ? 'bg-rose-500' : 'bg-amber-500'
                          }`} />
                          {order.status === 'completed' ? 'Completado' : order.status === 'canceled' ? 'Cancelado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(order.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectOrder(order)
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteOrder(order.id)
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar pedido"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. DRAWER SLIDE-OVER DE DETALLE DE PEDIDO ESTILO SHOPIFY */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="fixed inset-0 bg-transparent" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white w-full max-w-md h-full flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl z-10 border-l border-slate-200">
            {/* Cabecera del Drawer */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Pedido #{selectedOrder.id.slice(0, 8).toUpperCase()}</h3>
                <span className="text-[10px] text-slate-500 font-medium">Detalle del cliente y productos</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              
              {/* Información del Cliente */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Datos del Comprador</span>
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">Nombre:</span> <span className="font-bold text-slate-900">{selectedOrder.customer_name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">WhatsApp:</span> <span className="font-bold text-slate-900">{selectedOrder.customer_phone}</span></div>
                </div>
              </div>

              {/* Detalle de Artículos */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Artículos Seleccionados</span>
                {loadingItems ? (
                  <div className="text-center py-6 text-[10px] text-slate-400 font-medium">Cargando productos...</div>
                ) : (
                  <div className="border border-slate-200/60 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                    {selectedOrderItems.map((item) => (
                      <div key={item.id} className="p-3.5 flex justify-between items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900">{item.product_title}</div>
                          {item.selected_options.length > 0 && (
                            <div className="text-[9px] text-slate-400 mt-0.5 font-medium">
                              Variantes: {item.selected_options.map(o => o.value).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-slate-900">{item.quantity}x</div>
                          <div className="text-[10px] text-slate-500">{formatCurrency(item.price)} c/u</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desglose Económico */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-500"><span>Subtotal:</span> <span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between text-slate-500"><span>Envío:</span> <span>{formatCurrency(selectedOrder.shipping_price)}</span></div>
                <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-dashed border-slate-200 pt-2">
                  <span>Monto Total:</span> 
                  <span className={selectedOrder.status === 'canceled' ? 'line-through text-slate-400' : 'text-blue-600'}>
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Estado Actual */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado Logístico:</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${
                  selectedOrder.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : selectedOrder.status === 'canceled'
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedOrder.status === 'completed' ? 'bg-emerald-500' : selectedOrder.status === 'canceled' ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                  {selectedOrder.status === 'completed' ? 'Completado' : selectedOrder.status === 'canceled' ? 'Cancelado' : 'Pendiente'}
                </span>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={generateWhatsAppLink(selectedOrder, selectedOrderItems)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>WhatsApp</span>
              </a>

              {selectedOrder.status === 'pending' && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')}
                    className="p-2 border border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center justify-center h-9 w-9 transition-colors"
                    title="Marcar como Completado"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'canceled')}
                    className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center h-9 w-9 transition-colors"
                    title="Cancelar Pedido"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center h-9 w-9 transition-colors"
                title="Eliminar Pedido"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
