var convert_page = document.getElementById("convert-page");
var file_list = document.getElementById("files");

function open_convert_page() {
    convert_page.style.opacity = "1";
    convert_page.style.pointerEvents = "auto";
}

function close_convert_page() {
    convert_page.style.opacity = "0";
    convert_page.style.pointerEvents = "none";
}

var convert_btn = document.getElementById("convert-btn");
convert_btn.addEventListener("click", convert_check);

function convert_check() {
    sendMain({ check_internet: null });
}

function convert() {
    reset_vectors();
    var file_paths = get_list_file_paths();
    if (file_paths.length == 0) {
        return;
    }
    var file_names = get_list_file_names();
    var group_setting = get_current_group_setting();
    progress_state = "convert";
    start_new_progress(file_paths.length);
    sendMain({ convert: { files: file_paths, names: file_names, group: group_setting } });
}
