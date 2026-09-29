import { Router } from 'express'
import motorcycleRoutes from './motorcycle.routes.js'
import serviceRoutes from './service.routes.js'
import maintenanceRoutes from './maintenance.routes.js'

const apiRouter = Router()

apiRouter.use('/motorcycles', motorcycleRoutes)
apiRouter.use('/services', serviceRoutes)
apiRouter.use('/maintenance', maintenanceRoutes)

export default apiRouter
