refreshTokenInterval = setInterval(function () {
    refreshToken();
}, 30000);

function refreshToken() {

    var currentToken = obtenerValorDeCookie("secure");
    var username = obtenerValorDeCookie("user");
    var dataPost = {
        currentToken,
        username
    }
    var endpoint = hostApi + "/api/Token/refresh";
    $.ajax({
        type: "POST",
        url: endpoint,
        headers: {
            "Authorization": 'Bearer ' + currentToken,
            "Content-Type": "application/json"
        },
        data: JSON.stringify(dataPost),
        dataType: "json",
        beforeSend: function (xhr) {
            console.log("Iniciando ...");
        },
        success: function (data) {
            almacenarToken(data.newToken, username);
        },
        error: function (xhr, status, error) {

            console.error('Error :', error);

        }
    });

}

function obtenerValorDeCookie(key) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        var cookieParts = cookie.split('=');
        var cookieName = cookieParts[0].trim();
        var cookieValue = cookieParts[1];
        if (cookieName === key) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

function logout() {
    clearInterval(refreshTokenInterval);
    eliminarCookie("user");
    eliminarCookie("secure");
    window.location.replace(getDomain());
}

function eliminarCookie(key) {
    var nombreCookie = key;
    var fechaActual = new Date();
    var fechaExpiracion = new Date(fechaActual.getTime() + (1 * 60 * 60 * 1000));
    var formatoFechaExpiracion = fechaExpiracion.toUTCString();
    document.cookie = nombreCookie + "=; expires=" + formatoFechaExpiracion + "; path=/";
}