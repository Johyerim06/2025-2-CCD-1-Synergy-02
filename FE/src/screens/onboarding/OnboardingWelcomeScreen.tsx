import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { scale } from '../../utils/scale';

interface OnboardingWelcomeScreenProps {
  onStartPress?: () => void;
}

export default function OnboardingWelcomeScreen({ onStartPress }: OnboardingWelcomeScreenProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = scale(isTablet ? 420 : 360);
  const insets = useSafeAreaInsets();

  const handleStartPress = () => {
    console.log('시작하기 버튼 클릭');
    onStartPress?.();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + scale(80) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>
          <Image 
            source={require('../../../assets/images/icon.png')}
            style={styles.logo}
            contentFit="contain"
            cachePolicy="disk"
            priority="high"
          />
          <Text style={styles.introText}>복약 자립{'\n'}복자와 함께</Text>
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={[styles.submitButtonContainer, { bottom: insets.bottom + scale(16) }]}>
        <TouchableOpacity style={styles.button} onPress={handleStartPress}>
          <Text style={styles.buttonText}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: scale(70),
    alignItems: 'center' as any,
    flexGrow: 1,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center' as any,
  },
  logo: {
    width: scale(232),
    height: scale(232),
    marginTop: scale(100),
  },
  introText: {
    fontSize: scale(24),
    fontWeight: '700' as '700',
    color: '#090a0a',
    textAlign: 'center',
    lineHeight: scale(28.8),
    marginTop: scale(24),
  },
  submitButtonContainer: {
    position: 'absolute' as any,
    left: scale(16),
    right: scale(16),
    alignItems: 'center' as any,
  },
  button: {
    width: '100%',
    maxWidth: scale(360),
    height: scale(66),
    borderRadius: scale(200),
    backgroundColor: '#60584d',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  buttonText: {
    fontSize: scale(27),
    fontWeight: '700' as '700',
    color: '#ffffff',
  },
});
