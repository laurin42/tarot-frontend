const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname, {
    // Enable CSS support
    isCSSEnabled: true,
});

const { transformer, resolver } = config;

// SVG-Transformer konfigurieren
config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
    minifierConfig: {
        compress: {
            drop_console: true,
        },
    },
};

// Resolver für SVG und Module konfigurieren
config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
    enableGlobalPackages: true,
    extraNodeModules: {
        '@': path.resolve(__dirname),
        'global': path.resolve(__dirname, 'node_modules/global'),
    },
};

// Optimierungen für die neue React Native Version
config.maxWorkers = 4;
config.resetCache = true;

module.exports = withNativeWind(config, { input: './global.css' });