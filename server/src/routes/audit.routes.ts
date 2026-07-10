import { Router } from 'express'
import { AuditController } from '../controllers/audit.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { authenticate } from '../middlewares/authenticate.js'

const auditRoutes = Router()
const auditController = new AuditController()

auditRoutes.get('/', authenticate, asyncHandler(auditController.list))

export { auditRoutes }
