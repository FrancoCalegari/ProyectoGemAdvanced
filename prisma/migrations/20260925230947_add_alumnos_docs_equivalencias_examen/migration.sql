-- CreateEnum
CREATE TYPE "estado_examen" AS ENUM ('PENDIENTE', 'APROBADO', 'DESAPROBADO');

-- AlterTable
ALTER TABLE "alumnos" ADD COLUMN     "domicilio_calle" TEXT,
ADD COLUMN     "domicilio_ciudad" TEXT,
ADD COLUMN     "domicilio_cp" TEXT,
ADD COLUMN     "domicilio_numero" TEXT,
ADD COLUMN     "domicilio_provincia" TEXT,
ADD COLUMN     "tiene_analitico_incompleto" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_analitico_secundario" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_certificado_7mo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_cud" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_partida_nacimiento" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "cursada_materia" ADD COLUMN     "es_equivalencia" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "inscripciones" ADD COLUMN     "es_cambio_carrera" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inscripcion_origen_id" UUID;

-- CreateTable
CREATE TABLE "equivalencias" (
    "id" UUID NOT NULL,
    "materia_origen_id" UUID NOT NULL,
    "materia_destino_id" UUID NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equivalencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examenes_nivelatorios" (
    "id" UUID NOT NULL,
    "alumno_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "resultado" "estado_examen" NOT NULL DEFAULT 'PENDIENTE',
    "nota" DECIMAL(4,2),
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "examenes_nivelatorios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "equivalencias_materia_origen_id_materia_destino_id_key" ON "equivalencias"("materia_origen_id", "materia_destino_id");

-- AddForeignKey
ALTER TABLE "equivalencias" ADD CONSTRAINT "equivalencias_materia_origen_id_fkey" FOREIGN KEY ("materia_origen_id") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equivalencias" ADD CONSTRAINT "equivalencias_materia_destino_id_fkey" FOREIGN KEY ("materia_destino_id") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examenes_nivelatorios" ADD CONSTRAINT "examenes_nivelatorios_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_inscripcion_origen_id_fkey" FOREIGN KEY ("inscripcion_origen_id") REFERENCES "inscripciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
