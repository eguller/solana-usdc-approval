module.exports = function override(config, env) {
  // Disable source maps to avoid validation issues
  config.devtool = false;

  // Disable minification entirely to avoid terser-webpack-plugin ajv validation issues
  if (config.optimization) {
    config.optimization.minimize = false;
    config.optimization.minimizer = [];
  }

  return config;
};
