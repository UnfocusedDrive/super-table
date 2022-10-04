/**
 * Webpack Common Config
 */
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$|\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(less)$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
          "less-loader"
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
};