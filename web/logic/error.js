var error_message = document.getElementById("error-message");

var open_error_timeout;
var close_error_timeout;

function show_error(message) {
    clearTimeout(open_error_timeout);
    clearTimeout(close_error_timeout);
    error_message.textContent = message;
    // error_message.style.top = "40%";
    error_message.style.opacity = "1";
    open_error_timeout = setTimeout(close_error, 5000);
}

function close_error() {
    // error_message.style.top = "-100px";
    error_message.style.opacity = "0";
    close_error_timeout = setTimeout(function () {
        error_message.textContent = "";
    }, 1000);
}
