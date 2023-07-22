var editor_container = document.getElementById("editor-container");
var preview_display = document.getElementById("svg-display");
var layers_list = document.getElementById("svg-layers");

var editor_open = false;

function open_editor_page() {
    editor_open = true;
    load_vector_dropdown();
    dimmer.style.opacity = "0.5";
    dimmer.style.pointerEvents = "auto";
    editor_container.style.opacity = "1";
    editor_container.style.pointerEvents = "auto";
    init_panel_width();
    init_zoom();
}

function close_editor_page(e) {
    function close() {
        editor_open = false;
        dimmer.style.opacity = "0";
        dimmer.style.pointerEvents = "none";
        editor_container.style.opacity = "0";
        editor_container.style.pointerEvents = "none";
        dropdown_menu.innerHTML = "";
        dropdown_text.textContent = "Select vector to edit";
        preview_display.innerHTML = "";
        layers_list.innerHTML = "";
    }
    if (unsaved_edits()) {
        if (!e.override) {
            current_state = ["close_editor_page", null];
            open_alert_container();
        } else {
            close();
        }
    } else {
        close();
    }
}

var edit_btn = document.getElementById("edit-btn");
edit_btn.addEventListener("click", open_editor_page);

var editor_close_btn = document.getElementById("editor-close-btn");
editor_close_btn.addEventListener("click", close_editor_page);

var dropdown_container = Array.from(document.getElementById("vector-select-dropdown").children);
var dropdown_select = dropdown_container[0];
var dropdown_menu = dropdown_container[1];
var dropdown_text = Array.from(dropdown_select.children)[0];
var dropdown_chevron = Array.from(dropdown_select.children)[1];

dropdown_select.addEventListener("click", open_vector_dropdown);

function load_vector_dropdown() {
    dropdown_text.style.color = "var(--text-muted)";
    current_vectors.forEach(function (vector) {
        var name = Object.keys(vector)[0];
        var html = `<div class="dropdown-option" data-name="${name}">${name}</div>`;
        var option_element = create_element(html);
        dropdown_menu.appendChild(option_element);
        option_element.addEventListener("click", load_vector);
    });
}

function open_vector_dropdown(e) {
    dropdown_select.setAttribute("data-open", "true");
    dropdown_chevron.style.transform = "rotate(180deg)";
    dropdown_menu.style.opacity = "1";
    dropdown_menu.style.pointerEvents = "auto";
}

function close_vector_dropdown(e) {
    if (e.target != dropdown_select) {
        dropdown_select.setAttribute("data-open", "false");
        dropdown_chevron.style.transform = "rotate(0deg)";
        dropdown_menu.style.opacity = "0";
        dropdown_menu.style.pointerEvents = "none";
    }
}

var active_vector;

function load_vector(e) {
    function load() {
        dropdown_text.style.color = "var(--text-normal)";
        var name = e.target.getAttribute("data-name");
        dropdown_text.textContent = name;
        active_vector = retrieve_vector_by_name(name);
        load_preview(active_vector.svg);
        load_layers(active_vector.groups);
        center_preview();
    }
    if (unsaved_edits()) {
        if (!e.override) {
            current_state = ["load_vector", e];
            open_alert_container();
        } else {
            load();
        }
    } else {
        load();
    }
}

function load_preview(svg) {
    preview_display.innerHTML = "";
    preview_display.appendChild(svg);
}

function load_layers(groups) {
    layers_list.innerHTML = "";
    var group_names = Object.keys(groups);
    for (var i = 0; i < group_names.length; i++) {
        var group_name = group_names[i];
        var html = `
        <div class="svg-layer" data-name="${group_name}">
            <div class="checkbox-container">
                <div class="checkbox" data-checked="false">
                    <svg class="checkmark" width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.6667 1.5L4.25004 7.91667L1.33337 5" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <span class="svg-layer-name">${group_name}</span>
            </div>
        </div>`;
        var layer_element = create_element(html);
        layers_list.appendChild(layer_element);
        var checkbox_container = Array.from(layer_element.children)[0];
        checkbox_container.addEventListener("click", toggle_group);
        checkbox_container.click();
    }
}

