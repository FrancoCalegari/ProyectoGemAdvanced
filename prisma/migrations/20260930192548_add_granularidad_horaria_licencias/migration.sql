-- CreateEnum
CREATE TYPE "turno_licencia" AS ENUM ('MANANA', 'TARDE', 'NOCHE');

-- AlterTable
ALTER TABLE "licencias" ADD COLUMN     "hora_desde" TEXT,
ADD COLUMN     "hora_hasta" TEXT,
ADD COLUMN     "todo_el_dia" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "turno" "turno_licencia";
