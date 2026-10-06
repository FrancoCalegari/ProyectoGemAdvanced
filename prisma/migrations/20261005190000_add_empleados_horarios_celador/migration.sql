-- =========================================================
-- Personal no docente: Empleado, horarios de trabajo y
-- modificaciones de horario. Licencia pasa a servir tambien
-- a no docentes (profesor_id opcional + empleado_id).
-- =========================================================

-- AlterEnum: nuevos tipos de licencia para el personal no docente
ALTER TYPE "tipo_licencia" ADD VALUE IF NOT EXISTS 'CERTIFICADO_SALUD';
ALTER TYPE "tipo_licencia" ADD VALUE IF NOT EXISTS 'JUSTIFICATIVO_FALTA';

-- CreateEnum
CREATE TYPE "cargo_empleado" AS ENUM ('BEDEL', 'CELADOR', 'OTRO');
CREATE TYPE "estado_empleado" AS ENUM ('ACTIVO', 'INACTIVO');
CREATE TYPE "tipo_modificacion_horario" AS ENUM ('ALTA', 'CAMBIO', 'BAJA');

-- CreateTable
CREATE TABLE "empleados" (
    "id" UUID NOT NULL,
    "dni" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "fecha_nacimiento" DATE,
    "genero" TEXT,
    "domicilio_calle" TEXT,
    "domicilio_numero" TEXT,
    "domicilio_ciudad" TEXT,
    "domicilio_provincia" TEXT,
    "domicilio_cp" TEXT,
    "cargo" "cargo_empleado" NOT NULL,
    "sector" TEXT,
    "fecha_ingreso" DATE,
    "observaciones" TEXT,
    "estado" "estado_empleado" NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empleados_dni_key" ON "empleados"("dni");
CREATE UNIQUE INDEX "empleados_email_key" ON "empleados"("email");

-- CreateTable
CREATE TABLE "horarios_trabajo" (
    "id" UUID NOT NULL,
    "empleado_id" UUID NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "sector" TEXT,
    "vigente_desde" DATE NOT NULL,
    "vigente_hasta" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "horarios_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "horarios_trabajo_empleado_id_dia_semana_idx" ON "horarios_trabajo"("empleado_id", "dia_semana");

-- AddForeignKey
ALTER TABLE "horarios_trabajo" ADD CONSTRAINT "horarios_trabajo_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "modificaciones_horario" (
    "id" UUID NOT NULL,
    "horario_id" UUID NOT NULL,
    "empleado_id" UUID NOT NULL,
    "tipo" "tipo_modificacion_horario" NOT NULL,
    "detalle" TEXT NOT NULL,
    "valor_anterior" JSONB,
    "valor_nuevo" JSONB,
    "motivo" TEXT,
    "cambiado_por_id" UUID,
    "visto" BOOLEAN NOT NULL DEFAULT false,
    "visto_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modificaciones_horario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "modificaciones_horario_empleado_id_created_at_idx" ON "modificaciones_horario"("empleado_id", "created_at");

-- AddForeignKey
ALTER TABLE "modificaciones_horario" ADD CONSTRAINT "modificaciones_horario_horario_id_fkey" FOREIGN KEY ("horario_id") REFERENCES "horarios_trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "modificaciones_horario" ADD CONSTRAINT "modificaciones_horario_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "modificaciones_horario" ADD CONSTRAINT "modificaciones_horario_cambiado_por_id_fkey" FOREIGN KEY ("cambiado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable usuarios: vinculo con la ficha de empleado
ALTER TABLE "usuarios" ADD COLUMN "empleado_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_empleado_id_key" ON "usuarios"("empleado_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable licencias: el docente pasa a ser opcional y se agrega el no docente
ALTER TABLE "licencias" ALTER COLUMN "profesor_id" DROP NOT NULL;
ALTER TABLE "licencias" ADD COLUMN "empleado_id" UUID;

-- CreateIndex
CREATE INDEX "licencias_empleado_id_idx" ON "licencias"("empleado_id");

-- AddForeignKey
ALTER TABLE "licencias" ADD CONSTRAINT "licencias_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
