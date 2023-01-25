const webpack = require('webpack');

module.exports = function override(config, env) {
    console.log('override')
    let loaders = config.resolve
    loaders.fallback = {
        "fs": false,
        "tls": false,
        "net": false,
        "http": require.resolve("stream-http"),
        "https": false,
        "zlib": require.resolve("browserify-zlib"),
        "path": require.resolve("path-browserify"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util/"),
        "crypto": require.resolve("crypto-browserify"),
        "buffer": require.resolve("buffer"),
    }
    config.plugins.push(new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }))
    config.plugins.push(new webpack.ProvidePlugin({
        process: 'process/browser',
    }))
    return config
}