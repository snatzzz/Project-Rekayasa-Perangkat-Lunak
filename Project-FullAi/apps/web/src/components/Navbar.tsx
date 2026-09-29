import React from 'react'
import { Menu, RefreshCw, Plus, Bike } from 'lucide-react'
import { useMotorcycle } from '../context/MotorcycleContext.js'

interface NavbarProps {
  onOpenMobileMenu: () => void
  onOpenAddMotorcycle: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, onOpenAddMotorcycle }) => {
  const { motorcycles, activeMotorcycle, setActiveMotorcycle, refreshMotorcycles, loading } = useMotorcycle()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Motorcycle Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Bike className="w-4 h-4" />
          </div>

          {motorcycles.length > 0 ? (
            <div className="relative">
              <select
                aria-label="Pilih Motor"
                value={activeMotorcycle?.id ?? ''}
                onChange={(e) => {
                  const id = parseInt(e.target.value, 10)
                  const selected = motorcycles.find((m) => m.id === id) || null
                  setActiveMotorcycle(selected)
                }}
                className="bg-slate-900 border border-slate-700/80 text-white font-semibold text-sm rounded-xl px-3.5 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer hover:bg-slate-850 transition-colors"
              >
                {motorcycles.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white py-1">
                    {m.brand} {m.model} ({m.year}) - {m.currentMileage.toLocaleString()} KM
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ▼
              </div>
            </div>
          ) : (
            <span className="text-sm text-slate-400 font-medium">Belum ada motor terdaftar</span>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => refreshMotorcycles()}
          disabled={loading}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors disabled:opacity-50"
          title="Segarkan Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        <button
          onClick={onOpenAddMotorcycle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all duration-150 shadow-md shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Motor Baru</span>
        </button>
      </div>
    </header>
  )
}
