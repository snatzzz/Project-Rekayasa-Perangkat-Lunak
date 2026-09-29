export type MaintenanceStatus = 'UPCOMING' | 'DUE SOON' | 'DUE' | 'OVERDUE'

export interface RawMaintenanceSchedule {
  id: number
  motorcycleId: number
  maintenanceType: string
  intervalKm: number
  intervalDays: number
  lastServiceMileage: number
  lastServiceDate: Date
  createdAt: Date
}

export interface CalculatedMaintenanceSchedule extends RawMaintenanceSchedule {
  nextMileage: number
  nextDate: string // ISO string
  remainingKm: number
  remainingDays: number
  progressPercent: number
  status: MaintenanceStatus
}

export function calculateMaintenanceStatus(
  schedule: RawMaintenanceSchedule,
  currentMileage: number,
  referenceDate: Date = new Date()
): CalculatedMaintenanceSchedule {
  const nextMileage = schedule.lastServiceMileage + schedule.intervalKm
  
  const lastDate = new Date(schedule.lastServiceDate)
  const nextDateMs = lastDate.getTime() + schedule.intervalDays * 24 * 60 * 60 * 1000
  const nextDate = new Date(nextDateMs)

  const remainingKm = nextMileage - currentMileage
  const diffMs = nextDateMs - referenceDate.getTime()
  const remainingDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000))

  // Determine status
  let status: MaintenanceStatus = 'UPCOMING'

  if (remainingKm <= 0 || remainingDays <= 0) {
    status = 'OVERDUE'
  } else if (remainingKm <= Math.max(1, Math.round(schedule.intervalKm * 0.05)) || remainingDays <= 3) {
    status = 'DUE'
  } else if (remainingKm <= Math.max(1, Math.round(schedule.intervalKm * 0.10)) || remainingDays <= 7) {
    status = 'DUE SOON'
  } else {
    status = 'UPCOMING'
  }

  // Calculate visual progress percentage (0 - 100)
  const kmElapsed = Math.max(0, currentMileage - schedule.lastServiceMileage)
  const rawProgress = (kmElapsed / schedule.intervalKm) * 100
  const progressPercent = Math.min(100, Math.max(0, Math.round(rawProgress)))

  return {
    ...schedule,
    nextMileage,
    nextDate: nextDate.toISOString(),
    remainingKm,
    remainingDays,
    progressPercent,
    status,
  }
}
