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

        {/* Halo / Líneas de trazos elegantes de fondo */}
        <path
          d="M 50 12 C 67 15, 83 30, 83 48"
          stroke="url(#gradient-trace)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="animate-trace"
        />
        <path
          d="M 17 52 C 17 70, 33 85, 50 88"
          stroke="url(#gradient-trace)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="animate-trace"
          style={{ animationDelay: '-3s' }}
        />

        {/* Rombo Izquierdo Abajo (Azul) */}
        <polygon
          points="28,50 35,62 28,74 21,62"
          fill="url(#gradient-blue)"
          className="animate-left-diamond"
        />
        {/* Trazo del Rombo Izquierdo para darle relieve 3D */}
        <path
          d="M 21 62 L 28 50 L 35 62 L 28 74 Z"
          stroke="#2563EB"
          strokeWidth="0.8"
          strokeLinejoin="round"
          className="animate-left-diamond"
          opacity="0.8"
        />

        {/* Rombo Derecho Arriba (Azul) */}
        <polygon
          points="70,44 75,52 70,60 65,52"
          fill="url(#gradient-blue)"
          className="animate-right-diamond"
        />
        {/* Trazo del Rombo Derecho para darle relieve 3D */}
        <path
          d="M 65 52 L 70 44 L 75 52 L 70 60 Z"
          stroke="#2563EB"
          strokeWidth="0.8"
          strokeLinejoin="round"
          className="animate-right-diamond"
          opacity="0.8"
        />

        {/* Rombo Central Grande (Rojo) */}
        <polygon
          points="50,22 61,45 50,68 39,45"
          fill="url(#gradient-red)"
          className="animate-main-diamond"
        />
        {/* Contorno del Rombo Central para darle relieve 3D */}
        <path
          d="M 39 45 L 50 22 L 61 45 L 50 68 Z"
          stroke="#DC2626"
          strokeWidth="0.8"
          strokeLinejoin="round"
          className="animate-main-diamond"
          opacity="0.9"
        />

        {/* GRADIENTES Y DEGRADADOS OPTIMIZADOS (Compatibilidad 100% en todos los navegadores) */}
        <defs>
          {/* Degradado Rojo de arriba hacia abajo */}
          <linearGradient id="gradient-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          {/* Degradado Azul de arriba hacia abajo */}
          <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Degradado para los trazos de fondo */}
          <linearGradient id="gradient-trace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#64748B" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#F1F5F9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
