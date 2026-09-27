import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const log = (msg) => console.log(`   ${msg}`);
const titulo = (msg) => console.log(`\nÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â ${msg} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â`);

const TITULOS = [
  { nombre: 'Tecnicatura Superior en Desarrollo de Software', nivel: 'Terciario', duracionAnios: 3, codigoBase: 'TSD', materias: { 1: ['ProgramaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n I', 'MatemÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica I', 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âlgebra', 'IntroducciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n a la InformÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica', 'InglÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©s TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico I', 'LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³gica y Algoritmos', 'Sistemas Operativos I', 'Bases de Datos I', 'ComunicaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n y RedacciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n', 'Taller de ProgramaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n'], 2: ['ProgramaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n II', 'MatemÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica II', 'Bases de Datos II', 'Redes I', 'InglÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©s TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico II', 'Estructuras de Datos', 'Sistemas Operativos II', 'AnÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lisis de Sistemas', 'ProgramaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n Web I', 'Taller de Base de Datos'], 3: ['ProgramaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n III', 'Arquitectura de Software', 'ProgramaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n Web II', 'Seguridad InformÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica', 'MetodologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a de la InvestigaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n', 'GestiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de Proyectos', 'Inteligencia Artificial', 'Cloud Computing', 'PrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ctica Profesional', 'Trabajo Final'] } },
  { nombre: 'Tecnicatura Superior en EnfermerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', nivel: 'Terciario', duracionAnios: 3, codigoBase: 'TSE', materias: { 1: ['AnatomÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a y FisiologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a I', 'BiologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', 'QuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­mica BiolÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³gica', 'Fundamentos de EnfermerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', 'Salud PÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºblica I', 'PsicologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a General', 'NutriciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n', 'MicrobiologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', 'ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°tica Profesional', 'Taller de PrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡cticas I'], 2: ['AnatomÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a y FisiologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a II', 'FarmacologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', 'EnfermerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a ClÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­nica I', 'Salud PÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºblica II', 'PsicologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a Evolutiva', 'Cuidados Paliativos', 'EnfermerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a Materno-Infantil', 'BioestadÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stica', 'ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°tica y DeontologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', 'Taller de PrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡cticas II'], 3: ['EnfermerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a ClÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­nica II', 'AdministraciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n en EnfermerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', 'EnfermerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a QuirÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºrgica', 'Salud Mental', 'EmergentologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', 'EnfermerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a Comunitaria', 'MetodologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a de la InvestigaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n', 'GestiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de Servicios de Salud', 'PrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ctica Profesional', 'Trabajo Final'] } },
  { nombre: 'Tecnicatura Superior en AdministraciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de Empresas', nivel: 'Terciario', duracionAnios: 3, codigoBase: 'TSA', materias: { 1: ['Contabilidad I', 'MatemÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica Financiera', 'IntroducciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n a la AdministraciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n', 'EconomÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a I', 'Derecho Privado', 'InformÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica Aplicada', 'ComunicaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n Empresarial', 'EstadÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stica I', 'Principios de Marketing', 'Taller de GestiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n I'], 2: ['Contabilidad II', 'Costos y Presupuestos', 'AdministraciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de Personal', 'EconomÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a II', 'Derecho Laboral', 'Sistemas de InformaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n', 'EstadÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stica II', 'Marketing EstratÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©gico', 'Finanzas I', 'Taller de GestiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n II'], 3: ['Contabilidad Gerencial', 'AuditorÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', 'DirecciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n EstratÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©gica', 'Comercio Internacional', 'Finanzas II', 'GestiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de Operaciones', 'MetodologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a de la InvestigaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n', 'Emprendedorismo', 'PrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ctica Profesional', 'Trabajo Final'] } },
  { nombre: 'Tecnicatura Superior en AnÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lisis de Sistemas', nivel: 'Terciario', duracionAnios: 3, codigoBase: 'TSAS', materias: { 1: ['IntroducciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n a los Sistemas', 'MatemÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica Discreta', 'ProgramaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n I', 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âlgebra Lineal', 'Arquitectura de Computadoras', 'InglÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©s TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico I', 'LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³gica Computacional', 'Sistemas Operativos', 'ComunicaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnica', 'Taller de Sistemas I'], 2: ['AnÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lisis y DiseÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â±o de Sistemas', 'Estructuras de Datos', 'ProgramaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n II', 'Bases de Datos I', 'Redes de Computadoras', 'InglÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©s TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico II', 'IngenierÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a de Software I', 'Sistemas de InformaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n', 'EstadÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stica Aplicada', 'Taller de Sistemas II'], 3: ['IngenierÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a de Software II', 'Bases de Datos II', 'Arquitectura de Software', 'Seguridad de la InformaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n', 'GestiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de Proyectos InformÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ticos', 'AuditorÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a de Sistemas', 'MetodologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a de la InvestigaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n', 'Inteligencia de Negocios', 'PrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ctica Profesional', 'Trabajo Final'] } },
  { nombre: 'Tecnicatura Superior en Turismo y HotelerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', nivel: 'Terciario', duracionAnios: 3, codigoBase: 'TSTH', materias: { 1: ['IntroducciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n al Turismo', 'GeografÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a TurÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stica I', 'Historia del Turismo', 'Patrimonio Cultural', 'InglÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©s TurÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stico I', 'FrancÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©s TurÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stico I', 'ComunicaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n y AtenciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n al Cliente', 'AdministraciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n Hotelera I', 'Contabilidad BÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡sica', 'Taller de PrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡cticas I'], 2: ['GeografÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a TurÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stica II', 'Turismo Rural y de Aventura', 'Patrimonio Natural', 'InglÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©s TurÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stico II', 'FrancÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©s TurÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stico II', 'AdministraciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n Hotelera II', 'OperaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de Agencias de Viajes', 'Marketing TurÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stico', 'LegislaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n TurÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stica', 'Taller de PrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡cticas II'], 3: ['PlanificaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n TurÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stica', 'Turismo Sustentable', 'GestiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de Eventos', 'Turismo Internacional', 'InglÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©s TurÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stico III', 'GestiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de Calidad Hotelera', 'MetodologÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a de la InvestigaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n', 'Emprendedorismo TurÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­stico', 'PrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ctica Profesional', 'Trabajo Final'] } },
];

const NOMBRES = [
  ['Juan', 'PÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©rez'], ['MarÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', 'GÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³mez'], ['Carlos', 'RodrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­guez'], ['LucÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', 'FernÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ndez'],
  ['Diego', 'LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³pez'], ['SofÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a', 'MartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­nez'], ['MartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­n', 'GarcÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a'], ['Valentina', 'SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡nchez'],
  ['NicolÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡s', 'Romero'], ['Camila', 'Torres'], ['Federico', 'DÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­az'], ['Julieta', 'Ruiz'],
  ['MatÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­as', 'Sosa'], ['Florencia', 'RamÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­rez'], ['AgustÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­n', 'Castro'], ['Micaela', 'Ortiz'],
  ['TomÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡s', 'Silva'], ['Antonella', 'Morales'], ['Franco', 'Vargas'], ['BelÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©n', 'Herrera'],
];

const CALLES = ['Av. Corrientes', 'Av. Rivadavia', 'Av. Santa Fe', 'Av. Belgrano', 'Av. San MartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­n', 'Av. Mitre', 'Av. Sarmiento', 'Av. 9 de Julio', 'Calle Florida', 'Calle Lavalle', 'Calle Suipacha', 'Calle Esmeralda'];
const CIUDADES = ['CABA', 'La Plata', 'Rosario', 'CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rdoba', 'Mendoza', 'Mar del Plata', 'San Miguel', 'Quilmes'];
const PROVINCIAS = ['Buenos Aires', 'CABA', 'Santa Fe', 'CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rdoba', 'Mendoza', 'TucumÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡n', 'Salta', 'Entre RÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­os'];

const generarCodigoResolucion = (codigoBase, anio) => `RES-${codigoBase}-${anio}-V1`;
const generarCodigoMateria = (codigoBase, numeroAnio, indice) => `${codigoBase}${numeroAnio}${String(indice + 1).padStart(2, '0')}`;

async function limpiar() {
  titulo('LIMPIANDO BASE');
  await prisma.usuario.deleteMany();
  await prisma.examenNivelatorio.deleteMany();
  await prisma.equivalencia.deleteMany();
  await prisma.certificado.deleteMany();
  await prisma.cursadaMateria.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.correlatividad.deleteMany();
  await prisma.materia.deleteMany();
  await prisma.anioCurricular.deleteMany();
  await prisma.resolucion.deleteMany();
  await prisma.titulo.deleteMany();
  await prisma.alumno.deleteMany();
  log('ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ Base limpia');
}

async function crearEstructuraAcademica() {
  titulo('CREANDO ESTRUCTURA ACADÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°MICA');
  const resultados = [];

  for (const t of TITULOS) {
    const tituloCreado = await prisma.titulo.create({ data: { nombre: t.nombre, nivel: t.nivel, duracionAnios: t.duracionAnios, estado: 'ACTIVO' } });
    const resolucion = await prisma.resolucion.create({ data: { tituloId: tituloCreado.id, numero: '001', anioCreacion: 2026, codigo: generarCodigoResolucion(t.codigoBase, 2026), fechaInicioVigencia: new Date('2026-03-01'), estado: 'VIGENTE', observaciones: 'ResoluciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n inicial generada por el seeder' } });

    const materiasPorAnio = {};
    for (let numeroAnio = 1; numeroAnio <= t.duracionAnios; numeroAnio++) {
      const anio = await prisma.anioCurricular.create({ data: { resolucionId: resolucion.id, numeroAnio, nombre: numeroAnio === 1 ? 'Primer aÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â±o' : numeroAnio === 2 ? 'Segundo aÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â±o' : 'Tercer aÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â±o' } });
      const materiasNombres = t.materias[numeroAnio];
      const materiasCreadas = [];
      for (let i = 0; i < materiasNombres.length; i++) {
        const materia = await prisma.materia.create({ data: { anioCurricularId: anio.id, nombre: materiasNombres[i], codigo: generarCodigoMateria(t.codigoBase, numeroAnio, i), cargaHoraria: 96, tipoCursada: 'ANUAL' } });
        materiasCreadas.push(materia);
      }
      materiasPorAnio[numeroAnio] = materiasCreadas;
    }

    for (let numeroAnio = 2; numeroAnio <= t.duracionAnios; numeroAnio++) {
      const materiasActuales = materiasPorAnio[numeroAnio];
      const materiasAnteriores = materiasPorAnio[numeroAnio - 1];
      for (const materiaActual of materiasActuales) {
        for (const materiaAnterior of materiasAnteriores) {
          await prisma.correlatividad.create({ data: { materiaId: materiaActual.id, materiaRequeridaId: materiaAnterior.id, tipo: 'PARA_CURSAR' } });
          await prisma.correlatividad.create({ data: { materiaId: materiaActual.id, materiaRequeridaId: materiaAnterior.id, tipo: 'PARA_RENDIR_FINAL' } });
        }
      }
    }

    resultados.push({ titulo: tituloCreado, resolucion, materiasPorAnio });
    log(`ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ ${t.nombre}`);
  }
  return resultados;
}

async function crearAlumnos(estructuras) {
  titulo('CREANDO ALUMNOS E INSCRIPCIONES');
  const alumnosCreados = [];

  for (let i = 0; i < 20; i++) {
    const [nombre, apellido] = NOMBRES[i];
    const estructura = estructuras[i % estructuras.length];
    const perfil = i % 5;

    let anioNacimiento;
    if (perfil === 0 || perfil === 4) anioNacimiento = 1998 + (i % 3);
    else anioNacimiento = 1992 + (i % 3);

    const tieneSecundarioCompleto = perfil === 0 || perfil === 1 || perfil === 4;

    const alumno = await prisma.alumno.create({
      data: {
        dni: `30${String(10000000 + i).padStart(8, '0')}`,
        nombre, apellido,
        email: `alumno${i}@plataforma.edu.ar`,
        fechaNacimiento: new Date(`${anioNacimiento}-0${(i % 9) + 1}-15`),
        domicilioCalle: CALLES[i % CALLES.length],
        domicilioNumero: String(100 + i * 7),
        domicilioCiudad: CIUDADES[i % CIUDADES.length],
        domicilioProvincia: PROVINCIAS[i % PROVINCIAS.length],
        domicilioCP: String(1000 + (i * 13) % 9000),
        tienePartidaNacimiento: true,
        tieneAnaliticoSecundario: tieneSecundarioCompleto,
        tieneAnaliticoIncompleto: !tieneSecundarioCompleto && (perfil === 2 || perfil === 3),
        tieneCertificado7mo: !tieneSecundarioCompleto && (perfil === 2 || perfil === 3),
        tieneCUD: perfil === 4,
      },
    });

    if (perfil === 2) {
      await prisma.examenNivelatorio.create({ data: { alumnoId: alumno.id, fecha: new Date('2026-02-15'), resultado: 'APROBADO', nota: 7.5, observaciones: 'AprobÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ el examen nivelatorio en la primera instancia.' } });
    } else if (perfil === 3) {
      await prisma.examenNivelatorio.create({ data: { alumnoId: alumno.id, fecha: new Date('2026-02-15'), resultado: 'PENDIENTE', nota: null, observaciones: 'Examen pendiente de rendir.' } });
    }

    alumnosCreados.push({ alumno, estructura, indice: i, perfil });
    log(`ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ ${nombre} ${apellido} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ${estructura.titulo.nombre} (perfil ${perfil})`);
  }
  return alumnosCreados;
}

async function crearInscripciones(alumnosCreados) {
  titulo('CREANDO INSCRIPCIONES');
  const creadas = [];

  for (const { alumno, estructura, perfil } of alumnosCreados) {
    if (perfil === 3) {
      log(`ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â  ${alumno.nombre} ${alumno.apellido} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ SIN INSCRIPCIÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œN (no cumple admisiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n)`);
      continue;
    }

    const inscripcion = await prisma.inscripcion.create({
      data: { alumnoId: alumno.id, tituloId: estructura.titulo.id, resolucionId: estructura.resolucion.id, fechaInscripcion: new Date('2026-03-01'), estado: 'ACTIVA' },
    });

    creadas.push({ alumno, inscripcion, estructura, perfil });
    log(`ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ ${alumno.nombre} ${alumno.apellido} inscripto en ${estructura.titulo.nombre}`);
  }
  return creadas;
}

async function crearCursadas(inscripcionesCreadas) {
  titulo('CREANDO CURSADAS');

  for (const { inscripcion, estructura, perfil, alumno } of inscripcionesCreadas) {
    const { materiasPorAnio } = estructura;

    const crearCursada = async (materiaId, estado, notaCursada = null, notaFinal = null) => {
      await prisma.cursadaMateria.create({ data: { inscripcionId: inscripcion.id, materiaId, estado, notaCursada, notaFinal, fechaEstado: new Date('2026-07-01') } });
    };

    if (perfil === 0) {
      for (const m of materiasPorAnio[1]) await crearCursada(m.id, 'REGULAR', 7.5, null);
      for (const m of materiasPorAnio[2]) await crearCursada(m.id, 'EN_CURSO');
    } else if (perfil === 1) {
      for (const m of materiasPorAnio[1]) await crearCursada(m.id, 'APROBADA', 8, 8);
      for (const m of materiasPorAnio[2]) await crearCursada(m.id, 'REGULAR', 7, null);
      for (const m of materiasPorAnio[3]) await crearCursada(m.id, 'EN_CURSO');
    } else if (perfil === 2) {
      for (const m of materiasPorAnio[1]) await crearCursada(m.id, 'APROBADA', 7, 7);
      for (const m of materiasPorAnio[2]) await crearCursada(m.id, 'EN_CURSO');
    } else if (perfil === 4) {
      const materias = materiasPorAnio[1];
      for (let j = 0; j < materias.length; j++) {
        if (j < 4) await crearCursada(materias[j].id, 'REGULAR', 7, null);
        else if (j < 6) await crearCursada(materias[j].id, 'APROBADA', 8, 8);
        else if (j < 7) await crearCursada(materias[j].id, 'LIBRE');
        else if (j < 8) await crearCursada(materias[j].id, 'DESAPROBADA', 3, null);
        else await crearCursada(materias[j].id, 'EN_CURSO');
      }
    }
    log(`ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ Cursadas para ${alumno.nombre} ${alumno.apellido} (perfil ${perfil})`);
  }
}

async function crearCertificados(inscripcionesCreadas) {
  titulo('CREANDO CERTIFICADOS');
  const candidatosParcial = inscripcionesCreadas.filter((i) => i.perfil === 1);
  for (const { alumno, estructura } of candidatosParcial) {
    const anio1 = await prisma.anioCurricular.findFirst({ where: { resolucionId: estructura.resolucion.id, numeroAnio: 1 } });
    await prisma.certificado.create({ data: { alumnoId: alumno.id, tituloId: estructura.titulo.id, resolucionId: estructura.resolucion.id, tipo: 'PARCIAL_ANIO', anioCurricularId: anio1.id, fechaEmision: new Date('2026-12-15'), estado: 'EMITIDO' } });
    log(`ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ Certificado PARCIAL_ANIO para ${alumno.nombre} ${alumno.apellido}`);
  }
}

async function crearEquivalencias(estructuras) {
  titulo('CREANDO EQUIVALENCIAS DE EJEMPLO');
  const software = estructuras.find((e) => e.titulo.nombre.includes('Desarrollo de Software'));
  const analisis = estructuras.find((e) => e.titulo.nombre.includes('AnÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lisis de Sistemas'));

  if (software && analisis) {
    const progI_Soft = software.materiasPorAnio[1][0];
    const progI_Ana = analisis.materiasPorAnio[1][2];
    await prisma.equivalencia.create({ data: { materiaOrigenId: progI_Soft.id, materiaDestinoId: progI_Ana.id, observaciones: 'ProgramaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n I - contenidos equivalentes' } });
    log(`ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ ProgramaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n I (Software) ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ProgramaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n I (AnÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lisis)`);

    const matI_Soft = software.materiasPorAnio[1][1];
    const matDisc_Ana = analisis.materiasPorAnio[1][1];
    await prisma.equivalencia.create({ data: { materiaOrigenId: matI_Soft.id, materiaDestinoId: matDisc_Ana.id, observaciones: 'MatemÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica I ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â MatemÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica Discreta' } });
    log(`ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ MatemÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica I (Software) ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â MatemÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica Discreta (AnÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lisis)`);
  }
}


async function crearUsuarios(alumnosCreados) {
  titulo('CREANDO USUARIOS');

  const passwordAdminHash = await bcrypt.hash('admin123', 10);
  const passwordSecretariaHash = await bcrypt.hash('secretaria123', 10);
  const passwordAlumnoHash = await bcrypt.hash('alumno123', 10);

  await prisma.usuario.create({
    data: {
      email: 'admin@plataforma.edu.ar',
      passwordHash: passwordAdminHash,
      nombre: 'Admin',
      apellido: 'Sistema',
      rol: 'ADMIN',
    },
  });
  log('Usuario ADMIN creado: admin@plataforma.edu.ar / admin123');

  await prisma.usuario.create({
    data: {
      email: 'secretaria@plataforma.edu.ar',
      passwordHash: passwordSecretariaHash,
      nombre: 'Maria',
      apellido: 'Secretaria',
      rol: 'SECRETARIA',
    },
  });
  log('Usuario SECRETARIA creado: secretaria@plataforma.edu.ar / secretaria123');

  for (const { alumno } of alumnosCreados) {
    await prisma.usuario.create({
      data: {
        email: alumno.email,
        passwordHash: passwordAlumnoHash,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        rol: 'ALUMNO',
        alumnoId: alumno.id,
      },
    });
    log(`Usuario ALUMNO creado: ${alumno.email} / alumno123`);
  }
}

async function crearUsuarioAdmin() {
  titulo('CREANDO USUARIO ADMIN');
  const email = 'admin@plataforma.edu.ar';
  const passwordPlano = 'admin123';
  const passwordHash = await bcrypt.hash(passwordPlano, 10);
  log(`ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â  Modelo Usuario aÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºn no implementado. Datos listos:`);
  log(`   email: ${email}`);
  log(`   password: ${passwordPlano}`);
  log(`   rol: admin`);
}

async function main() {
  console.log('\nÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â');
  console.log('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“  SEEDER ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Plataforma AcadÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©mica                       ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“');
  console.log('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚Â');

  const inicio = Date.now();
  await limpiar();
  const estructuras = await crearEstructuraAcademica();
  const alumnosCreados = await crearAlumnos(estructuras);
  const inscripcionesCreadas = await crearInscripciones(alumnosCreados);
  await crearCursadas(inscripcionesCreadas);
  await crearCertificados(inscripcionesCreadas);
  await crearEquivalencias(estructuras);
  await crearUsuarios(alumnosCreados);
  await crearUsuarioAdmin();
  const duracion = ((Date.now() - inicio) / 1000).toFixed(2);
  console.log('\nÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â');
  console.log('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“  ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ SEEDER COMPLETADO                                ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“');
  console.log('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚Â');
  console.log(`\nÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒâ€šÃ‚Â±  DuraciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n: ${duracion}s\n`);
}

main().catch((e) => { console.error('ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒâ€¦Ã¢â‚¬â„¢ Error en el seeder:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
