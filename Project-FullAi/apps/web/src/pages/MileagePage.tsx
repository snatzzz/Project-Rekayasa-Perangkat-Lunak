import React, { useState, useEffect, useCallback } from 'react'
import { Gauge, Plus, Calendar, TrendingUp } from 'lucide-react'
import { useMotorcycle } from '../context/MotorcycleContext.js'
import { api } from '../services/api.js'
import type { MileageRecord } from '../types/index.js'
import { TableSkeleton } from '../components/Skeleton.js'
import { EmptyState } from '../components/EmptyState.js'

export const MileagePage: React.FC = () => {
  const { activeMotorcycle, refreshMotorcycles, showToast } = useMotorcycle()
  const [records, setRecords] = useState<MileageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [newMileage, setNewMileage] = useState<number | ''>('')
  const [recordedDate, setRecordedDate] = useState<string>(
    new Date().toISOString().split('T')[0] ?? ''
  )
  const [formError, setFormError] = useState<string | null>(null)

  const loadMileage = useCallback(async () => {
    if (!activeMotorcycle) return
    try {
      setLoading(true)
      const res = await api.getMileageRecords(activeMotorcycle.id)
      setRecords(res.records)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memuat data kilometer', 'error')
    } finally {
      setLoading(false)
    }
  }, [activeMotorcycle, showToast])

  useEffect(() => {
    loadMileage()
  }, [loadMileage])

  const handleAddMileage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeMotorcycle) return

    const val = Number(newMileage)
    if (isNaN(val) || val < 0) {
      setFormError('Nilai kilometer harus valid dan tidak negatif')
      return
    }

    if (val < activeMotorcycle.currentMileage) {
      setFormError(
        `Kilometer baru (${val.toLocaleString()} KM) tidak boleh lebih rendah dari odometer saat ini (${activeMotorcycle.currentMileage.toLocaleString()} KM)`
      )
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)
      await api.addMileageRecord(activeMotorcycle.id, {
        mileage: val,
        recordedAt: recordedDate ? new Date(recordedDate).toISOString() : undefined,
      })

      showToast(`Kilometer berhasil diperbarui ke ${val.toLocaleString()} KM!`)
      setNewMileage('')
      await loadMileage()
      await refreshMotorcycles()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal mencatat kilometer')
    } finally {
      setSubmitting(false)
    }
  }

  if (!activeMotorcycle) {
    return (
      <EmptyState
        icon={<Gauge className="w-8 h-8" />}
        title="Pilih Motor Terlebih Dahulu"
        description="Silakan pilih motor aktif untuk mengelola dan mencatat riwayat kilometer."
      />
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Pencatatan Kilometer</h1>
        <p className="text-sm text-slate-400 mt-1">
          Pantau riwayat jarak tempuh motor {activeMotorcycle.brand} {activeMotorcycle.model}.
        </p>
      </div>

      {/* Grid: Current Mileage Card & Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Current Mileage Display Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Odometer Saat Ini
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Gauge className="w-6 h-6" />
              </div>
            </div>

            <div className="text-4xl lg:text-5xl font-black text-white font-mono tracking-tight my-2">
              {activeMotorcycle.currentMileage.toLocaleString()}
              <span className="text-lg font-normal text-slate-400 ml-2">KM</span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Setiap pembaruan kilometer akan memicu evaluasi otomatis jadwal servis berkala.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center gap-2 text-xs text-slate-300">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Total {records.length} kali pencatatan tercatat</span>
          </div>
        </div>

        {/* Right: Quick Add Form */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Catat Kilometer Baru
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Masukkan angka odometer terbaru dari speedometer motor Anda.
          </p>

          <form onSubmit={handleAddMileage} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-medium">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Angka Kilometer (KM)
                </label>
                <input
                  type="number"
                  placeholder={`Minimal ${activeMotorcycle.currentMileage}`}
                  value={newMileage}
                  onChange={(e) => setNewMileage(e.target.value === '' ? '' : Number(e.target.value))}
                  min={activeMotorcycle.currentMileage}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tanggal Pencatatan
                </label>
                <input
                  type="date"
                  value={recordedDate}
                  onChange={(e) => setRecordedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : 'Perbarui Kilometer'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* History Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Riwayat Perubahan Kilometer
        </h3>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : records.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            Belum ada riwayat pencatatan kilometer untuk motor ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Tanggal Catat</th>
                  <th className="py-3 px-4">Kilometer</th>
                  <th className="py-3 px-4">Kenaikan Jarak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {records.map((rec, index) => {
                  const prevRec = records[index + 1]
                  const diff = prevRec ? rec.mileage - prevRec.mileage : null

                  return (
                    <tr key={rec.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                        #{records.length - index}
                      </td>
                      <td className="py-3 px-4 text-white">
                        {new Date(rec.recordedAt).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {rec.mileage.toLocaleString()} KM
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {diff !== null ? (
                          <span className="text-slate-300">+{diff.toLocaleString()} KM</span>
                        ) : (
                          <span className="text-slate-400 italic">Pencatatan awal</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
