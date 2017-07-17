var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config = require('./webpack.config.dev');
var port = 7711

config.entry.unshift("webpack-dev-server/client?http://localhost:"+port+"/");

var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath,
    historyApiFallback: {
	  index: '/'
	}
});

console.log('listening on localhost:' + port)

server.listen(port);