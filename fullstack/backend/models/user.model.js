import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';



const userSchema = new mongoose.Schema({

    role: {

        type: String,

        enum: ['client', 'administrator', 'operator'],

        required: [true, 'El rol es requerido'],

    },

    code: {

        type: String,

        unique: true,

        sparse: true,

    },

    companyName: {

        type: String,

        required: function() {

            return this.role === 'client';

        },

    },

    nit: {

        type: String,

        required: function() {

            return this.role === 'client';

        },

    },

    address: {

        type: String,

        required: function() {

            return this.role === 'client';

        },

    },

    location: {

        type: String,

        required: function() {

            return this.role === 'client';

        },

    },

    phoneNumber: {

        type: String,

        required: function() {

            return this.role === 'client';

        },

    },

    email: {

        type: String,

        unique: true,

        sparse: true,

        lowercase: true,

        match: [/.+@.+\..+/, 'Por favor ingrese un email válido'],

        required: [true, 'El email es requerido'],

    },

    contactName: {

        type: String,

        required: function() {

            return this.role === 'client';

        },

    },

    password: {

        type: String,

        select: false,

        required: function() {

            return this.role !== 'client';

        },

    },

    isEnabled: { // ¡Añadido el campo isEnabled!

        type: Boolean,

        default: true

    }

}, {

    timestamps: true,

    strict: 'throw' // Lanza error si hay campos no definidos en el esquema

});



// Middleware para validación y HASH de contraseña (SOLO si la contraseña NO ha sido hasheada)

userSchema.pre('save', async function(next) {

    console.log('Ejecutando pre-save para:', this);



    if (this.role === 'client') {

        if (!this.companyName) throw new Error('Nombre de empresa es requerido para clientes');

        if (!this.nit) throw new Error('NIT es requerido para clientes');

        if (!this.address) throw new Error('Dirección es requerida para clientes');

        if (!this.location) throw new Error('Localidad es requerida para clientes');

        if (!this.phoneNumber) throw new Error('Número de teléfono es requerido para clientes');

        if (!this.email) throw new Error('Correo electrónico es requerido para clientes');

        if (!this.contactName) throw new Error('Nombre del encargado es requerido para clientes');

    } else {

        if (!this.password) throw new Error('Contraseña es requerida');

        // Verificar si la contraseña ya está hasheada (para evitar doble hashing)

        if (!this.password.startsWith('$2b$')) {

            this.password = await bcrypt.hash(this.password, 10);

        }

    }



    next();

});



// Agregar método para verificar si el email ya existe

userSchema.statics.emailExists = async function(email) {

    const user = await this.findOne({ email });

    return !!user;

};



export default mongoose.model('User', userSchema);