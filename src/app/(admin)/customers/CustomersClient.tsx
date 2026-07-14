'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { Button } from '@/src/components/ui/button'
import {
  Users,
  Search,
  MessageSquare,
  X,
  FileText,
  Clock,
  Eye,
  Check,
  Calendar
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  notes: string | null
  created_at: string
}

interface CustomerOrder {
  id: string
  total: number
  status: string
  created_at: string
}

interface CustomersClientProps {
  store: {
    id: string
  }
  initialCustomers: Customer[]
}

export default function CustomersClient({ store, initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Ficha de Cliente seleccionado
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [customerNotes, setCustomerNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const supabase = createClient()

  // Cargar historial de pedidos al seleccionar un cliente
  useEffect(() => {
    if (!selectedCustomer) return

    const fetchCustomerOrders = async () => {
      setLoadingOrders(true)
      const { data, error } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .eq('customer_id', selectedCustomer.id)
        .order('created_at', { ascending: false })

      if (!error) {
        setCustomerOrders(data || [])
      }
      setLoadingOrders(false)
    }

    setCustomerNotes(selectedCustomer.notes || '')
    fetchCustomerOrders()
  }, [selectedCustomer, supabase])

  const handleSaveNotes = async () => {
    if (!selectedCustomer) return

    setSavingNotes(true)
    const { error } = await supabase
      .from('customers')
      .update({ notes: customerNotes.trim() || null })
      .eq('id', selectedCustomer.id)

    if (!error) {
      // Actualizar en el estado de clientes locales
      setCustomers((prev) => 
        prev.map((c) => c.id === selectedCustomer.id ? { ...c, notes: customerNotes.trim() || null } : c)
      )
      setSelectedCustomer((current) => 
        current ? { ...current, notes: customerNotes.trim() || null } : null
      )
    }
    setSavingNotes(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Filtrado de búsqueda
  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      (customer.address && customer.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.notes && customer.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Directorio de Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">CRM local y registro histórico de compradores de tu tienda.</p>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono o nota..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-white"
          />
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-2" />
            <div className="font-bold text-sm text-slate-700">No se encontraron clientes</div>
            <p className="text-xs text-slate-500 mt-1">Registraremos clientes automáticamente cuando realicen compras.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">WhatsApp</th>
                  <th className="px-6 py-4">Dirección</th>
                  <th className="px-6 py-4">Registro</th>
                  <th className="px-6 py-4 text-center">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{customer.name}</div>
                      {customer.email && <div className="text-xs text-slate-400">{customer.email}</div>}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">{customer.phone}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                      {customer.address || <span className="italic text-slate-300">No registrada</span>}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(customer.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        onClick={() => setSelectedCustomer(customer)}
                        variant="outline"
                        className="h-8 px-3 text-xs font-bold gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ficha</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal / Dialog de Ficha de Cliente CRM */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSelectedCustomer(null)} />
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="font-black text-slate-900 text-base">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-500">Historial de comprador único</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Información de Contacto */}
              <div className="grid grid-cols-2 gap-4 text-xs p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div>
                  <span className="text-slate-400 uppercase font-semibold block">WhatsApp</span>
                  <a 
                    href={`https://api.whatsapp.com/send?phone=${selectedCustomer.phone.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>{selectedCustomer.phone}</span>
                    <MessageSquare className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold block">Dirección</span>
                  <span className="font-semibold text-slate-700 truncate block mt-0.5">
                    {selectedCustomer.address || 'No registrada'}
                  </span>
                </div>
              </div>

              {/* Notas Internas (CRM) */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Notas internas (Solo visibles por ti)</span>
                </div>
                <div className="space-y-2">
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Ej. Cliente recurrente, prefiere entrega por la tarde, exige cambio en efectivo."
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-white"
                    rows={3}
                  />
                  <Button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-1.5 h-8 px-4"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savingNotes ? 'Guardando...' : 'Guardar notas'}</span>
                  </Button>
                </div>
              </div>

              {/* Historial de Pedidos */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Historial de Compras</span>
                </div>

                {loadingOrders ? (
                  <div className="text-center py-6 text-xs text-slate-400">Cargando compras...</div>
                ) : customerOrders.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-100 rounded-lg">
                    No posee pedidos registrados.
                  </div>
                ) : (
                  <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">Pedido #{order.id.slice(0, 8)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                              order.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : order.status === 'canceled'
                                ? 'bg-red-500/10 text-red-600 border-red-500/20'
                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }`}>
                              {order.status === 'completed' ? 'Completado' : order.status === 'canceled' ? 'Cancelado' : 'Pendiente'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-300" />
                            <span>{new Date(order.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {formatCurrency(order.total)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
