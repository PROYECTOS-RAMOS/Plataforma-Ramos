'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { Button } from '@/src/components/ui/button'
import {
  Search,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react'

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

  // Actualización en tiempo real de nuevos pedidos
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
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Filtrado y búsqueda lógica
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

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Bandeja de Pedidos</h1>
        <p className="text-sm text-slate-500 mt-1">Administra el flujo de ventas, estados de entrega y envíos a WhatsApp.</p>
      </div>

      {/* Controles: Buscar y Filtrar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Pestañas de Estados */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 w-fit self-start">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pending', label: 'Pendientes' },
            { id: 'completed', label: 'Completados' },
            { id: 'canceled', label: 'Cancelados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                filterStatus === tab.id
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente o teléfono..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-white"
          />
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-2" />
            <div className="font-bold text-sm text-slate-700">No se encontraron pedidos</div>
            <p className="text-xs text-slate-500 mt-1">Intenta ajustando los filtros o el término de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Pedido ID</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">WhatsApp</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{order.customer_name}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{order.customer_phone}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-right">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
                        order.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : order.status === 'canceled'
                          ? 'bg-red-500/10 text-red-600 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                        {order.status === 'completed' ? 'Completado' : order.status === 'canceled' ? 'Cancelado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        variant="outline"
                        className="h-8 px-3 text-xs font-bold gap-1 border-slate-200 text-slate-700 hover:bg-slate-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detalles</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal / Dialog de Detalles de Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-base">Pedido #{selectedOrder.id.slice(0, 8)}</h3>
                <p className="text-xs text-slate-500">Recibido el {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Información del Cliente */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Información del Cliente</h4>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Nombre:</span> <span className="font-semibold text-slate-900">{selectedOrder.customer_name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">WhatsApp:</span> <span className="font-semibold text-slate-900">{selectedOrder.customer_phone}</span></div>
                </div>
              </div>

              {/* Detalle de Artículos */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Productos Comprados</h4>
                {loadingItems ? (
                  <div className="text-center py-6 text-xs text-slate-400">Cargando productos...</div>
                ) : (
                  <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100 text-sm">
                    {selectedOrderItems.map((item) => (
                      <div key={item.id} className="p-3 flex justify-between items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 truncate">{item.product_title}</div>
                          {item.selected_options.length > 0 && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Opciones: {item.selected_options.map(o => o.value).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold text-slate-900">{item.quantity}x</div>
                          <div className="text-xs text-slate-500">{formatCurrency(item.price)} c/u</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desglose Económico */}
              <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal:</span> <span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Envío:</span> <span>{formatCurrency(selectedOrder.shipping_price)}</span></div>
                <div className="flex justify-between font-black text-slate-900 text-base border-t border-dashed border-slate-100 pt-2">
                  <span>Total a pagar:</span> 
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Estado Actual del Pedido */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold uppercase">
                <span className="text-slate-400">Estado de Despacho:</span>
                <span className={`px-2.5 py-0.5 rounded-full border ${
                  selectedOrder.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : selectedOrder.status === 'canceled'
                    ? 'bg-red-500/10 text-red-600 border-red-500/20'
                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                }`}>
                  {selectedOrder.status === 'completed' ? 'Completado' : selectedOrder.status === 'canceled' ? 'Cancelado' : 'Pendiente'}
                </span>
              </div>
            </div>

            {/* Footer del Modal (Acciones) */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <a
                href={generateWhatsAppLink(selectedOrder, selectedOrderItems)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar Pedido a WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {selectedOrder.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')}
                    variant="outline"
                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs px-3 h-10"
                    title="Marcar como Completado"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'canceled')}
                    variant="ghost"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 px-3 h-10"
                    title="Cancelar Pedido"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
