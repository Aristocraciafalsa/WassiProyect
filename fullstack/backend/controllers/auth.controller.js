import jwt from 'jsonwebtoken';

import bcrypt from 'bcryptjs';

import User from '../models/user.model.js';



// Configuración común

const TOKEN_CONFIG = {

    expiresIn: '8h',

    algorithm: 'HS256'

};



// Generador de token

const generateToken = (user) => {

    if (!process.env.JWT_SECRET) {

        console.error('JWT_SECRET no está configurado');

        throw new Error('Error de configuración del servidor');

    }



    return jwt.sign(

        {

            id: user._id,

            role: user.role,

            ...(user.role === 'client' && {

                company: user.companyName,

                code: user.code

            })

        },

        process.env.JWT_SECRET,

        TOKEN_CONFIG

    );

};



// Función para generar código de 6 dígitos

function generateCode() {

    return Math.floor(100000 + Math.random() * 900000).toString();

}



// ================== CONTROLADORES ================== //



/**

 * Registro de usuario (clientes y admin/operadores)

 * Versión adaptada para MongoDB standalone

 */

export const registerUser = async (req, res) => {

    try {

        console.log('Datos recibidos para registro:', req.body);



        const { role, email, password, companyName, nit, address, location, phoneNumber, contactName } = req.body;



        // Validación básica de rol

        if (!['client', 'administrator', 'operator'].includes(role)) {

            return res.status(400).json({

                error: 'Rol no válido',

                roles_validos: ['client', 'administrator', 'operator']

            });

        }



        // Validación específica por rol

        if (role === 'client') {

            const requiredFields = ['companyName', 'nit', 'address', 'location', 'phoneNumber', 'email', 'contactName'];

            const missingFields = requiredFields.filter(field => !req.body[field]);



            if (missingFields.length > 0) {

                return res.status(400).json({

                    error: 'Faltan campos requeridos para cliente',

                    missingFields,

                    message: 'Todos los campos son obligatorios para clientes'

                });

            }



            // Validar formato de email

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

                return res.status(400).json({ error: 'Formato de email inválido' });

            }

        } else {

            // Validación para admin/operador

            if (!email || !password) {

                return res.status(400).json({

                    error: 'Credenciales incompletas',

                    message: 'Email y contraseña son requeridos para administradores/operarios'

                });

            }



            if (password.length < 8) {

                return res.status(400).json({

                    error: 'Contraseña insegura',

                    message: 'La contraseña debe tener al menos 8 caracteres'

                });

            }



            // Verificar si el email ya existe

            const existingUser = await User.findOne({ email });

            if (existingUser) {

                return res.status(409).json({

                    error: 'Email ya registrado',

                    message: 'El email proporcionado ya está en uso'

                });

            }

        }



        // Preparar datos del usuario

        const userData = {

            role,

            email,

            ...(role === 'client' ? {

                companyName,

                nit,

                address,

                location,

                phoneNumber,

                contactName,

                code: generateCode()

            } : {

                password: await bcrypt.hash(password, 10) // Hash de contraseña para admin/operador AQUÍ

            })

        };



        // Para clientes, verificar código único

        if (role === 'client') {

            let codeIsUnique = false;

            let attempts = 0;

            const maxAttempts = 3;



            while (!codeIsUnique && attempts < maxAttempts) {

                const existingCode = await User.findOne({ code: userData.code });

                if (!existingCode) {

                    codeIsUnique = true;

                } else {

                    userData.code = generateCode();

                    attempts++;

                }

            }



            if (!codeIsUnique) {

                return res.status(500).json({

                    error: 'Error generando código único',

                    message: 'No se pudo generar un código único para el cliente'

                });

            }

        }



        console.log('Creando usuario con datos:', userData);



        // Crear usuario (sin transacción)

        const newUser = await User.create(userData);

        console.log('Usuario registrado con éxito:', newUser);



        return res.status(201).json({

            success: true,

            message: 'Usuario registrado exitosamente',

            user: {

                id: newUser._id,

                role: newUser.role,

                email: newUser.email,

                ...(role === 'client' && {

                    companyName: newUser.companyName,

                    code: newUser.code

                })

            }

        });



    } catch (error) {

        console.error('Error en registerUser:', {

            message: error.message,

            stack: error.stack,

            body: req.body

        });



        const errorResponse = {

            error: 'Error al registrar usuario',

            message: process.env.NODE_ENV === 'development' ?

                error.message : 'Ocurrió un error al procesar tu registro'

        };



        if (error.name === 'ValidationError') {

            return res.status(400).json({

                ...errorResponse,

                details: error.errors

            });

        }



        if (error.code === 11000) {

            return res.status(409).json({

                ...errorResponse,

                message: 'El email o código ya está registrado'

            });

        }



        return res.status(500).json(errorResponse);

    }

};



