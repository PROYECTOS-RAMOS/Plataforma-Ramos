'use client'

import React from 'react'

interface LogoProps {
  className?: string
  size?: number
  mirror?: boolean
}

export default function Logo({ className = '', size = 40, mirror = false }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={mirror ? { transform: 'scaleX(-1)' } : undefined}
      >
        <style>
          {`
            @keyframes float-main {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-3px) scale(1.02); }
            }
            @keyframes float-left {
              0%, 100% { transform: translateY(0px) rotate(-2deg); }
              50% { transform: translateY(2px) rotate(2deg); }
            }
            @keyframes float-right {
              0%, 100% { transform: translateY(0px) rotate(3deg); }
              50% { transform: translateY(-2px) rotate(-3deg); }
            }
            @keyframes pulse-stroke {
              0%, 100% { stroke-opacity: 0.3; stroke-dashoffset: 0; }
              50% { stroke-opacity: 0.8; stroke-dashoffset: 20; }
            }
            .animate-main-diamond {
              transform-origin: 50px 45px;
              animation: float-main 4s ease-in-out infinite;
            }
            .animate-left-diamond {
              transform-origin: 28px 62px;
              animation: float-left 3.5s ease-in-out infinite;
            }
            .animate-right-diamond {
              transform-origin: 70px 52px;
              animation: float-right 4.5s ease-in-out infinite;
            }
            .animate-trace {
              stroke-dasharray: 40;
              animation: pulse-stroke 6s linear infinite;
            }
          `}
        </style>

        {/* Halo / Líneas de trazos elegantes de fondo con color e instrucciones planas */}
        <path
          d="M 50 12 C 67 15, 83 30, 83 48"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="animate-trace"
          opacity="0.4"
        />
        <path
          d="M 17 52 C 17 70, 33 85, 50 88"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="animate-trace"
          style={{ animationDelay: '-3s' }}
          opacity="0.4"
        />

        {/* Rombo Izquierdo Abajo (Azul Sólido) */}
        <polygon
          points="28,50 35,62 28,74 21,62"
          fill="#3B82F6"
          className="animate-left-diamond"
        />
        {/* Contorno para mayor definición y relieve 3D */}
        <path
          d="M 21 62 L 28 50 L 35 62 L 28 74 Z"
          stroke="#1D4ED8"
          strokeWidth="1"
          strokeLinejoin="round"
          className="animate-left-diamond"
        />

        {/* Rombo Derecho Arriba (Azul Sólido) */}
        <polygon
          points="70,44 75,52 70,60 65,52"
          fill="#3B82F6"
          className="animate-right-diamond"
        />
        {/* Contorno para mayor definición y relieve 3D */}
        <path
          d="M 65 52 L 70 44 L 75 52 L 70 60 Z"
          stroke="#1D4ED8"
          strokeWidth="1"
          strokeLinejoin="round"
          className="animate-right-diamond"
        />

        {/* Rombo Central Grande (Rojo Sólido) */}
        <polygon
          points="50,22 61,45 50,68 39,45"
          fill="#EF4444"
          className="animate-main-diamond"
        />
        {/* Contorno para mayor definición y relieve 3D */}
        <path
          d="M 39 45 L 50 22 L 61 45 L 50 68 Z"
          stroke="#B91C1C"
          strokeWidth="1"
          strokeLinejoin="round"
          className="animate-main-diamond"
        />
      </svg>
    </div>
  )
}
