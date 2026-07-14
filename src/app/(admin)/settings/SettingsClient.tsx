'use client'

import React, { useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { Button } from '@/src/components/ui/button'
import {
  Store,
  FileText,
  CreditCard,
  Truck,
  Users,
  Settings,
  Check,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react'

interface Member {
  id: string
  email: string
  role: string
  status: string
}

interface SettingsClientProps {
  store: {
    id: string
    name: string
    slug: string
    custom_domain: string | null
    whatsapp_phone: string
    currency_code: string
    template_name: string
    theme_settings: any
    show_decimals: boolean
    show_canceled_orders: string
    collect_sales_tax: boolean
    sales_tax_rate: number
    custom_order_statuses: any[]
    receipt_settings: any
    payment_settings: any
    delivery_settings: any
  }
  members: Member[]
  isCollaborator: boolean
  collaboratorRole: string
}

export default function SettingsClient({ store, members, isCollaborator, collaboratorRole }: SettingsClientProps) {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'sales' | 'receipt' | 'payments' | 'delivery' | 'team'>('general')
  const supabase = createClient()

  // 1. Estados General
  const [storeName, setStoreName] = useState(store.name)
  const [storeSlug, setStoreSlug] = useState(store.slug)
  const [storePhone, setStorePhone] = useState(store.whatsapp_phone)
  const [showDecimals, setShowDecimals] = useState(store.show_decimals)
  const [showCanceledOrders, setShowCanceledOrders] = useState(store.show_canceled_orders)
  const [primaryColor, setPrimaryColor] = useState(store.theme_settings?.primaryColor || '#0F172A')

  // 2. Estados Pedidos y Ventas
  const [collectSalesTax, setCollectSalesTax] = useState(store.collect_sales_tax)
  const [salesTaxRate, setSalesTaxRate] = useState(store.sales_tax_rate.toString())
  const [orderStatuses, setOrderStatuses] = useState<any[]>(store.custom_order_statuses)

  // 3. Estados Recibo
  const [receiptHeader, setReceiptHeader] = useState(store.receipt_settings?.header_text || '')
  const [receiptFooter, setReceiptFooter] = useState(store.receipt_settings?.footer_text || '')
  const [receiptNotes, setReceiptNotes] = useState(store.receipt_settings?.receipt_notes || '')
  const [showCustInfo, setShowCustInfo] = useState(store.receipt_settings?.show_customer_info || false)
  const [showProdCode, setShowProdCode] = useState(store.receipt_settings?.show_product_code || false)

  // 4. Estados Pagos
  const [allowPayLater, setAllowPayLater] = useState(store.payment_settings?.allow_pay_later ?? true)
  const [storeCreditEnabled, setStoreCreditEnabled] = useState(store.payment_settings?.store_credit_enabled ?? true)

  // 5. Estados Entrega/Recogida
  const [allowPickup, setAllowPickup] = useState(store.delivery_settings?.allow_pickup ?? true)
  const [allowDelivery, setAllowDelivery] = useState(store.delivery_settings?.allow_delivery ?? true)

  // 6. Estados Equipo
  const [teamMembers, setTeamMembers] = useState<Member[]>(members)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('editor')
  const [loadingTeam, setLoadingTeam] = useState(false)

  // Estado de guardado global
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isUserAdmin = !isCollaborator || collaboratorRole === 'admin'

  // Guardar Cambios Generales, Ventas, Recibo, Pagos y Envíos
  const handleSaveSettings = async () => {
    setSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    // Formatear estados JSON correspondientes
    const updatedTheme = { ...store.theme_settings, primaryColor }
    const updatedReceipt = {
      header_text: receiptHeader.trim(),
      footer_text: receiptFooter.trim(),
      receipt_notes: receiptNotes.trim(),
      show_customer_info: showCustInfo,
      show_product_code: showProdCode
    }
    const updatedPayments = {
      allow_pay_later: allowPayLater,
      store_credit_enabled: storeCreditEnabled
    }
    const updatedDelivery = {
      allow_pickup: allowPickup,
      allow_delivery: allowDelivery
    }

    const { error } = await supabase
      .from('stores')
      .update({
        name: storeName.trim(),
        slug: storeSlug.trim(),
        whatsapp_phone: storePhone.trim(),
        show_decimals: showDecimals,
        show_canceled_orders: showCanceledOrders,
        collect_sales_tax: collectSalesTax,
        sales_tax_rate: parseFloat(salesTaxRate) || 0,
        custom_order_statuses: orderStatuses,
        theme_settings: updatedTheme,
        receipt_settings: updatedReceipt,
        payment_settings: updatedPayments,
        delivery_settings: updatedDelivery
      })
      .eq('id', store.id)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('Ajustes guardados con éxito.')
    }
    setSaving(false)
  }

  // Activar/desactivar estado de pedido
  const handleToggleStatus = (statusId: string) => {
    setOrderStatuses((prev) => 
      prev.map((s) => s.id === statusId ? { ...s, enabled: !s.enabled } : s)
    )
  }

  // Invitar miembro al equipo
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberEmail.trim()) return

    setLoadingTeam(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const { data, error } = await supabase
      .from('store_members')
      .insert({
        store_id: store.id,
        email: newMemberEmail.trim().toLowerCase(),
        role: newMemberRole,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      setErrorMsg(error.message)
    } else if (data) {
      setTeamMembers((prev) => [...prev, data])
      setNewMemberEmail('')
      setSuccessMsg('Invitación de equipo enviada.')
    }
    setLoadingTeam(false)
  }

  // Eliminar miembro del equipo
  const handleDeleteMember = async (memberId: string) => {
    const { error } = await supabase
      .from('store_members')
      .delete()
      .eq('id', memberId)

    if (!error) {
      setTeamMembers((prev) => prev.filter((m) => m.id !== memberId))
      setSuccessMsg('Miembro revocado con éxito.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Ajustes del Negocio</h1>
          <p className="text-sm text-slate-500 mt-1">Configura los parámetros estéticos, fiscales, de facturación y equipo.</p>
        </div>

        {/* Botón de Guardado Unificado (Visible si no es la pestaña de Equipo) */}
        {activeSubTab !== 'team' && (
          <Button
            onClick={handleSaveSettings}
            disabled={saving || !isUserAdmin}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-1.5 h-10 px-6"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Ajustes'}</span>
          </Button>
        )}
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-xs font-semibold">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Grid de Pestañas y Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar de Ajustes */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-3 h-fit flex flex-col space-y-1">
          {[
            { id: 'general', label: 'General', icon: Store },
            { id: 'sales', label: 'Pedidos y Ventas', icon: Settings },
            { id: 'receipt', label: 'Impresión de Recibo', icon: FileText },
            { id: 'payments', label: 'Métodos de Pago', icon: CreditCard },
            { id: 'delivery', label: 'Entrega y Recogida', icon: Truck },
            { id: 'team', label: 'Equipo y Permisos', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any)
                  setSuccessMsg(null)
                  setErrorMsg(null)
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                  activeSubTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Formulario / Configuración de la Pestaña */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-xl shadow-sm p-6 lg:p-8">
          
          {/* 1. AJUSTES GENERALES */}
          {activeSubTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Identificación y Aspecto</h3>
                <p className="text-xs text-slate-500">Datos públicos de cara a tus clientes en el catálogo.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre del Negocio</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    disabled={!isUserAdmin}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug de la Tienda (URL)</label>
                  <input
                    type="text"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-mono text-xs bg-slate-50"
                    disabled={!isUserAdmin}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">WhatsApp de contacto (Formato E.164)</label>
                  <input
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="+5491122334455"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    disabled={!isUserAdmin}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Color de Marca (Botones/Destacados)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer p-0"
                      disabled={!isUserAdmin}
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-mono text-xs max-w-[120px]"
                      disabled={!isUserAdmin}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Visualización y Números</h4>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div>
                    <span className="text-sm font-bold text-slate-900">Mostrar Decimales en Precios</span>
                    <p className="text-xs text-slate-500">Permite ver centavos. Desactívalo si usas monedas enteras (CLP, COP).</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showDecimals}
                    onChange={(e) => setShowDecimals(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    disabled={!isUserAdmin}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div>
                    <span className="text-sm font-bold text-slate-900">Visualización de Pedidos Cancelados</span>
                    <p className="text-xs text-slate-500">Muestra los pedidos anulados tachados o escóndelos del historial.</p>
                  </div>
                  <select
                    value={showCanceledOrders}
                    onChange={(e) => setShowCanceledOrders(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-semibold bg-white"
                    disabled={!isUserAdmin}
                  >
                    <option value="strikethrough">Mostrar tachados</option>
                    <option value="hide">Esconder totalmente</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 2. AJUSTES PEDIDOS Y VENTAS */}
          {activeSubTab === 'sales' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Pedidos, Ventas e Impuestos</h3>
                <p className="text-xs text-slate-500">Configura la facturación fiscal y activa estados personalizados.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900">Cobrar impuestos a ventas</span>
                    <p className="text-xs text-slate-500">Suma de forma automática la alícuota sobre el subtotal.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={collectSalesTax}
                    onChange={(e) => setCollectSalesTax(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900"
                    disabled={!isUserAdmin}
                  />
                </div>

                {collectSalesTax && (
                  <div className="max-w-[200px] space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasa de Impuesto (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salesTaxRate}
                      onChange={(e) => setSalesTaxRate(e.target.value)}
                      placeholder="19.00"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                      disabled={!isUserAdmin}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Matriz de Estados de Pedido</h4>
                <p className="text-xs text-slate-500">Desactiva los estados que no uses en tu logística diaria:</p>

                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100">
                  {orderStatuses.map((status) => (
                    <div key={status.id} className="p-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{status.label}</span>
                      <input
                        type="checkbox"
                        checked={status.enabled}
                        onChange={() => handleToggleStatus(status.id)}
                        className="rounded border-slate-300 text-slate-900"
                        disabled={!isUserAdmin}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. IMPRESIÓN DE RECIBO & SIMULADOR EN VIVO */}
          {activeSubTab === 'receipt' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Formulario */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Ticket de Compra</h3>
                  <p className="text-xs text-slate-500">Encabezado y pie de ticket para el comprobante en PDF e impresión física.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Texto del Encabezado</label>
                    <textarea
                      value={receiptHeader}
                      onChange={(e) => setReceiptHeader(e.target.value)}
                      placeholder="Ej. ¡Gracias por elegirnos! Nit: 12345"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                      rows={2}
                      disabled={!isUserAdmin}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Texto del Pie de Recibo</label>
                    <textarea
                      value={receiptFooter}
                      onChange={(e) => setReceiptFooter(e.target.value)}
                      placeholder="Ej. Conserve este ticket para devoluciones."
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                      rows={2}
                      disabled={!isUserAdmin}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Notas Internas / Condiciones</label>
                    <textarea
                      value={receiptNotes}
                      onChange={(e) => setReceiptNotes(e.target.value)}
                      placeholder="Condiciones comerciales en letra chica."
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                      rows={2}
                      disabled={!isUserAdmin}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-xs font-bold text-slate-700">Imprimir información de Cliente</span>
                    <input
                      type="checkbox"
                      checked={showCustInfo}
                      onChange={(e) => setShowCustInfo(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900"
                      disabled={!isUserAdmin}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-xs font-bold text-slate-700">Imprimir códigos internos de producto</span>
                    <input
                      type="checkbox"
                      checked={showProdCode}
                      onChange={(e) => setShowProdCode(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900"
                      disabled={!isUserAdmin}
                    />
                  </div>
                </div>
              </div>

              {/* Simulador de Recibo Térmico (En Vivo) */}
              <div className="border border-slate-200 bg-amber-50/10 p-6 rounded-xl shadow-inner space-y-4 flex flex-col items-center">
                <div className="text-center font-bold text-xs uppercase tracking-widest text-slate-400">Previsualización de Ticket</div>
                
                {/* Estilo Ticket Térmico */}
                <div className="w-full max-w-[280px] bg-white border border-slate-200 shadow-lg p-4 font-mono text-[10px] text-slate-800 space-y-4 leading-tight">
                  <div className="text-center space-y-1">
                    <div className="font-extrabold text-sm uppercase tracking-tight">{storeName}</div>
                    {receiptHeader.trim() && <p className="whitespace-pre-line text-slate-500">{receiptHeader}</p>}
                  </div>

                  <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
                    {showCustInfo && (
                      <div className="text-slate-400">
                        CLIENTE: Martin Maldonado<br />
                        TEL: +592 1234 5678
                      </div>
                    )}
                    <div>FECHA: {new Date().toLocaleDateString()}</div>
                  </div>

                  <div className="border-t border-dashed border-slate-300 py-2 space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span>DESCRIPCIÓN</span>
                      <span>TOTAL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1x Hamburguesa Especial {showProdCode && '#PROD01'}</span>
                      <span>$12.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2x Gaseosa Fria {showProdCode && '#PROD02'}</span>
                      <span>$5.00</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-right font-bold">
                    <div className="flex justify-between"><span>SUBTOTAL:</span> <span>$17.50</span></div>
                    {collectSalesTax && (
                      <div className="flex justify-between">
                        <span>IMP ({salesTaxRate}%):</span> 
                        <span>${(17.5 * (parseFloat(salesTaxRate) || 0) / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-1 border-t border-slate-200 font-extrabold">
                      <span>TOTAL:</span> 
                      <span>${(17.5 + (17.5 * (parseFloat(salesTaxRate) || 0) / 100)).toFixed(2)}</span>
                    </div>
                  </div>

                  {receiptFooter.trim() && (
                    <div className="border-t border-dashed border-slate-300 pt-3 text-center text-slate-500 whitespace-pre-line">
                      {receiptFooter}
                    </div>
                  )}

                  {receiptNotes.trim() && (
                    <div className="text-[8px] text-slate-400 text-center leading-normal pt-2">
                      {receiptNotes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. AJUSTES MÉTODOS DE PAGO */}
          {activeSubTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Métodos de Pago del Comprador</h3>
                <p className="text-xs text-slate-500">Activa los métodos de pago que los clientes verán en el checkout de la tienda móvil.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <span className="text-sm font-bold text-slate-900">Permitir "Pagar más tarde"</span>
                    <p className="text-xs text-slate-500">El cliente realiza el pedido sin pagar y acuerda el pago en WhatsApp.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowPayLater}
                    onChange={(e) => setAllowPayLater(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900"
                    disabled={!isUserAdmin}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <span className="text-sm font-bold text-slate-900">Habilitar Crédito de Negocio</span>
                    <p className="text-xs text-slate-500">Permite registrar deudas y créditos internos del comercio.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={storeCreditEnabled}
                    onChange={(e) => setStoreCreditEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900"
                    disabled={!isUserAdmin}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. AJUSTES ENTREGA Y RECOGIDA */}
          {activeSubTab === 'delivery' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Métodos de Entrega</h3>
                <p className="text-xs text-slate-500">Configura la recogida en tienda y los envíos a domicilio.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <span className="text-sm font-bold text-slate-900">Permitir Recogida Local (Takeaway)</span>
                    <p className="text-xs text-slate-500">Los clientes pueden elegir retirar los productos en el local.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowPickup}
                    onChange={(e) => setAllowPickup(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900"
                    disabled={!isUserAdmin}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <span className="text-sm font-bold text-slate-900">Permitir Entrega a Domicilio (Delivery)</span>
                    <p className="text-xs text-slate-500">Los clientes pueden solicitar el envío del pedido a su dirección.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowDelivery}
                    onChange={(e) => setAllowDelivery(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900"
                    disabled={!isUserAdmin}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. EQUIPO DE COLABORADORES (CREAR Y REVOCAR) */}
          {activeSubTab === 'team' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Colaboradores y Permisos</h3>
                <p className="text-xs text-slate-500">Invita administradores o editores para ayudarte a gestionar la tienda.</p>
              </div>

              {/* Formulario Invitación (Solo Dueño o Admin) */}
              {isUserAdmin ? (
                <form onSubmit={handleInviteMember} className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-4">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Invitar nuevo miembro</span>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="colaborador@correo.com"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white"
                      required
                    />
                    
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-md text-xs font-semibold bg-white md:max-w-[150px]"
                    >
                      <option value="admin">Administrador</option>
                      <option value="editor">Editor (Inventario)</option>
                      <option value="viewer">Lector (Solo ver)</option>
                    </select>

                    <Button
                      type="submit"
                      disabled={loadingTeam}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-1.5 h-10 px-4"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{loadingTeam ? 'Enviando...' : 'Enviar Invitación'}</span>
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-600 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Solo los administradores directos o dueños pueden gestionar el equipo de colaboradores.</span>
                </div>
              )}

              {/* Listado de Miembros del Equipo */}
              <div className="space-y-4">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Equipo Registrado</span>
                
                {teamMembers.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-100 rounded-lg">
                    No tienes colaboradores agregados todavía.
                  </div>
                ) : (
                  <div className="border border-slate-100 rounded-xl divide-y divide-slate-100">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="p-3.5 flex justify-between items-center gap-4 hover:bg-slate-50/40">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 text-sm">{member.email}</div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold uppercase rounded text-[10px]">
                              {member.role === 'admin' ? 'Administrador' : member.role === 'editor' ? 'Editor' : 'Lector'}
                            </span>
                            <span className={`px-2 py-0.5 font-bold uppercase rounded text-[10px] ${
                              member.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                              {member.status === 'active' ? 'Activo' : 'Pendiente registro'}
                            </span>
                          </div>
                        </div>

                        {/* Revocar (Solo Dueños o Admins pueden revocar) */}
                        {isUserAdmin && (
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Revocar Colaborador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
