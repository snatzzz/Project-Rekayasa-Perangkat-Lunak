import React from 'react'

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-800/80 rounded-lg ${className}`}
    />
  )
}

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <Skeleton className="h-6 w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  )
}
