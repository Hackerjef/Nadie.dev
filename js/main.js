LOADINGBTNHTML = "<i class='fas fa-spinner fa-spin'></i>"
BOOTEDLINUXHTML = '<i class="fab fa-linux"></i> STOP Linux'
data = {}

function webload(btnID, timeout=3000) {
    start_load(btnID, timeout);
    switch (btnID) {
        case "github":
            window.open("https://github.com/hackerjef", '_blank');
            break;
        case "Twitter":
            window.open("https://twitter.com/hackerjef", '_blank');
            break;
        case "TWITCH":
            window.open("https://www.twitch.tv/nadie63", '_blank');
            break;
        case "steam":
            window.open("https://steamcommunity.com/profiles/76561198081061317", '_blank');
            break;
        case "discord":
            updateDiscordinfo();
            clearTimeout(data[btnID].timeout);
            $('#discordpopup').on('hidden.bs.modal', function (e) {
                stop_load(btnID);
            })
            $('#discordpopup').modal();
            break;
        case "terminal":
            clearTimeout(data[btnID].timeout);
            $('#terminalpopup').on('hidden.bs.modal', function (e) {
                stop_load(btnID);
            })
            $('#terminalpopup').on('shown.bs.modal', function () {
                loadTerminal();
            });
            $('#terminalpopup').modal();
            break;
        case "discordbio":
            window.open("https://discord.bio/p/Nadie", '_blank');
            break;
        default:
            console.warn("Somehow you got here.. dont know how but uh ye");
            break;
    }
}

function start_load(btnID, timeout) {
    data[btnID] = {}
    data[btnID].backup = document.getElementById(btnID).innerHTML
    document.getElementById(btnID).innerHTML = LOADINGBTNHTML
    if (!timeout == false) {
        data[btnID].timeout = setTimeout(function () {
            stop_load(btnID);
        }, timeout)
    }
}

function stop_load(btnID) {
    document.getElementById(btnID).innerHTML = data[btnID].backup;
}

var updateDiscordinfo = once(function () {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            UserData = JSON.parse(xhttp.responseText);
            document.getElementById("duser").innerHTML = `${UserData['username']}#${UserData['discriminator']}`;
            document.getElementById("dID").innerHTML = `(${UserData['id']})`;
        }
    };
    xhttp.open("GET", "php/discord.php?data", true);
    xhttp.send();
});

var loadTerminal = once(function () {
    status("Terminal")
    addLine();
    server_commands("motd");
    cmdPrompt();
});

// var emulator = new V86Starter({
//     bios: {
//         url: "../dist/linuxvm/seabios.bin",
//     },
//     cdrom: {
//         url: "../dist/linuxvm/linux.iso",
//     },
//     vga_bios: {
//         url: "../dist/linuxvm/vgabios.bin",
//     },
//     disable_keyboard: true,
//     disable_mouse: true,
//     memory_size: 32 * 1024 * 1024,
// });

// TODO: FIX TEXT AREA
function start_linux() {
    terminalhtml = document.getElementById('Termbody');
    bootlinuxhtml = document.getElementById('bootlinux');
    
    // backup terminal
    data['terminal_div'] = {}
    data['terminal_div'].innerHTML = terminalhtml.innerHTML;
    
    //backup button
    data['bootlinux'] = {}
    data['bootlinux'].innerHTML = bootlinuxhtml.innerHTML;
    bootlinux.innerHTML = BOOTEDLINUXHTML;
    bootlinuxhtml.onclick = stop_linux;
    
    //clear terminal to blank terminal
    terminalhtml.innerHTML = "<table id='Termtable'>This doesnt work.. yet..</table>";
    return
    
    emulator.run();
    
    current_line = []
    //output to console good, just need to add it to TERMSERIAL
    emulator.add_listener("serial0-output-char", function(char)
    {
        if (char == "\n")
        {
            console.log(" ")
            return
        }
        if(char === "\r")
        {
            console.log(current_line.join(""))
            current_line = []
            return;
        }
        
        current_line.push(char)
        //document.getElementById("TermSerial").value += char;
    });
};


function stop_linux() {
    //emulator.stop();
    terminalhtml = document.getElementById('Termbody');
    bootlinuxhtml = document.getElementById('bootlinux');
    
    // restore terminal
    terminalhtml.innerHTML = data['terminal_div'].innerHTML;
    clearterminal();
    
    //restore button
    bootlinuxhtml.innerHTML = data['bootlinux'].innerHTML;
    bootlinuxhtml.onclick = start_linux;
}

// https://davidwalsh.name/javascript-once
function once(fn, context) {
    var result;

    return function () {
        if (fn) {
            result = fn.apply(context || this, arguments);
            fn = null;
        }
        return result;
    };
}