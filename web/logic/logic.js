// GLOBAL FUNCTIONS

// Sleep function for pauses
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if (new Date().getTime() - start > milliseconds) {
            break;
        }
    }
}

// Accurate round function
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

// Create elements using strings
function create_element(html_string) {
    var div = document.createElement("div");
    div.innerHTML = html_string.trim();
    return div.firstChild;
}

// Send message to node script
function sendMain(message) {
    window.api.send("toMain", JSON.stringify(message));
}

// Receive message from node script
window.api.receive("toRender", (data) => {
    var values = JSON.parse(data);
    var keys = Object.keys(values);
    var call = keys[0];

    if (call == "print") {
        console.log(values["print"]);
    }

    if (call == "platform") {
        platform = values["platform"];
    }

    if (call == "resize") {
        fullscreen = values["resize"];
        mac_resize_handler(fullscreen);
    }

    if (call == "display_columns_events") {
        columns = values["display_columns_events"];
        display_columns_events(columns);
    }

    if (call == "dialog") {
        var file = values["dialog"];
        add_new_file(file);
    }

    if (call == "sent_request") {
        var file = values["sent_request"];
        var message = `Converting ${file}`;
        update_progress_text(message);
    }

    if (call == "vectorized") {
        var vector = values["vectorized"];
        receive_vector(vector);
    }

    if (call == "download_dialog") {
        var folder = values["download_dialog"];
        check_folder(folder);
    }

    if (call == "error") {
        var message = values["error"];
        show_error(message);
    }

    if (call == "download") {
        var folder = values["download"];
        download(folder);
    }

    if (call == "downloaded") {
        update_progress();
    }

    if (call == "internet_status") {
        var status = values["internet_status"];
        if (!status) {
            show_error("Internet connection required to convert files");
        } else {
            convert();
        }
    }
});

var platform;
document.addEventListener("DOMContentLoaded", init); // Startup tasks
function init() {
    sendMain({ platform: null });
    init_pages();
    init_settings();
}

// PAGE LOGIC

function init_pages() {
    dimmer.style.opacity = "0";
    dimmer.style.pointerEvents = "none";
    close_alert_container();
    close_confirm_container();
    close_confirm_cancel_container();
    close_warn_container();
    close_vectors_page();
    close_progress_page();
    close_editor_page();
}

function set_local_storage(item, value) {
    localStorage.setItem(item, JSON.stringify(value));
}

function get_local_storage(item) {
    return JSON.parse(localStorage.getItem(item));
}

// App mouse events
document.body.addEventListener(
    "click",
    function (e) {
        close_vector_dropdown(e);
    },
    true
);

// Disable keyboard shortcuts
window.onkeydown = function (e) {
    if (e.key == "Escape" || e.key == "Esc" || e.keyCode == 27) {
        //
    }
    if ((e.ctrlKey || e.metaKey) && (e.which === 61 || e.which === 107 || e.which === 173 || e.which === 109 || e.which === 187 || e.which === 189)) {
        e.preventDefault();
    }
    // Disable zoom
    if ((e.keyCode == 173 || e.keyCode == 61) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable minimize and close
    if ((e.keyCode == 77 || e.keyCode == 87) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable reload
    if ((e.keyCode == 82 || (e.keyCode == 82 && e.shiftKey)) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable inspect
    if (e.keyCode == 73 && e.shiftKey && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable find in search
    if (e.keyCode == 70 && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable F1-F4 keys
    if (e.keyCode == 112 || e.keyCode == 113 || e.keyCode == 114 || e.keyCode == 115) {
        e.preventDefault();
    }
    // Disable F5-F8 keys
    if (e.keyCode == 116 || e.keyCode == 117 || e.keyCode == 118 || e.keyCode == 119) {
        e.preventDefault();
    }
    // Disable F9-F12 keys
    if (e.keyCode == 120 || e.keyCode == 121 || e.keyCode == 122 || e.keyCode == 123) {
        e.preventDefault();
    }
    // Disable undo, redo, select all
    if ((e.keyCode == 90 || e.keyCode == 89 || e.keyCode == 65) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable cut, copy, and paste
    if ((e.keyCode == 88 || e.keyCode == 67 || e.keyCode == 86) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable new tab, open last tab
    if ((e.keyCode == 84 || (e.keyCode == 84 && e.shiftKey)) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable source code, save page, history
    if ((e.keyCode == 85 || e.keyCode == 83 || e.keyCode == 72) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable open bookmarks
    if (e.keyCode == 79 && e.shiftKey && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable printing
    if ((e.keyCode == 80 || (e.keyCode == 80 && e.shiftKey)) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable find in search (with G)
    if ((e.keyCode == 71 || (e.keyCode == 71 && e.shiftKey)) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable downloads and devtools
    if ((e.keyCode == 74 || (e.keyCode == 74 && e.shiftKey)) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable new tab and new incognito tab
    if ((e.keyCode == 78 || (e.keyCode == 78 && e.shiftKey)) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
    // Disable tabbing through elements
    if (e.keyCode == 9) {
        e.preventDefault();
    }
};
