import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80 bg-gradient-to-r from-transparent via-white/20 to-transparent ${className}`}
      {...props}
    />
  )
}

export default Skeleton
