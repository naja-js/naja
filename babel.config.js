module.exports = (api) => {
	api.cache(true);

	return {
		presets: [
			'@babel/preset-env',
		],
		plugins: [
			'@babel/plugin-proposal-class-properties',
			'@babel/plugin-proposal-nullish-coalescing-operator',
			'@babel/plugin-proposal-optional-chaining',
			'@babel/plugin-transform-runtime',
		],
		env: {
			development: {
				plugins: [
					['babel-plugin-istanbul', {
						exclude: [
							"node_modules/**",
							"tests/**/*.js"
						],
					}],
				],
			},
		},
	};
};
