import { Router } from 'express'
import {
  getAllMotorcycles,
  getMotorcycleById,
  createMotorcycle,
  updateMotorcycle,
  deleteMotorcycle,
} from '../controllers/motorcycle.controller.js'
import { getMileageRecords, addMileageRecord } from '../controllers/mileage.controller.js'
import { getServices, createService } from '../controllers/service.controller.js'
import { getMaintenanceSchedules, createMaintenanceSchedule } from '../controllers/maintenance.controller.js'
import { getMotorcycleHealthScore } from '../controllers/healthScore.controller.js'
import { getMotorcycleRecommendation } from '../controllers/recommendation.controller.js'
import { getDashboardData } from '../controllers/dashboard.controller.js'

const router = Router()

// Motorcycles CRUD
router.get('/', getAllMotorcycles)
router.post('/', createMotorcycle)
router.get('/:id', getMotorcycleById)
router.put('/:id', updateMotorcycle)
router.delete('/:id', deleteMotorcycle)

// Nested routes under /api/motorcycles/:id
router.get('/:id/mileage', getMileageRecords)
router.post('/:id/mileage', addMileageRecord)

router.get('/:id/services', getServices)
router.post('/:id/services', createService)

router.get('/:id/maintenance', getMaintenanceSchedules)
router.post('/:id/maintenance', createMaintenanceSchedule)

router.get('/:id/health-score', getMotorcycleHealthScore)
router.post('/:id/recommendation', getMotorcycleRecommendation)
router.get('/:id/dashboard', getDashboardData)

export default router
