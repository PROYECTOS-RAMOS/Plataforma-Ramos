'use client'

import React, { useState, useEffect } from 'react'
import { useCart, CartItem } from '@/lib/store/useCart'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  MessageSquare,
  MapPin,
  Clock,
  ChevronRight,
  X,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Value {
  id: string
  option_id: string
  value: string
  price_modifier: number
}

interface Option {
  id: string
  product_id: string
  name: string
  type: string
  is_required: boolean
  product_option_values: Value[]
}

interface Product {
  id: string
  title: string
  description: string | null
  price: number
  images: string[]
  category_id: string | null
  product_options: Option[]
}

interface Category {
  id: string
  name: string
  slug: string
  is_active: boolean
}

interface ShippingRule {
  id: string
  name: string
  min_order_amount: number
  price: number
}

interface StorefrontClientProps {
  store: {
    id: string
    name: string
    slug: string
    whatsapp_phone: string
    currency_code: string
    theme_settings: any
    show_decimals: boolean
    collect_sales_tax: boolean
    sales_tax_rate: number
    payment_settings: any
    delivery_settings: any
  }
  categories: Category[]
  products: Product[]
  shippingRules: ShippingRule[]
}

export default function StorefrontClient({ store, categories, products, shippingRules }: StorefrontClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Estado para el modal de variantes
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { valueId: string; valueName: string; priceModifier: number }>>({})
  
  // Vista del Carrito/Checkout
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutStep, setIsCheckoutStep] = useState(false)

  // Datos Checkout
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [custAddress, setCustAddress] = useState('')
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('pickup')
  const [selectedShippingRuleId, setSelectedShippingRuleId] = useState<string>('')
  
  // Carga de procesamiento
  const [processing, setProcessing] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const cart = useCart()
  const supabase = createClient()

  // Sincronizar el primer método de envío si hay reglas
  useEffect(() => {
    if (shippingRules.length > 0) {
      setSelectedShippingRuleId(shippingRules[0].id)
    }
  }, [shippingRules])

  // Inicializar tipo de entrega según ajustes
  useEffect(() => {
    if (store.delivery_settings?.allow_pickup) {
      setDeliveryType('pickup')
    } else if (store.delivery_settings?.allow_delivery) {
      setDeliveryType('delivery')
    }
  }, [store])

  // Filtrado de productos
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategoryId === 'all' || prod.category_id === selectedCategoryId
    const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Abrir modal de variantes o añadir directo si no tiene
  const handleProductClick = (prod: Product) => {
    if (prod.product_options && prod.product_options.length > 0) {
      setSelectedProduct(prod)
      setSelectedOptions({}) // Resetear selecciones
    } else {
      // Agregar directo al carrito
      cart.addItem({
        productId: prod.id,
        title: prod.title,
        price: Number(prod.price),
        image: prod.images[0] || null,
        selectedOptions: [],
        quantity: 1
      })
    }
  }

  // Guardar opción seleccionada en el modal de variantes
  const handleSelectOption = (optionId: string, optionName: string, value: Value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: {
        valueId: value.id,
        valueName: value.value,
        priceModifier: Number(value.price_modifier)
      }
    }))
  }

  // Confirmar y añadir al carrito desde el modal de variantes
  const handleAddWithVariants = () => {
    if (!selectedProduct) return

    // Validar requeridos
    const missingRequired = selectedProduct.product_options.some(
      (opt) => opt.is_required && !selectedOptions[opt.id]
    )

    if (missingRequired) {
      alert('Por favor selecciona las opciones obligatorias.')
      return
    }

    const optionsList = selectedProduct.product_options
      .filter((opt) => selectedOptions[opt.id])
      .map((opt) => ({
        optionId: opt.id,
        optionName: opt.name,
        valueId: selectedOptions[opt.id].valueId,
        valueName: selectedOptions[opt.id].valueName,
        priceModifier: selectedOptions[opt.id].priceModifier
      }))

    cart.addItem({
      productId: selectedProduct.id,
      title: selectedProduct.title,
      price: Number(selectedProduct.price),
      image: selectedProduct.images[0] || null,
      selectedOptions: optionsList,
      quantity: 1
    })

    setSelectedProduct(null)
  }

  // Precios formateados
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: store.currency_code || 'USD',
    }).format(amount)
  }

  // Cálculos Checkout
  const cartSubtotal = cart.getCartTotal()
  
  const currentShippingRule = shippingRules.find((r) => r.id === selectedShippingRuleId)
  const shippingCost = deliveryType === 'delivery' && currentShippingRule ? Number(currentShippingRule.price) : 0
  
  const taxCost = store.collect_sales_tax 
    ? (cartSubtotal * Number(store.sales_tax_rate) / 100)
    : 0

  const cartTotal = cartSubtotal + shippingCost + taxCost

  // Enviar pedido y WhatsApp
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!custName.trim() || !custPhone.trim()) return
    if (deliveryType === 'delivery' && !custAddress.trim()) {
      alert('Por favor indica tu dirección de entrega.')
      return
    }

    setProcessing(true)
    setCheckoutError(null)

    // Formatear teléfono para WhatsApp E.164 (asegurar prefijo +)
    let formattedPhone = custPhone.trim()
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone.replace(/\D/g, '')
    }

    try {
      // 1. Insertar/Actualizar Cliente en Supabase CRM
      const { data: customer, error: customerErr } = await supabase
        .from('customers')
        .upsert(
          {
            store_id: store.id,
            name: custName.trim(),
            phone: formattedPhone,
            address: deliveryType === 'delivery' ? custAddress.trim() : null
          },
          { onConflict: 'store_id,phone' }
        )
        .select()
        .single()

      if (customerErr) throw new Error(customerErr.message)

      // 2. Insertar Orden en Supabase
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          store_id: store.id,
          customer_id: customer.id,
          customer_name: custName.trim(),
          customer_phone: formattedPhone,
          shipping_rule_id: deliveryType === 'delivery' ? selectedShippingRuleId : null,
          shipping_price: shippingCost,
          subtotal: cartSubtotal,
          total: cartTotal,
          status: 'pending'
        })
        .select()
        .single()

      if (orderErr) throw new Error(orderErr.message)

      // 3. Insertar Artículos del pedido en order_items
      const orderItemsInsert = cart.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_title: item.title,
        price: item.price,
        quantity: item.quantity,
        selected_options: item.selectedOptions
      }))

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItemsInsert)

      if (itemsErr) throw new Error(itemsErr.message)

      // 4. Limpiar carro en Zustand y cookies
      cart.clearCart()

      // 5. Redireccionar al WhatsApp del vendedor con el ticket formateado
      let itemsText = ''
      orderItemsInsert.forEach((item) => {
        const optionsLabel = item.selected_options.length > 0 
          ? ` (${item.selected_options.map(o => o.valueName).join(', ')})`
          : ''
        itemsText += `• ${item.quantity}x ${item.product_title}${optionsLabel} - ${formatPrice(item.price * item.quantity)}\n`
      })

      const checkoutText = `*NUEVO PEDIDO #${order.id.slice(0, 8)}*\n\n` +
        `👤 *Cliente:* ${custName.trim()}\n` +
        `📞 *Teléfono:* ${formattedPhone}\n` +
        `🛵 *Entrega:* ${deliveryType === 'delivery' ? 'Domicilio' : 'Retiro local'}\n` +
        (deliveryType === 'delivery' ? `📍 *Dirección:* ${custAddress.trim()}\n\n` : '\n') +
        `📦 *Detalle:*\n${itemsText}\n` +
        `💵 *Subtotal:* ${formatPrice(cartSubtotal)}\n` +
        (deliveryType === 'delivery' ? `🚚 *Envío:* ${formatPrice(shippingCost)}\n` : '') +
        (store.collect_sales_tax ? `🏛️ *Impuesto:* ${formatPrice(taxCost)}\n` : '') +
        `💰 *Total:* ${formatPrice(cartTotal)}\n\n` +
        `Por favor, confirma recepción para finalizar. ¡Gracias!`

      const whatsappTarget = store.whatsapp_phone.replace('+', '')
      window.location.href = `https://api.whatsapp.com/send?phone=${whatsappTarget}&text=${encodeURIComponent(checkoutText)}`
      
    } catch (err: any) {
      setCheckoutError(err.message || 'Error al procesar el pedido. Intente nuevamente.')
      setProcessing(false)
    }
  }

  // Calcular precio en vivo del modal de variantes
  const getLiveModalPrice = () => {
    if (!selectedProduct) return 0
    const modifiersTotal = Object.values(selectedOptions).reduce((acc, opt) => acc + opt.priceModifier, 0)
    return Number(selectedProduct.price) + modifiersTotal
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-20">
      
      {/* 1. HEADER TIENDA */}
      <header className="p-6 text-center space-y-3 bg-slate-50 border-b border-slate-100 flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-[var(--tenant-primary)] text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
          {store.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{store.name}</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Realiza tu orden rápido y envíala a nuestro WhatsApp.</p>
        </div>
      </header>

      {/* 2. BUSCADOR & CATEGORÍAS */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 py-3 border-b border-slate-100 space-y-3 px-4">
        {/* Barra Búsqueda */}
        <div className="relative">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en el catálogo..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] focus:border-transparent text-sm bg-slate-50/50"
          />
        </div>

        {/* Carrusel Horizontal Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategoryId === 'all'
                ? 'bg-[var(--tenant-primary)] border-transparent text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategoryId === cat.id
                  ? 'bg-[var(--tenant-primary)] border-transparent text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. LISTADO DE PRODUCTOS */}
      <main className="p-4 flex-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-2" />
            <div className="font-bold text-sm text-slate-700">Sin productos disponibles</div>
            <p className="text-xs text-slate-500 mt-1">Vuelve a revisar la búsqueda o las categorías.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((prod) => (
              <div 
                key={prod.id} 
                onClick={() => handleProductClick(prod)}
                className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 cursor-pointer transition-all shadow-sm group"
              >
                {/* Imagen */}
                {prod.images[0] ? (
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-20 h-20 rounded-lg object-cover border border-slate-50 flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 flex-shrink-0">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                )}

                {/* Texto */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-bold text-slate-900 group-hover:text-[var(--tenant-primary)] transition-colors text-sm truncate">
                    {prod.title}
                  </div>
                  {prod.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-snug">
                      {prod.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-extrabold text-slate-900 text-sm">{formatPrice(prod.price)}</span>
                    <button className="p-1 bg-slate-900 text-white rounded-full group-hover:bg-[var(--tenant-primary)] transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 4. BARRA FLOTANTE CARRITO */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-xl z-30 max-w-md mx-auto">
          <Button
            onClick={() => {
              setIsCartOpen(true)
              setIsCheckoutStep(false)
            }}
            className="w-full bg-[var(--tenant-primary)] hover:opacity-90 text-white font-bold py-3 rounded-xl flex items-center justify-between px-6 shadow-md"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {cart.items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <span className="text-sm">Ver Carrito</span>
            <span className="text-sm font-black">{formatPrice(cartSubtotal)}</span>
          </Button>
        </div>
      )}

      {/* 5. MODAL DE VARIANTES */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 md:p-4 bg-black/60">
          <div className="fixed inset-0 bg-transparent" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            {/* Cabecera */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedProduct.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Selecciona tus preferencias</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Listado de Opciones */}
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              {selectedProduct.product_options.map((opt) => (
                <div key={opt.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">{opt.name}</span>
                    {opt.is_required && (
                      <span className="text-[10px] bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full font-bold uppercase">
                        Obligatorio
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {opt.product_option_values.map((val) => {
                      const isSelected = selectedOptions[opt.id]?.valueId === val.id
                      return (
                        <div
                          key={val.id}
                          onClick={() => handleSelectOption(opt.id, opt.name, val)}
                          className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-[var(--tenant-primary)] bg-[var(--tenant-primary)]/5 font-bold' 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <span className="text-sm text-slate-800">{val.value}</span>
                          <span className="text-xs text-slate-500 font-bold">
                            {Number(val.price_modifier) > 0 ? `+ ${formatPrice(val.price_modifier)}` : 'Gratis'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Producto</span>
                <span className="font-extrabold text-slate-900 text-lg">{formatPrice(getLiveModalPrice())}</span>
              </div>
              <Button
                onClick={handleAddWithVariants}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs gap-1.5 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Agregar al Carrito</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DRAWER DE CARRITO & CHECKOUT */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 flex justify-center bg-black/60">
          <div className="fixed inset-0 bg-transparent" onClick={() => setIsCartOpen(false)} />
          <div className="relative bg-white w-full max-w-md h-full flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
            
            {/* Cabecera */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-black text-slate-900 text-base">
                {isCheckoutStep ? 'Datos de tu Pedido' : 'Tu Carrito'}
              </h3>
              <button 
                onClick={() => {
                  if (isCheckoutStep) {
                    setIsCheckoutStep(false)
                  } else {
                    setIsCartOpen(false)
                  }
                }} 
                className="p-1 rounded-full text-slate-400 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CONTENIDO 1: RESUMEN DE ARTÍCULOS EN CARRITO */}
            {!isCheckoutStep && (
              <div className="flex-1 flex flex-col overflow-y-auto">
                {cart.items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 text-center">
                    <ShoppingBag className="w-12 h-12 text-slate-200 mb-2" />
                    <span className="font-bold text-sm text-slate-700">Carrito Vacío</span>
                    <p className="text-xs text-slate-500 mt-1">Agrega productos del catálogo para continuar.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
                      {cart.items.map((item) => (
                        <div key={item.id} className="py-4 flex justify-between items-center gap-4">
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-900 text-sm block truncate">{item.title}</span>
                            {item.selectedOptions.length > 0 && (
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {item.selectedOptions.map(o => o.valueName).join(', ')}
                              </p>
                            )}
                            <span className="font-extrabold text-slate-800 text-xs block mt-1">
                              {formatPrice(item.singleItemPrice * item.quantity)}
                            </span>
                          </div>

                          {/* Sumar / Restar Unidades */}
                          <div className="flex items-center border border-slate-200 rounded-lg flex-shrink-0 bg-slate-50/50">
                            <button
                              onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-l-lg"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-r-lg"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer del Carrito */}
                    <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold">Subtotal de Compra:</span>
                        <span className="font-black text-slate-900 text-base">{formatPrice(cartSubtotal)}</span>
                      </div>
                      <Button
                        onClick={() => setIsCheckoutStep(true)}
                        className="w-full bg-[var(--tenant-primary)] hover:opacity-90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1 shadow-md"
                      >
                        <span>Continuar al Checkout</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CONTENIDO 2: FORMULARIO DE CHECKOUT */}
            {isCheckoutStep && (
              <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex-1 p-5 overflow-y-auto space-y-5">
                  
                  {/* Datos de Contacto */}
                  <div className="space-y-3">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Tus Datos</span>
                    
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Tu Nombre Completo</label>
                      <input
                        type="text"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="Ej. Martin Maldonado"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] text-sm bg-slate-50/50"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Tu Teléfono (WhatsApp)</label>
                      <input
                        type="tel"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="Ej. +59212345678"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] text-sm bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Configuración de Entrega */}
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Método de Entrega</span>
                    
                    <div className="flex gap-2">
                      {store.delivery_settings?.allow_pickup && (
                        <button
                          type="button"
                          onClick={() => setDeliveryType('pickup')}
                          className={`flex-1 p-3 border rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                            deliveryType === 'pickup'
                              ? 'border-[var(--tenant-primary)] bg-[var(--tenant-primary)]/5 text-slate-900 font-extrabold'
                              : 'border-slate-200 text-slate-500 bg-white'
                          }`}
                        >
                          <Clock className="w-5 h-5" />
                          <span>Retiro en Local</span>
                        </button>
                      )}

                      {store.delivery_settings?.allow_delivery && (
                        <button
                          type="button"
                          onClick={() => setDeliveryType('delivery')}
                          className={`flex-1 p-3 border rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                            deliveryType === 'delivery'
                              ? 'border-[var(--tenant-primary)] bg-[var(--tenant-primary)]/5 text-slate-900 font-extrabold'
                              : 'border-slate-200 text-slate-500 bg-white'
                          }`}
                        >
                          <Truck className="w-5 h-5" />
                          <span>Envío a Domicilio</span>
                        </button>
                      )}
                    </div>

                    {/* Dirección y Envío (Si es Delivery) */}
                    {deliveryType === 'delivery' && (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Dirección Completa de Entrega</label>
                          <input
                            type="text"
                            value={custAddress}
                            onChange={(e) => setCustAddress(e.target.value)}
                            placeholder="Ej. Calle Falsa 123, Piso 1"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] text-sm bg-slate-50/50"
                            required
                          />
                        </div>

                        {shippingRules.length > 0 && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">Zona / Tarifa de Envío</label>
                            <select
                              value={selectedShippingRuleId}
                              onChange={(e) => setSelectedShippingRuleId(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] text-sm bg-white"
                            >
                              {shippingRules.map((rule) => (
                                <option key={rule.id} value={rule.id}>
                                  {rule.name} (+{formatPrice(rule.price)})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Método de Pago */}
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Forma de Pago</span>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Coordinar con el vendedor</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Enviaremos tu pedido a WhatsApp y acordaremos el pago.</p>
                      </div>
                    </div>
                  </div>

                  {/* Errores */}
                  {checkoutError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                  )}
                </div>

                {/* Resumen Total y Botón Compra */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-3.5">
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>{formatPrice(cartSubtotal)}</span></div>
                    {deliveryType === 'delivery' && (
                      <div className="flex justify-between"><span>Costo de Envío:</span> <span>{formatPrice(shippingCost)}</span></div>
                    )}
                    {store.collect_sales_tax && (
                      <div className="flex justify-between">
                        <span>Impuestos ({store.sales_tax_rate}%):</span> 
                        <span>{formatPrice(taxCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-slate-900 text-sm border-t border-dashed border-slate-200 pt-2">
                      <span>Total final:</span> 
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>{processing ? 'Procesando...' : 'Confirmar y Enviar a WhatsApp'}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
