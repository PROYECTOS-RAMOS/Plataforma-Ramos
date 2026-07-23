'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'

interface ImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackText?: string
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackText
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className={`bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-2 border border-slate-200/50 ${className}`}>
        <ShoppingBag className="w-6 h-6 stroke-[1.5] text-slate-300 mb-1" />
        {fallbackText && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 text-center truncate max-w-full">
            {fallbackText}
          </span>
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  )
}
