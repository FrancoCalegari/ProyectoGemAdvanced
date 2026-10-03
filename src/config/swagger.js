import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Plataforma Academica API',
      version: '1.0.0',
      description: 'API para la gestion de carreras academicas, alumnos, inscripciones, cursadas y certificados.',
      contact: {
        name: 'ProyectoGemAdvanced',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Estado del servidor' },
      { name: 'Auth', description: 'Autenticacion y usuarios' },
      { name: 'Títulos', description: 'Gestión de titulos' },
      { name: 'Alumnos', description: 'Gestión de alumnos' },
      { name: 'Certificados', description: 'Certificados y PDFs' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
