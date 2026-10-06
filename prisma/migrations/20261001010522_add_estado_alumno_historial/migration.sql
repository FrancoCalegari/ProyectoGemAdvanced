-- CreateEnum
CREATE TYPE "estado_alumno" AS ENUM ('ACTIVO', 'EGRESADO', 'BAJA', 'INACTIVO');

-- AlterTable
ALTER TABLE "alumnos" ADD COLUMN     "estado_alumno" "estado_alumno" NOT NULL DEFAULT 'ACTIVO';
