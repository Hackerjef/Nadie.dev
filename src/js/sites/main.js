/* eslint-env jquery */

import "normalize.css/normalize.css";

//font awsome
import "@fortawesome/fontawesome-free/js/all.js";
import "@fortawesome/fontawesome-free/css/all.css";

//bootstrap
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

//background
import "../background.js";

//css
import "../../css/profile.css";

import "../terminal.js";

const LOADINGBTNHTML = "<i class='fas fa-spinner fa-spin'></i>";
var data = {};


// eslint-disable-next-line no-unused-vars
window.webload = function (btnID, timeout=3000) {
    start_load(btnID, timeout);
    switch (btnID) {
    case "github":
        window.open("https://github.com/hackerjef", "_blank");
        break;
    case "Twitter":
        window.open("https://twitter.com/hackerjef", "_blank");
        break;
    case "TWITCH":
        window.open("https://www.twitch.tv/nadie63", "_blank");
        break;
    case "steam":
        window.open("https://steamcommunity.com/profiles/76561198081061317", "_blank");
        break;
    case "discord":
        clearTimeout(data[btnID].timeout);
        $("#discordpopup").on("hidden.bs.modal", function () {
            stop_load(btnID);
        });
        $("#discordpopup").modal("show");
        break;
    case "terminal":
        //import xtermjs
        clearTimeout(data[btnID].timeout);
        $("#terminalpopup").on("hidden.bs.modal", function () {
            stop_load(btnID);
        });
        $("#terminalpopup").on("shown.bs.modal", function () {
            
        });
        $("#terminalpopup").modal("show");
        break;
    case "discordbio":
        window.open("https://discord.bio/p/Nadie", "_blank");
        break;
    default:
        console.warn("Somehow you got here.. dont know how but uh ye");
        break;
    }
};

function start_load(btnID, timeout) {
    data[btnID] = {};
    data[btnID].backup = document.getElementById(btnID).innerHTML;
    document.getElementById(btnID).innerHTML = LOADINGBTNHTML;
    if (!timeout == false) {
        data[btnID].timeout = setTimeout(function () {
            stop_load(btnID);
        }, timeout);
    }
}

function stop_load(btnID) {
    document.getElementById(btnID).innerHTML = data[btnID].backup;
}

var updateDiscordinfo = once(function () {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var UserData = JSON.parse(xhttp.responseText);
            document.getElementById("duser").innerHTML = `${UserData["username"]}#${UserData["discriminator"]}`;
            document.getElementById("dID").innerHTML = `(${UserData["id"]})`;
            $(".avatar").css("background-image", "url(" + UserData["avatarurl"] + ")");
        }
    };
    xhttp.open("GET", "php/discord.php?data", true);
    xhttp.send();
});


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


updateDiscordinfo();