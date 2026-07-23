'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ShieldCheck, Sparkles, Store, Lock, ArrowRight } from 'lucide-react'
import Logo from '@/components/marketing/Logo'

interface AuthTransitionOverlayProps {
  isVisible: boolean
  title?: string
  subtitle?: string
  userEmailOrName?: string
  provider?: 'email' | 'google' | 'master'
  onComplete?: () => void
}

export default function AuthTransitionOverlay({
  isVisible,
  title = '¡Bienvenido a Plataforma Ramos!',
  subtitle = 'Cargando tu espacio de trabajo y productos...',
  userEmailOrName,
  provider = 'email',
  onComplete,
}: AuthTransitionOverlayProps) {
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(25)

  useEffect(() => {
    if (!isVisible) return

    // Tiempos ultra fluidos y profesionales (600ms total)
    const timer1 = setTimeout(() => {
      setStep(2)
      setProgress(65)
    }, 220)

    const timer2 = setTimeout(() => {
      setStep(3)
      setProgress(100)
    }, 500)

    const timer3 = setTimeout(() => {
      if (onComplete) onComplete()
    }, 750)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [isVisible, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.25, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden font-sans select-none"
        >
          {/* Barra de progreso fija en el borde superior */}
          <div className="absolute top-0 inset-x-0 h-1 bg-slate-900 overflow-hidden z-20">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            />
          </div>

          {/* Luces y Neón de Fondo */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/10 to-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

          {/* Header Superior: Identidad Plataforma Ramos */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-800/60 pb-5">
            <div className="flex items-center gap-3">
              <Logo />
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-3.5 py-1 text-[11px] font-bold text-slate-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Conexión Segura SSL</span>
            </div>
          </div>

          {/* Cuerpo Central: Vista de Transición Fluida */}
          <div className="relative z-10 max-w-lg mx-auto w-full my-auto text-center space-y-7 py-8">
            {/* Emblema con Logo Plataforma Ramos */}
            <div className="relative inline-block">
              <motion.div 
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 opacity-40 blur-md"
              />
              <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700/60 shadow-2xl flex items-center justify-center text-white mx-auto backdrop-blur-xl">
                {provider === 'master' ? (
                  <ShieldCheck className="w-10 h-10 text-indigo-400" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/20">
                    R
                  </div>
                )}
              </div>
            </div>

            {/* Mensajes de bienvenida */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {title}
              </h2>
              {userEmailOrName && (
                <p className="text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full inline-block">
                  {userEmailOrName}
                </p>
              )}
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                {subtitle}
              </p>
            </div>

            {/* Indicador de Carga Horizontal Delgado */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 space-y-3 backdrop-blur-xl text-xs font-semibold">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span>Verificación de sesión</span>
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-in zoom-in duration-150" />
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-indigo-400" />
                  <span>Sincronizando tienda</span>
                </span>
                {step >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-in zoom-in duration-150" />
                ) : (
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Desplegando panel</span>
                </span>
                {step >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-in zoom-in duration-150" />
                ) : (
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Cargando...</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Inferior */}
          <div className="relative z-10 flex items-center justify-between border-t border-slate-800/60 pt-4 text-[11px] text-slate-500 font-medium">
            <span>Plataforma Ramos © 2026</span>
            <span>Sistema Multi-tienda v2.0</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
