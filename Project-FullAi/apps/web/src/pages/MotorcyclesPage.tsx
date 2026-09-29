import React, { useState } from 'react'
import { Plus, Bike, Edit, Trash2, CheckCircle2, Calendar, Gauge } from 'lucide-react'
import { useMotorcycle } from '../context/MotorcycleContext.js'
import { api } from '../services/api.js'
import type { Motorcycle } from '../types/index.js'
import { Modal } from '../components/Modal.js'
import { EmptyState } from '../components/EmptyState.js'

export const MotorcyclesPage: React.FC = () => {
  const {
    motorcycles,
    activeMotorcycle,
    setActiveMotorcycle,
    refreshMotorcycles,
    showToast,
  } = useMotorcycle()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMotorcycle, setEditingMotorcycle] = useState<Motorcycle | null>(null)
  const [deletingMotorcycle, setDeletingMotorcycle] = useState<Motorcycle | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [currentMileage, setCurrentMileage] = useState<number>(0)
  const [formError, setFormError] = useState<string | null>(null)

  const openAddModal = () => {
    setBrand('')
    setModel('')
    setYear(new Date().getFullYear())
    setCurrentMileage(0)
    setFormError(null)
    setIsAddModalOpen(true)
  }

  const openEditModal = (motorcycle: Motorcycle) => {
    setEditingMotorcycle(motorcycle)
    setBrand(motorcycle.brand)
    setModel(motorcycle.model)
    setYear(motorcycle.year)
    setCurrentMileage(motorcycle.currentMileage)
    setFormError(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brand.trim() || !model.trim()) {
      setFormError('Merk dan model motor wajib diisi')
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)
      await api.createMotorcycle({
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year),
        currentMileage: Number(currentMileage),
      })
      showToast('Motor baru berhasil ditambahkan!')
      setIsAddModalOpen(false)
      await refreshMotorcycles()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menambahkan motor')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMotorcycle) return
    if (!brand.trim() || !model.trim()) {
      setFormError('Merk dan model motor wajib diisi')
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)
      await api.updateMotorcycle(editingMotorcycle.id, {
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year),
        currentMileage: Number(currentMileage),
      })
      showToast('Data motor berhasil diperbarui!')
      setEditingMotorcycle(null)
      await refreshMotorcycles()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal memperbarui motor')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingMotorcycle) return

    try {
      setSubmitting(true)
      await api.deleteMotorcycle(deletingMotorcycle.id)
      showToast(`Motor ${deletingMotorcycle.brand} ${deletingMotorcycle.model} berhasil dihapus`)
      setDeletingMotorcycle(null)
      await refreshMotorcycles()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus motor', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Motor Saya</h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola profil motor dan pilih motor yang sedang aktif dipantau.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 w-fit"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Motor</span>
        </button>
      </div>

      {/* Motorcycle Cards Grid */}
      {motorcycles.length === 0 ? (
        <EmptyState
          icon={<Bike className="w-8 h-8" />}
          title="Belum Ada Motor Terdaftar"
          description="Tambahkan motor pertama Anda untuk mulai memantau odometer, riwayat servis, dan jadwal perawatannya."
          actionLabel="Tambah Motor Sekarang"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {motorcycles.map((m) => {
            const isActive = activeMotorcycle?.id === m.id

            return (
              <div
                key={m.id}
                className={`p-6 rounded-2xl bg-slate-900 border transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {m.brand}
                      </span>
                      <h3 className="text-xl font-black text-white">{m.model}</h3>
                    </div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aktif</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveMotorcycle(m)}
                        className="text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
                      >
                        Pilih Aktif
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 mt-4 pt-4 border-t border-slate-800/80 text-sm">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-2 text-slate-400">
                        <Gauge className="w-4 h-4 text-emerald-400" />
                        Odometer:
                      </span>
                      <span className="font-mono font-bold text-white">
                        {m.currentMileage.toLocaleString()} KM
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        Tahun Produksi:
                      </span>
                      <span className="font-semibold text-white">{m.year}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400">
                    ID: #{m.id}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit Data Motor"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingMotorcycle(m)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Hapus Motor"
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

      {/* Add Motorcycle Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Motor Baru"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Merk Motor
            </label>
            <input
              type="text"
              placeholder="Contoh: Honda, Yamaha, Suzuki, Kawasaki"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Model Motor
            </label>
            <input
              type="text"
              placeholder="Contoh: Vario 160, NMAX 155, Aerox, Beat"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Tahun
              </label>
              <input
                type="number"
                min="1950"
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Kilometer Awal
              </label>
              <input
                type="number"
                min="0"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
              {submitting ? 'Menyimpan...' : 'Simpan Motor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Motorcycle Modal */}
      <Modal
        isOpen={Boolean(editingMotorcycle)}
        onClose={() => setEditingMotorcycle(null)}
        title="Edit Profil Motor"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Merk Motor
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Model Motor
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Tahun
              </label>
              <input
                type="number"
                min="1950"
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Kilometer Saat Ini
              </label>
              <input
                type="number"
                min="0"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingMotorcycle(null)}
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
        isOpen={Boolean(deletingMotorcycle)}
        onClose={() => setDeletingMotorcycle(null)}
        title="Konfirmasi Hapus Motor"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Apakah Anda yakin ingin menghapus motor{' '}
            <span className="font-bold text-white">
              {deletingMotorcycle?.brand} {deletingMotorcycle?.model}
            </span>
            ? Seluruh riwayat kilometer, servis, dan jadwal maintenance terkait juga akan terhapus.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setDeletingMotorcycle(null)}
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
