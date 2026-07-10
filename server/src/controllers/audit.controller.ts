import type { Request, Response } from 'express'
import { prisma } from '../config/database.js'

export class AuditController {
  async list(req: Request, res: Response) {
    const take = Number(req.query.take ?? 5)
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        usuarioTI: {
          select: { id: true, nome: true },
        },
      },
    })

    return res.json({ data: logs })
  }
}
