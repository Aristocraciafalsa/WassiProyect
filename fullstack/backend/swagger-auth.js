// swagger-auth.js
import swaggerAutogen from 'swagger-autogen';

const outputFile = './swagger-auth.json';
const endPointsFiles = ['./routes/auth.routes.js'];

const doc = {
    info: {
        title: 'API de Autenticación de Usuarios',
        description: 'Documentación de los endpoints relacionados con la autenticación y gestión de usuarios'
    },
    host: 'localhost:8000',
    schemes: ['http']
};

swaggerAutogen()(outputFile, endPointsFiles, doc);