function toggle_group(e) {
    var checkbox_container = e.target;
    var group_name = checkbox_container.parentElement.getAttribute("data-name");
    var checkbox = Array.from(checkbox_container.children)[0];
    var text = Array.from(checkbox_container.children)[1];
    var checkmark = Array.from(checkbox.children)[0];
    if (checkbox.getAttribute("data-checked") == "false") {
        checkbox.setAttribute("data-checked", "true");
        checkbox.style.backgroundColor = "var(--blue)";
        checkmark.style.color = "var(--text-alt)";
        text.style.color = "var(--text-normal)";
        show_group(group_name);
    } else if (checkbox.getAttribute("data-checked") == "true") {
        checkbox.setAttribute("data-checked", "false");
        checkbox.style.backgroundColor = "var(--200)";
        checkmark.style.color = "rgba(0, 0, 0, 0)";
        text.style.color = "var(--text-muted)";
        hide_group(group_name);
    }
}

function show_group(group_name) {
    var group_element = active_vector.groups[group_name];
    var index = parseInt(group_element.getAttribute("data-index"));
    var svg = Array.from(preview_display.children)[0];
    var existing_groups = Array.from(svg.children);
    if (existing_groups.length == 0) {
        svg.appendChild(group_element);
    } else {
        var target_group;
        existing_groups.every(function (existing_group) {
            var existing_index = parseInt(existing_group.getAttribute("data-index"));
            if (index < existing_index) {
                target_group = existing_group;
                return false;
            }
            return true;
        });
        svg.insertBefore(group_element, target_group);
    }
}

function hide_group(group_name) {
    var group_element;
    var svg = Array.from(preview_display.children)[0];
    var groups = Array.from(svg.children);
    groups.forEach(function (group) {
        var name = group.getAttribute("data-name");
        if (name == group_name) {
            group_element = group;
        }
    });
    group_element.remove();
}

function retrieve_vector_by_name(name) {
    for (var i = 0; i < current_vectors.length; i++) {
        var item_name = Object.keys(current_vectors[i])[0];
        if (item_name == name) {
            return current_vectors[i][name];
        }
    }
}

var editor_save_btn = document.getElementById("editor-save-btn");
editor_save_btn.addEventListener("click", save_changes);

function save_changes(e) {
    function save() {
        var new_vector = active_vector;
        var new_groups = {};
        var svg = Array.from(preview_display.children)[0];
        Array.from(svg.children).forEach(function (group) {
            new_groups[group.getAttribute("data-name")] = group;
        });
        new_vector.groups = new_groups;
        current_vectors[active_vector.name] = new_vector;
        active_vector = new_vector;
        remove_unused_layers();
    }
    if (get_local_storage("dont_show_again") != "true") {
        if (unsaved_edits()) {
            if (!e.override) {
                current_state = ["save_changes", null];
                open_confirm_container();
            } else {
                save();
            }
        } else {
            save();
        }
    } else {
        save();
    }
}

function confirm_save() {}

function remove_unused_layers() {
    var layers = Array.from(document.getElementsByClassName("svg-layer"));
    layers.forEach(function (layer) {
        var checkbox_container = Array.from(layer.children)[0];
        var checkbox = Array.from(checkbox_container.children)[0];
        if (checkbox.getAttribute("data-checked") == "false") {
            layer.remove();
        }
    });
}

function unsaved_edits() {
    var layers = Array.from(document.getElementsByClassName("svg-layer"));
    var unsaved = false;
    layers.forEach(function (layer) {
        var checkbox_container = Array.from(layer.children)[0];
        var checkbox = Array.from(checkbox_container.children)[0];
        if (checkbox.getAttribute("data-checked") == "false") {
            unsaved = true;
        }
    });
    return unsaved;
}

var preview_scroll_area = document.getElementById("svg-display-scroll");
var zoom_in_btn = document.getElementById("zoom-in-btn");
var zoom_out_btn = document.getElementById("zoom-out-btn");
var zoom_text = document.getElementById("zoom-level-text");

zoom_in_btn.addEventListener("click", zoom_in);
zoom_out_btn.addEventListener("click", zoom_out);

