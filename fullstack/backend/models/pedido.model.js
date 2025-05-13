import mongoose from 'mongoose';

const PedidoSchema = new mongoose.Schema({
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cantidadCanastillas: {
        type: Number,
        required: true,
        min: 4
    },
    fechaPedido: {
        type: Date,
        default: Date.now
    },
    fechaEntrega: {
        type: Date,
        required: true
    },
    nombreCliente: {
        type: String,
        required: true
    },
    direccionCliente: {
        type: String,
        required: true
    },
    localidadCliente: {
        type: String,
        required: true
    },
    telefonoCliente: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'Entregado'],
        default: 'Pendiente'
    },
    fechaEntregado: { // Nuevo campo para la fecha de entrega real
        type: Date
    },
    detallesEntrega: { // Nuevo campo para los detalles de la entrega
        type: String
    },
    // ¡NUEVOS CAMPOS PARA LA INFORMACIÓN DE LA EMPRESA DEL CLIENTE!
    companyName: {
        type: String
    },
    nit: {
        type: String
    },
    email: {
        type: String
    }
}, { timestamps: true });

const Pedido = mongoose.model('Pedido', PedidoSchema);

export default Pedido;