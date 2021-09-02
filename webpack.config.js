const path = require('path');

module.exports = {
    entry: {
        'qrcode.js': './src/index.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist/'),
        filename: '[name]',
        libraryTarget: 'commonjs2',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            // '/SRC': path.resolve(__dirname, 'src/'),
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    optimization: {},
};
