-- CreateEnum
CREATE TYPE "estado_asistencia" AS ENUM ('PRESENTE', 'AUSENTE', 'JUSTIFICADO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "tipo_certificado" ADD VALUE 'CONCURRENCIA';
ALTER TYPE "tipo_certificado" ADD VALUE 'PARA_COLECTIVO';
ALTER TYPE "tipo_certificado" ADD VALUE 'LABORAL';

-- CreateTable
CREATE TABLE "asistencias" (
    "id" UUID NOT NULL,
    "cursada_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "estado" "estado_asistencia" NOT NULL DEFAULT 'PRESENTE',
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_cursada_id_fecha_key" ON "asistencias"("cursada_id", "fecha");

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_cursada_id_fkey" FOREIGN KEY ("cursada_id") REFERENCES "cursada_materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
