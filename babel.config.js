module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // 'expo-router/babel' is deprecated in SDK 50; removed to avoid warnings
    plugins: [],
  };
};
