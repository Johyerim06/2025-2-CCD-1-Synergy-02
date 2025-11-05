// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// react-native-svg-transformer 설치 전까지는 기본 설정 사용
// SVG를 직접 import해서 사용할 경우에만 아래 설정 필요:
// config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");
// const assetExts = config.resolver.assetExts.filter(ext => ext !== "svg");
// config.resolver.assetExts = assetExts;
// config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

module.exports = config;

