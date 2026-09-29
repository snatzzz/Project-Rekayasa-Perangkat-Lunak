import React from 'react'
import {
  LayoutDashboard,
  Bike,
  Gauge,
  History,
  Wrench,
  HelpCircle,
  X,
} from 'lucide-react'
import { useMotorcycle } from '../context/MotorcycleContext.js'

export type PageId = 'dashboard' | 'motorcycles' | 'mileage' | 'services' | 'maintenance' | 'recommendation'

interface SidebarProps {
  currentPage: PageId
  onSelectPage: (page: PageId) => void
  isOpenMobile: boolean
  onCloseMobile: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { activeMotorcycle } = useMotorcycle()

  const navItems: { id: PageId; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      desc: 'Ringkasan & status motor',
    },
    {
      id: 'motorcycles',
      label: 'Motor Saya',
      icon: <Bike className="w-5 h-5" />,
      desc: 'Kelola data kendaraan',
    },
    {
      id: 'mileage',
      label: 'Kilometer',
      icon: <Gauge className="w-5 h-5" />,
      desc: 'Catat riwayat kilometer',
    },
    {
      id: 'services',
      label: 'Riwayat Servis',
      icon: <History className="w-5 h-5" />,
      desc: 'Catatan servis & bengkel',
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: <Wrench className="w-5 h-5" />,
      desc: 'Jadwal & interval servis',
    },
    {
      id: 'recommendation',
      label: 'Rekomendasi',
      icon: <HelpCircle className="w-5 h-5" />,
      desc: 'Panduan keluhan motor',
    },
  ]

  const handleNavClick = (id: PageId) => {
    onSelectPage(id)
    onCloseMobile()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-black tracking-wider text-white uppercase">
                Smart Moto
              </div>
              <div className="text-xs text-emerald-400 font-semibold tracking-wide">
                Health & Maintenance
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Motorcycle Quick Status Card */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Motor Aktif
          </div>
          {activeMotorcycle ? (
            <div>
              <div className="text-sm font-bold text-white truncate">
                {activeMotorcycle.brand} {activeMotorcycle.model}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400">Total Odo:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {activeMotorcycle.currentMileage.toLocaleString()} KM
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">Belum ada motor dipilih</div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 font-medium'
                }`}
              >
                <div
                  className={`${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm leading-tight">{item.label}</div>
                  <div className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-center">
          <div className="text-xs text-slate-400">Proyek Rekayasa Perangkat Lunak</div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">Semester 3</div>
        </div>
      </aside>
    </>
  )
}
