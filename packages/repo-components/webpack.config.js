const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const LessPluginFunctions = require('less-plugin-functions');
const hasha = require('hasha');
const autoprefixer = require('autoprefixer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackBar = require('webpackbar');
const package = require('./package.json');
const ESLintPlugin = require('eslint-webpack-plugin');

const distOutputPath = './dist';

const getLocalIdent = ({ resourcePath }, localIdentName, localName) => {
  if (/\.global\.(css|less)$/.test(resourcePath) || /node_modules/.test(resourcePath)) {
    // 不做cssModule 处理的
    return localName;
  }
  return `${localName}__${hasha(resourcePath + localName, { algorithm: 'md5' }).slice(0, 8)}`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = (cliEnv = {}, argv) => {
  const mode = argv.mode;

  if (!['production', 'development'].includes(mode)) {
    throw new Error('The mode is required for NODE_ENV, BABEL_ENV but was not specified.');
  }

  const isProd = mode === 'production';

  const classNamesConfig = {
    loader: '@ecomfe/class-names-loader',
    options: {
      classNamesModule: require.resolve('classnames'),
    },
  };
  // 生产环境使用 MiniCssExtractPlugin
  const extractOrStyleLoaderConfig = MiniCssExtractPlugin.loader;

  const lessLoaderConfig = {
    loader: 'less-loader',
    options: {
      lessOptions: {
        javascriptEnabled: true,
        modifyVars: {
          'ant-prefix': 'ant',
        },
        plugins: [new LessPluginFunctions({ alwaysOverride: true })],
      },
    },
  };

  const cssLoaderConfig = {
    loader: 'css-loader',
    options: {
      modules: { getLocalIdent },
      importLoaders: 1,
    },
  };

  const postcssLoaderConfig = {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [autoprefixer],
      },
    },
  };
  return {
    entry: './src/index.tsx',
    mode: isProd ? 'production' : 'development',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, distOutputPath),
      library: {
        type: 'commonjs2',
      },
    },
    devtool: (() => {
      return isProd ? 'source-map' : 'eval-source-map';
    })(),
    externals: [
      function ({ request }, callback) {
        const dependencies = Object.keys(package.dependencies);
        const peerDependencies = Object.keys(package.peerDependencies);
        if (dependencies.includes(request) || peerDependencies.includes(request)) {
          return callback(null, 'commonjs2 ' + request);
        }
        callback();
      },
    ],
    externalsType: 'commonjs2',
    resolve: {
      extensions: ['.js', '.css', '.jsx', '.tsx', '.ts'],
      alias: {
        '@': path.resolve(__dirname, 'src/'),
      },
    },
    plugins: [
      new ESLintPlugin(),
      new WebpackBar(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[name].chunk.css',
      }),
      new CleanWebpackPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css/,
          use: [classNamesConfig, extractOrStyleLoaderConfig, 'css-loader', postcssLoaderConfig],
        },
        {
          test: /\.less$/,
          use: [
            classNamesConfig,
            extractOrStyleLoaderConfig,
            cssLoaderConfig,
            postcssLoaderConfig,
            lessLoaderConfig,
          ],
        },
        // 静态资源
        {
          test: /\.(png|jpg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'resource/[hash][ext][query]',
          },
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },
      ],
    },
  };
};
