-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('ADMIN', 'SECRETARIA', 'ALUMNO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rol" "rol_usuario" NOT NULL DEFAULT 'ALUMNO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "alumno_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_alumno_id_key" ON "usuarios"("alumno_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
