// pedido.controller.js
import Pedido from '../models/pedido.model.js';
import User from '../models/user.model.js';
import moment from 'moment-timezone';

export const crearPedido = async (req, res) => {
    try {
        const { cantidadCanastillas } = req.body;
        const clienteId = req.userId; // Este ID viene de tu middleware de autenticación (verifyToken)

        if (!clienteId) {
            return res.status(401).json({ message: 'Cliente no autenticado' });
        }

        if (cantidadCanastillas < 4) {
            return res.status(400).json({ message: 'El pedido mínimo es de 4 canastillas' });
        }

        const now = moment().tz('America/Bogota');
        const dayOfWeek = now.day(); // 0 (Domingo) - 6 (Sábado)

        if (dayOfWeek === 4) { // Jueves
            return res.status(400).json({ message: 'No se pueden realizar pedidos los jueves' });
        }

        const startOfWeek = now.clone().startOf('week').add(1, 'day'); // Lunes de esta semana
        const endOfWeek = now.clone().endOf('week').add(1, 'day').subtract(1, 'second'); // Domingo de esta semana

        const existingPedido = await Pedido.findOne({
            clienteId: clienteId,
            fechaPedido: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
        });

        if (existingPedido) {
            return res.status(400).json({ message: 'Solo se puede realizar un pedido por semana' });
        }

        const entregaJueves = now.clone().day(4); // Establece el día al jueves de la semana actual
        if (now.day() > 4 || (now.day() === 4 && now.hour() >= 0)) { // Si hoy es después del jueves o es jueves ya iniciado
            entregaJueves.add(7, 'days'); // La entrega será el próximo jueves
        }

        const cliente = await User.findById(clienteId);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        const nuevoPedido = new Pedido({
            clienteId: clienteId,
            cantidadCanastillas,
            fechaEntrega: entregaJueves.toDate(),
            nombreCliente: cliente.contactName || cliente.companyName || 'Sin nombre',
            direccionCliente: cliente.address || 'Sin dirección',
            localidadCliente: cliente.location || 'Sin localidad',
            telefonoCliente: cliente.phoneNumber || 'Sin teléfono',
        });

        await nuevoPedido.save();

        // Deshabilitar el perfil del cliente
        await User.findByIdAndUpdate(clienteId, { isEnabled: false });

        res.status(201).json({ message: 'Pedido realizado con éxito', pedido: nuevoPedido });

    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({ message: 'Error al procesar el pedido' });
    }
};

export const listarPedidos = async (req, res) => {
    try {
        const { localidad, estado, fechaPedido } = req.query;
        const filtros = {};

        if (localidad) {
            filtros.localidadCliente = localidad;
        }

        if (estado && ['Pendiente', 'Entregado'].includes(estado)) {
            filtros.estado = estado;
        }

        if (fechaPedido) {
            // Intentaremos parsear la fecha proporcionada. Asumimos formatoYYYY-MM-DD
            const fecha = moment.tz(fechaPedido, 'YYYY-MM-DD', 'America/Bogota', true);
            if (fecha.isValid()) {
                // Creamos un rango para buscar pedidos en ese día (desde el inicio hasta el final del día en Bogotá)
                const inicioDia = fecha.clone().startOf('day').toDate();
                const finDia = fecha.clone().endOf('day').toDate();
                filtros.fechaPedido = { $gte: inicioDia, $lte: finDia };
            } else {
                return res.status(400).json({ message: 'Formato de fecha de pedido inválido (YYYY-MM-DD)' });
            }
        }

        const pedidos = await Pedido.find(filtros)
            .select('clienteId nombreCliente fechaPedido fechaEntrega estado') // Seleccionamos los campos que necesitamos para la lista
            .populate('clienteId', 'email contactName companyName'); // Populamos la información del cliente que necesitemos
        res.json(pedidos);
    } catch (error) {
        console.error('Error al listar pedidos:', error);
        res.status(500).json({ message: 'Error al obtener la lista de pedidos' });
    }
};

export const obtenerDetallePedido = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const pedido = await Pedido.findById(pedidoId).populate('clienteId', 'email contactName companyName address location phoneNumber nit');
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        // ¡Añadimos este console.log para verificar la información del cliente!
        console.log('Información del cliente populada:', pedido.clienteId);
        res.json(pedido);
    } catch (error) {
        console.error('Error al obtener detalle del pedido:', error);
        res.status(500).json({ message: 'Error al obtener el detalle del pedido' });
    }
};

export const marcarPedidoEntregado = async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const { detallesEntrega } = req.body; // Recibimos los detalles de la entrega desde el cuerpo de la petición

        const pedidoActualizado = await Pedido.findByIdAndUpdate(
            pedidoId,
            { estado: 'Entregado', fechaEntregado: new Date(), detallesEntrega: detallesEntrega },
            { new: true }
        );

        if (!pedidoActualizado) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        res.json({ message: 'Pedido marcado como entregado', pedido: pedidoActualizado });
    } catch (error) {
        console.error('Error al marcar pedido como entregado:', error);
        res.status(500).json({ message: 'Error al actualizar el estado del pedido' });
    }
};