import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

type TimePeriod = 'breakfast' | 'lunch' | 'dinner' | 'bedtime';

interface TimeOption {
  id: TimePeriod;
  label: string;
  icon: any;
}

const timeOptions: TimeOption[] = [
  { id: 'breakfast', label: '아침', icon: require('../../../assets/images/MorningIcon.png') },
  { id: 'lunch', label: '점심', icon: require('../../../assets/images/LunchIcon.png') },
  { id: 'dinner', label: '저녁', icon: require('../../../assets/images/EveningIcon.png') },
  { id: 'bedtime', label: '취침 전', icon: require('../../../assets/images/BedTimeIcon.png') },
];

interface PrescriptionIntakeTimeSelectScreenProps {
  onNext?: (timePeriods: TimePeriod[]) => void;
}

export default function PrescriptionIntakeTimeSelectScreen({ onNext }: PrescriptionIntakeTimeSelectScreenProps) {
  const [selectedTimePeriods, setSelectedTimePeriods] = useState<TimePeriod[]>(['breakfast']); // 배열로 변경 (중복 선택 가능)
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;

  const isNextButtonActive = selectedTimePeriods.length > 0;

  const handleTimePeriodSelect = (period: TimePeriod) => {
    // 이미 선택된 경우 제거, 선택되지 않은 경우 추가
    if (selectedTimePeriods.includes(period)) {
      setSelectedTimePeriods(selectedTimePeriods.filter(p => p !== period));
    } else {
      setSelectedTimePeriods([...selectedTimePeriods, period]);
    }
  };

  const handleNext = () => {
    if (isNextButtonActive) {
      // TODO: 선택된 시간대를 API로 전송
      // PUT /api/v1/users/me/medications/{umno}/combination
      // 또는 POST /api/v1/users/me/medications/{umno}/times
      
      console.log('선택된 복용 시간대:', selectedTimePeriods);
      onNext?.(selectedTimePeriods);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>복약 시간대 설정</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>
          {/* Time Period Buttons */}
          <View style={styles.timeButtonsContainer}>
            {timeOptions.map((option) => {
              const isSelected = selectedTimePeriods.includes(option.id); // 배열에 포함되어 있는지 체크
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.timeButton,
                    isSelected ? styles.timeButtonSelected : styles.timeButtonUnselected,
                  ]}
                  onPress={() => handleTimePeriodSelect(option.id)}
                >
                  {/* Icon - 왼쪽 고정 */}
                  <View style={styles.iconContainer}>
                    <Image 
                      source={option.icon}
                      style={styles.icon}
                      resizeMode="contain"
                    />
                  </View>
                  
                  {/* Text - 가운데 정렬 */}
                  <View style={styles.textContainer}>
                    <Text
                      style={[
                        styles.timeButtonText,
                        isSelected ? styles.timeButtonTextSelected : styles.timeButtonTextUnselected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            isNextButtonActive ? styles.nextButtonActive : styles.nextButtonInactive,
          ]}
          onPress={handleNext}
          disabled={!isNextButtonActive}
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
    height: 56,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  headerText: {
    fontSize: 27,
    fontWeight: '700' as any,
    color: '#1A1A1A',
    lineHeight: 32.4,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 100,
    alignItems: 'center' as any,
    flexGrow: 1,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  timeButtonsContainer: {
    width: '100%',
  },
  timeButton: {
    width: '100%',
    height: 110,
    borderRadius: 24,
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    paddingHorizontal: 20,
    marginBottom: 16,
    position: 'relative' as any,
  },
  timeButtonSelected: {
    backgroundColor: '#60584d',
  },
  timeButtonUnselected: {
    backgroundColor: '#ffcc02',
  },
  iconContainer: {
    width: 35,
    height: 35,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  icon: {
    width: 32,
    height: 32,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
    marginLeft: -47, // 아이콘 너비(35) + 여백(12) = 47, 음수로 설정하여 가운데 정렬
  },
  timeButtonText: {
    fontSize: 48,
    fontWeight: '700' as '700',
    lineHeight: 57.6,
  },
  timeButtonTextSelected: {
    color: '#ffffff',
  },
  timeButtonTextUnselected: {
    color: '#545045',
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
    color: '#ffffff',
    lineHeight: 32.4,
  },
});
