'use client'

import { useEffect } from 'react'

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return

    // Guardar estilos originales
    const originalBodyOverflow = document.body.style.overflow
    const originalDocOverflow = document.documentElement.style.overflow

    // Bloquear el scroll en document.documentElement y document.body
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    // Bloquear también los contenedores principales de la aplicación (<main>)
    const mainElements = document.querySelectorAll('main')
    const originalMainOverflows: string[] = []

    mainElements.forEach((el) => {
      originalMainOverflows.push(el.style.overflow)
      el.style.overflow = 'hidden'
    })

    // Limpiar touchAction global en el body para permitir scroll en la ventana flotante
    document.body.style.touchAction = ''

    return () => {
      document.documentElement.style.overflow = originalDocOverflow
      document.body.style.overflow = originalBodyOverflow
      document.body.style.touchAction = ''

      mainElements.forEach((el, index) => {
        el.style.overflow = originalMainOverflows[index] || ''
      })
    }
  }, [isLocked])
}
