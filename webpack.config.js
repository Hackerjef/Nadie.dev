const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MergeIntoSingleFilePlugin = require("webpack-merge-and-include-globally");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const miniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    devtool: "source-map",
    devServer: {
        compress: true,
        port: 9000,
        http2: true,
        setupExitSignals: true,
        hot: true
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
            patterns: [
                { from: "src/robots.txt", to: "robots.txt", force: true },
                { from: "src/php", to: "php/" },
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