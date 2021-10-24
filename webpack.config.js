const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MergeIntoSingleFilePlugin = require("webpack-merge-and-include-globally");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const miniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");


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
    optimization: {
        minimize: true,
        minimizer: [
            "...",
            new CssMinimizerPlugin(),
        ],
    },
    mode: "none",
    entry: {
        main: path.resolve(__dirname, "./src/js/sites/main.js"),
        streambackground: path.resolve(__dirname, "./src/js/sites/streambackground.js")
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].[fullhash].js",
        clean: true
    },
    plugins: [
        new CssMinimizerPlugin(),
        new CleanWebpackPlugin(),
        new MergeIntoSingleFilePlugin({ 
            files: { "jquery.min.js": [ "node_modules/jquery/dist/jquery.min.js"]}
        }),
        new miniCssExtractPlugin({
            filename: "[name].[fullhash].css",
        }),
        new CopyPlugin({
            // Php copy is in a diffrent section for gen script to work
            patterns: [
                { from: "src/robots.txt", to: "robots.txt", force: true },
                //Fuck my life i hate webpack + not doing shit right :)
                { from: "src/v86", to: "v86/" }
                // Php copy is in a diffrent section for gen script to work
                // { from: "src/php", to: "php/" }
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


            // Thanks! https://discourse.aurelia.io/t/problem-loading-css-from-html-or-js-module/3463/4
            { test: /\.(png|gif|jpg|cur)$/i, loader: "url-loader", options: { limit: 8192 } },
            { test: /\.(woff2)?$/i, loader: "url-loader", options: { limit: 10000, mimetype: "application/font-woff2" } },
            { test: /\.(woff)?$/i, loader: "url-loader", options: { limit: 10000, mimetype: "application/font-woff" } },
            { test: /\.(ttf|eot|svg|otf)?$/i, loader: "file-loader" },

        ]
    }
};


var phpcopy = new CopyPlugin({ patterns: [{ from: "src/php", to: "php/" }]});
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
            cfg["plugins"].push(phpcopy);
            resolve(cfg);
        });
    } else {
        console.log("webpack dev server not supposed to be starting, not starting php dev server if installed");
        // adding config to copy so we can still copy it on build :)
        cfg["plugins"].push(phpcopy);
        resolve(cfg);
    }
});