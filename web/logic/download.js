var download_btn = document.getElementById("download-btn");
download_btn.addEventListener("click", open_download_dialog);

function open_download_dialog(e) {
    sendMain({ download_dialog: null });
}

function check_folder(folder) {
    var names = get_list_file_names();
    sendMain({ check_folder: [folder, names] });
}

function download(folder) {
    var vectors = prepare_vectors();
    progress_state = "download";
    start_new_progress(vectors.length);
    vectors.forEach(function (vector) {
        var name = vector[0];
        var svg = vector[1];
        download_vector(name, svg, folder);
    });
}

function prepare_vectors() {
    var working_parent = document.createElement("div");
    var svgs = [];
    current_vectors.forEach(function (current_vector) {
        working_parent.innerHTML = "";
        var name = Object.keys(current_vector)[0];
        var vector = current_vector[name];
        var svg = vector.svg;
        var groups = vector.groups;
        var group_names = Array.from(Object.keys(groups));
        working_parent.appendChild(svg);
        group_names.forEach(function (group_name) {
            var group = groups[group_name];
            group.removeAttribute("data-name");
            group.removeAttribute("data-index");
            svg.appendChild(group);
        });
        var final_svg = String(working_parent.innerHTML);
        svgs.push([name, final_svg]);
    });
    working_parent.remove();
    return svgs;
}

function download_vector(name, svg, folder) {
    sendMain({ download_vector: [name, svg, folder] });
}
