const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const isDevelopment = process.env.NODE_ENV === 'development';

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
    include: /images/,
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
    include: /fonts/,
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
          sourceMap: isDevelopment
        }
      },
      {
        loader: 'resolve-url-loader'
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: isDevelopment
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
          sourceMap: isDevelopment
        }
      }
    ]
  },

];
