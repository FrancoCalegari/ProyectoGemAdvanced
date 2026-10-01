-- CreateEnum
CREATE TYPE "estado_certificado_presentado" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "tipo_certificado_presentado" AS ENUM ('MEDICO', 'LABORAL', 'FAMILIAR', 'OTRO');

-- CreateTable
CREATE TABLE "certificados_presentados" (
    "id" UUID NOT NULL,
    "alumno_id" UUID NOT NULL,
    "tipo" "tipo_certificado_presentado" NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha_desde" DATE NOT NULL,
    "fecha_hasta" DATE NOT NULL,
    "estado" "estado_certificado_presentado" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "aprobado_por_id" UUID,
    "fecha_resolucion" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificados_presentados_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "certificados_presentados" ADD CONSTRAINT "certificados_presentados_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados_presentados" ADD CONSTRAINT "certificados_presentados_aprobado_por_id_fkey" FOREIGN KEY ("aprobado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
