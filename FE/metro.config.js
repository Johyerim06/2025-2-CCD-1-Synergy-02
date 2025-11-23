// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

// Bridgeless mode 비활성화를 위한 환경 변수 설정
process.env.RCT_NEW_ARCH_ENABLED = '0';
process.env.ENABLE_TURBOMODULE_INTEROP = '1';

const config = getDefaultConfig(__dirname);

// Bridgeless mode 비활성화 설정
config.resolver.unstable_enablePackageExports = false;
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: false,
};

// react-native-svg-transformer 설치 전까지는 기본 설정 사용
// SVG를 직접 import해서 사용할 경우에만 아래 설정 필요:
// config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");
// const assetExts = config.resolver.assetExts.filter(ext => ext !== "svg");
// config.resolver.assetExts = assetExts;
// config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

module.exports = config;

