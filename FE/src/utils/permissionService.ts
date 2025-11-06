// 권한 관리 서비스
import * as Notifications from 'expo-notifications';
import { Camera } from 'expo-camera';
import { Platform, Alert, Linking } from 'react-native';

// 알림 권한 상태 타입
export interface NotificationPermissionStatus {
  status: Notifications.PermissionStatus;
  canAskAgain: boolean;
}

// 카메라 권한 상태 타입
export interface CameraPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * 알림 권한 요청
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  try {
    const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      if (!canAskAgain) {
        // 권한이 거부되었고 다시 요청할 수 없는 경우
        Alert.alert(
          '알림 권한 필요',
          '알림을 받으려면 설정에서 알림 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            { 
              text: '설정 열기', 
              onPress: () => Linking.openSettings() 
            },
          ]
        );
      }
    }
    
    return { status, canAskAgain };
  } catch (error) {
    console.error('알림 권한 요청 실패:', error);
    throw error;
  }
}

/**
 * 알림 권한 상태 확인
 */
export async function checkNotificationPermission(): Promise<NotificationPermissionStatus> {
  try {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    return { status, canAskAgain };
  } catch (error) {
    console.error('알림 권한 확인 실패:', error);
    throw error;
  }
}

/**
 * 카메라 권한 요청
 */
export async function requestCameraPermission(): Promise<CameraPermissionStatus> {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        '카메라 권한 필요',
        '카메라를 사용하려면 설정에서 카메라 권한을 허용해주세요.',
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '설정 열기', 
            onPress: () => Linking.openSettings() 
          },
        ]
      );
    }
    
    return {
      granted: status === 'granted',
      canAskAgain: status === 'undetermined',
    };
  } catch (error) {
    console.error('카메라 권한 요청 실패:', error);
    throw error;
  }
}

/**
 * 카메라 권한 상태 확인
 */
export async function checkCameraPermission(): Promise<CameraPermissionStatus> {
  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain: status === 'undetermined',
    };
  } catch (error) {
    console.error('카메라 권한 확인 실패:', error);
    throw error;
  }
}

/**
 * 모든 필수 권한 요청 (앱 시작 시)
 */
export async function requestAllPermissions(): Promise<{
  notification: NotificationPermissionStatus;
  camera: CameraPermissionStatus;
}> {
  try {
    const [notification, camera] = await Promise.all([
      requestNotificationPermission(),
      requestCameraPermission(),
    ]);
    
    return {
      notification,
      camera,
    };
  } catch (error) {
    console.error('권한 요청 실패:', error);
    throw error;
  }
}

/**
 * 모든 필수 권한 상태 확인
 */
export async function checkAllPermissions(): Promise<{
  notification: NotificationPermissionStatus;
  camera: CameraPermissionStatus;
}> {
  try {
    const [notification, camera] = await Promise.all([
      checkNotificationPermission(),
      checkCameraPermission(),
    ]);
    
    return {
      notification,
      camera,
    };
  } catch (error) {
    console.error('권한 확인 실패:', error);
    throw error;
  }
}

/**
 * Android Full Screen Intent 권한 확인 (Android 11+)
 */
export async function checkFullScreenIntentPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true; // iOS는 항상 true
  }
  
  try {
    // Android 11 (API 30) 이상에서만 필요
    if (Platform.Version >= 30) {
      const { status } = await Notifications.getPermissionsAsync();
      // Full Screen Intent는 알림 권한과 함께 관리됨
      return status === 'granted';
    }
    
    return true; // Android 10 이하는 항상 허용
  } catch (error) {
    console.error('Full Screen Intent 권한 확인 실패:', error);
    return false;
  }
}

