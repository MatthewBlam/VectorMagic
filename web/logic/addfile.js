var drop_text = document.getElementById("drop-text");
var add_file_btn = document.getElementById("add-file-btn");
add_file_btn.addEventListener("click", function () {
    sendMain({ dialog: null });
});

function get_raw_name(file) {
    var split = file.split(".");
    split.pop();
    var raw = split.join(".");
    return raw;
}

function show_drop_text() {
    var existing_files = Array.from(document.getElementsByClassName("file"));
    if (existing_files.length == 0) {
        drop_text.style.opacity = "0.75";
    }
}

function add_new_file(file) {
    var dup = false;
    var full_path = file;
    var file_name = full_path.split("&sol;");
    var file_name = file_name[file_name.length - 1];
    var existing_files = Array.from(document.getElementsByClassName("file"));
    existing_files.forEach(function (f) {
        if (f.getAttribute("data-name") == file_name) {
            show_error("A file with that name is already uploaded");
            dup = true;
        }
    });
    if (dup) {
        return;
    }
    var html = `
    <div class="file" data-path="${full_path}" data-name="${file_name}" data-rawname="${get_raw_name(file_name)}">
        <span class="file-name">${file_name}</span>
        <div class="delete-file-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6 btn">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </div>
    </div>`;
    var file_element = create_element(html);
    file_list.appendChild(file_element);
    drop_text.style.opacity = "0";
    Array.from(file_element.children)[1].addEventListener("click", function (e) {
        e.target.parentElement.remove();
        show_drop_text();
    });
    sendMain({ cache_bitmap: [file_name, full_path.split("&sol;").join("/")] });
}

function get_list_file_paths() {
    var file_paths = [];
    var file_elements = Array.from(file_list.children);
    file_elements.forEach(function (file_element) {
        var file_path = file_element.getAttribute("data-path");
        file_paths.push(file_path);
    });
    return file_paths;
}

function get_list_file_names() {
    var file_names = [];
    var file_elements = Array.from(file_list.children);
    file_elements.forEach(function (file_element) {
        var file_name = file_element.getAttribute("data-name");
        var raw_name = file_element.getAttribute("data-rawname");
        var name = { fullname: file_name, rawname: raw_name };
        file_names.push(name);
    });
    return file_names;
}
