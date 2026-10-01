-- CreateEnum
CREATE TYPE "estado_mesa" AS ENUM ('PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "estado_inscripcion_mesa" AS ENUM ('INSCRIPTO', 'PRESENTE', 'AUSENTE', 'CANCELADO');

-- CreateTable
CREATE TABLE "mesas_examen" (
    "id" UUID NOT NULL,
    "materia_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TEXT NOT NULL,
    "aula" TEXT,
    "cupo_maximo" INTEGER,
    "estado" "estado_mesa" NOT NULL DEFAULT 'PROGRAMADA',
    "observaciones" TEXT,
    "creado_por_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mesas_examen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones_mesa" (
    "id" UUID NOT NULL,
    "mesa_id" UUID NOT NULL,
    "alumno_id" UUID NOT NULL,
    "estado" "estado_inscripcion_mesa" NOT NULL DEFAULT 'INSCRIPTO',
    "nota" DECIMAL(4,2),
    "observaciones" TEXT,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_cancelacion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscripciones_mesa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mesas_examen_materia_id_fecha_idx" ON "mesas_examen"("materia_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_mesa_mesa_id_alumno_id_key" ON "inscripciones_mesa"("mesa_id", "alumno_id");

-- AddForeignKey
ALTER TABLE "mesas_examen" ADD CONSTRAINT "mesas_examen_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas_examen" ADD CONSTRAINT "mesas_examen_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_mesa" ADD CONSTRAINT "inscripciones_mesa_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas_examen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_mesa" ADD CONSTRAINT "inscripciones_mesa_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
