var path = require('path');
var webpack = require('webpack');


module.exports = {
	entry: [
		'./src/index',
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'Naja.js'
	},
	module: {
		rules: [
			{test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
		]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				unused: true,
				dead_code: true,
				warnings: false
			},
			comments: /$./
		}),
		new webpack.BannerPlugin({banner: 'Naja.ja\nv0.2.0\n\nby Jiří Pudil <https://jiripudil.cz>'})
	]
};
