// 알림 서비스 - FCM 토큰 관리 및 푸시 알림 처리
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * FCM 토큰 받아오기
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    // 알림 권한 확인
    const { status } = await Notifications.getPermissionsAsync();
    
    if (status !== 'granted') {
      // 권한이 없으면 요청
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.warn('알림 권한이 허용되지 않았습니다.');
        return null;
      }
    }
    
    // FCM 토큰 받아오기
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // TODO: Expo 프로젝트 ID로 변경
    });
    
    return token.data;
  } catch (error) {
    console.error('FCM 토큰 받아오기 실패:', error);
    return null;
  }
}

/**
 * 알림 수신 리스너 설정
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) {
  // 포그라운드에서 알림 받을 때
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('알림 수신:', notification);
      onNotificationReceived?.(notification);
    }
  );
  
  // 알림 클릭 시 (백그라운드/포그라운드 모두)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('알림 클릭:', response);
      onNotificationResponse?.(response);
    }
  );
  
  // 정리 함수 반환
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * 로컬 알림 스케줄링 (선택사항)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
  } catch (error) {
    console.error('로컬 알림 스케줄링 실패:', error);
  }
}

/**
 * 모든 알림 취소
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * 알림 배지 수 설정
 */
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * 알림 채널 설정 (Android)
 */
export async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: '기본 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFCC02',
      sound: 'default',
      showBadge: true,
      enableVibrate: true,
      enableLights: true,
    });
    
    // Full Screen Intent를 위한 채널 (Android 11+)
    await Notifications.setNotificationChannelAsync('incoming-call', {
      name: '전화 수신',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFCC02',
      sound: 'default',
      showBadge: true,
      enableVibrate: true,
      enableLights: true,
    });
  }
}

