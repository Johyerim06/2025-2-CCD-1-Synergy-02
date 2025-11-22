module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // New Architecture 비활성화
          unstable_transformProfile: 'default',
          // import.meta polyfill (Hermes용)
          unstable_transformImportMeta: true,
        },
      ],
    ],
  };
};

