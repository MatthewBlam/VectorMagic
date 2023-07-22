var progress_container = document.getElementById("progress-container");
var progress_text = document.getElementById("progress-text");
var progress_cancel_btn = document.getElementById("progress-cancel-btn");
var progress_indicator = document.getElementById("progress-indicator");
var progress_cancel_btn = document.getElementById("progress-cancel-btn");
var dimmer = document.getElementById("dimmer");

progress_cancel_btn.addEventListener("click", cancel_current_progress_handler);
var progress_state;

function open_progress_page() {
    if (progress_state == "convert") {
        progress_text.textContent = "Converting files...";
    } else if (progress_state == "download") {
        progress_text.textContent = "Downloading files...";
    } else {
        progress_text.textContent = "Loading...";
    }
    progress_indicator.style.width = "0%";
    dimmer.style.opacity = "0.5";
    dimmer.style.pointerEvents = "auto";
    progress_container.style.opacity = "1";
    progress_container.style.pointerEvents = "auto";
    progress_cancel_btn.pointerEvents = "auto";
}

function close_progress_page() {
    close_confirm_cancel_container();
    dimmer.style.opacity = "0";
    dimmer.style.pointerEvents = "none";
    progress_container.style.opacity = "0";
    progress_container.style.pointerEvents = "none";
    progress_cancel_btn.pointerEvents = "none";
    setTimeout(function () {
        progress_indicator.style.width = "0%";
        progress_indicator.setAttribute("data-width", "0");
    }, 700);
}

var progress_active = false;
var active_progress_max = 0;
var active_progress_count = 0;
var progress_width_ratio = 0;

function start_new_progress(count) {
    progress_indicator.style.transition = "1s";
    open_progress_page();
    progress_active = true;
    active_progress_max = count;
    active_progress_count = 0;
    progress_width_ratio = 99 / count;
    progress_indicator.style.width = "1%";
    progress_indicator.setAttribute("data-width", "1");
    passive_progress();
}

function end_current_progress() {
    cancel_the_cancel();
    progress_indicator.style.transition = "var(--medium)";
    sendMain({ end_progress: null });
    progress_active = false;
    active_progress_max = 0;
    active_progress_count = 0;
    progress_indicator.style.width = "100%";
    close_convert_page();
    open_vectors_page();
    setTimeout(close_progress_page, 1000);
}

function cancel_current_progress_handler() {
    open_confirm_cancel_container();
}

function cancel_the_cancel() {
    close_confirm_cancel_container();
}

function cancel_current_progress() {
    sendMain({ end_progress: null });
    progress_active = false;
    active_progress_max = 0;
    active_progress_count = 0;
    open_convert_page();
    setTimeout(close_progress_page, 100);
}

function update_progress() {
    if (progress_active) {
        active_progress_count += 1;
        var width = active_progress_count * progress_width_ratio + 1;
        progress_indicator.style.width = `${width}%`;
        progress_indicator.setAttribute("data-width", String(width));
        if (active_progress_count == active_progress_max) {
            progress_cancel_btn.pointerEvents = "none";
            end_current_progress();
        }
    }
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function passive_progress() {
    if (progress_active) {
        var width = parseFloat(progress_indicator.getAttribute("data-width")) + random(0.5, 1);
        var max = 1000;
        if (width > 80) {
            var max = 5000;
        }
        if (width > 90) {
            var max = 10000;
        }
        if (width > 95) {
            var max = false;
        }
        progress_indicator.style.width = `${width}%`;
        progress_indicator.setAttribute("data-width", String(width));
        if (max) {
            setTimeout(passive_progress, random(100, max));
        }
    }
}

// deprecated
function update_progress_text(message) {
    // progress_text.textContent = message;
}
