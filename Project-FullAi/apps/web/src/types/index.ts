export interface Motorcycle {
  id: number
  brand: string
  model: string
  year: number
  currentMileage: number
  createdAt: string
  _count?: {
    mileageRecords: number
    serviceHistories: number
    maintenanceSchedules: number
  }
}

export interface MileageRecord {
  id: number
  motorcycleId: number
  mileage: number
  recordedAt: string
}

export interface ServiceHistory {
  id: number
  motorcycleId: number
  serviceType: string
  serviceDate: string
  mileage: number
  cost: number
  notes: string | null
  createdAt: string
}

export type MaintenanceStatus = 'UPCOMING' | 'DUE SOON' | 'DUE' | 'OVERDUE'

export interface MaintenanceSchedule {
  id: number
  motorcycleId: number
  maintenanceType: string
  intervalKm: number
  intervalDays: number
  lastServiceMileage: number
  lastServiceDate: string
  createdAt: string
  nextMileage: number
  nextDate: string
  remainingKm: number
  remainingDays: number
  progressPercent: number
  status: MaintenanceStatus
}

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

export interface DashboardData {
  motorcycle: Motorcycle
  healthScore: HealthScoreResult
  summary: {
    currentMileage: number
    totalSchedules: number
    dueSoonCount: number
    overdueCount: number
    dueCount: number
    totalServices: number
  }
  closestMaintenance: MaintenanceSchedule[]
  overdueMaintenance: MaintenanceSchedule[]
  allSchedules: MaintenanceSchedule[]
  recentServices: ServiceHistory[]
  recentMileage: MileageRecord[]
}

export interface RecommendationResult {
  motorcycleId: number
  motorcycleName: string
  complaint: string
  isRecognized: boolean
  matchedTopic: string | null
  urgency: 'TINGGI' | 'SEDANG' | 'STANDAR' | null
  recommendations: string[]
  disclaimer: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: unknown
}
