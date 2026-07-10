-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "usuarioTIId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_usuarioTIId_fkey" FOREIGN KEY ("usuarioTIId") REFERENCES "UsuarioTI"("id") ON DELETE SET NULL ON UPDATE CASCADE;
