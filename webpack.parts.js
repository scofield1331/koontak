const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const glob = require("glob");
const path = require("path");
const prefixSelector = require("postcss-prefix-selector");
const TerserPlugin = require("terser-webpack-plugin");

exports.common = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  entry: {
    // 'Bodi/shop/js/UpdatePopup': path.resolve(__dirname, './src/Bodi/Shop/index.js'),
    // 'Bodi/shop/Label/PromoTag': path.resolve(__dirname, './src/Bodi/Shop/Label/index.js'),
    // "Bodi/retail/js/shoporder": path.resolve(
    //   __dirname,
    //   "./src/Bodi/retail/index.js",
    // ),
    // 'setting/setting': path.resolve(__dirname, './src/setting/index.js'),
    // 'Accounting/expense': path.resolve(__dirname, './src/Accounting/expense/index.js'),
    "Bakery/index": path.resolve(__dirname, "./src/Bakery/index.js"),
    // "production/production": path.resolve(__dirname, "./src/production/index.js"),
    // "Recipes/recipe": path.resolve(__dirname, "./src/Recipes/index.js"),
    // "manager/purchase": path.resolve(__dirname, "./src/manager/index.js"),
  },
  output: {
    path: path.resolve(__dirname, ".."),
    filename: "[name].js",
    sourceMapFilename: "_dev/src/[name].[contenthash].js.map",
  },
  externals: {
    jquery: "$",
    Calculation: "Calculation",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: true,
          compress: {
            dead_code: true,
            unused: true,
          },
          format: {
            beautify: true,
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};

exports.loadCSS = {
  module: {
    rules: [{ test: /\.css$/, use: ["style-loader", "css-loader"] }],
  },
};
exports.extractCSS = ({ options = {}, loaders = [] } = {}) => {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            { loader: MiniCssExtractPlugin.loader, options },
            {
              loader: "css-loader",
              options: {
                sourceMap: false,
              },
            },
          ].concat(loaders),
          sideEffects: true,
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: (pathData) => {
          return pathData.chunk.name.replace("/js/", "/css/") + ".css";
        },
      }),
    ],
  };
};
const prefixMap = {
  ProductPopup: "#product-popup",
  SelectPopup: "#select-popup",
};
exports.tailwind = () => ({
  loader: "postcss-loader",
  options: {
    postcssOptions: (loaderContext) => {
      const file = loaderContext.resourcePath;
      const fileNameNoExt = path.basename(file, path.extname(file)); // "index"
      const match = Object.keys(prefixMap).find((key) => file.includes(key));
      const prefix = match ? prefixMap[match] : `#${fileNameNoExt}`;

      return {
        plugins: [
          ...(prefix ? [prefixSelector({ prefix, exclude: [prefix] })] : []),
        ],
      };
    },
  },
});

exports.loadJavaScript = () => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, "src"),
        use: "babel-loader",
      },
    ],
  },
});
exports.preact = () => ({
  presets: [
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
        importSource: "preact",
      },
    ],
  ],
});
exports.generateSourceMaps = ({ type }) => ({ devtool: type });
