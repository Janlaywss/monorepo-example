/** @type {import('next').NextConfig} */
const hasha = require('hasha');
const path = require('path');

const nextConfig = {
  cssModules: {
    getLocalIdent: ({ resourcePath }, localIdentName, localName) => {
      if (/\.global\.(css|less)$/.test(resourcePath) || /node_modules/.test(resourcePath)) {
        return localName;
      }
      return `${localName}__${hasha(resourcePath + localName, { algorithm: 'md5' }).slice(0, 8)}`;
    }
  },
  webpack(config) {
    config.resolve.alias.react = path.resolve(__dirname, './node_modules/react');
    config.resolve.alias['react-dom'] = path.resolve(__dirname, './node_modules/react-dom');
    config.module.rules.push(
        {
          test: /\.svg$/,
          issuer: /\.(js|ts)x|less|css?$/,
          use: ['@svgr/webpack']
        },
        {
          test: /\.(eot|woff|woff2|ttf|png|jpg|gif)$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 100000,
              name: '[name].[ext]'
            }
          }
        },
    );
    return config;
  }
}

module.exports = nextConfig
