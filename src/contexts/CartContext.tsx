'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CartItem {
  id: string // Generado en cliente: productId + selectedOptionsHash
  productId: string
  title: string
  price: number
  quantity: number
  image: string | null
  selectedOptions: {
    optionId: string
    optionName: string
    valueId: string
    valueName: string
    priceModifier: number
  }[]
  singleItemPrice: number // Precio base + modificadores
}

interface CartContextType {
  items: CartItem[]
  deliveryType: 'delivery' | 'pickup'
  selectedShippingRuleId: string | null
  setDeliveryType: (type: 'delivery' | 'pickup') => void
  setSelectedShippingRuleId: (id: string | null) => void
  addItem: (item: Omit<CartItem, 'id' | 'singleItemPrice'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCalculations: (shippingRules: any[], store: any) => {
    subtotal: number
    tax: number
    shipping: number
    total: number
  }
  generateWhatsAppMessage: (
    store: any,
    shippingRules: any[],
    customerData: { name: string; phone: string; address?: string; notes?: string }
  ) => Promise<{ message: string; url: string }>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
  storeId: string
}

export function CartProvider({ children, storeId }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('pickup')
  const [selectedShippingRuleId, setSelectedShippingRuleId] = useState<string | null>(null)
  
  const supabase = createClient()
  const storageKey = `ramos-cart-${storeId}`

  // Cargar el carrito desde localStorage al montar el componente
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Error al cargar el carrito de localStorage:', e)
    }
  }, [storageKey])

  // Escuchar el evento 'storage' para sincronizar pestañas abiertas de la misma tienda (Realtime Multitab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        try {
          if (e.newValue) {
            setItems(JSON.parse(e.newValue))
          } else {
            setItems([])
          }
        } catch (err) {
          console.error('Error al sincronizar el carrito entre pestañas:', err)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [storageKey])

  const saveItems = (newItems: CartItem[]) => {
    setItems(newItems)
    try {
      localStorage.setItem(storageKey, JSON.stringify(newItems))
    } catch (e) {
      console.error('Error al guardar el carrito en localStorage:', e)
    }
  }

  const generateOptionsHash = (options: CartItem['selectedOptions']) => {
    return options
      .map((o) => `${o.optionId}:${o.valueId}`)
      .sort()
      .join('|')
  }

  const addItem = (newItem: Omit<CartItem, 'id' | 'singleItemPrice'>) => {
    const optionsHash = generateOptionsHash(newItem.selectedOptions)
    const itemUniqueId = optionsHash ? `${newItem.productId}_${optionsHash}` : newItem.productId

    // Calcular costo unitario (precio base + modificadores de variantes)
    const modifiersTotal = newItem.selectedOptions.reduce((acc, opt) => acc + Number(opt.priceModifier), 0)
    const singleItemPrice = Number(newItem.price) + modifiersTotal

    const existingIndex = items.findIndex((item) => item.id === itemUniqueId)

    if (existingIndex > -1) {
      const updated = [...items]
      updated[existingIndex].quantity += newItem.quantity
      saveItems(updated)
    } else {
      const addedItem: CartItem = {
        ...newItem,
        id: itemUniqueId,
        singleItemPrice
      }
      saveItems([...items, addedItem])
    }
  }

  const removeItem = (id: string) => {
    saveItems(items.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    saveItems(
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    saveItems([])
    setSelectedShippingRuleId(null)
    setDeliveryType('pickup')
  }

  const getCartTotal = () => {
    return items.reduce((acc, item) => acc + (item.singleItemPrice * item.quantity), 0)
  }

  // Cálculos consolidados para el flujo de Checkout
  const getCartCalculations = (shippingRules: any[], store: any) => {
    const subtotal = getCartTotal()
    const tax = store.collect_sales_tax 
      ? subtotal * (Number(store.sales_tax_rate) / 100)
      : 0
    const currentShippingRule = shippingRules.find((r) => r.id === selectedShippingRuleId)
    const shipping = deliveryType === 'delivery' && currentShippingRule ? Number(currentShippingRule.price) : 0
    
    return {
      subtotal,
      tax,
      shipping,
      total: subtotal + tax + shipping,
    }
  }

  // Validación anti-tampering y formateo de pedido para WhatsApp
  const generateWhatsAppMessage = async (
    store: any,
    shippingRules: any[],
    customerData: { name: string; phone: string; address?: string; notes?: string }
  ) => {
    const currency = store.currency_code || 'PEN'
    
    const formatValue = (amount: number) => {
      if (currency === 'PEN') {
        return `S/ ${amount.toFixed(2)}`
      }
      return new Intl.NumberFormat('es-US', {
        style: 'currency',
        currency: currency,
      }).format(amount)
    }

    // 🔒 1. Validación en Caliente (Anti-Tampering)
    // Consultamos los precios vigentes de los productos en base de datos
    const productIds = items.map((i) => i.productId)
    let validatedItems = [...items]

    if (productIds.length > 0) {
      const { data: dbProducts } = await supabase
        .from('products')
        .select('id, price')
        .in('id', productIds)

      if (dbProducts) {
        validatedItems = items.map((item) => {
          const dbProd = dbProducts.find((p) => p.id === item.productId)
          if (dbProd && Number(dbProd.price) !== Number(item.price)) {
            console.warn(`[Anti-Tampering] Precio corregido para ${item.title}: ${item.price} -> ${dbProd.price}`)
            
            // Recalcular singleItemPrice con el precio fidedigno de la BD
            const modifiersTotal = item.selectedOptions.reduce((acc, opt) => acc + Number(opt.priceModifier), 0)
            const newSinglePrice = Number(dbProd.price) + modifiersTotal
            
            return {
              ...item,
              price: Number(dbProd.price),
              singleItemPrice: newSinglePrice
            }
          }
          return item
        })
      }
    }

    // 2. Calcular los subtotales validados
    const subtotal = validatedItems.reduce((acc, item) => acc + (item.singleItemPrice * item.quantity), 0)
    const tax = store.collect_sales_tax 
      ? subtotal * (Number(store.sales_tax_rate) / 100)
      : 0
    const currentShippingRule = shippingRules.find((r) => r.id === selectedShippingRuleId)
    const shipping = deliveryType === 'delivery' && currentShippingRule ? Number(currentShippingRule.price) : 0
    const total = subtotal + tax + shipping

    // 3. Formatear cuerpo del mensaje
    let itemsText = ''
    validatedItems.forEach((item) => {
      const optionsLabel = item.selectedOptions.length > 0
        ? ` (${item.selectedOptions.map((o) => o.valueName).join(', ')})`
        : ''
      const itemTotal = item.singleItemPrice * item.quantity
      itemsText += `• ${item.quantity}x ${item.title}${optionsLabel} - ${formatValue(itemTotal)}\n`
    })

    const taxLabel = store.collect_sales_tax ? `🧾 *Impuesto:* ${formatValue(tax)}\n` : ''
    const shippingLabel = deliveryType === 'delivery' ? `🚚 *Envío:* ${formatValue(shipping)}\n` : ''

    const message = 
      `🛒 *NUEVO PEDIDO - ${store.name.toUpperCase()}*\n\n` +
      `👤 *Cliente:* ${customerData.name}\n` +
      `📞 *Teléfono:* ${customerData.phone}\n` +
      `📌 *Tipo:* ${deliveryType === 'delivery' ? 'Envío a Domicilio' : 'Recojo en Tienda'}\n` +
      (deliveryType === 'delivery' && customerData.address ? `🏠 *Dirección:* ${customerData.address}\n` : '') +
      (customerData.notes ? `💬 *Notas:* ${customerData.notes}\n` : '') +
      `\n📋 *Detalle del Pedido:*\n${itemsText}\n` +
      `💵 *Subtotal:* ${formatValue(subtotal)}\n` +
      taxLabel +
      shippingLabel +
      `💰 *Total:* ${formatValue(total)}\n\n` +
      `Gracias por comprar con nosotros.`

    const storePhoneClean = store.whatsapp_phone.replace(/[+\s-]/g, '')
    const url = `https://api.whatsapp.com/send?phone=${storePhoneClean}&text=${encodeURIComponent(message)}`

    // 🔒 4. Limpieza del carrito al confirmar pedido
    clearCart()

    return { message, url }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        deliveryType,
        selectedShippingRuleId,
        setDeliveryType,
        setSelectedShippingRuleId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCalculations,
        generateWhatsAppMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider')
  }
  return context
}
