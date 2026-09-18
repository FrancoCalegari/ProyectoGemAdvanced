import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fuerza la carga del .env ubicado en la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/plataforma_academica?schema=public";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

export default prisma;