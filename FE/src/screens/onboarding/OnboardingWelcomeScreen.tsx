import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';

interface OnboardingWelcomeScreenProps {
  onStartPress?: () => void;
}

export default function OnboardingWelcomeScreen({ onStartPress }: OnboardingWelcomeScreenProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;

  const handleStartPress = () => {
    console.log('시작하기 버튼 클릭');
    onStartPress?.();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
      <View style={styles.submitButtonContainer}>
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
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 120,
    alignItems: 'center' as any,
    flexGrow: 1,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center' as any,
  },
  logo: {
    width: 232,
    height: 232,
    marginTop: 100,
  },
  introText: {
    fontSize: 24,
    fontWeight: '700' as '700',
    color: '#090a0a',
    textAlign: 'center',
    lineHeight: 28.8,
    marginTop: 24,
  },
  submitButtonContainer: {
    position: 'absolute' as any,
    left: 16,
    right: 16,
    bottom: 36,
    alignItems: 'center' as any,
  },
  button: {
    width: '100%',
    maxWidth: 360,
    height: 66,
    borderRadius: 200,
    backgroundColor: '#60584d',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  buttonText: {
    fontSize: 27,
    fontWeight: '700' as '700',
    color: '#ffffff',
  },
});
