import React, { useState } from 'react'
import { MotorcycleProvider, useMotorcycle } from './context/MotorcycleContext.js'
import { Sidebar, type PageId } from './components/Sidebar.js'
import { Navbar } from './components/Navbar.js'
import { ToastContainer } from './components/Toast.js'
import { Modal } from './components/Modal.js'
import { DashboardPage } from './pages/DashboardPage.js'
import { MotorcyclesPage } from './pages/MotorcyclesPage.js'
import { MileagePage } from './pages/MileagePage.js'
import { ServicesPage } from './pages/ServicesPage.js'
import { MaintenancePage } from './pages/MaintenancePage.js'
import { RecommendationPage } from './pages/RecommendationPage.js'
import { api } from './services/api.js'

const MainContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAddMotorcycleOpen, setIsAddMotorcycleOpen] = useState(false)

  // Direct trigger states for child pages
  const [initialOpenAddService, setInitialOpenAddService] = useState(false)
  const [initialOpenAddMaintenance, setInitialOpenAddMaintenance] = useState(false)

  // Form states for topbar Add Motorcycle
  const { refreshMotorcycles, showToast } = useMotorcycle()
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [currentMileage, setCurrentMileage] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleCreateMotorcycle = async (e: React.FormEvent) => {
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
      setIsAddMotorcycleOpen(false)
      setBrand('')
      setModel('')
      setYear(new Date().getFullYear())
      setCurrentMileage(0)
      await refreshMotorcycles()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menambahkan motor')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNavigateFromDashboard = {
    onNavigate: (page: PageId) => setCurrentPage(page),
    onOpenAddMileage: () => setCurrentPage('mileage'),
    onOpenAddService: () => {
      setInitialOpenAddService(true)
      setCurrentPage('services')
    },
    onOpenAddMaintenance: () => {
      setInitialOpenAddMaintenance(true)
      setCurrentPage('maintenance')
    },
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Sidebar for Desktop & Mobile Drawer */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
        <Navbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddMotorcycle={() => setIsAddMotorcycleOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && <DashboardPage {...handleNavigateFromDashboard} />}
          {currentPage === 'motorcycles' && <MotorcyclesPage />}
          {currentPage === 'mileage' && <MileagePage />}
          {currentPage === 'services' && (
            <ServicesPage
              initialOpenAdd={initialOpenAddService}
              onResetInitialOpenAdd={() => setInitialOpenAddService(false)}
            />
          )}
          {currentPage === 'maintenance' && (
            <MaintenancePage
              initialOpenAdd={initialOpenAddMaintenance}
              onResetInitialOpenAdd={() => setInitialOpenAddMaintenance(false)}
            />
          )}
          {currentPage === 'recommendation' && <RecommendationPage />}
        </main>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Add Motorcycle Global Modal */}
      <Modal
        isOpen={isAddMotorcycleOpen}
        onClose={() => setIsAddMotorcycleOpen(false)}
        title="Daftarkan Motor Baru"
      >
        <form onSubmit={handleCreateMotorcycle} className="space-y-4">
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
              onClick={() => setIsAddMotorcycleOpen(false)}
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
    </div>
  )
}

function App() {
  return (
    <MotorcycleProvider>
      <MainContent />
    </MotorcycleProvider>
  )
}

export default App
