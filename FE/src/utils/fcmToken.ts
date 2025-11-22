/**
 * FCM 토큰 관련 유틸리티
 * 
 * 주의: PlatformConstants 에러 방지를 위해 현재 비활성화됨
 * New Architecture 문제 해결 후 재활성화 필요
 * 
 * 문제 원인: expo-notifications가 내부적으로 expo-constants를 사용하는데,
 * New Architecture 환경에서 PlatformConstants를 찾을 수 없어 에러 발생
 */

/**
 * FCM 토큰을 가져오는 함수
 * @returns FCM 토큰 문자열 또는 null
 * 
 * 주의: PlatformConstants 에러 방지를 위해 현재 비활성화됨
 * New Architecture 문제 해결 후 재활성화 필요
 */
export const getFcmToken = async (): Promise<string | null> => {
  // PlatformConstants 에러 방지를 위해 일시적으로 비활성화
  console.warn('FCM 토큰 기능이 일시적으로 비활성화되었습니다. (PlatformConstants 에러 방지)');
  return null;
  
  /* 주석 처리된 원래 코드 - New Architecture 문제 해결 후 재활성화
  try {
    // 알림 핸들러 초기화 (런타임 준비 후)
    await initializeNotificationHandler();
    const NotificationsModule = await getNotifications();
    // 알림 권한 요청
    const { status: existingStatus } = await NotificationsModule.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 권한이 없으면 요청
    if (existingStatus !== 'granted') {
      const { status } = await NotificationsModule.requestPermissionsAsync();
      finalStatus = status;
    }

    // 권한이 거부된 경우
    if (finalStatus !== 'granted') {
      console.warn('알림 권한이 거부되었습니다.');
      return null;
    }

    // Android의 경우 채널 설정 필요
    if (Platform.OS === 'android') {
      await NotificationsModule.setNotificationChannelAsync('default', {
        name: 'default',
        importance: NotificationsModule.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // FCM 토큰 가져오기
    // Expo Go에서는 projectId 없이 호출하면 자동으로 감지함
    const tokenData = await NotificationsModule.getExpoPushTokenAsync();

    const token = tokenData.data;
    console.log('FCM 토큰 받기 성공:', token);
    return token;
  } catch (error) {
    console.error('FCM 토큰 받기 실패:', error);
    return null;
  }
  */
};

