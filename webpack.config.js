const { mode } = require("webpack-nano/argv");
const parts = require("./webpack.parts");
const { merge } = require("webpack-merge");

const cssLoaders = [parts.tailwind()];
const common = merge(
    parts.common,
    parts.extractCSS({ loaders: cssLoaders }),
    parts.loadJavaScript(),
);
const getConfig = (mode) => {
    switch (mode) {
        case 'development':
            return merge(
                parts.generateSourceMaps({ type: 'eval-source-map' }),
                common,
                { watch: true },
                { mode }
            );
        case 'production':
            return merge(
                parts.generateSourceMaps({ type: 'source-map' }),
                common,
                { watch: false },
                { mode },
                // {
                //     optimization: {
                //         minimize: false,
                //     },
                // },
            );

        default:
            throw new Error('error');
    }
}
module.exports = getConfig(mode);