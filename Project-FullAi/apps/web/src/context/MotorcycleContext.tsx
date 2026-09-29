import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Motorcycle } from '../types/index.js'
import { api } from '../services/api.js'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface MotorcycleContextType {
  motorcycles: Motorcycle[]
  activeMotorcycle: Motorcycle | null
  loading: boolean
  error: string | null
  toasts: ToastMessage[]
  setActiveMotorcycle: (motorcycle: Motorcycle | null) => void
  refreshMotorcycles: () => Promise<void>
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  removeToast: (id: string) => void
}

const MotorcycleContext = createContext<MotorcycleContextType | undefined>(undefined)

export const MotorcycleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [activeMotorcycle, setActiveMotorcycleState] = useState<Motorcycle | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const refreshMotorcycles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const list = await api.getMotorcycles()
      setMotorcycles(list)

      // Maintain active motorcycle if possible, else select first
      setActiveMotorcycleState((prev) => {
        if (!prev) return list[0] ?? null
        const found = list.find((m) => m.id === prev.id)
        return found ?? list[0] ?? null
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat daftar motor'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const setActiveMotorcycle = (motorcycle: Motorcycle | null) => {
    setActiveMotorcycleState(motorcycle)
  }

  useEffect(() => {
    refreshMotorcycles()
  }, [refreshMotorcycles])

  return (
    <MotorcycleContext.Provider
      value={{
        motorcycles,
        activeMotorcycle,
        loading,
        error,
        toasts,
        setActiveMotorcycle,
        refreshMotorcycles,
        showToast,
        removeToast,
      }}
    >
      {children}
    </MotorcycleContext.Provider>
  )
}

export function useMotorcycle(): MotorcycleContextType {
  const context = useContext(MotorcycleContext)
  if (!context) {
    throw new Error('useMotorcycle must be used within a MotorcycleProvider')
  }
  return context
}
