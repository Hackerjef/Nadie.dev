const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MergeIntoSingleFilePlugin = require("webpack-merge-and-include-globally");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const miniCssExtractPlugin = require("mini-css-extract-plugin");

const Promise = require("Promise");
var commandExists = require("command-exists");
const { spawn } = require("child_process");

// eslint-disable-next-line no-useless-escape
var php_regex_url = "\\((.*):\\/\\/(.*):(.*)\\)";
var php_regex =  new RegExp(php_regex_url);

var cfg = {
    devtool: "source-map",
    devServer: {
        compress: true,
        port: 9000,
        setupExitSignals: true,
        hot: true,
        devMiddleware: {
            writeToDisk: true
        },
        proxy: {}
    },
    mode: "none",
    entry: {
        main: path.resolve(__dirname, "./src/js/sites/main.js"),
        streambackground: path.resolve(__dirname, "./src/js/sites/streambackground.js"),
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].[hash].js",
        clean: true
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MergeIntoSingleFilePlugin({ 
            files: { "jquery.min.js": [ "node_modules/jquery/dist/jquery.min.js"]}
        }),
        new miniCssExtractPlugin({
            filename: "[name].[hash].css",
        }),
        new CopyPlugin({
            // Php copy is in a diffrent section for gen script to work
            patterns: [
                { from: "src/robots.txt", to: "robots.txt", force: true },
            ]
        }),
        new HtmlWebpackPlugin({
            inject: "body",
            template: "./src/html/index.html",
            chunks: ["main"],
            filename: "index.html"
        }), 
        new HtmlWebpackPlugin({
            inject: "body",
            template: "./src/html/streambackground.html",
            chunks: ["streambackground"],
            filename: "streambackground.html"
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        compact: true,
                        presets: [
                            ["@babel/preset-env", { targets: "defaults" }]
                        ]
                    }
                }
            },
            {
                test: /\.(sass|scss|css)$/,
                use: [miniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            },
            {
                test: /\.(svg|eot|woff|woff2|ttf)$/,
                use: ["file-loader"]
            }
        ]
    },
};


var ran_already = false;
module.exports = new Promise((resolve) => {
    if (process.argv.includes("serve")) {
        commandExists("php").then(function () {
            const php_server = spawn("php", ["-S", "127.0.0.1:0", "-t", "src"]);
            php_server.stdout.on("data", (data) => {
                // This never gets called?
                console.log(`php stdout: ${data}`);
            });
            
            //Aparently php server stderr's its full logger????? bruh
            php_server.stderr.on("data", (data) => {
                console.log(`${data}`);
                if (!ran_already) {
                    if (php_regex.test(`${data}`)) {
                        var groups = [...`${data}`.matchAll(php_regex_url)][0];
                        cfg["devServer"]["proxy"]["/php"] = { target: `${groups[1]}://${groups[2]}:${groups[3]}`, changeOrigin: true, secure: false };
                        ran_already = true;
                        resolve(cfg);
                    }
                }
            });
              
            php_server.on("close", (code) => {
                console.log(`php server died with code: ${code}`);
            });
        }).catch(function () {
            console.log("php not installed, not running webpack dev server with php dev server :)");
            //because its not running with build, copy php folder
            cfg["plugins"].push(new CopyPlugin({ patterns: [{ from: "src/php", to: "php/" }]}));
            resolve(cfg);
        });
    } else {
        console.log("webpack dev server not supposed to be starting, not starting php dev server if installed");
        // adding config to copy so we can still copy it on build :)
        cfg["plugins"].push(new CopyPlugin({ patterns: [{ from: "src/php", to: "php/" }]}));
        resolve(cfg);
    }
});