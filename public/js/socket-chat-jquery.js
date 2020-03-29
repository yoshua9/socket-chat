var params = new URLSearchParams(window.location.search);

var nombre = params.get('nombre');
var sala = params.get('sala');

//referencias estructura
var divUsuarios = $('#divUsuarios');
var formEnviar = $('#formEnviar');
var formBuscar = $('#formBuscar');
var txtMensaje = $('#txtMensaje');
var divChatbox = $('#divChatboxPublic');
var divChatboxPrivate = $('.chat-rbox.private');
var tituloChat = $('#tituloChat');

console.log(params);

$('.footer span').text(new Date().getFullYear());


// Funciones para renderizar a los usuarios

function renderizarUsuarios(personas) { //{},{},{}


    var html = "";
    html += '<li>';
    html += '<a href="javascript:void(0)" class="active"> Chat de <span class="text-success">' + params.get('sala') + '</span></a>';
    html += '</li>';


    for (var i = 0; i < personas.usuarios.length; i++) {

        html += '<li>';
        if (personas.usuarios[i].nombre === nombre) {
            html += '<a data-id="' + personas.usuarios[i].id + '" href="javascript:void(0)"><img src="assets/images/users/8.jpg" alt="user-img" class="img-circle"> <span>' + personas.usuarios[i].nombre + ' <small class="text-success">online</small></span></a>';
        } else {
            html += '<a data-id="' + personas.usuarios[i].id + '" href="javascript:void(0)"><img src="assets/images/users/1.jpg" alt="user-img" class="img-circle"> <span>' + personas.usuarios[i].nombre + ' <small class="text-success">online</small></span></a>';
        }
        html += '</li>';

    }

    divUsuarios.html(html);



    var html2 = "";
    html2 += '<h3 class="box-title">Sala de chat <small class="text-success">' + params.get('sala') + '</small></h3>';

    tituloChat.html(html2);


}

function renderizarMensajes(mensaje, yo) {

    var html = '';
    var fecha = new Date(mensaje.fecha);
    var hora = fecha.getHours() + ':' + (fecha.getMinutes() < 10 ? '0' : '') + fecha.getMinutes();

    var adminClass = "info";

    if (mensaje.nombre === "Administrador") {
        adminClass = "danger";
    }

    if (!yo) {
        html += '<li cclass="animated fadeIn">';
        if (mensaje.nombre !== "Administrador") {
            html += '<div class="chat-img"><img src="assets/images/users/1.jpg" alt="user" /></div>';
        }
        html += '<div class="chat-content">';
        html += '    <h5>' + mensaje.nombre + '</h5>';
        html += '    <div class="box bg-light-' + adminClass + '">' + mensaje.mensaje + '</div>';
        html += '</div>';
        html += '<div class="chat-time">' + hora + '</div>';
        html += '</li>';
    } else {
        html += '<li class="reverse">';
        html += '<div class="chat-content">';
        html += '<h5>' + mensaje.nombre + '</h5>';
        html += '<div class="box bg-light-inverse">' + mensaje.mensaje + '</div>';
        html += '</div>';
        html += '<div class="chat-img"><img src="assets/images/users/8.jpg" alt="user" /></div>';
        html += '<div class="chat-time">' + hora + '</div>';
        html += '</li> ';
    }


    divChatbox.append(html);
    scrollBottom();
}

function renderizarMensajesPrivados(mensaje, yo, destinatario) {

    var html = '';
    var fecha = new Date(mensaje.fecha);
    var hora = fecha.getHours() + ':' + (fecha.getMinutes() < 10 ? '0' : '') + fecha.getMinutes();

    var adminClass = "info";


    var id = `${yo.id}-${destinatario.id}`;
    var elementId = $('#' + id + '');
    if (!elementId.length) {
        var divChatboxPrivate = '<ul class="chat-list p-20" id="' + id + '"></ul>';
        divChatboxPrivate.append(html);
    }

    if (!yo) {
        html += '<li cclass="animated fadeIn">';
        if (mensaje.nombre !== "Administrador") {
            html += '<div class="chat-img"><img src="assets/images/users/1.jpg" alt="user" /></div>';
        }
        html += '<div class="chat-content">';
        html += '    <h5>' + mensaje.nombre + '</h5>';
        html += '    <div class="box bg-light-' + adminClass + '">' + mensaje.mensaje + '</div>';
        html += '</div>';
        html += '<div class="chat-time">' + hora + '</div>';
        html += '</li>';
    } else {
        html += '<li class="reverse">';
        html += '<div class="chat-content">';
        html += '<h5>' + mensaje.nombre + '</h5>';
        html += '<div class="box bg-light-inverse">' + mensaje.mensaje + '</div>';
        html += '</div>';
        html += '<div class="chat-img"><img src="assets/images/users/5.jpg" alt="user" /></div>';
        html += '<div class="chat-time">' + hora + '</div>';
        html += '</li> ';
    }



    elementId.append(html);
    scrollBottom();
}

function crearPrivado(destinatarioId) {
    socket.emit('chatPrivado', {
        id: destinatarioId,
    }, function(mensaje) {
        // txtMensaje.val('').focus();
        // renderizarMensajes(mensaje, true);
        // scrollBottom();
        //console.log("esto", mensaje);
        var id = `${mensaje.destinyUser}-${mensaje.clientUser}`;
        var elementId = $('#' + id + '');
        if (!elementId.length && mensaje.destinyUser != mensaje.clientUser) {
            var bloquePrivado = '<ul class="chat-list p-20" id="' + id + '"></ul>';
            divChatboxPrivate.append(bloquePrivado);
        }
    });


}

//posiciona el puntero en el último mensaje
function scrollBottom() {

    // selectors
    var newMessage = divChatbox.children('li:last-child');

    // heights
    var clientHeight = divChatbox.prop('clientHeight');
    var scrollTop = divChatbox.prop('scrollTop');
    var scrollHeight = divChatbox.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight() || 0;

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        divChatbox.scrollTop(scrollHeight);
    }
}


//Listeners

divUsuarios.on('click', 'a', function() {

    let id = $(this).data('id');
    if (id && !($(this).hasClass('active'))) {
        crearPrivado(id);
        $('#tituloChat small').text('Privada');
        $('.chat-rbox.private').show();
        $('.chat-rbox.public').hide();
        //console.log(id);
    } else if (($(this).hasClass('active'))) {
        $('.chat-rbox.public').show();
        $('.chat-rbox.private').hide();
        $('#tituloChat small').text(sala);
    }


});

formEnviar.on('submit', function(e) {
    e.preventDefault();
    if (txtMensaje.val().trim().length === 0) {
        return;
    }

    socket.emit('crearMensaje', {
        nombre: nombre,
        mensaje: txtMensaje.val()
    }, function(mensaje) {
        txtMensaje.val('').focus();
        renderizarMensajes(mensaje, true);
        scrollBottom();
    });

});


formBuscar.on('input', function(e) {
    e.preventDefault();


    socket.emit('consultarUsuario', {
        sala,
        cadena: formBuscar.val()
    }, function(personas) {
        renderizarUsuarios(personas);
    });

});