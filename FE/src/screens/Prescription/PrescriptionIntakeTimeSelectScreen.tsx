import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import responsive from '../../utils/responsive';
import { updateMedicationCombination } from '../../api/medicationApi';

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
  umno: number; // 복약 정보 ID
  onNext?: (timePeriods: TimePeriod[]) => void;
}

export default function PrescriptionIntakeTimeSelectScreen({ umno, onNext }: PrescriptionIntakeTimeSelectScreenProps) {
  const [selectedTimePeriods, setSelectedTimePeriods] = useState<TimePeriod[]>(['breakfast']);
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = responsive(isTablet ? 420 : 360);
  const insets = useSafeAreaInsets();

  const isNextButtonActive = selectedTimePeriods.length > 0 && !isLoading;

  const handleTimePeriodSelect = (period: TimePeriod) => {
    if (isLoading) return;
    // 이미 선택된 경우 제거, 선택되지 않은 경우 추가
    if (selectedTimePeriods.includes(period)) {
      setSelectedTimePeriods(selectedTimePeriods.filter(p => p !== period));
    } else {
      setSelectedTimePeriods([...selectedTimePeriods, period]);
    }
  };

  const handleNext = async () => {
    if (!isNextButtonActive) return;

    setIsLoading(true);
    try {
      // TimePeriod를 백엔드 형식으로 변환 (bedtime -> night)
      const combination = selectedTimePeriods
        .map((period) => (period === 'bedtime' ? 'night' : period))
        .join(',');

      const response = await updateMedicationCombination(umno, combination);
      if (response.header?.resultCode === 1000) {
        onNext?.(selectedTimePeriods);
      } else {
        throw new Error(response.header?.resultMsg || '복약 시간대 조합 수정에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('복약 시간대 조합 수정 실패:', error);
      Alert.alert(
        '수정 실패',
        error.response?.data?.header?.resultMsg || error.response?.data?.message || error.message || '복약 시간대 조합 수정 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>복약 시간대 설정</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + responsive(100) }]}
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
      <View style={[styles.buttonContainer, { bottom: insets.bottom + responsive(36) }]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            isNextButtonActive ? styles.nextButtonActive : styles.nextButtonInactive,
          ]}
          onPress={handleNext}
          disabled={!isNextButtonActive}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.nextButtonText}>다음으로</Text>
          )}
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
    borderBottomWidth: responsive(1),
    borderBottomColor: '#EAEAEA',
  },
  headerContent: {
    minHeight: responsive(56),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  headerText: {
    fontSize: responsive(27),
    fontWeight: '700' as any,
    color: '#1A1A1A',
    lineHeight: responsive(32.4),
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: responsive(16),
    paddingTop: responsive(48),
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
    height: responsive(110),
    borderRadius: responsive(24),
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    paddingHorizontal: responsive(20),
    marginBottom: responsive(16),
    position: 'relative' as any,
  },
  timeButtonSelected: {
    backgroundColor: '#60584d',
  },
  timeButtonUnselected: {
    backgroundColor: '#ffcc02',
  },
  iconContainer: {
    width: responsive(35),
    height: responsive(35),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  icon: {
    width: responsive(32),
    height: responsive(32),
  },
  textContainer: {
    flex: 1,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
    marginLeft: responsive(-47), // 아이콘 너비(35) + 여백(12) = 47, 음수로 설정하여 가운데 정렬
  },
  timeButtonText: {
    fontSize: responsive(48),
    fontWeight: '700' as '700',
    lineHeight: responsive(57.6),
  },
  timeButtonTextSelected: {
    color: '#ffffff',
  },
  timeButtonTextUnselected: {
    color: '#545045',
  },
  buttonContainer: {
    position: 'absolute' as any,
    left: responsive(16),
    right: responsive(16),
    alignItems: 'center' as any,
  },
  nextButton: {
    width: '100%',
    maxWidth: responsive(360),
    height: responsive(66),
    borderRadius: responsive(200),
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
    fontSize: responsive(27),
    fontWeight: '700' as any,
    color: '#ffffff',
    lineHeight: responsive(32.4),
  },
});
