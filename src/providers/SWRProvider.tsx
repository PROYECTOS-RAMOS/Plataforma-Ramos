'use client'

import React from 'react'
import { SWRConfig } from 'swr'

interface SWRProviderProps {
  children: React.ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 10000, // Deduplicar peticiones iguales por 10 segundos
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  )
}

export default SWRProvider
