const path = require('path')

module.exports = function (name) {
  const filename = name + '.js'
  return {
    entry: './src/' + filename,
    mode: 'development',
    target: 'node',
    externals: ['./config.json', 'aws-sdk'],
    output: {
      libraryTarget: 'commonjs2',
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist', name),
    },
  }
}
