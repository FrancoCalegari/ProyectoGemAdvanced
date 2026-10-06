/*
  Warnings:

  - A unique constraint covering the columns `[profesor_id]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "estado_profesor" AS ENUM ('ACTIVO', 'SUPLENCIA', 'INACTIVO');

-- CreateEnum
CREATE TYPE "tipo_licencia" AS ENUM ('ENFERMEDAD', 'RAZON_PARTICULAR', 'ESTUDIOS_FEMENINOS', 'DONACION_SANGRE', 'ACCIDENTE_LABORAL', 'OTRO');

-- CreateEnum
CREATE TYPE "estado_licencia" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "tipo_solicitud" AS ENUM ('CAMBIO_HORARIO', 'AUSENCIA_PROGRAMADA', 'CAMBIO_MATERIA', 'OTRO');

-- CreateEnum
CREATE TYPE "estado_solicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "tipo_titulo_profesor" AS ENUM ('UNIVERSITARIO', 'TERCIARIO');

-- AlterEnum
ALTER TYPE "rol_usuario" ADD VALUE 'PROFESOR';

-- AlterTable
ALTER TABLE "cursada_materia" ADD COLUMN     "profesor_id" UUID;

-- AlterTable
ALTER TABLE "examenes_nivelatorios" ADD COLUMN     "articulo" TEXT,
ADD COLUMN     "hora" TEXT,
ADD COLUMN     "lugar" TEXT;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "profesor_id" UUID;

-- CreateTable
CREATE TABLE "profesores" (
    "id" UUID NOT NULL,
    "dni" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "fecha_nacimiento" DATE NOT NULL,
    "genero" TEXT,
    "domicilio_calle" TEXT,
    "domicilio_numero" TEXT,
    "domicilio_ciudad" TEXT,
    "domicilio_provincia" TEXT,
    "domicilio_cp" TEXT,
    "tiene_cud" BOOLEAN NOT NULL DEFAULT false,
    "estado" "estado_profesor" NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profesores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "titulos_profesor" (
    "id" UUID NOT NULL,
    "profesor_id" UUID NOT NULL,
    "tipo" "tipo_titulo_profesor" NOT NULL,
    "nombre" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "anio_egreso" INTEGER NOT NULL,
    "numero" TEXT,
    "archivo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "titulos_profesor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias_profesor" (
    "id" UUID NOT NULL,
    "profesor_id" UUID NOT NULL,
    "materia_id" UUID NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "aula" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materias_profesor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licencias" (
    "id" UUID NOT NULL,
    "profesor_id" UUID NOT NULL,
    "tipo" "tipo_licencia" NOT NULL,
    "fecha_desde" DATE NOT NULL,
    "fecha_hasta" DATE NOT NULL,
    "motivo" TEXT,
    "estado" "estado_licencia" NOT NULL DEFAULT 'PENDIENTE',
    "aprobado_por" UUID,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "licencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes" (
    "id" UUID NOT NULL,
    "tipo" "tipo_solicitud" NOT NULL,
    "alumno_id" UUID,
    "profesor_id" UUID,
    "comentario" TEXT NOT NULL,
    "estado" "estado_solicitud" NOT NULL DEFAULT 'PENDIENTE',
    "respuesta" TEXT,
    "resuelto_por" UUID,
    "resuelto_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profesores_dni_key" ON "profesores"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "profesores_email_key" ON "profesores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "materias_profesor_profesor_id_materia_id_dia_semana_hora_in_key" ON "materias_profesor"("profesor_id", "materia_id", "dia_semana", "hora_inicio");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_profesor_id_key" ON "usuarios"("profesor_id");

-- AddForeignKey
ALTER TABLE "cursada_materia" ADD CONSTRAINT "cursada_materia_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "titulos_profesor" ADD CONSTRAINT "titulos_profesor_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materias_profesor" ADD CONSTRAINT "materias_profesor_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materias_profesor" ADD CONSTRAINT "materias_profesor_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licencias" ADD CONSTRAINT "licencias_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
