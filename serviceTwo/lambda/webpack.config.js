var path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/handler.js',
  target: 'node',
  externals: ['./config.json', 'aws-sdk'],
  output: {
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
}
