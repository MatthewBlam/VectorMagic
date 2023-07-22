// TODO: cache encoding

const { app, BrowserWindow, ipcMain, screen, nativeTheme, dialog } = require("electron");
const request = require("request");
const fs = require("fs");
const path = require("path");
const process = require("process");
const os = process.platform;
const http2 = require("http2");
// const zlib = require("node:zlib");

function isConnected() {
    return new Promise((resolve) => {
        const client = http2.connect("https://www.google.com");
        client.on("connect", () => {
            resolve(true);
            client.destroy();
        });
        client.on("error", () => {
            resolve(false);
            client.destroy();
        });
    });
}

function check_internet() {
    isConnected().then(function (connected) {
        sendRender({ internet_status: connected });
    });
}

function time_in_hours() {
    return Date.now() / 1000 / 60 / 60;
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if (new Date().getTime() - start > milliseconds) {
            break;
        }
    }
}

const createWindow = () => {
    if (!app.getLoginItemSettings().openAtLogin) {
        app.setLoginItemSettings({
            openAtLogin: true,
        });
    }
    app.setAppUserModelId("com.mattblam.vectormagic");
    app.commandLine.appendSwitch("disable-color-correct-rendering");
    app.commandLine.appendSwitch("force-color-profile", "srgb");

    nativeTheme.themeSource = "light";

    const screen_size = screen.getPrimaryDisplay().size;

    win = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 850,
        minHeight: 350,
        show: false,
        // icon: __dirname + "/logo/VectorMagic.png",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "preload.js"),
            enableBlinkFeatures: "CSSColorSchemeUARendering",
            devTools: false,
        },
        transparent: false,
        frame: true,
        hasShadow: true,
    });

    win.setMenu(null);
    win.removeMenu();

    win.loadFile("web/index.html");
    win.webContents.openDevTools();

    win.once("ready-to-show", () => {
        sleep(1000);
        win.show();
    });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (os !== "darwin") {
        app.quit();
    }
});

