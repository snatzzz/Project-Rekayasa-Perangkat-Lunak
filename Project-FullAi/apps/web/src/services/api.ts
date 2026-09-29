import type {
  Motorcycle,
  MileageRecord,
  ServiceHistory,
  MaintenanceSchedule,
  HealthScoreResult,
  DashboardData,
  RecommendationResult,
  ApiResponse,
} from '../types/index.js'

const API_BASE_URL = 'http://localhost:3000/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  }

  const res = await fetch(url, { ...options, headers })
  const json: ApiResponse<T> = await res.json()

  if (!res.ok || !json.success) {
    const errorDetails = Array.isArray(json.error) ? json.error.join(', ') : ''
    const message = json.message || 'Terjadi kesalahan pada server'
    throw new Error(errorDetails ? `${message}: ${errorDetails}` : message)
  }

  return json.data as T
}

export const api = {
  // Motorcycle
  getMotorcycles: () => request<Motorcycle[]>('/motorcycles'),
  getMotorcycleById: (id: number) => request<Motorcycle>(`/motorcycles/${id}`),
  createMotorcycle: (data: { brand: string; model: string; year: number; currentMileage: number }) =>
    request<Motorcycle>('/motorcycles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMotorcycle: (id: number, data: Partial<{ brand: string; model: string; year: number; currentMileage: number }>) =>
    request<Motorcycle>(`/motorcycles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMotorcycle: (id: number) =>
    request<{ id: number }>(`/motorcycles/${id}`, {
      method: 'DELETE',
    }),

  // Mileage
  getMileageRecords: (motorcycleId: number) =>
    request<{ currentMileage: number; records: MileageRecord[] }>(`/motorcycles/${motorcycleId}/mileage`),
  addMileageRecord: (motorcycleId: number, data: { mileage: number; recordedAt?: string }) =>
    request<{ record: MileageRecord; currentMileage: number }>(`/motorcycles/${motorcycleId}/mileage`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Service History
  getServices: (motorcycleId: number) =>
    request<ServiceHistory[]>(`/motorcycles/${motorcycleId}/services`),
  createService: (
    motorcycleId: number,
    data: { serviceType: string; serviceDate: string; mileage: number; cost: number; notes?: string }
  ) =>
    request<{ service: ServiceHistory; syncedSchedule?: MaintenanceSchedule }>(
      `/motorcycles/${motorcycleId}/services`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),
  updateService: (
    id: number,
    data: Partial<{ serviceType: string; serviceDate: string; mileage: number; cost: number; notes: string | null }>
  ) =>
    request<ServiceHistory>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteService: (id: number) =>
    request<{ id: number }>(`/services/${id}`, {
      method: 'DELETE',
    }),

  // Maintenance Schedule
  getMaintenanceSchedules: (motorcycleId: number) =>
    request<{ currentMileage: number; schedules: MaintenanceSchedule[] }>(`/motorcycles/${motorcycleId}/maintenance`),
  createMaintenanceSchedule: (
    motorcycleId: number,
    data: {
      maintenanceType: string
      intervalKm: number
      intervalDays: number
      lastServiceMileage: number
      lastServiceDate: string
    }
  ) =>
    request<MaintenanceSchedule>(`/motorcycles/${motorcycleId}/maintenance`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMaintenanceSchedule: (
    id: number,
    data: Partial<{
      maintenanceType: string
      intervalKm: number
      intervalDays: number
      lastServiceMileage: number
      lastServiceDate: string
    }>
  ) =>
    request<MaintenanceSchedule>(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMaintenanceSchedule: (id: number) =>
    request<{ id: number }>(`/maintenance/${id}`, {
      method: 'DELETE',
    }),

  // Health Score
  getHealthScore: (motorcycleId: number) =>
    request<{
      motorcycleId: number
      brand: string
      model: string
      currentMileage: number
      healthScore: HealthScoreResult
    }>(`/motorcycles/${motorcycleId}/health-score`),

  // Recommendation
  getRecommendation: (motorcycleId: number, complaint: string) =>
    request<RecommendationResult>(`/motorcycles/${motorcycleId}/recommendation`, {
      method: 'POST',
      body: JSON.stringify({ complaint }),
    }),

  // Dashboard Aggregated
  getDashboardData: (motorcycleId: number) =>
    request<DashboardData>(`/motorcycles/${motorcycleId}/dashboard`),
}
