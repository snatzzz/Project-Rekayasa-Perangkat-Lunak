import { Router } from 'express'
import { updateService, deleteService } from '../controllers/service.controller.js'

const router = Router()

router.put('/:id', updateService)
router.delete('/:id', deleteService)

export default router
