import React, { useState, useEffect, useCallback } from 'react'
import { History, Plus, Edit, Trash2, DollarSign } from 'lucide-react'
import { useMotorcycle } from '../context/MotorcycleContext.js'
import { api } from '../services/api.js'
import type { ServiceHistory } from '../types/index.js'
import { Modal } from '../components/Modal.js'
import { TableSkeleton } from '../components/Skeleton.js'
import { EmptyState } from '../components/EmptyState.js'

export const ServicesPage: React.FC<{ initialOpenAdd?: boolean; onResetInitialOpenAdd?: () => void }> = ({
  initialOpenAdd,
  onResetInitialOpenAdd,
}) => {
  const { activeMotorcycle, refreshMotorcycles, showToast } = useMotorcycle()
  const [services, setServices] = useState<ServiceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceHistory | null>(null)
  const [deletingService, setDeletingService] = useState<ServiceHistory | null>(null)

  // Form states
  const [serviceType, setServiceType] = useState('')
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0] ?? '')
  const [mileage, setMileage] = useState<number>(0)
  const [cost, setCost] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const loadServices = useCallback(async () => {
    if (!activeMotorcycle) return
    try {
      setLoading(true)
      const res = await api.getServices(activeMotorcycle.id)
      setServices(res)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memuat riwayat servis', 'error')
    } finally {
      setLoading(false)
    }
  }, [activeMotorcycle, showToast])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  useEffect(() => {
    if (initialOpenAdd && activeMotorcycle) {
      openAddModal()
      if (onResetInitialOpenAdd) onResetInitialOpenAdd()
    }
  }, [initialOpenAdd, activeMotorcycle])

  const openAddModal = () => {
    setServiceType('')
    setServiceDate(new Date().toISOString().split('T')[0] ?? '')
    setMileage(activeMotorcycle?.currentMileage ?? 0)
    setCost(0)
    setNotes('')
    setFormError(null)
    setIsAddModalOpen(true)
  }

  const openEditModal = (svc: ServiceHistory) => {
    setEditingService(svc)
    setServiceType(svc.serviceType)
    setServiceDate(new Date(svc.serviceDate).toISOString().split('T')[0] ?? '')
    setMileage(svc.mileage)
    setCost(svc.cost)
    setNotes(svc.notes || '')
    setFormError(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeMotorcycle) return
    if (!serviceType.trim()) {
      setFormError('Jenis servis wajib diisi')
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)
      const res = await api.createService(activeMotorcycle.id, {
        serviceType: serviceType.trim(),
        serviceDate: new Date(serviceDate).toISOString(),
        mileage: Number(mileage),
        cost: Number(cost),
        notes: notes.trim() || undefined,
      })

      if (res.syncedSchedule) {
        showToast(
          `Servis dicatat! Jadwal "${res.syncedSchedule.maintenanceType}" otomatis disinkronkan.`
        )
      } else {
        showToast('Riwayat servis berhasil dicatat!')
      }

      setIsAddModalOpen(false)
      await loadServices()
      await refreshMotorcycles()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal mencatat servis')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingService) return
    if (!serviceType.trim()) {
      setFormError('Jenis servis wajib diisi')
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)
      await api.updateService(editingService.id, {
        serviceType: serviceType.trim(),
        serviceDate: new Date(serviceDate).toISOString(),
        mileage: Number(mileage),
        cost: Number(cost),
        notes: notes.trim() || null,
      })

      showToast('Riwayat servis berhasil diperbarui!')
      setEditingService(null)
      await loadServices()
      await refreshMotorcycles()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal memperbarui servis')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingService) return

    try {
      setSubmitting(true)
      await api.deleteService(deletingService.id)
      showToast('Catatan servis berhasil dihapus')
      setDeletingService(null)
      await loadServices()
      await refreshMotorcycles()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus servis', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!activeMotorcycle) {
    return (
      <EmptyState
        icon={<History className="w-8 h-8" />}
        title="Pilih Motor Terlebih Dahulu"
        description="Silakan pilih motor aktif untuk mengelola riwayat servis dan perawatan bengkel."
      />
    )
  }

  const totalCost = services.reduce((acc, curr) => acc + curr.cost, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Riwayat Servis</h1>
          <p className="text-sm text-slate-400 mt-1">
            Catatan perawatan berkala dan perbaikan motor {activeMotorcycle.brand} {activeMotorcycle.model}.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 w-fit"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Catat Servis Baru</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Servis Dilakukan</div>
            <div className="text-3xl font-black text-white font-mono mt-1">{services.length} kali</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <History className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Biaya Perawatan</div>
            <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
              Rp {totalCost.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Services List / Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        {loading ? (
          <TableSkeleton rows={4} />
        ) : services.length === 0 ? (
          <EmptyState
            icon={<History className="w-8 h-8" />}
            title="Belum Ada Catatan Servis"
            description="Catat servis pertama motor Anda (seperti Ganti Oli, Servis CVT, atau Ganti Busi) untuk memperbarui status perawatan."
            actionLabel="Catat Servis Sekarang"
            onAction={openAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Jenis Servis</th>
                  <th className="py-3 px-4">Tanggal Servis</th>
                  <th className="py-3 px-4">Kilometer</th>
                  <th className="py-3 px-4">Biaya</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {svc.serviceType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {new Date(svc.serviceDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {svc.mileage.toLocaleString()} KM
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      Rp {svc.cost.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 max-w-xs truncate">
                      {svc.notes || <span className="italic opacity-50">-</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(svc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit Servis"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingService(svc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Hapus Servis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Catat Servis Baru"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Jenis Servis / Tindakan
            </label>
            <input
              type="text"
              placeholder="Contoh: Ganti Oli Mesin, Servis CVT, Ganti Busi"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              💡 Jika nama jenis servis cocok dengan jadwal maintenance, interval dan tanggal servis jadwal tersebut akan otomatis diperbarui.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Tanggal Servis
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Kilometer Saat Servis
              </label>
              <input
                type="number"
                min="0"
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Total Biaya (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              placeholder="0"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Catatan Servis / Bengkel (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Oli SPX2 0.8L di Bengkel Resmi AHASS, ganti ring gasket"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
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
              {submitting ? 'Menyimpan...' : 'Simpan Servis'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        isOpen={Boolean(editingService)}
        onClose={() => setEditingService(null)}
        title="Edit Catatan Servis"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Jenis Servis
            </label>
            <input
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Tanggal Servis
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Kilometer Saat Servis
              </label>
              <input
                type="number"
                min="0"
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Total Biaya (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Catatan Servis (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingService(null)}
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
        isOpen={Boolean(deletingService)}
        onClose={() => setDeletingService(null)}
        title="Konfirmasi Hapus Servis"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Apakah Anda yakin ingin menghapus catatan servis{' '}
            <span className="font-bold text-white">{deletingService?.serviceType}</span> pada tanggal{' '}
            {deletingService &&
              new Date(deletingService.serviceDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            ?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setDeletingService(null)}
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
