module.exports = (api) => {
	api.cache(true);

	return {
		presets: [
			'@babel/preset-env',
		],
		plugins: [
			'@babel/plugin-transform-runtime',
		],
	};
};
