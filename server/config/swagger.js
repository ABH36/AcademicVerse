const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AcademicVerse API Documentation',
      version: '1.0.0',
      description: 'Production-ready REST API for AcademicVerse - The Student Hiring Platform.',
      contact: {
        name: 'API Support',
        email: 'dev@academicverse.com',
      },
      license: {
        name: 'Proprietary',
        url: 'https://academicverse.com/license',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Server',
      },
      {
        url: 'https://api.academicverse.com/api',
        description: 'Production Server',
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
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message details',
            },
          },
        },
      },
    },
  },
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;