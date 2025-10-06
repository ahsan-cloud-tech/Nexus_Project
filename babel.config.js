module.exports = {
  presets: ['module:@react-native/babel-preset'],
   plugins: [
    // ... other plugins you might have
    'react-native-reanimated/plugin', // This must be listed LAST
  ],
};
