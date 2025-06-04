var domain = "http://app.sarghesa.com/FrontEmaus";
var currentToken = obtenerValorDeCookie("secure");
if (currentToken === undefined || currentToken === null || currentToken === "") {
    window.location.replace(domain);
}

function obtenerValorDeCookie(key) {
    var secure = key;
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(secure + "=") === 0) {
            return decodeURIComponent(cookie.substring(secure.length + 1));
        }
    }
    return null;
}