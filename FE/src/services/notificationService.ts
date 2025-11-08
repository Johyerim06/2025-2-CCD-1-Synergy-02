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
        console.warn('알림 권한이 거부되었습니다.');
        return null;
      }
    }

    // Expo Push Token 받아오기
    // projectId를 생략하면 자동으로 감지됩니다
    const tokenData = await Notifications.getExpoPushTokenAsync();
    
    return tokenData.data;
  } catch (error) {
    console.error('FCM 토큰 받아오기 실패:', error);
    return null;
  }
}

/**
 * 알림 채널 생성 (Android)
 */
export async function createNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: '기본 알림',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFCC02',
    });
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
      onNotificationReceived?.(notification);
    }
  );

  // 알림 클릭 시 (백그라운드/포그라운드 모두)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
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
  data: { [key: string]: any },
  seconds: number = 1
): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });

  return identifier;
}
