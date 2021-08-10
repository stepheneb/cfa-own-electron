const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const isDevelopment = process.env.NODE_ENV === 'development';

const path = require('path');

module.exports = [
  // Add support for native node modules
  {
    test: /\.node$/,
    use: 'node-loader',
  },
  // {
  //   test: /\.(png|jpg)$/,
  //   loader: 'url-loader'
  // },
  // {
  //   test: "/images/background.jpg",
  //   loader: 'url-loader'
  // },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@marshallofsound/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },

  {
    test: /\.(png|svg|jpe?g|gif)$/,
    include: path.resolve(__dirname, "images"),
    use: [{
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: 'images/',
        publicPath: 'images/'
      }
    }]
  },

  {
    test: /\.(woff|ttf)$/,
    include: path.resolve(__dirname, "fonts"),
    use: [{
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: 'fonts/',
        publicPath: 'fonts/'
      }
    }]
  },

  {
    test: /\.module\.s(a|c)ss$/,
    use: [
      isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          modules: true,
          sourceMap: true
        }
      },
      {
        loader: 'resolve-url-loader',
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          sassOptions: {
            linefeed: 'lf',
          },
        }
      }
    ]
  },

  {
    test: /\.s(a|c)ss$/,
    exclude: /\.module.(s(a|c)ss)$/,
    use: [
      isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader',
      {
        loader: 'resolve-url-loader'
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          sassOptions: {
            linefeed: 'lf',
          },
        }
      }
    ]
  },

  {
    test: /\.css$/i,
    use: ["style-loader", "css-loader"],
  },

  {
    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    include: path.resolve(__dirname, './node_modules/bootstrap-icons/font/fonts'),
    use: {
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: 'webfonts',
        publicPath: '../webfonts',
      },
    }
  }

];
