module.exports = {
    entry:  __dirname + "/src/preload.js",//已多次提及的唯一入口文件
    output: {
      path: __dirname + "/src",//打包后的文件存放的地方
      filename: "bundle.js"//打包后输出文件的文件名
    },
    externals: {
      "electron": "commonjs2 electron",
    }
}