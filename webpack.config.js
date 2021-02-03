const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "./remote-object-api/index.js"),
  output: {
    filename: "remote-object-api.js",
    globalObject: "this",
    library: "remoteObjectAPI",
    libraryExport: "default",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "lib"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
