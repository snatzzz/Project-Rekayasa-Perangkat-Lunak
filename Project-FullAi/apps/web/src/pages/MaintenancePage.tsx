import React, { useState, useEffect, useCallback } from 'react'
import { Wrench, Plus, Edit, Trash2, Clock, Gauge, AlertCircle } from 'lucide-react'
import { useMotorcycle } from '../context/MotorcycleContext.js'
import { api } from '../services/api.js'
import type { MaintenanceSchedule } from '../types/index.js'
import { Badge } from '../components/Badge.js'
import { Modal } from '../components/Modal.js'
import { TableSkeleton } from '../components/Skeleton.js'
import { EmptyState } from '../components/EmptyState.js'

export const MaintenancePage: React.FC<{ initialOpenAdd?: boolean; onResetInitialOpenAdd?: () => void }> = ({
  initialOpenAdd,
  onResetInitialOpenAdd,
}) => {
  const { activeMotorcycle, refreshMotorcycles, showToast } = useMotorcycle()
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<MaintenanceSchedule | null>(null)
  const [deletingSchedule, setDeletingSchedule] = useState<MaintenanceSchedule | null>(null)

  // Form states
  const [maintenanceType, setMaintenanceType] = useState('')
  const [intervalKm, setIntervalKm] = useState<number>(2000)
  const [intervalDays, setIntervalDays] = useState<number>(60)
  const [lastServiceMileage, setLastServiceMileage] = useState<number>(0)
  const [lastServiceDate, setLastServiceDate] = useState<string>(
    new Date().toISOString().split('T')[0] ?? ''
  )
  const [formError, setFormError] = useState<string | null>(null)

  const loadMaintenance = useCallback(async () => {
    if (!activeMotorcycle) return
    try {
      setLoading(true)
      const res = await api.getMaintenanceSchedules(activeMotorcycle.id)
      setSchedules(res.schedules)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memuat jadwal maintenance', 'error')
    } finally {
      setLoading(false)
    }
  }, [activeMotorcycle, showToast])

  useEffect(() => {
    loadMaintenance()
  }, [loadMaintenance])

  useEffect(() => {
    if (initialOpenAdd && activeMotorcycle) {
      openAddModal()
      if (onResetInitialOpenAdd) onResetInitialOpenAdd()
    }
  }, [initialOpenAdd, activeMotorcycle])

  const openAddModal = () => {
    setMaintenanceType('')
    setIntervalKm(2000)
    setIntervalDays(60)
    setLastServiceMileage(activeMotorcycle?.currentMileage ?? 0)
    setLastServiceDate(new Date().toISOString().split('T')[0] ?? '')
    setFormError(null)
    setIsAddModalOpen(true)
  }

  const openEditModal = (item: MaintenanceSchedule) => {
    setEditingSchedule(item)
    setMaintenanceType(item.maintenanceType)
    setIntervalKm(item.intervalKm)
    setIntervalDays(item.intervalDays)
    setLastServiceMileage(item.lastServiceMileage)
    setLastServiceDate(new Date(item.lastServiceDate).toISOString().split('T')[0] ?? '')
    setFormError(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeMotorcycle) return
    if (!maintenanceType.trim()) {
      setFormError('Jenis maintenance wajib diisi')
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)
      await api.createMaintenanceSchedule(activeMotorcycle.id, {
        maintenanceType: maintenanceType.trim(),
        intervalKm: Number(intervalKm),
        intervalDays: Number(intervalDays),
        lastServiceMileage: Number(lastServiceMileage),
        lastServiceDate: new Date(lastServiceDate).toISOString(),
      })

      showToast('Jadwal maintenance baru berhasil ditambahkan!')
      setIsAddModalOpen(false)
      await loadMaintenance()
      await refreshMotorcycles()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menambahkan jadwal maintenance')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSchedule) return
    if (!maintenanceType.trim()) {
      setFormError('Jenis maintenance wajib diisi')
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)
      await api.updateMaintenanceSchedule(editingSchedule.id, {
        maintenanceType: maintenanceType.trim(),
        intervalKm: Number(intervalKm),
        intervalDays: Number(intervalDays),
        lastServiceMileage: Number(lastServiceMileage),
        lastServiceDate: new Date(lastServiceDate).toISOString(),
      })

      showToast('Jadwal maintenance berhasil diperbarui!')
      setEditingSchedule(null)
      await loadMaintenance()
      await refreshMotorcycles()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal memperbarui jadwal maintenance')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingSchedule) return

    try {
      setSubmitting(true)
      await api.deleteMaintenanceSchedule(deletingSchedule.id)
      showToast('Jadwal maintenance berhasil dihapus')
      setDeletingSchedule(null)
      await loadMaintenance()
      await refreshMotorcycles()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus jadwal maintenance', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!activeMotorcycle) {
    return (
      <EmptyState
        icon={<Wrench className="w-8 h-8" />}
        title="Pilih Motor Terlebih Dahulu"
        description="Silakan pilih motor aktif untuk mengelola jadwal maintenance berkala."
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Jadwal Maintenance</h1>
          <p className="text-sm text-slate-400 mt-1">
            Pantau interval waktu dan kilometer setiap suku cadang motor {activeMotorcycle.brand} {activeMotorcycle.model}.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 w-fit"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      {/* Logic explanation bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold text-slate-200">Perhitungan Dinamis:</span> Status maintenance dihitung secara real-time berdasarkan perbandingan kilometer saat ini ({activeMotorcycle.currentMileage.toLocaleString()} KM) dan tanggal hari ini terhadap batas interval servis. Status tidak disimpan mati di database sehingga selalu akurat.
        </div>
      </div>

      {/* Schedules List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={<Wrench className="w-8 h-8" />}
          title="Belum Ada Jadwal Maintenance"
          description="Tambahkan interval servis rutin seperti Ganti Oli (setiap 2000 km / 60 hari) atau Servis CVT (setiap 8000 km / 180 hari)."
          actionLabel="Tambah Jadwal Sekarang"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((item) => {
            const isOverdue = item.status === 'OVERDUE'
            const isDueSoon = item.status === 'DUE SOON' || item.status === 'DUE'

            let progressColor = 'bg-emerald-500'
            let cardBorder = 'border-slate-800'

            if (isOverdue) {
              progressColor = 'bg-rose-500'
              cardBorder = 'border-rose-900/60'
            } else if (isDueSoon) {
              progressColor = 'bg-amber-400'
              cardBorder = 'border-amber-900/40'
            }

            return (
              <div
                key={item.id}
                className={`p-6 rounded-2xl bg-slate-900 border ${cardBorder} shadow-xl flex flex-col justify-between transition-all hover:border-slate-700`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-black text-white">{item.maintenanceType}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Interval: <span className="font-mono text-slate-300 font-bold">{item.intervalKm.toLocaleString()} KM</span> atau{' '}
                        <span className="font-mono text-slate-300 font-bold">{item.intervalDays} hari</span>
                      </div>
                    </div>
                    <Badge status={item.status} />
                  </div>

                  {/* Visual Progress Bar Component */}
                  <div className="my-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                      <span>Progres Servis</span>
                      <span className="font-mono text-white font-bold">{item.progressPercent}%</span>
                    </div>

                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="text-[10px] uppercase text-slate-400">Servis Terakhir</div>
                        <div className="text-slate-300 font-bold">
                          {item.lastServiceMileage.toLocaleString()} km
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase text-slate-400">Jadwal Berikutnya</div>
                        <div className="text-emerald-400 font-bold">
                          {item.nextMileage.toLocaleString()} km
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                      <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Sisa Kilometer:</span>
                      </div>
                      <div className={`font-mono font-bold text-sm ${isOverdue ? 'text-rose-400' : 'text-white'}`}>
                        {item.remainingKm > 0 ? `${item.remainingKm.toLocaleString()} KM` : `Terlewat ${Math.abs(item.remainingKm).toLocaleString()} KM`}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                      <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Sisa Waktu:</span>
                      </div>
                      <div className={`font-mono font-bold text-sm ${isOverdue ? 'text-rose-400' : 'text-white'}`}>
                        {item.remainingDays > 0 ? `${item.remainingDays} hari lagi` : `Terlewat ${Math.abs(item.remainingDays)} hari`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card actions */}
                <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400">
                    Terakhir: {new Date(item.lastServiceDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit Jadwal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSchedule(item)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Maintenance Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Jadwal Maintenance"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Jenis Perawatan / Komponen
            </label>
            <input
              type="text"
              placeholder="Contoh: Ganti Oli Mesin, Servis CVT, Ganti Busi, Cek Kampas Rem"
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Interval Kilometer (KM)
              </label>
              <input
                type="number"
                min="1"
                placeholder="Contoh: 2000"
                value={intervalKm}
                onChange={(e) => setIntervalKm(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Interval Hari
              </label>
              <input
                type="number"
                min="1"
                placeholder="Contoh: 60"
                value={intervalDays}
                onChange={(e) => setIntervalDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Kilometer Servis Terakhir
              </label>
              <input
                type="number"
                min="0"
                value={lastServiceMileage}
                onChange={(e) => setLastServiceMileage(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Tanggal Servis Terakhir
              </label>
              <input
                type="date"
                value={lastServiceDate}
                onChange={(e) => setLastServiceDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Maintenance Modal */}
      <Modal
        isOpen={Boolean(editingSchedule)}
        onClose={() => setEditingSchedule(null)}
        title="Edit Jadwal Maintenance"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Jenis Perawatan / Komponen
            </label>
            <input
              type="text"
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Interval Kilometer (KM)
              </label>
              <input
                type="number"
                min="1"
                value={intervalKm}
                onChange={(e) => setIntervalKm(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Interval Hari
              </label>
              <input
                type="number"
                min="1"
                value={intervalDays}
                onChange={(e) => setIntervalDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Kilometer Servis Terakhir
              </label>
              <input
                type="number"
                min="0"
                value={lastServiceMileage}
                onChange={(e) => setLastServiceMileage(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Tanggal Servis Terakhir
              </label>
              <input
                type="date"
                value={lastServiceDate}
                onChange={(e) => setLastServiceDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingSchedule(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {submitting ? 'Memperbarui...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingSchedule)}
        onClose={() => setDeletingSchedule(null)}
        title="Konfirmasi Hapus Jadwal"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Apakah Anda yakin ingin menghapus jadwal perawatan{' '}
            <span className="font-bold text-white">{deletingSchedule?.maintenanceType}</span>?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setDeletingSchedule(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
