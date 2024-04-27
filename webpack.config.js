const path = require('path');
module.exports = {
    entry: './src/index.ts',
    mode: "production",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bgio-websocket-lobby.js',
        libraryTarget: "commonjs2",
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    }
};