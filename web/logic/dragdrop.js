var drop = file_list.parentElement;

["dragenter", "dragover", "dragleave", "drop"].forEach((event) => {
    drop.addEventListener(event, preventDefaults);
    document.body.addEventListener(event, preventDefaults);
});
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function is_valid_file_type(file) {
    var file_type = file.split(".");
    var file_type = file_type[file_type.length - 1];
    if (file_type == "png" || file_type == "jpg" || file_type == "jpeg" || file_type == "gif") {
        return true;
    }
    return false;
}

drop.addEventListener("drop", function (e) {
    Array.from(e.dataTransfer.files).forEach(function (file) {
        var file_path = String(file.path).split("/").join("&sol;");
        if (is_valid_file_type(file_path)) {
            add_new_file(file_path);
        }
    });
});
