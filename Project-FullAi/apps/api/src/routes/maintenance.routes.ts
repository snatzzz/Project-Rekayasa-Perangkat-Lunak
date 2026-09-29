import { Router } from 'express'
import { updateMaintenanceSchedule, deleteMaintenanceSchedule } from '../controllers/maintenance.controller.js'

const router = Router()

router.put('/:id', updateMaintenanceSchedule)
router.delete('/:id', deleteMaintenanceSchedule)

export default router
