var path = require('path');
var webpack = require('webpack');


module.exports = {
	context: __dirname,
	entry: [
		'./src/index',
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'Naja.js'
	},
	module: {
		loaders: [
			{test: /\.js$/, exclude: /node_modules/, loader: 'babel'}
		]
	},
	plugins: [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				unused: true,
				dead_code: true,
				warnings: false
			},
			sourceMap: false,
			comments: /$./
		}),
		new webpack.BannerPlugin('Naja.ja\nv0.1.0-dev\n\nby Jiří Pudil <https://jiripudil.cz>')
	]
};
