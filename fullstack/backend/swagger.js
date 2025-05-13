// swagger.js
import swaggerAutogen from 'swagger-autogen';

const outputFile = './swagger.json'; // Este será para productos, pedidos Y autenticación (la documentación principal)
const endPointsFiles = ['./routes/routes.js', './routes/pedido.routes.js', './routes/auth.routes.js']; // ¡Incluimos auth.routes.js!

const doc = {
    info: {
        title: 'API Gestión de Pedidos, Productos y Autenticación',
        description: 'Documentación de los endpoints para la gestión de productos, pedidos y la autenticación de usuarios'
    },
    host: 'localhost:8000',
    schemes: ['http']
};

swaggerAutogen()(outputFile, endPointsFiles, doc);