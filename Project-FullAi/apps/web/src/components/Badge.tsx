import React from 'react'

interface BadgeProps {
  status: string
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase().trim()

  let style = 'bg-slate-800 text-slate-300 border-slate-700'

  if (normalized === 'UPCOMING' || normalized === 'GOOD' || normalized === 'BAIK') {
    style = 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
  } else if (normalized === 'DUE SOON' || normalized === 'SEGERA') {
    style = 'bg-amber-950/80 text-amber-400 border-amber-500/30'
  } else if (normalized === 'DUE' || normalized === 'FAIR' || normalized === 'CUKUP') {
    style = 'bg-orange-950/80 text-orange-400 border-orange-500/30'
  } else if (
    normalized === 'OVERDUE' ||
    normalized === 'NEEDS ATTENTION' ||
    normalized === 'NEEDS_ATTENTION' ||
    normalized === 'TINGGI'
  ) {
    style = 'bg-rose-950/80 text-rose-400 border-rose-500/30'
  } else if (normalized === 'SEDANG') {
    style = 'bg-yellow-950/80 text-yellow-400 border-yellow-500/30'
  } else if (normalized === 'STANDAR') {
    style = 'bg-blue-950/80 text-blue-400 border-blue-500/30'
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80 animate-pulse"></span>
      {status}
    </span>
  )
}
