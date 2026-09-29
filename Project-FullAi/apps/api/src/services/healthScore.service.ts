import type { CalculatedMaintenanceSchedule } from './maintenanceCalculation.service.js'

export type HealthScoreStatus = 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION' | 'INSUFFICIENT_DATA'

export interface HealthScoreResult {
  score: number | null
  status: HealthScoreStatus
  summary: string
  reasons: string[]
  details: {
    totalSchedules: number
    overdueCount: number
    dueCount: number
    dueSoonCount: number
    upcomingCount: number
  }
}

export function calculateHealthScore(schedules: CalculatedMaintenanceSchedule[]): HealthScoreResult {
  if (schedules.length === 0) {
    return {
      score: null,
      status: 'INSUFFICIENT_DATA',
      summary: 'Belum cukup data maintenance untuk menganalisis kesehatan motor.',
      reasons: ['Belum ada jadwal maintenance yang diatur untuk motor ini.'],
      details: {
        totalSchedules: 0,
        overdueCount: 0,
        dueCount: 0,
        dueSoonCount: 0,
        upcomingCount: 0,
      },
    }
  }

  const overdueItems = schedules.filter((s) => s.status === 'OVERDUE')
  const dueItems = schedules.filter((s) => s.status === 'DUE')
  const dueSoonItems = schedules.filter((s) => s.status === 'DUE SOON')
  const upcomingItems = schedules.filter((s) => s.status === 'UPCOMING')

  const overdueCount = overdueItems.length
  const dueCount = dueItems.length
  const dueSoonCount = dueSoonItems.length
  const upcomingCount = upcomingItems.length

  // Base score 100
  // Overdue / Due: -25 each
  // Due Soon: -10 each
  let score = 100 - (overdueCount * 25) - (dueCount * 25) - (dueSoonCount * 10)
  score = Math.max(0, Math.min(100, score))

  const reasons: string[] = []

  if (overdueCount > 0) {
    const names = overdueItems.map((s) => s.maintenanceType).join(', ')
    reasons.push(`${overdueCount} perawatan sudah terlambat (Overdue): ${names} (-${overdueCount * 25} poin)`)
  }

  if (dueCount > 0) {
    const names = dueItems.map((s) => s.maintenanceType).join(', ')
    reasons.push(`${dueCount} perawatan telah mencapai batas jadwal (Due): ${names} (-${dueCount * 25} poin)`)
  }

  if (dueSoonCount > 0) {
    const names = dueSoonItems.map((s) => s.maintenanceType).join(', ')
    reasons.push(`${dueSoonCount} perawatan mendekati jadwal batas (Due Soon): ${names} (-${dueSoonCount * 10} poin)`)
  }

  if (reasons.length === 0) {
    reasons.push('Semua komponen perawatan berada dalam kondisi jadwal aman dan prima.')
  }

  let status: HealthScoreStatus = 'GOOD'
  let summary = ''

  if (score >= 80) {
    status = 'GOOD'
    summary = 'Kondisi motor prima. Sebagian besar jadwal maintenance masih terjaga dengan baik.'
  } else if (score >= 60) {
    status = 'FAIR'
    summary = 'Kondisi motor cukup baik, namun terdapat jadwal perawatan yang perlu segera dilakukan.'
  } else {
    status = 'NEEDS_ATTENTION'
    summary = 'Motor memerlukan perhatian mendesak karena ada perawatan penting yang terlewat.'
  }

  return {
    score,
    status,
    summary,
    reasons,
    details: {
      totalSchedules: schedules.length,
      overdueCount,
      dueCount,
      dueSoonCount,
      upcomingCount,
    },
  }
}
