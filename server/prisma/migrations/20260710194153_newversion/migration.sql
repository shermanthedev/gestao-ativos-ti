/*
  Warnings:

  - You are about to drop the column `batchId` on the `Ativo` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `Ativo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numeroSerie]` on the table `Ativo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Ativo" DROP COLUMN "batchId",
DROP COLUMN "quantidade";

-- CreateIndex
CREATE UNIQUE INDEX "Ativo_numeroSerie_key" ON "Ativo"("numeroSerie");
