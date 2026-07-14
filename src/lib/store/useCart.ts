import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { setCookie, getCookie, deleteCookie } from 'cookies-next'

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

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id' | 'singleItemPrice'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
}

// Helper para generar hash simple de opciones seleccionadas
const generateOptionsHash = (options: CartItem['selectedOptions']) => {
  return options
    .map((o) => `${o.optionId}:${o.valueId}`)
    .sort()
    .join('|')
}

// Custom storage que guarda en LocalStorage y respalda en Cookies de larga duración
const hybridStorage = {
  getItem: (name: string): string | null => {
    // Intentar leer de localStorage
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(name)
      if (local) return local
    }
    // Si no está en LocalStorage, intentar rescatar del respaldo en Cookies
    const cookie = getCookie(name)
    return cookie ? (cookie as string) : null
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(name, value)
    }
    // Respaldar en Cookie con duración de 30 días
    setCookie(name, value, { maxAge: 60 * 60 * 24 * 30, path: '/' })
  },
  removeItem: (name: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(name)
    }
    deleteCookie(name)
  }
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        const optionsHash = generateOptionsHash(newItem.selectedOptions)
        const itemUniqueId = `${newItem.productId}_${optionsHash}`

        // Calcular costo unitario (precio base + modificadores de variantes)
        const modifiersTotal = newItem.selectedOptions.reduce((acc, opt) => acc + Number(opt.priceModifier), 0)
        const singleItemPrice = Number(newItem.price) + modifiersTotal

        set((state) => {
          const existingItemIndex = state.items.findIndex((item) => item.id === itemUniqueId)
          
          if (existingItemIndex > -1) {
            // Incrementar unidades
            const updatedItems = [...state.items]
            updatedItems[existingItemIndex].quantity += newItem.quantity
            return { items: updatedItems }
          } else {
            // Añadir nuevo ítem
            return {
              items: [
                ...state.items,
                {
                  ...newItem,
                  id: itemUniqueId,
                  singleItemPrice
                }
              ]
            }
          }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set((state) => ({
          items: state.items.map((item) => item.id === id ? { ...item, quantity } : item)
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getCartTotal: () => {
        return get().items.reduce((acc, item) => acc + (item.singleItemPrice * item.quantity), 0)
      }
    }),
    {
      name: 'ramos-tenant-cart',
      storage: createJSONStorage(() => hybridStorage)
    }
  )
)
