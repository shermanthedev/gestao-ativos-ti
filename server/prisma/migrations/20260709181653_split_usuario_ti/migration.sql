/*
  Warnings:

  - You are about to drop the column `role` on the `Funcionario` table. All the data in the column will be lost.
  - You are about to drop the column `senha` on the `Funcionario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Funcionario" DROP COLUMN "role",
DROP COLUMN "senha";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "UsuarioTI" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioTI_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioTI_email_key" ON "UsuarioTI"("email");
