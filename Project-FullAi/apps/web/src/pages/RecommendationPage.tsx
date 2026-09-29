import React, { useState } from 'react'
import { HelpCircle, Search, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react'
import { useMotorcycle } from '../context/MotorcycleContext.js'
import { api } from '../services/api.js'
import type { RecommendationResult } from '../types/index.js'
import { Badge } from '../components/Badge.js'
import { EmptyState } from '../components/EmptyState.js'

export const RecommendationPage: React.FC = () => {
  const { activeMotorcycle, showToast } = useMotorcycle()
  const [complaint, setComplaint] = useState('')
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const quickSamples = [
    'motor susah dinyalakan saat pagi',
    'motor bergetar dan gredek di rpm rendah',
    'rem terasa kurang pakem dan berdecit',
    'tarikan motor terasa berat dan loyo',
    'suara mesin kasar dan ngelitik',
    'stang kemudi oleng dan tidak stabil',
    'mesin motor cepat panas dan indikator radiator nyala',
  ]

  const handleSearch = async (queryText?: string) => {
    const textToSearch = queryText ?? complaint
    if (!activeMotorcycle) return
    if (!textToSearch.trim() || textToSearch.trim().length < 3) {
      setError('Masukkan deskripsi keluhan minimal 3 karakter')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await api.getRecommendation(activeMotorcycle.id, textToSearch.trim())
      setResult(res)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses rekomendasi'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!activeMotorcycle) {
    return (
      <EmptyState
        icon={<HelpCircle className="w-8 h-8" />}
        title="Pilih Motor Terlebih Dahulu"
        description="Silakan pilih motor aktif untuk berkonsultasi mengenai keluhan kendaraan."
      />
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Sistem Panduan Mandiri Berbasis Aturan</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Rekomendasi Keluhan Motor</h1>
        <p className="text-sm text-slate-400 mt-1">
          Dapatkan rekomendasi awal pemeriksaan komponen untuk motor {activeMotorcycle.brand} {activeMotorcycle.model} berdasarkan gejala yang Anda rasakan.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Deskripsikan Keluhan atau Gejala Motor
        </label>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="relative">
          <textarea
            rows={3}
            placeholder="Contoh: motor susah dinyalakan saat pagi hari, atau motor bergetar saat tarikan awal..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all"
          />
        </div>

        {/* Quick Click Samples */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Contoh Gejala Populer (Klik untuk Mencoba):
          </div>
          <div className="flex flex-wrap gap-2">
            {quickSamples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setComplaint(sample)
                  handleSearch(sample)
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors text-left"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <Search className="w-4 h-4 stroke-[3]" />
            <span>{loading ? 'Menganalisis...' : 'Cari Rekomendasi'}</span>
          </button>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Hasil Analisis Rule-Based
              </div>
              <h3 className="text-xl font-black text-white mt-0.5">
                {result.isRecognized ? result.matchedTopic : 'Keluhan Tidak Dikenali'}
              </h3>
            </div>
            {result.urgency && <Badge status={result.urgency} />}
          </div>

          {/* Actionable recommendations list */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Rekomendasi Komponen yang Perlu Diperiksa:
            </h4>
            <div className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-200"
                >
                  <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Disclaimer Box */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/60 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Peringatan: </span>
              {result.disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
