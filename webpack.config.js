var path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['.js'],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /(node_modules|build)/,
            }
        ]
    }
};



// /*** webpack.config.js ***/
// const path = require('path');

// module.exports = {
//     entry: path.join(__dirname, "src/index.js"),
//     output: {
//         path: path.join(__dirname, "/build"),
//         filename: "index.js"
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.js$/,
//                 use: "babel-loader",
//                 exclude: /node_modules/
//             }
//         ]
//     },
//     resolve: {
//         extensions: [".js"]
//     },
//     devServer: {
//         port: 3001
//     }
// };