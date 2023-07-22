var color_option = document.getElementById("color-option");
var layer_option = document.getElementById("layer-option");

color_option.addEventListener("click", change_settings);
layer_option.addEventListener("click", change_settings);

var color_checkbox = Array.from(color_option.children)[0];
var color_checkmark = Array.from(color_checkbox.children)[0];
var color_text = Array.from(color_option.children)[1];

var layer_checkbox = Array.from(layer_option.children)[0];
var layer_checkmark = Array.from(layer_checkbox.children)[0];
var layer_text = Array.from(layer_option.children)[1];

function change_settings(e) {
    var target = e.target;
    if (target == color_option) {
        color_checkbox.setAttribute("data-checked", "true");
        color_checkbox.style.backgroundColor = "var(--blue)";
        color_checkmark.style.color = "var(--text-alt)";
        color_text.style.color = "var(--text-normal)";

        layer_checkbox.setAttribute("data-checked", "false");
        layer_checkbox.style.backgroundColor = "var(--200)";
        layer_checkmark.style.color = "rgba(0, 0, 0, 0)";
        layer_text.style.color = "var(--text-muted)";

        set_local_storage("group", "color");
    }
    if (target == layer_option) {
        layer_checkbox.setAttribute("data-checked", "true");
        layer_checkbox.style.backgroundColor = "var(--blue)";
        layer_checkmark.style.color = "var(--text-alt)";
        layer_text.style.color = "var(--text-normal)";

        color_checkbox.setAttribute("data-checked", "false");
        color_checkbox.style.backgroundColor = "var(--200)";
        color_checkmark.style.color = "rgba(0, 0, 0, 0)";
        color_text.style.color = "var(--text-muted)";

        set_local_storage("group", "layer");
    }
}

function get_current_group_setting() {
    var setting = "color";
    if (color_checkbox.getAttribute("data-checked") == "true") {
        setting = "color";
    }
    if (layer_checkbox.getAttribute("data-checked") == "true") {
        setting = "layer";
    }
    return setting;
}

function init_settings() {
    var setting = get_local_storage("group");
    if (setting == "color") {
        color_option.click();
    }
    if (setting == "layer") {
        layer_option.click();
    }
}
