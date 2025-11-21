import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';

interface OnboardingAlarmGuideProps {
  onComplete?: () => void;
}

export default function OnboardingAlarmGuide({ onComplete }: OnboardingAlarmGuideProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;

  useEffect(() => {
    // 3초 후 자동으로 다음 화면으로 이동
    const timer = setTimeout(() => {
      console.log('3초 후 OnboardingMorningTimeSet으로 이동');
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={[styles.card, { maxWidth: MAX_WIDTH }]}>
          <Image 
            source={require('../../../assets/images/PillImage2.png')}
            style={styles.logo}
            contentFit="contain"
            cachePolicy="disk"
            priority="high"
          />
          <Text style={styles.title}>알림 희망 시간을{'\n'}입력해주세요.</Text>
          <Text style={styles.subtitle}>
            건강한 약 복용을 위해{'\n'}원하는 시간에 알림을 드릴게요.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffcc02',
  },
  container: {
    flex: 1,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    paddingHorizontal: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    width: 300,
    height: 320,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 105,
    height: 105,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as any,
    color: '#60584d',
    textAlign: 'center' as any,
    lineHeight: 34.75,
    marginBottom: 23,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600' as any,
    color: '#b5a288',
    textAlign: 'center' as any,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});

