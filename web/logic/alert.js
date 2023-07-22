// Globals
var page_block = document.getElementById("page-block");
var current_state;

// Unsaved changes alert in editor
var alert_container = document.getElementById("alert-container");
var yes_btn = document.getElementById("yes-btn");
var no_btn = document.getElementById("no-btn");

function open_alert_container() {
    page_block.style.pointerEvents = "auto";
    alert_container.style.opacity = "1";
    alert_container.style.pointerEvents = "auto";
}

function close_alert_container() {
    page_block.style.pointerEvents = "none";
    alert_container.style.opacity = "0";
    alert_container.style.pointerEvents = "none";
}

yes_btn.addEventListener("click", yes_handler);
no_btn.addEventListener("click", no_handler);

function yes_handler() {
    if (current_state[0] == "close_editor_page") {
        close_editor_page({ override: true });
    }
    if (current_state[0] == "load_vector") {
        var new_event = current_state[1];
        new_event["override"] = true;
        load_vector(new_event);
    }
    close_alert_container();
}

function no_handler() {
    close_alert_container();
}

// Unused layers will be deleted on save alert
var confirm_container = document.getElementById("confirm-container");
var confirm_save_btn = document.getElementById("confirm-save-btn");
var confirm_cancel_btn = document.getElementById("confirm-cancel-btn");
var dont_show_again = document.getElementById("dont-show-again");

function open_confirm_container() {
    page_block.style.pointerEvents = "auto";
    confirm_container.style.opacity = "1";
    confirm_container.style.pointerEvents = "auto";
}

function close_confirm_container() {
    page_block.style.pointerEvents = "none";
    confirm_container.style.opacity = "0";
    confirm_container.style.pointerEvents = "none";
}

confirm_save_btn.addEventListener("click", save_handler);
confirm_cancel_btn.addEventListener("click", cancel_handler);
dont_show_again.addEventListener("click", dont_show_again_handler);

function save_handler() {
    if (current_state[0] == "save_changes") {
        save_changes({ override: true });
    }
    close_confirm_container();
}

function cancel_handler() {
    close_confirm_container();
}

function dont_show_again_handler() {
    var checkbox = Array.from(dont_show_again.children)[0];
    var checkmark = Array.from(checkbox.children)[0];
    var text = Array.from(dont_show_again.children)[1];
    if (checkbox.getAttribute("data-checked") == "false") {
        checkbox.setAttribute("data-checked", "true");
        checkbox.style.backgroundColor = "var(--blue)";
        checkmark.style.color = "var(--text-alt)";
        text.style.color = "var(--text-normal)";
        set_local_storage("dont_show_again", "true");
    } else if (checkbox.getAttribute("data-checked") == "true") {
        checkbox.setAttribute("data-checked", "false");
        checkbox.style.backgroundColor = "var(--200)";
        checkmark.style.color = "rgba(0, 0, 0, 0)";
        text.style.color = "var(--text-muted)";
        set_local_storage("dont_show_again", "false");
    }
}

// set_local_storage("dont_show_again", "false"); // called for dev testing

// Confirm to cancel convert process alert
var confirm_cancel_container = document.getElementById("confirm-cancel-container");
var cc_yes_btn = document.getElementById("cc-yes-btn");
var cc_no_btn = document.getElementById("cc-no-btn");

function open_confirm_cancel_container() {
    cc_yes_btn.style.pointerEvents = "auto";
    page_block.style.pointerEvents = "auto";
    confirm_cancel_container.style.opacity = "1";
    confirm_cancel_container.style.pointerEvents = "auto";
}

function close_confirm_cancel_container() {
    cc_yes_btn.style.pointerEvents = "none";
    page_block.style.pointerEvents = "none";
    confirm_cancel_container.style.opacity = "0";
    confirm_cancel_container.style.pointerEvents = "none";
}

cc_yes_btn.addEventListener("click", cc_yes_handler);
cc_no_btn.addEventListener("click", cc_no_handler);

function cc_yes_handler() {
    if (!progress_active) {
        return;
    }
    cancel_current_progress();
    close_confirm_cancel_container();
}

function cc_no_handler() {
    close_confirm_cancel_container();
}

// Warn when going back from vector page
var back_btn = document.getElementById("back-btn");
var back_warn_container = document.getElementById("back-warn-container");
var warn_yes_btn = document.getElementById("warn-yes-btn");
var warn_no_btn = document.getElementById("warn-no-btn");
var warn_dont_show_again = document.getElementById("warn-dont-show-again");

function open_warn_container() {
    page_block.style.pointerEvents = "auto";
    back_warn_container.style.opacity = "1";
    back_warn_container.style.pointerEvents = "auto";
}

function close_warn_container() {
    page_block.style.pointerEvents = "none";
    back_warn_container.style.opacity = "0";
    back_warn_container.style.pointerEvents = "none";
}

back_btn.addEventListener("click", back_btn_handler);
warn_yes_btn.addEventListener("click", go_back);
warn_no_btn.addEventListener("click", stay_here);
warn_dont_show_again.addEventListener("click", warn_dont_show_again_handler);

function back_btn_handler(e) {
    if (get_local_storage("warn_dont_show_again") == "true") {
        go_back();
    } else {
        open_warn_container();
    }
}

function go_back() {
    open_convert_page();
    close_vectors_page();
    close_warn_container();
}

function stay_here() {
    close_warn_container();
}

function warn_dont_show_again_handler() {
    var checkbox = Array.from(warn_dont_show_again.children)[0];
    var checkmark = Array.from(checkbox.children)[0];
    var text = Array.from(warn_dont_show_again.children)[1];
    if (checkbox.getAttribute("data-checked") == "false") {
        checkbox.setAttribute("data-checked", "true");
        checkbox.style.backgroundColor = "var(--blue)";
        checkmark.style.color = "var(--text-alt)";
        text.style.color = "var(--text-normal)";
        set_local_storage("warn_dont_show_again", "true");
    } else if (checkbox.getAttribute("data-checked") == "true") {
        checkbox.setAttribute("data-checked", "false");
        checkbox.style.backgroundColor = "var(--200)";
        checkmark.style.color = "rgba(0, 0, 0, 0)";
        text.style.color = "var(--text-muted)";
        set_local_storage("warn_dont_show_again", "false");
    }
}

// set_local_storage("warn_dont_show_again", "false"); // called for dev testing
