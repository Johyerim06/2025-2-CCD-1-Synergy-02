// Bridgeless mode 비활성화를 위한 환경 변수 설정 (가장 먼저 실행)
if (typeof global !== 'undefined') {
  // New Architecture 비활성화
  global.__turboModuleProxy = null;
  // TurboModule interop 활성화
  if (!global.nativeModuleProxy) {
    global.nativeModuleProxy = global;
  }
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);


