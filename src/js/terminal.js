/* eslint-env jquery */

import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { Unicode11Addon } from "xterm-addon-unicode11";

import "xterm/css/xterm.css";

const term = new Terminal({
    fontFamily: "\"Cascadia Code\", Menlo, monospace",
    theme: { foreground: "#eff0eb", background: "#282a36", selection: "#97979b33", black: "#282a36", brightBlack: "#686868", red: "#ff5c57", brightRed: "#ff5c57", green: "#5af78e", brightGreen: "#5af78e", yellow: "#f3f99d", brightYellow: "#f3f99d", blue: "#57c7ff", brightBlue: "#57c7ff", magenta: "#ff6ac1", brightMagenta: "#ff6ac1", cyan: "#9aedfe", brightCyan: "#9aedfe", white: "#f1f1f0", brightWhite: "#eff0eb" },
    cursorBlink: true
});
const fitAddon = new FitAddon();
const unicode11Addon = new Unicode11Addon();

term.loadAddon(fitAddon);
term.loadAddon(unicode11Addon);
term.unicode.activeVersion = "11";

$("#terminalpopup").on("hidden.bs.modal", function () {
    term.dispose();
    term.reset();
    document.getElementById("terminaldiv").innerHTML = "";
});

$("#terminalpopup").on("shown.bs.modal", function () {
    term.open(document.getElementById("terminaldiv"));
    fitAddon.fit();
});

// TODO: implment libv86 to exist with webpack...... https://github.com/copy/v86/issues/373