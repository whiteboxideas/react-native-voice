const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const root = path.resolve(__dirname, '..');

// Watch the library source in the parent directory
config.watchFolders = [root];

// Packages that must be singletons (only one copy in the bundle).
// Without this, the library's dist/ would resolve its own react from
// the root node_modules — causing the "Invalid hook call" error.
const singletonPkgs = [
  'react',
  'react-native',
  'react-native-reanimated',
  'expo-av',
  'expo-haptics',
  'expo-speech',
  'expo-secure-store',
  'expo-constants',
  'expo-file-system',
];

const exampleModules = path.resolve(__dirname, 'node_modules');

// Pin singleton packages to the example's copies (fallback resolution)
const extraNodeModules = {
  '@app': path.resolve(__dirname, 'src'),
};
for (const pkg of singletonPkgs) {
  extraNodeModules[pkg] = path.resolve(exampleModules, pkg);
}
config.resolver.extraNodeModules = extraNodeModules;

// Block the root's copies of singleton packages so Metro never resolves
// them from <root>/node_modules — forces use of extraNodeModules above.
const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
config.resolver.blockList = [
  new RegExp(`${escaped}/node_modules/(${singletonPkgs.join('|')})/.*`),
];

// Resolve remaining modules from both locations
config.resolver.nodeModulesPaths = [
  exampleModules,
  path.resolve(root, 'node_modules'),
];

module.exports = config;
