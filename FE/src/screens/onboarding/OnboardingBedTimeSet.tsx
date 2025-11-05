import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const timeOptions = [19, 20, 21, 22, 23, 24];

interface OnboardingBedTimeSetProps {
  onComplete?: () => void;
}

export default function OnboardingBedTimeSet({ onComplete }: OnboardingBedTimeSetProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;

  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const isNextButtonActive = selectedTime !== null;

  const handleTimeSelect = (hour: number) => {
    setSelectedTime(hour);
  };

  const handleNext = () => {
    if (isNextButtonActive) {
      console.log('선택된 취침 시간:', selectedTime);
      onComplete?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerText}>복약 시간 설정</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>
          {/* 제목 */}
          <Text style={styles.title}>취침 시간을 선택하세요.</Text>

          {/* 시간 버튼 그리드 */}
          <View style={styles.timeButtonsContainer}>
            {timeOptions.map((hour) => {
              const isSelected = selectedTime === hour;
              return (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.timeButton,
                    isSelected ? styles.timeButtonSelected : styles.timeButtonUnselected,
                  ]}
                  onPress={() => handleTimeSelect(hour)}
                >
                  <Text
                    style={[
                      styles.timeButtonText,
                      isSelected ? styles.timeButtonTextSelected : styles.timeButtonTextUnselected,
                    ]}
                  >
                    {hour}시
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* 완료 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            isNextButtonActive ? styles.nextButtonActive : styles.nextButtonInactive,
          ]}
          onPress={handleNext}
          disabled={!isNextButtonActive}
        >
          <Text
            style={[
              styles.nextButtonText,
              isNextButtonActive ? styles.nextButtonTextActive : styles.nextButtonTextInactive,
            ]}
          >
            입력 완료
          </Text>
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
    height: 56, // Consistent header height
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    backgroundColor: '#FFFFFF', // Consistent header background
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA', // Consistent header border
  },
  headerText: {
    fontSize: 27,
    fontWeight: '700' as any, // Consistent font weight
    color: '#1A1A1A', // Consistent font color
    lineHeight: 32.4,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 48, // Adjusted to move content down by 24px
    paddingBottom: 100, // Consistent bottom padding for fixed button
    alignItems: 'center' as any,
    flexGrow: 1,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as any,
    color: '#1e2939',
    marginBottom: 24, // Adjusted from 32 to 24 for consistency
    textAlign: 'left', // Adjusted to left align
  },
  timeButtonsContainer: {
    width: '100%',
    flexDirection: 'row' as any,
    flexWrap: 'wrap' as any,
    justifyContent: 'space-between' as any,
  },
  timeButton: {
    width: 164, // Increased width
    height: 144, // Increased height
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ffcc02', // Unselected border color
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    marginBottom: 24, // Vertical spacing
  },
  timeButtonSelected: {
    backgroundColor: '#60584d', // Selected background color
    borderColor: '#60584d',
  },
  timeButtonUnselected: {
    backgroundColor: '#ffcc02', // Unselected background color
    borderColor: '#ffcc02',
  },
  timeButtonText: {
    fontSize: 48,
    fontWeight: '700' as any,
    lineHeight: 57.6,
  },
  timeButtonTextSelected: {
    color: '#ffffff', // Selected text color
  },
  timeButtonTextUnselected: {
    color: '#545045', // Unselected text color
  },
  buttonContainer: {
    position: 'absolute' as any,
    left: 16,
    right: 16,
    bottom: 36,
    alignItems: 'center' as any,
  },
  nextButton: {
    width: '100%',
    maxWidth: 360,
    height: 66,
    borderRadius: 200,
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
    fontSize: 27,
    fontWeight: '700' as any,
    lineHeight: 32.4,
  },
  nextButtonTextActive: {
    color: '#ffffff',
  },
  nextButtonTextInactive: {
    color: '#ffffff', // Figma shows white text even when inactive
  },
});