/**

 * Login para clientes (solo con código)

 */

export const loginCliente = async (req, res) => {

    try {

        const { code } = req.body;



        if (!code || !/^\d{6}$/.test(code)) {

            return res.status(400).json({

                error: 'Código inválido',

                message: 'El código debe ser exactamente 6 dígitos numéricos'

            });

        }



        console.log(`Buscando cliente con código: ${code}`);

        const user = await User.findOne({ code, role: 'client' });



        if (!user) {

            return res.status(404).json({

                error: 'Cliente no encontrado',

                message: 'No existe un cliente con ese código'

            });

        }



        console.log(`Cliente encontrado: ${user._id}`);



        const token = generateToken(user);



        return res.json({

            success: true,

            message: 'Inicio de sesión exitoso',

            token,

            user: {

                id: user._id,

                role: user.role,

                companyName: user.companyName,

                code: user.code

            }

        });



    } catch (error) {

        console.error('Error en loginCliente:', {

            message: error.message,

            stack: error.stack,

            code: req.body.code

        });



        return res.status(500).json({

            error: 'Error en el servidor',

            message: 'Ocurrió un error al procesar tu solicitud'

        });

    }

};



/**

 * Login para admin/operadores (con email y contraseña)

 * Con protección contra timing attacks

 */

export const loginAdminOperario = async (req, res) => {

    try {

        const { email, password } = req.body;



        console.log('Intento de login para el email:', email); // <--- LOG



        // Validación básica

        if (!email || !password) {

            return res.status(400).json({

                error: 'Credenciales incompletas',

                message: 'Email y contraseña son requeridos'

            });

        }



        console.log(`Buscando admin/operador con email: ${email}`);



        // Consulta para encontrar al usuario por email

        const user = await User.findOne({ email }).select('+password');



        console.log('Usuario encontrado (raw):', user); // <--- LOG



        // **LOG ADICIONAL CRUCIAL:** Vamos a ver la contraseña que viene del frontend justo antes de la comparación

        console.log('Contraseña recibida del frontend:', password);



        // Verificación segura con bcrypt.compare

        const passwordMatch = user ? await bcrypt.compare(password, user.password) : false;



        console.log('Resultado de bcrypt.compare:', passwordMatch); // <--- LOG



        if (!user || !passwordMatch) {

            console.log('Autenticación fallida para:', email); // <--- LOG

            return res.status(401).json({

                error: 'Credenciales inválidas',

                message: 'Email o contraseña incorrectos'

            });

        }



        console.log(`Usuario autenticado: ${user._id}, Rol: ${user.role}`);



        const token = generateToken(user);

        const userResponse = user.toObject();

        delete userResponse.password;



        return res.json({

            success: true,

            message: 'Inicio de sesión exitoso',

            token,

            user: {

                id: userResponse._id,

                role: userResponse.role, // <---- ¡AÑADIDO EL ROL AQUÍ!

                email: userResponse.email

            }

        });



    } catch (error) {

        console.error('Error en loginAdminOperario:', {

            message: error.message,

            stack: error.stack,

            email: req.body.email

        });



        return res.status(500).json({

            error: 'Error en el servidor',

            message: 'Ocurrió un error al procesar tu solicitud'

        });

    }

};



/**

 * Obtener datos del cliente

 */

export const getClientData = async (req, res) => {

    try {

        const authHeader = req.headers.authorization;



        if (!authHeader?.startsWith('Bearer ')) {

            return res.status(401).json({

                error: 'Autenticación requerida',

                message: 'Token de acceso no proporcionado'

            });

        }



        const token = authHeader.split(' ')[1];



        // Verificar token

        let decoded;

        try {

            decoded = jwt.verify(token, process.env.JWT_SECRET);

        } catch (jwtError) {

            console.error('Error verificando token:', jwtError);

            return res.status(401).json({

                error: 'Token inválido',

                message: 'Tu sesión ha expirado o es inválida'

            });

        }



        console.log(`Buscando datos del cliente ID: ${decoded.id}`);



        // Obtener datos del cliente

        const user = await User.findById(decoded.id).select('-password -__v');



        if (!user || user.role !== 'client') {

            return res.status(403).json({

                error: 'Acceso denegado',

                message: 'No tienes permiso para acceder a estos datos'

            });

        }



        return res.json({

            success: true,

            data: {

                companyName: user.companyName,

                nit: user.nit,

                address: user.address,

                location: user.location,

                phoneNumber: user.phoneNumber,

                contactName: user.contactName,

                email: user.email,

                code: user.code

            }

        });



    } catch (error) {

        console.error('Error en getClientData:', {

            message: error.message,

            stack: error.stack

        });



        return res.status(500).json({

            error: 'Error en el servidor',

            message: 'Ocurrió un error al obtener los datos'

        });

    }

};

