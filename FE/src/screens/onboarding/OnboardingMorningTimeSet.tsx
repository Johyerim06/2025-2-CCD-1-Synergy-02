import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { scale } from '../../utils/scale';

interface OnboardingMorningTimeSetProps {
  onNext?: () => void;
}

export default function OnboardingMorningTimeSet({ onNext }: OnboardingMorningTimeSetProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = scale(isTablet ? 420 : 360);
  const insets = useSafeAreaInsets();

  const times = ['6시', '7시', '8시', '9시', '10시', '11시'];

  const isButtonActive = selectedTime !== null;

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmit = () => {
    if (isButtonActive) {
      console.log('선택된 시간:', selectedTime);
      onNext?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>복약 시간 설정</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + scale(80) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>
          {/* Title */}
          <Text style={styles.title}>아침 약 시간을 선택하세요.</Text>

          {/* Time Buttons Grid */}
          <View style={styles.timeButtonsContainer}>
            {times.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    isSelected ? styles.timeButtonSelected : styles.timeButtonUnselected,
                  ]}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text 
                    style={[
                      styles.timeButtonText,
                      isSelected ? styles.timeButtonTextSelected : styles.timeButtonTextUnselected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={[styles.buttonContainer, { bottom: insets.bottom + scale(16) }]}>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            isButtonActive ? styles.nextButtonActive : styles.nextButtonInactive,
          ]} 
          onPress={handleSubmit}
          disabled={!isButtonActive}
        >
          <Text style={styles.nextButtonText}>다음으로</Text>
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
  header: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: scale(1),
    borderBottomColor: '#EAEAEA',
  },
  headerContent: {
    minHeight: scale(56),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  headerText: {
    fontSize: scale(27),
    fontWeight: '700' as any,
    color: '#1A1A1A',
    lineHeight: scale(32.4),
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: scale(24),
    alignItems: 'center' as any,
    flexGrow: 1,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: scale(24),
    fontWeight: '700' as any,
    color: '#1e2939',
    marginBottom: scale(24),
    textAlign: 'left',
  },
  timeButtonsContainer: {
    width: '100%',
    flexDirection: 'row' as any,
    flexWrap: 'wrap' as any,
    justifyContent: 'space-between' as any,
  },
  timeButton: {
    width: '48%', // 2열 그리드 유지 - scale 제거
    height: scale(144), // height는 scale 처리
    borderRadius: scale(25),
    borderWidth: scale(1),
    borderColor: '#ffcc02',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    marginBottom: scale(24),
  },
  timeButtonSelected: {
    backgroundColor: '#60584d',
    borderColor: '#60584d',
  },
  timeButtonUnselected: {
    backgroundColor: '#ffcc02',
    borderColor: '#ffcc02',
  },
  timeButtonText: {
    fontSize: scale(48),
    fontWeight: '700' as any,
    lineHeight: scale(57.6),
  },
  timeButtonTextSelected: {
    color: '#ffffff',
  },
  timeButtonTextUnselected: {
    color: '#545045',
  },
  buttonContainer: {
    position: 'absolute' as any,
    left: scale(16),
    right: scale(16),
    alignItems: 'center' as any,
  },
  nextButton: {
    width: '100%',
    maxWidth: scale(360),
    height: scale(66),
    borderRadius: scale(200),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  nextButtonActive: {
    backgroundColor: '#60584d',
  },
  nextButtonInactive: {
    backgroundColor: '#c4bcb1',
  },
  nextButtonText: {
    fontSize: scale(27),
    fontWeight: '700' as any,
    color: '#ffffff',
    lineHeight: scale(32.4),
  },
  nextButtonTextActive: {
    color: '#ffffff',
  },
  nextButtonTextInactive: {
    color: '#ffffff',
  },
});
