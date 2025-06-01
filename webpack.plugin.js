/**
 * Custom webpack plugin to patch react-helmet-async
 */
class HelmetPatchPlugin {
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap('HelmetPatchPlugin', (factory) => {
      factory.hooks.afterResolve.tap('HelmetPatchPlugin', (result) => {
        // Check if this is the react-helmet-async module
        if (result.resource && result.resource.includes('react-helmet-async')) {
          // Add a loader to patch the module
          result.loaders.push({
            loader: require.resolve('./src/utils/helmetPatchLoader.js'),
            options: {},
          });
        }
        return result;
      });
    });
  }
}

module.exports = HelmetPatchPlugin;