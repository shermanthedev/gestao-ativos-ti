-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoAtivo" ADD VALUE 'CABO';
ALTER TYPE "TipoAtivo" ADD VALUE 'MONITOR';
ALTER TYPE "TipoAtivo" ADD VALUE 'PERIFÉRICO';
ALTER TYPE "TipoAtivo" ADD VALUE 'NOBREAK';
ALTER TYPE "TipoAtivo" ADD VALUE 'SERVIDOR';
ALTER TYPE "TipoAtivo" ADD VALUE 'SWITCH';
ALTER TYPE "TipoAtivo" ADD VALUE 'LEITOR';
ALTER TYPE "TipoAtivo" ADD VALUE 'COMPUTADOR';
ALTER TYPE "TipoAtivo" ADD VALUE 'ACCESSPOINT';
ALTER TYPE "TipoAtivo" ADD VALUE 'ROTEADOR';
