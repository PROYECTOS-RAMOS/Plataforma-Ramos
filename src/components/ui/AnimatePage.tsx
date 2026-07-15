'use client'

import { motion } from 'framer-motion'
import React from 'react'

interface AnimatePageProps {
  children: React.ReactNode
  className?: string
}

export default function AnimatePage({ children, className }: AnimatePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