function init_zoom() {
    var zoom = parseInt(get_local_storage("zoom"));
    if (isNaN(zoom)) {
        zoom = 50;
    }
    update_zoom(zoom);
}

function update_zoom(zoom) {
    zoom = String(zoom);
    preview_display.style.transform = `scale(${zoom}%)`;
    zoom_text.setAttribute("data-zoom", zoom);
    zoom_text.textContent = zoom + "%";
    set_local_storage("zoom", zoom);
    center_preview();
}

function zoom_in(e) {
    var new_zoom = current_zoom() + 5;
    update_zoom(new_zoom);
}

function zoom_out(e) {
    var new_zoom = current_zoom() - 5;
    if (new_zoom < 5) {
        return;
    }
    update_zoom(new_zoom);
}

function current_zoom() {
    return parseInt(zoom_text.getAttribute("data-zoom"));
}

function center_preview() {
    var width = preview_scroll_area.scrollWidth;
    var height = preview_scroll_area.scrollHeight;
    preview_scroll_area.scrollLeft = width / 2.5;
    preview_scroll_area.scrollTop = height / 2.5;
}

var preview_drag = false;
var oldX;
var oldY;

preview_scroll_area.addEventListener("mousedown", function (e) {
    preview_drag = true;
    oldX = e.pageX;
    oldY = e.pageY;
});

preview_scroll_area.addEventListener("mousemove", function (e) {
    if (preview_drag) {
        var newX = e.pageX;
        var newY = e.pageY;
        var deltaX = newX - oldX;
        var deltaY = newY - oldY;
        preview_scroll_area.scrollLeft -= Math.round(deltaX);
        preview_scroll_area.scrollTop -= Math.round(deltaY);
        if (deltaX > 1 || deltaX < -1 || deltaY > 1 || deltaY < -1) {
            oldX = newX;
            oldY = newY;
        }
    }
});

preview_scroll_area.addEventListener("mouseup", function (e) {
    preview_drag = false;
});

preview_scroll_area.addEventListener("mouseleave", function (e) {
    preview_drag = false;
});

var main_editor_container = document.getElementById("main-editor-container");
var panel_divider = document.getElementById("panel-divider");
var display_container = document.getElementById("svg-display-container");
var layers_container = document.getElementById("svg-layers-container");

var panel_drag = false;
var startX;

panel_divider.addEventListener("mousedown", function (e) {
    panel_drag = true;
    startX = e.clientX;
});

document.body.addEventListener("mousemove", function (e) {
    if (panel_drag) {
        var endX = e.clientX;
        var diff = endX - startX;
        var width = parseInt(display_container.getAttribute("data-width"));
        var new_width = Math.round(width + diff);
        if (panel_in_bounds(new_width)) {
            display_container.style.width = `${new_width}px`;
            display_container.setAttribute("data-width", String(new_width));
            center_preview();
        }
        if (diff > 1 || diff < -1) {
            startX = endX;
        }
        set_local_storage("panel_width", String(get_panel_percent(new_width)));
    }
});

document.body.addEventListener("mouseup", function (e) {
    panel_drag = false;
});

window.onresize = panel_width_onresize;

function init_panel_width() {
    var percent = parseInt(get_local_storage("panel_width"));
    if (isNaN(percent)) {
        percent = 80;
    }
    set_panel_width(percent);
}

function panel_width_onresize() {
    if (editor_open) {
        var width = parseInt(display_container.getAttribute("data-width"));
        set_panel_width(get_panel_percent(width));
        center_preview();
    }
}

function set_panel_width(percent) {
    var main_width = main_editor_container.offsetWidth;
    var width = String(Math.round(main_width * (percent / 100)));
    display_container.style.width = `${width}px`;
    display_container.setAttribute("data-width", width);
}

function get_panel_percent(width) {
    var main_width = main_editor_container.offsetWidth;
    var percent = Math.round((width / main_width) * 100);
    return percent;
}

function panel_in_bounds(width) {
    var percent = get_panel_percent(width);
    if (percent > 90 || percent < 20) {
        return false;
    }
    return true;
}
