/* config-overrides.js */
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        url: require.resolve('url'),
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
    };
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser',
            // Buffer: ['buffer', 'Buffer'],
        }),
    );

    if (process.env.NODE_ENV === 'production') {
        config.plugins.push(
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true,
                },
            }),
        );
    }

    return config;
};