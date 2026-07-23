'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthTransitionOverlay from '@/components/auth/AuthTransitionOverlay'

function AuthSuccessContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const provider = (searchParams.get('provider') as 'email' | 'google' | 'master') || 'google'

  const handleComplete = () => {
    window.location.href = next
  }

  return (
    <AuthTransitionOverlay
      isVisible={true}
      title="¡Bienvenido a Plataforma Ramos!"
      subtitle="Cargando tu espacio de trabajo y productos..."
      provider={provider}
      onComplete={handleComplete}
    />
  )
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <AuthTransitionOverlay
          isVisible={true}
          title="¡Bienvenido a Plataforma Ramos!"
          subtitle="Cargando tu espacio de trabajo y productos..."
          provider="google"
        />
      }
    >
      <AuthSuccessContent />
    </Suspense>
  )
}
