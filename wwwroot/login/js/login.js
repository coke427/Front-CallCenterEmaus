function getDomain() {
    return "http://" + window.location.host + "/FrontEmaus";
}

function IniciarSesion() {

    var email = $("#input_user_email").val().trim();
    var password = $("#input_user_password").val().trim();

    var dataPost = {
        user_email: email,
        user_password: password
    }

    var endpoint = hostApi + "/api/Login/iniciarSesion";
    $.ajax({
        type: "POST",
        url: endpoint,
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify(dataPost),
        dataType: "json",
        beforeSend: function (xhr) {
            console.log("Iniciando Sesión...");
        },
        success: function (data) {
            console.log(data);
            if (data.rpta == "0") {
                datosUsuario = data.datosUsuario;
                email = datosUsuario.user_email;
                token = data.captcha;
                almacenarToken(token, email);
                window.location.replace(getDomain() + "/home");
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops... Ocurrió un fallo',
                    text: data.msg
                })
            }
        },
        error: function (jqXHR) {
            if (jqXHR.responseJSON.msg) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: jqXHR.responseJSON.msg
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops... Ocurrió un fallo!',
                    text: 'Vuelve a intentarlo!'
                })
            }
        }
    });

}
$(document).ready(function () {
    $('#btn-show-password-usuario').on('mousedown', function () {
        $('#input_user_password').attr('type', 'text');
    }).on('mouseup mouseleave', function () {
        $('#input_user_password').attr('type', 'password');
    });
});

function almacenarToken(value1, value2) {

    var tiempo = 70;

    var fechaExpiracion = new Date();
    fechaExpiracion.setTime(fechaExpiracion.getTime() + (tiempo * 1000));
    var formatoFechaExpiracion = fechaExpiracion.toUTCString();
    var cadenaCookie1 = "secure=" + encodeURIComponent(value1) + "; expires=" + formatoFechaExpiracion + "; path=/";
    var cadenaCookie2 = "user=" + encodeURIComponent(value2) + "; expires=" + formatoFechaExpiracion + "; path=/";
    document.cookie = cadenaCookie1;
    document.cookie = cadenaCookie2;
}