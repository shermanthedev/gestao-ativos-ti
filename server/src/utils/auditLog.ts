import type { Request } from 'express'
import { prisma } from '../config/database.js'

export async function createAuditLog(
  req: Request,
  action: string,
  entity: string,
  message: string,
) {
  return prisma.auditLog.create({
    data: {
      usuarioTIId: req.user?.id ?? null,
      action,
      entity,
      message,
    },
  })
}
