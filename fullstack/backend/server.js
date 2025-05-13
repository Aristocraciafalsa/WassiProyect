import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import productsRouter from './routes/routes.js';
import authRouter from './routes/auth.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import swaggerUI from 'swagger-ui-express';
import swaggerDocumentation from './swagger.json' assert { type: 'json' }; // Documentación principal (productos, pedidos, autenticación)
import swaggerAuthDocumentation from './swagger-auth.json' assert { type: 'json' }; // Documentación separada de autenticación

// Configuración inicial
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tudb';

// Conexión optimizada para MongoDB Standalone
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            directConnection: true, // Importante para standalone
            retryWrites: false      // Deshabilitar para standalone
        });

        console.log(`✅ MongoDB Standalone conectado: ${conn.connection.host}`);

        // Verificación básica de la base de datos
        const collections = await conn.connection.db.listCollections().toArray();
        console.log(`📚 Colecciones disponibles: ${collections.map(c => c.name).join(', ') || 'Ninguna'}`);

    } catch (error) {
        console.error('❌ Error de conexión a MongoDB:', error.message);
        console.error('ℹ️ Asegúrate que:');
        console.error('1. MongoDB está instalado y corriendo localmente');
        console.error(`2. La URI de conexión es correcta: ${MONGO_URI}`);
        console.error('3. No hay aplicaciones usando el mismo puerto (27017)');
        process.exit(1);
    }
};

// Configuración de middlewares
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de diagnóstico
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Estado MongoDB:', mongoose.STATES[mongoose.connection.readyState]);
    next();
});

// Ruta de verificación de salud
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
    res.json({
        status: 'API operational',
        database: dbStatus,
        timestamp: new Date()
    });
});

// Rutas para la documentación Swagger UI
app.use('/doc', swaggerUI.serve, swaggerUI.setup(swaggerDocumentation)); // Documentación principal
app.use('/doc/auth', swaggerUI.serve, swaggerUI.setup(swaggerAuthDocumentation)); // Documentación separada de autenticación

// Rutas principales
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/pedidos', pedidoRoutes); // ¡Aquí montamos las rutas de pedidos!

// Manejo de errores optimizado
app.use((err, req, res, next) => {
    console.error('Error no manejado:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        body: req.body
    });

    const statusCode = err.statusCode || 500;
    const response = {
        error: {
            message: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack,
                details: err.details
            })
        }
    };

    res.status(statusCode).json(response);
});

// Inicialización del servidor
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
            console.log('🔍 Entorno:', process.env.NODE_ENV || 'development');
            console.log('📚 Documentación principal Swagger disponible en http://localhost:${PORT}/doc');
            console.log('📚 Documentación de Autenticación Swagger disponible en http://localhost:${PORT}/doc/auth');
        });

        // Eventos de conexión para diagnóstico
        mongoose.connection.on('connecting', () => console.log('🟡 Conectando a MongoDB...'));
        mongoose.connection.on('connected', () => console.log('🟢 MongoDB conectado exitosamente'));
        mongoose.connection.on('disconnected', () => console.log('🔴 MongoDB desconectado'));

    } catch (error) {
        console.error('Fallo al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();