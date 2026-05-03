// module.exports = {
//   presets: ['module:@react-native/babel-preset'],
//   plugins: ['react-native-reanimated/plugin'],
// };

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: false, // set to true if you want a .env.example check
        allowUndefined: true,
      },
    ],
    'react-native-reanimated/plugin', // 🔥 must remain LAST
  ],
};
