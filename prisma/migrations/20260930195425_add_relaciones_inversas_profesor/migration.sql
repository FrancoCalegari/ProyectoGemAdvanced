-- CreateEnum
CREATE TYPE "motivo_suspension" AS ENUM ('LICENCIA_PROFESOR', 'FERIADO', 'PARO', 'CLIMA', 'OTRO');

-- CreateTable
CREATE TABLE "clases_suspendidas" (
    "id" UUID NOT NULL,
    "materia_id" UUID NOT NULL,
    "profesor_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_inicio" TEXT,
    "hora_fin" TEXT,
    "motivo" "motivo_suspension" NOT NULL,
    "licencia_id" UUID,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clases_suspendidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reasignaciones" (
    "id" UUID NOT NULL,
    "clase_suspendida_id" UUID NOT NULL,
    "profesor_origen_id" UUID NOT NULL,
    "profesor_destino_id" UUID NOT NULL,
    "observaciones" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reasignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clases_suspendidas_fecha_idx" ON "clases_suspendidas"("fecha");

-- CreateIndex
CREATE INDEX "clases_suspendidas_profesor_id_fecha_idx" ON "clases_suspendidas"("profesor_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "clases_suspendidas_materia_id_profesor_id_fecha_hora_inicio_key" ON "clases_suspendidas"("materia_id", "profesor_id", "fecha", "hora_inicio");

-- CreateIndex
CREATE UNIQUE INDEX "reasignaciones_clase_suspendida_id_profesor_destino_id_key" ON "reasignaciones"("clase_suspendida_id", "profesor_destino_id");

-- AddForeignKey
ALTER TABLE "clases_suspendidas" ADD CONSTRAINT "clases_suspendidas_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clases_suspendidas" ADD CONSTRAINT "clases_suspendidas_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clases_suspendidas" ADD CONSTRAINT "clases_suspendidas_licencia_id_fkey" FOREIGN KEY ("licencia_id") REFERENCES "licencias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_clase_suspendida_id_fkey" FOREIGN KEY ("clase_suspendida_id") REFERENCES "clases_suspendidas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_profesor_origen_id_fkey" FOREIGN KEY ("profesor_origen_id") REFERENCES "profesores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasignaciones" ADD CONSTRAINT "reasignaciones_profesor_destino_id_fkey" FOREIGN KEY ("profesor_destino_id") REFERENCES "profesores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
