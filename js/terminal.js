function clearterminal() {
    document.getElementById("Termtable").innerHTML = "";
    lineNum = -1;
    addLine();
    server_commands("motd");
    return cmdPrompt()
}

client_commands = {
    "cls": (function () {
        return clearterminal();
    }),
    "clear": (function () {
        return clearterminal();
    }),
    "exit": (function () {
        clearterminal();
        $('#terminalpopup').modal('toggle');
        return null
    })
}

function server_commands(cmd) {
    commandpart = cmd.split(" ");
    commandobj = {};
    commandobj['fullstring'] = cmd
    commandobj["command"] = commandpart[0];
    if (commandpart.length != 1) {
        commandobj['argstring'] = cmd.replace(commandpart[0] + " ", '');
        commandobj["args"] = commandobj['argstring'].split(" ");
    } else {
        commandobj['argstring'] = null;
        commandobj["args"] = null;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'php/interp.php', false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var query = "";
    for (keyplace in commandobj) {
        query += encodeURIComponent(keyplace) + "=" + encodeURIComponent(commandobj[keyplace]) + "&";
    }
    
    xhr.send(query);
    if (xhr.status === 200) {
        if (/\r|\n/.exec(xhr.responseText)) {
            lines = xhr.response.split(/\r?\n/);
            lines.forEach(line => println(line));
        } else {
            println(xhr.responseText);
        }
        println();
        return true;
    }
    if (xhr.status === 503) {
        println("You Have been ratelimited!");
        println();
        return true;
    }
    
    if (xhr.status === 500) {
        println("Server encountered error");
        println();
        return true;
    }

    if (xhr.status === 418) {
        println("Server Cannot handle request, Turned into a teapot.");
        println();
        return true;
    }

    println(`Unknown Status code: ${xhr.status}`);
    println();
    return true;
}

function execute(command) {
    if (command == "") return cmdPrompt();
    if (client_commands.hasOwnProperty(command)) {
        var answer = client_commands[command]()
        if (answer == true) {
            return cmdPrompt();
        }
        return null
    } else {
        if (server_commands(command)) return cmdPrompt();
    }
}