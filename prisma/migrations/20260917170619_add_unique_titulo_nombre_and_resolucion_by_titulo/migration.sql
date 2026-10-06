/*
  Warnings:

  - A unique constraint covering the columns `[titulo_id,codigo]` on the table `resoluciones` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `titulos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "resoluciones_titulo_id_codigo_key" ON "resoluciones"("titulo_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "titulos_nombre_key" ON "titulos"("nombre");
