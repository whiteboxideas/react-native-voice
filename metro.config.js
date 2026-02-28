const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  '@app': path.resolve(__dirname, 'src/config'),
  '@voice-ux': path.resolve(__dirname, 'src/voice-ux'),
};

module.exports = config;
