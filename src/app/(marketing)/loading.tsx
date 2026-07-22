import React from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function MarketingLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 space-y-16 animate-pulse">
      {/* Skeleton del Hero */}
      <div className="flex flex-col lg:flex-row items-center gap-12 pt-8">
        <div className="w-full lg:w-1/2 space-y-6">
          <Skeleton className="h-6 w-48 rounded-full" />
          <Skeleton className="h-14 w-full max-w-lg rounded-2xl" />
          <Skeleton className="h-14 w-3/4 rounded-2xl" />
          <Skeleton className="h-16 w-full max-w-md rounded-2xl" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 w-44 rounded-xl" />
            <Skeleton className="h-12 w-36 rounded-xl" />
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex justify-center">
          <Skeleton className="w-[300px] h-[550px] rounded-[40px]" />
        </div>
      </div>

      {/* Skeleton de las tarjetas de características / giros */}
      <div className="space-y-6 pt-12">
        <div className="flex flex-col items-center space-y-3 text-center">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-8 w-96 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="h-5 w-3/4 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