app.on("before-quit", function (e) {
    // save anything here before close
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

function sendRender(message) {
    win.webContents.send("toRender", JSON.stringify(message));
}

ipcMain.on("toMain", (event, args) => {
    var values = JSON.parse(args);
    var keys = Object.keys(values);
    var call = keys[0];

    if (call == "platform") {
        sendRender({ platform: os });
    }

    if (call == "dialog") {
        open_dialog();
    }

    if (call == "check_internet") {
        check_internet();
    }

    if (call == "convert") {
        convert(values["convert"]);
    }

    if (call == "end_progress") {
        stop_convert();
    }

    if (call == "download_dialog") {
        download_dialog();
    }

    if (call == "cache_bitmap") {
        // var name = values["cache_bitmap"][0];
        // var path = values["cache_bitmap"][1];
        // cache_bitmap(name, path);
    }

    if (call == "check_same") {
        var name = values["check_same"][0];
        var path = values["check_same"][1];
        check_same(name, path);
    }

    if (call == "check_folder") {
        var folder = values["check_folder"][0];
        var names = values["check_folder"][1];
        check_folder(folder, names);
    }

    if (call == "download_vector") {
        var name = values["download_vector"][0];
        var svg = values["download_vector"][1];
        var folder = values["download_vector"][2];
        download_vector(name, svg, folder);
    }
});

function open_dialog() {
    dialog
        .showOpenDialog({
            properties: ["openFile"],
            filters: [{ name: "Images", extensions: ["jpg", "png", "gif"] }],
        })
        .then(function (response) {
            if (!response.canceled) {
                var filepath;
                if (os == "darwin") {
                    filepath = String(response.filePaths[0]).split("/").join("&sol;");
                } else {
                    filepath = String(response.filePaths[0]).split("\\").join("&sol;");
                }
                sendRender({ dialog: filepath });
            } else {
            }
        });
}

/* DEPRECATED

function save_json(file, data) {
    var stringify = JSON.stringify(data);
    var compress = zlib.brotliCompressSync(stringify);
    var b64 = compress.toString("base64");
    fs.writeFileSync(file, b64);
}

function get_json(file) {
    var b64 = fs.readFileSync(file).toString();
    if (b64.length == 0) {
        return {};
    }
    var buf = Buffer.from(b64, "base64");
    var decompress = zlib.brotliDecompressSync(buf);
    var json = JSON.parse(decompress.toString("utf8"));
    return json;
}

var CACHE;
function set_cache_file() {
    if (os == "darwin") {
        CACHE = path.join(process.resourcesPath, "extraResources", "vmcache.txt");
    } else {
        CACHE = path.join(app.getPath("appData"), "vmcache.txt");
        if (!fs.existsSync(CACHE)) {
            fs.writeFileSync(CACHE, JSON.stringify({}));
        }
    }
}
set_cache_file();
CACHE = "vmcache.txt"; // for dev environment

function clear_old_cache() {
    // var files = JSON.parse(fs.readFileSync(OLDCACHE));
    var files = get_json(CACHE);
    var file_names = Object.keys(files);
    var current_time = time_in_hours();
    file_names.forEach(function (name) {
        var file_time = files[name].date;
        if (current_time - file_time > 24) {
            delete files[name];
        }
    });
    // fs.writeFileSync(OLDCACHE, JSON.stringify(files));
    save_json(CACHE, files);
}
clear_old_cache();

function cache_bitmap(name, path) {
    // var files = JSON.parse(fs.readFileSync(OLDCACHE));
    var files = get_json(CACHE);
    var buf = fs.readFileSync(path).toString("base64");
    if (files[name] == undefined) {
        files[name] = { buffer: buf };
    } else {
        // if (Buffer.compare(buf, Buffer.from(files[name].buffer)) != 0) {
        if (buf != files[name].buffer) {
            files[name].buffer = buf;
            delete files[name].svg;
        }
    }
    files[name].date = time_in_hours();
    // fs.writeFileSync(OLDCACHE, JSON.stringify(files));
    save_json(CACHE, files);
}

function cache_vector(name, svg, group) {
    // var files = JSON.parse(fs.readFileSync(OLDCACHE));
    var files = get_json(CACHE);
    if (!files[name].hasOwnProperty("svg")) {
        files[name].svg = {};
    }
    files[name].svg[group] = svg;
    // fs.writeFileSync(OLDCACHE, JSON.stringify(files));
    save_json(CACHE, files);
}

function found_cached_svg(name, group) {
    // var files = JSON.parse(fs.readFileSync(OLDCACHE));
    var files = get_json(CACHE);
    if (files[name].hasOwnProperty("svg")) {
        if (files[name].svg.hasOwnProperty(group)) {
            return files[name].svg[group];
        }
    }
    return false;
}

*/

function vectorize(file, fullname, rawname, group) {
    sendRender({ sent_request: fullname });
    // var cached_svg = found_cached_svg(fullname, group);
    // if (cached_svg) {
    //     sendRender({ vectorized: { vector: cached_svg, name: rawname + ".svg" } });
    //     return;
    // }
    request.post(
        {
            url: "https://vectorizer.ai/api/v1/vectorize",
            formData: {
                image: fs.createReadStream(file),
                "output.group_by": group,
            },
            auth: {
                user: "vk7xmmtdpdml2ll",
                pass: "3jaeo85a6j87hmu3dmu29p6utt85600jcnahjtfjkmmjmnjher9j",
            },
            followAllRedirects: true,
            encoding: null,
        },
        function (error, response, body) {
            if (!cancel_convert) {
                if (error) {
                    sendRender({ error: "Request Failed: " + String(error) });
                    console.error("Request Failed:", error);
                } else if (!response || response.statusCode != 200) {
                    sendRender({ error: "Error: " + String(response) });
                    console.error("Error:", response && response.statusCode, body.toString("utf8"));
                } else {
                    var svg = body.toString().split(/\r?\n/);
                    svg.splice(0, 2);
                    svg = svg.join("\r\n");
                    sendRender({ vectorized: { vector: svg, name: rawname + ".svg" } });
                    // cache_vector(fullname, svg, group);
                }
            }
        }
    );
}

var cancel_convert = true;

function stop_convert() {
    cancel_convert = true;
}

function convert(data) {
    cancel_convert = false;
    var files = data.files;
    var names = data.names;
    var group = data.group;
    var count = 0;
    files.forEach(function (file) {
        if (!cancel_convert) {
            vectorize(file, names[count].fullname, names[count].rawname, group);
        }
        count += 1;
    });
}

function download_dialog() {
    dialog
        .showOpenDialog({
            properties: ["openDirectory"],
        })
        .then(function (response) {
            if (!response.canceled) {
                var folderpath = response.filePaths[0];
                sendRender({ download_dialog: folderpath });
            } else {
            }
        });
}

function check_folder(folder, names) {
    var dup = false;
    names.forEach(function (name) {
        var file = name.rawname + ".svg";
        var path = `${folder}/${file}`;
        if (fs.existsSync(path)) {
            var message = `Cannot overwrite ${file} which already exists in ${folder}`;
            sendRender({ error: message });
            dup = true;
        }
    });
    if (dup) {
        return;
    }
    sendRender({ download: folder });
}

function download_vector(name, svg, folder) {
    var path = `${folder}/${name}`;
    fs.writeFileSync(path, svg);
    sendRender({ downloaded: [name, svg, folder] });
}
