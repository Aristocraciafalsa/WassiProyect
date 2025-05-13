import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';



export const verifyToken = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;



        if (!authHeader?.startsWith('Bearer ')) {

            return res.status(401).json({ error: 'Autenticación requerida', message: 'Token de acceso no proporcionado' });

        }



        const token = authHeader.split(' ')[1];



        let decoded;

        try {

            decoded = jwt.verify(token, process.env.JWT_SECRET);

        } catch (jwtError) {

            console.error('Error verificando token:', jwtError);

            return res.status(401).json({ error: 'Token inválido', message: 'Tu sesión ha expirado o es inválida' });

        }



        req.userId = decoded.id;

        req.userRole = decoded.role;

        next();



    } catch (error) {

        console.error('Error en verifyToken middleware:', error);

        return res.status(500).json({ error: 'Error en el servidor', message: 'Error al verificar la autenticación' });

    }

};



export const authorizeRole = (roles) => {

    return (req, res, next) => {

        if (!req.userRole || !roles.includes(req.userRole)) {

            return res.status(403).json({ error: 'Acceso denegado', message: 'No tienes permiso para acceder a esta ruta' });

        }

        next();

    };

};