module.exports = function override(config, env) {
  // Enable source maps if GENERATE_SOURCEMAP is true
  if (process.env.GENERATE_SOURCEMAP === 'true') {
    config.devtool = 'source-map';
  } else {
    config.devtool = false;
  }

  // Disable minification entirely to avoid terser-webpack-plugin ajv validation issues
  if (config.optimization) {
    config.optimization.minimize = false;
    config.optimization.minimizer = [];
  }

  // Ignore source map warnings from node_modules
  config.ignoreWarnings = [
    {
      module: /node_modules/,
      message: /Failed to parse source map/,
    },
  ];

  return config;
};
