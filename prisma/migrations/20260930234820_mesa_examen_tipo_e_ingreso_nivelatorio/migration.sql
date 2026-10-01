/*
  Warnings:

  - A unique constraint covering the columns `[examen_nivelatorio_id]` on the table `mesas_examen` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "mesas_examen" ADD COLUMN     "examen_nivelatorio_id" UUID,
ADD COLUMN     "tipo_mesa" "tipo_mesa" NOT NULL DEFAULT 'EXAMEN_FINAL',
ALTER COLUMN "materia_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "mesas_examen_examen_nivelatorio_id_key" ON "mesas_examen"("examen_nivelatorio_id");

-- CreateIndex
CREATE INDEX "mesas_examen_tipo_mesa_fecha_idx" ON "mesas_examen"("tipo_mesa", "fecha");

-- AddForeignKey
ALTER TABLE "mesas_examen" ADD CONSTRAINT "mesas_examen_examen_nivelatorio_id_fkey" FOREIGN KEY ("examen_nivelatorio_id") REFERENCES "examenes_nivelatorios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
