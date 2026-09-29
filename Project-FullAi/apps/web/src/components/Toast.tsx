import React from 'react'
import { useMotorcycle } from '../context/MotorcycleContext.js'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useMotorcycle()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderColor = 'border-emerald-500/50'
        let bg = 'bg-slate-900/95'
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />

        if (toast.type === 'error') {
          borderColor = 'border-rose-500/50'
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        } else if (toast.type === 'info') {
          borderColor = 'border-cyan-500/50'
          icon = <Info className="w-5 h-5 text-cyan-400 shrink-0" />
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderColor} ${bg} text-slate-100 shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-in`}
          >
            {icon}
            <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
