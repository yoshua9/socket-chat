const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {

        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            });
        }

        client.join(data.sala);

        let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersonas', { yo: client.id, usuarios: usuarios.getPersonasPorSala(data.sala) });
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${ data.nombre} se unió`));

        callback({ yo: client.id, usuarios: usuarios.getPersonasPorSala(data.sala) });

    })

    client.on('crearMensaje', (data, callback) => {

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

        callback(mensaje);
    });



    client.on('consultarUsuario', (data, callback) => {

        let personas = usuarios.getPersonasBusqueda(data.sala, data.cadena);

        callback(personas);
    });

    client.on('disconnect', () => {

        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${ personaBorrada.nombre} salió`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', { yo: client.id, usuarios: usuarios.getPersonasPorSala(personaBorrada.sala) });

    });

    //Mensajes privados
    client.on('mensajePrivado', data => {

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));

    })

    //Chat Privado
    client.on('chatPrivado', (data, callback) => {
        var object = { destinyUser: data.id, clientUser: client.id };
        //console.log(object);
        callback(object);

    })
});