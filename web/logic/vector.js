var vectors_page = document.getElementById("vectors-page");
var vector_list = document.getElementById("vectors");

function open_vectors_page() {
    vectors_page.style.opacity = "1";
    vectors_page.style.pointerEvents = "auto";
}

function close_vectors_page() {
    vectors_page.style.opacity = "0";
    vectors_page.style.pointerEvents = "none";
    vector_list.innerHTML = "";
}

function add_new_vector(name) {
    var html = `
    <div class="vector" data-name="${name}">
        <span class="vector-name">${name}</span>
    </div>`;
    var vector_element = create_element(html);
    vector_list.appendChild(vector_element);
}

function reset_vectors() {
    current_vectors = [];
    vector_list.innerHTML = "";
}

var current_vectors = [];

function receive_vector(data) {
    var svg = data.vector;
    var name = data.name;
    var vector = {};
    vector[name] = parse_svg(svg, name);
    current_vectors.push(vector);
    add_new_vector(name);
    update_progress();
}

function parse_svg(vector, name) {
    var groups = {};
    var element = create_element(vector);
    var children = Array.from(element.children);
    for (var i = 0; i < children.length; i++) {
        var number = i + 1;
        var group_name = `Group ${number}`;
        children[i].setAttribute("data-name", group_name);
        children[i].setAttribute("data-index", String(number));
        groups[group_name] = children[i];
    }
    element.innerHTML = "";
    var svg = element;
    var parsed = {};
    parsed["name"] = name;
    parsed["svg"] = svg;
    parsed["groups"] = groups;
    return parsed;
}
