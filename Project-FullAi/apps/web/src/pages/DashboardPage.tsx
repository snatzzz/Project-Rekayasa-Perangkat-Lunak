import React, { useEffect, useState, useCallback } from 'react'
import {
  Gauge,
  HeartPulse,
  Clock,
  AlertTriangle,
  Wrench,
  History,
  Plus,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { useMotorcycle } from '../context/MotorcycleContext.js'
import { api } from '../services/api.js'
import type { DashboardData } from '../types/index.js'
import { Badge } from '../components/Badge.js'
import { Skeleton, CardSkeleton } from '../components/Skeleton.js'
import { EmptyState } from '../components/EmptyState.js'
import type { PageId } from '../components/Sidebar.js'

interface DashboardPageProps {
  onNavigate: (page: PageId) => void
  onOpenAddMileage: () => void
  onOpenAddService: () => void
  onOpenAddMaintenance: () => void
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenAddMileage,
  onOpenAddService,
  onOpenAddMaintenance,
}) => {
  const { activeMotorcycle } = useMotorcycle()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    if (!activeMotorcycle) {
      setData(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await api.getDashboardData(activeMotorcycle.id)
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dashboard')
    } finally {
      setLoading(false)
    }
  }, [activeMotorcycle])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (!activeMotorcycle) {
    return (
      <EmptyState
        title="Belum Ada Motor yang Dipilih"
        description="Silakan tambahkan profil motor terlebih dahulu atau pilih salah satu motor Anda."
        actionLabel="Buka Menu Motor Saya"
        onAction={() => onNavigate('motorcycles')}
      />
    )
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-950/40 border border-rose-800/80 rounded-2xl text-rose-200">
        <div className="font-bold mb-1">Gagal Menampilkan Dashboard</div>
        <p className="text-sm opacity-90">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  const { healthScore, summary, closestMaintenance, overdueMaintenance, recentServices } = data!

  // Health Score color theme
  let healthBorder = 'border-slate-800'
  let healthText = 'text-white'
  let healthBg = 'bg-slate-900/60'
  let healthBadgeColor = 'GOOD'

  if (healthScore.status === 'GOOD') {
    healthBorder = 'border-emerald-500/40'
    healthText = 'text-emerald-400'
    healthBg = 'bg-gradient-to-br from-emerald-950/30 to-slate-900/60'
    healthBadgeColor = 'GOOD'
  } else if (healthScore.status === 'FAIR') {
    healthBorder = 'border-amber-500/40'
    healthText = 'text-amber-400'
    healthBg = 'bg-gradient-to-br from-amber-950/30 to-slate-900/60'
    healthBadgeColor = 'FAIR'
  } else if (healthScore.status === 'NEEDS_ATTENTION') {
    healthBorder = 'border-rose-500/40'
    healthText = 'text-rose-400'
    healthBg = 'bg-gradient-to-br from-rose-950/30 to-slate-900/60'
    healthBadgeColor = 'NEEDS ATTENTION'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner: Motor Name & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            Ringkasan Kendaraan
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {activeMotorcycle.brand} {activeMotorcycle.model}{' '}
            <span className="text-slate-400 text-xl font-normal">({activeMotorcycle.year})</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pantauan kondisi suku cadang, kilometer, dan jadwal servis berkala.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
          <button
            onClick={onOpenAddMileage}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all hover:border-slate-600"
          >
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>Tambah KM</span>
          </button>
          <button
            onClick={onOpenAddService}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all hover:border-slate-600"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>Catat Servis</span>
          </button>
          <button
            onClick={onOpenAddMaintenance}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Jadwal Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Mileage */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Kilometer Saat Ini</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {summary.currentMileage.toLocaleString()}
              <span className="text-sm font-medium text-slate-400 ml-1.5">KM</span>
            </div>
            <button
              onClick={() => onNavigate('mileage')}
              className="mt-3 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <span>Riwayat Kilometer</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Health Score Highlight */}
        <div
          className={`p-5 rounded-2xl ${healthBg} border ${healthBorder} flex flex-col justify-between transition-all`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Health Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black font-mono tracking-tight ${healthText}`}>
                {healthScore.score !== null ? healthScore.score : '-'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              <div className="ml-auto">
                <Badge status={healthBadgeColor} />
              </div>
            </div>
            <div className="text-xs text-slate-300 mt-2 line-clamp-1">
              {healthScore.summary}
            </div>
          </div>
        </div>

        {/* Card 3: Due Soon */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Perlu Servis Segera</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
              {summary.dueSoonCount + summary.dueCount}
              <span className="text-xs font-medium text-slate-400 ml-2">komponen</span>
            </div>
            <button
              onClick={() => onNavigate('maintenance')}
              className="mt-3 flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              <span>Lihat Jadwal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 4: Overdue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Jadwal Terlambat</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-rose-400 font-mono tracking-tight">
              {summary.overdueCount}
              <span className="text-xs font-medium text-slate-400 ml-2">terlewat</span>
            </div>
            <button
              onClick={() => onNavigate('maintenance')}
              className="mt-3 flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              <span>Periksa Komponen</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Health Score Explanations Details */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Analisis Logika Health Score
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Skor dihitung secara transparan berbasis aturan matematis: dimulai dari 100 poin, dikurangi 25 poin untuk setiap perawatan terlambat (Overdue) dan 10 poin untuk yang mendekati batas (Due Soon).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {healthScore.reasons.map((reason, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue Maintenance Alert Section (if any) */}
      {overdueMaintenance.length > 0 && (
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-900/60 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold text-white">
                Perhatian: Perawatan Melewati Batas ({overdueMaintenance.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('maintenance')}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              Kelola Semua
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdueMaintenance.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900 border border-rose-900/40 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-white">{item.maintenanceType}</div>
                  <div className="text-xs text-rose-400 mt-1">
                    Terlewat {Math.abs(item.remainingKm).toLocaleString()} KM atau{' '}
                    {Math.abs(item.remainingDays)} hari
                  </div>
                </div>
                <button
                  onClick={onOpenAddService}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition-colors"
                >
                  Servis Sekarang
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Maintenance Terdekat & Servis Terakhir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section: Maintenance Terdekat */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Maintenance Terdekat</h3>
              </div>
              <button
                onClick={() => onNavigate('maintenance')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {closestMaintenance.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 italic">
                Tidak ada jadwal perawatan mendatang atau semua dalam kondisi aman.
              </div>
            ) : (
              <div className="space-y-4">
                {closestMaintenance.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">{item.maintenanceType}</span>
                      <Badge status={item.status} />
                    </div>

                    {/* Progress Bar (Visual Rule) */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.status === 'OVERDUE'
                            ? 'bg-rose-500'
                            : item.status === 'DUE' || item.status === 'DUE SOON'
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>{item.lastServiceMileage.toLocaleString()} km</span>
                      <span className="text-emerald-400 font-bold">
                        Sisa {item.remainingKm > 0 ? item.remainingKm.toLocaleString() : 0} KM ({item.remainingDays} hari)
                      </span>
                      <span>{item.nextMileage.toLocaleString()} km</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section: Servis Terakhir */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Servis Terakhir</h3>
              </div>
              <button
                onClick={() => onNavigate('services')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Riwayat Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentServices.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 italic">
                Belum ada catatan servis untuk motor ini.
              </div>
            ) : (
              <div className="space-y-3">
                {recentServices.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{svc.serviceType}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(svc.serviceDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        • <span className="font-mono text-slate-300">{svc.mileage.toLocaleString()} KM</span>
                      </div>
                      {svc.notes && <div className="text-[11px] text-slate-400 mt-1 italic">"{svc.notes}"</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        Rp {svc.cost.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
