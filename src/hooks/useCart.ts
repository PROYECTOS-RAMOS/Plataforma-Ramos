'use client'

import { useCart as useCartFromContext } from '@/contexts/CartContext'

/**
 * Hook para interactuar con la instancia del carrito de compras global
 * de la tienda del inquilino (Storefront).
 */
export function useCart() {
  return useCartFromContext()
}
