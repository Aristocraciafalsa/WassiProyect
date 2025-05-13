import express from 'express';
import { crearPedido, listarPedidos, obtenerDetallePedido, marcarPedidoEntregado } from '../controllers/pedido.controller.js';
import { verifyToken, authorizeRole } from '../middlewares/auth.middleware.js'; // ¡Importamos el nuevo middleware!

const router = express.Router();

/**
 * @openapi
 * /api/pedidos/crear:
 * post:
 * summary: Crear un nuevo pedido.
 * description: Endpoint para que los clientes registrados creen un nuevo pedido.
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * productos:
 * type: array
 * items:
 * type: object
 * properties:
 * productoId:
 * type: string
 * description: ID del producto a pedir.
 * cantidad:
 * type: integer
 * description: Cantidad del producto.
 * example:
 * productos:
 * - productoId: "64b7f4a0-f1a2-4b3c-9e8d-f0a1e2b3c4d5"
 * cantidad: 2
 * - productoId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 * cantidad: 1
 * responses:
 * 201:
 * description: Pedido creado exitosamente.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * mensaje:
 * type: string
 * example: "Pedido creado exitosamente con ID: 123"
 * pedidoId:
 * type: string
 * example: "123"
 * 401:
 * description: No autorizado. Token inválido o ausente.
 * 403:
 * description: Prohibido. El rol del usuario no tiene permiso para esta acción.
 * 500:
 * description: Error interno del servidor.
 */
router.post('/crear', verifyToken, authorizeRole(['client']), crearPedido);

/**
 * @openapi
 * /api/pedidos/listar:
 * get:
 * summary: Listar todos los pedidos.
 * description: Endpoint para que los administradores listen todos los pedidos existentes.
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Lista de pedidos obtenida exitosamente.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * _id:
 * type: string
 * example: "64b7f4a0-f1a2-4b3c-9e8d-f0a1e2b3c4d6"
 * clienteId:
 * type: string
 * example: "user123"
 * productos:
 * type: array
 * items:
 * type: object
 * properties:
 * productoId:
 * type: string
 * example: "prod456"
 * cantidad:
 * type: integer
 * example: 3
 * estado:
 * type: string
 * example: "pendiente"
 * fechaCreacion:
 * type: string
 * format: date-time
 * example: "2025-04-23T10:00:00.000Z"
 * 401:
 * description: No autorizado. Token inválido o ausente.
 * 403:
 * description: Prohibido. El rol del usuario no tiene permiso para esta acción.
 * 500:
 * description: Error interno del servidor.
 */
router.get('/listar', verifyToken, authorizeRole(['administrator']), listarPedidos);

/**
 * @openapi
 * /api/pedidos/{id}:
 * get:
 * summary: Obtener detalles de un pedido por ID.
 * description: Endpoint para que los administradores obtengan los detalles de un pedido específico.
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * description: ID del pedido a obtener.
 * schema:
 * type: string
 * example: "64b7f4a0-f1a2-4b3c-9e8d-f0a1e2b3c4d6"
 * responses:
 * 200:
 * description: Detalles del pedido obtenidos exitosamente.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * _id:
 * type: string
 * example: "64b7f4a0-f1a2-4b3c-9e8d-f0a1e2b3c4d6"
 * clienteId:
 * type: string
 * example: "user123"
 * productos:
 * type: array
 * items:
 * type: object
 * properties:
 * productoId:
 * type: string
 * example: "prod456"
 * cantidad:
 * type: integer
 * example: 3
 * estado:
 * type: string
 * example: "pendiente"
 * fechaCreacion:
 * type: string
 * format: date-time
 * example: "2025-04-23T10:00:00.000Z"
 * 401:
 * description: No autorizado. Token inválido o ausente.
 * 403:
 * description: Prohibido. El rol del usuario no tiene permiso para esta acción.
 * 404:
 * description: Pedido no encontrado.
 * 500:
 * description: Error interno del servidor.
 */
router.get('/:id', verifyToken, authorizeRole(['administrator']), obtenerDetallePedido);

/**
 * @openapi
 * /api/pedidos/{id}/entregado:
 * patch:
 * summary: Marcar un pedido como entregado.
 * description: Endpoint para que los administradores marquen un pedido específico como entregado.
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * description: ID del pedido a marcar como entregado.
 * schema:
 * type: string
 * example: "64b7f4a0-f1a2-4b3c-9e8d-f0a1e2b3c4d6"
 * responses:
 * 200:
 * description: Pedido marcado como entregado exitosamente.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * mensaje:
 * type: string
 * example: "Pedido marcado como entregado."
 * 401:
 * description: No autorizado. Token inválido o ausente.
 * 403:
 * description: Prohibido. El rol del usuario no tiene permiso para esta acción.
 * 404:
 * description: Pedido no encontrado.
 * 500:
 * description: Error interno del servidor.
 */
router.patch('/:id/entregado', verifyToken, authorizeRole(['administrator']), marcarPedidoEntregado);

export default router;