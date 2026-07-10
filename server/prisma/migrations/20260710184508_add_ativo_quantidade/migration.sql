-- DropIndex
DROP INDEX "Ativo_numeroSerie_key";

-- AlterTable
ALTER TABLE "Ativo" ADD COLUMN     "quantidade" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "numeroSerie" DROP NOT NULL;
