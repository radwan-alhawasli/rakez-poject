const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    performance: process.env.NODE_ENV === 'production'
      ? {
          // Keep warnings enabled but with realistic thresholds.
          // Large PDFs and background assets are expected in this app.
          hints: 'warning',
          maxAssetSize: 1500000,
          maxEntrypointSize: 1500000
        }
      : false
  }
});
