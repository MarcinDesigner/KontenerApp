const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Zmniejsz liczbę monitorowanych plików
config.watchFolders = ['.'];
config.resolver.nodeModulesPaths = ['./node_modules'];

// Optymalizacje dla Metro Bundler
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Dodatkowe opcje cache
config.cacheStores = [];

module.exports = config;