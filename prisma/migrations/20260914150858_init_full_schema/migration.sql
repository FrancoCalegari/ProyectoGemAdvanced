-- CreateEnum
CREATE TYPE "estado_titulo" AS ENUM ('ACTIVO', 'DE_BAJA');

-- CreateEnum
CREATE TYPE "estado_resolucion" AS ENUM ('VIGENTE', 'CERRADA');

-- CreateEnum
CREATE TYPE "tipo_cursada" AS ENUM ('ANUAL', 'CUATRIMESTRAL_1', 'CUATRIMESTRAL_2');

-- CreateEnum
CREATE TYPE "tipo_correlatividad" AS ENUM ('PARA_CURSAR', 'PARA_RENDIR_FINAL');

-- CreateEnum
CREATE TYPE "estado_inscripcion" AS ENUM ('ACTIVA', 'EGRESADO', 'BAJA');

-- CreateEnum
CREATE TYPE "estado_cursada" AS ENUM ('EN_CURSO', 'REGULAR', 'APROBADA', 'LIBRE', 'DESAPROBADA');

-- CreateEnum
CREATE TYPE "tipo_certificado" AS ENUM ('PARCIAL_ANIO', 'TITULO_COMPLETO');

-- CreateEnum
CREATE TYPE "estado_certificado" AS ENUM ('EMITIDO', 'ANULADO');

-- CreateTable
CREATE TABLE "titulos" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "duracion_anios" INTEGER NOT NULL,
    "estado" "estado_titulo" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "titulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resoluciones" (
    "id" UUID NOT NULL,
    "titulo_id" UUID NOT NULL,
    "numero" TEXT NOT NULL,
    "anio_creacion" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "fecha_inicio_vigencia" DATE NOT NULL,
    "fecha_fin_vigencia" DATE,
    "estado" "estado_resolucion" NOT NULL DEFAULT 'VIGENTE',
    "observaciones" TEXT,

    CONSTRAINT "resoluciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anios_curriculares" (
    "id" UUID NOT NULL,
    "resolucion_id" UUID NOT NULL,
    "numero_anio" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "anios_curriculares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias" (
    "id" UUID NOT NULL,
    "anio_curricular_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "carga_horaria" INTEGER NOT NULL,
    "tipo_cursada" "tipo_cursada" NOT NULL,

    CONSTRAINT "materias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correlatividades" (
    "id" UUID NOT NULL,
    "materia_id" UUID NOT NULL,
    "materia_requerida_id" UUID NOT NULL,
    "tipo" "tipo_correlatividad" NOT NULL,

    CONSTRAINT "correlatividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumnos" (
    "id" UUID NOT NULL,
    "dni" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,

    CONSTRAINT "alumnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones" (
    "id" UUID NOT NULL,
    "alumno_id" UUID NOT NULL,
    "titulo_id" UUID NOT NULL,
    "resolucion_id" UUID NOT NULL,
    "fecha_inscripcion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "estado_inscripcion" NOT NULL DEFAULT 'ACTIVA',

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursada_materia" (
    "id" UUID NOT NULL,
    "inscripcion_id" UUID NOT NULL,
    "materia_id" UUID NOT NULL,
    "estado" "estado_cursada" NOT NULL DEFAULT 'EN_CURSO',
    "nota_cursada" DECIMAL(4,2),
    "nota_final" DECIMAL(4,2),
    "fecha_estado" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cursada_materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificados" (
    "id" UUID NOT NULL,
    "alumno_id" UUID NOT NULL,
    "titulo_id" UUID NOT NULL,
    "resolucion_id" UUID NOT NULL,
    "tipo" "tipo_certificado" NOT NULL,
    "anio_curricular_id" UUID,
    "fecha_emision" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "estado_certificado" NOT NULL DEFAULT 'EMITIDO',

    CONSTRAINT "certificados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resoluciones_codigo_key" ON "resoluciones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "anios_curriculares_resolucion_id_numero_anio_key" ON "anios_curriculares"("resolucion_id", "numero_anio");

-- CreateIndex
CREATE UNIQUE INDEX "materias_anio_curricular_id_codigo_key" ON "materias"("anio_curricular_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "correlatividades_materia_id_materia_requerida_id_tipo_key" ON "correlatividades"("materia_id", "materia_requerida_id", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "alumnos_dni_key" ON "alumnos"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "alumnos_email_key" ON "alumnos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_alumno_id_titulo_id_resolucion_id_key" ON "inscripciones"("alumno_id", "titulo_id", "resolucion_id");

-- CreateIndex
CREATE UNIQUE INDEX "cursada_materia_inscripcion_id_materia_id_key" ON "cursada_materia"("inscripcion_id", "materia_id");

-- AddForeignKey
ALTER TABLE "resoluciones" ADD CONSTRAINT "resoluciones_titulo_id_fkey" FOREIGN KEY ("titulo_id") REFERENCES "titulos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anios_curriculares" ADD CONSTRAINT "anios_curriculares_resolucion_id_fkey" FOREIGN KEY ("resolucion_id") REFERENCES "resoluciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materias" ADD CONSTRAINT "materias_anio_curricular_id_fkey" FOREIGN KEY ("anio_curricular_id") REFERENCES "anios_curriculares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correlatividades" ADD CONSTRAINT "correlatividades_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correlatividades" ADD CONSTRAINT "correlatividades_materia_requerida_id_fkey" FOREIGN KEY ("materia_requerida_id") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_titulo_id_fkey" FOREIGN KEY ("titulo_id") REFERENCES "titulos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_resolucion_id_fkey" FOREIGN KEY ("resolucion_id") REFERENCES "resoluciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursada_materia" ADD CONSTRAINT "cursada_materia_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursada_materia" ADD CONSTRAINT "cursada_materia_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_titulo_id_fkey" FOREIGN KEY ("titulo_id") REFERENCES "titulos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_resolucion_id_fkey" FOREIGN KEY ("resolucion_id") REFERENCES "resoluciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_anio_curricular_id_fkey" FOREIGN KEY ("anio_curricular_id") REFERENCES "anios_curriculares"("id") ON DELETE SET NULL ON UPDATE CASCADE;
