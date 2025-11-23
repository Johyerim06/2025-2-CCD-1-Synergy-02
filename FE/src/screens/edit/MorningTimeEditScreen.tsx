import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import responsive from '../../utils/responsive';
import { getMedicationTime, updateMedicationTime, setMedicationTime } from '../../api/userApi';
import { getMedicationTimePresets } from '../../api/presetApi';

interface MorningTimeEditScreenProps {
  onNext?: () => void;
}

export default function MorningTimeEditScreen({ onNext }: MorningTimeEditScreenProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedTno, setSelectedTno] = useState<number | null>(null);
  const [utno, setUtno] = useState<number | null>(null);
  const [times, setTimes] = useState<Array<{ label: string; hour: number; tno: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = responsive(isTablet ? 420 : 360);
  const insets = useSafeAreaInsets();

  const TYPE = 'breakfast';

  // 기존 시간 조회 및 프리셋 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        
        // 1. 기존 시간 조회 (데이터가 없어도 에러 표시하지 않음)
        let currentHour: number | null = null;
        try {
          const currentTimeResponse = await getMedicationTime(TYPE);
          if (currentTimeResponse.header?.resultCode === 1000 && currentTimeResponse.body) {
            currentHour = currentTimeResponse.body.time;
            setUtno(currentTimeResponse.body.utno);
            setSelectedHour(currentHour);
            setSelectedTime(`${currentHour}시`);
          }
        } catch (error: any) {
          // 복약 시간 정보가 없으면 빈 상태로 유지 (에러 표시하지 않음)
          console.log('복약 시간 정보 없음:', error.response?.status === 404 ? '데이터 없음' : error.message);
        }

        // 2. 프리셋 조회
        const presetsResponse = await getMedicationTimePresets(TYPE);
        if (presetsResponse.header?.resultCode === 1000 && presetsResponse.body) {
          const timeOptions = presetsResponse.body.times.map((preset) => ({
            label: `${preset.time}시`,
            hour: preset.time,
            tno: preset.tno,
          }));
          setTimes(timeOptions);
          
          // 기존 시간이 있으면 해당하는 tno도 설정
          if (currentHour !== null) {
            const matchingPreset = presetsResponse.body.times.find((preset) => preset.time === currentHour);
            if (matchingPreset) {
              setSelectedTno(matchingPreset.tno);
            }
          }
        }
      } catch (error: any) {
        console.error('프리셋 로드 실패:', error);
        // 프리셋 로드 실패 시에만 에러 표시
        Alert.alert('오류', '복약 시간 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  const isButtonActive = selectedTime !== null && !isLoading;

  const handleTimeSelect = (time: string, hour: number, tno: number) => {
    setSelectedTime(time);
    setSelectedHour(hour);
    setSelectedTno(tno);
  };

  const handleSubmit = async () => {
    if (!isButtonActive || selectedHour === null || selectedTno === null) return;

    setIsLoading(true);
    try {
      let response;
      
      if (utno === null) {
        // 복약 시간 정보가 없으면 새로 생성
        console.log('복약 시간 새로 생성:', selectedTno);
        response = await setMedicationTime(selectedTno);
      } else {
        // 복약 시간 정보가 있으면 수정
        console.log('복약 시간 수정:', utno);
        response = await updateMedicationTime(utno, {
          type: TYPE,
          time: selectedHour,
        });
      }
      
      if (response.header?.resultCode === 1000) {
        console.log('복약 시간 저장 성공:', response);
        // 저장 성공 후 응답에서 utno를 받아서 state 업데이트
        if (response.body?.utno) {
          setUtno(response.body.utno);
        }
        // 팝업 없이 바로 다음 화면으로 이동
        onNext?.();
      } else {
        throw new Error(response.header?.resultMsg || '복약 시간 저장에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('복약 시간 저장 실패:', error);
      Alert.alert(
        '저장 실패',
        error.response?.data?.header?.resultMsg || error.response?.data?.message || error.message || '복약 시간 저장 중 오류가 발생했습니다.'
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
          <Text style={styles.headerText}>복약 시간 수정</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + responsive(80) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>
          {/* Title */}
          <Text style={styles.title}>아침 약 시간을 선택하세요.</Text>

          {/* Time Buttons Grid */}
          {isLoadingData ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#60584d" />
              <Text style={styles.loadingText}>시간 정보 불러오는 중...</Text>
            </View>
          ) : (
            <View style={styles.timeButtonsContainer}>
              {times.map((timeOption) => {
                const isSelected = selectedTime === timeOption.label;
                return (
                  <TouchableOpacity
                    key={timeOption.hour}
                    style={[
                      styles.timeButton,
                      isSelected ? styles.timeButtonSelected : styles.timeButtonUnselected,
                    ]}
                    onPress={() => handleTimeSelect(timeOption.label, timeOption.hour, timeOption.tno)}
                    disabled={isLoading}
                  >
                    <Text 
                      style={[
                        styles.timeButtonText,
                        isSelected ? styles.timeButtonTextSelected : styles.timeButtonTextUnselected,
                      ]}
                    >
                      {timeOption.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={[styles.buttonContainer, { bottom: insets.bottom + responsive(16) }]}>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            isButtonActive ? styles.nextButtonActive : styles.nextButtonInactive,
          ]} 
          onPress={handleSubmit}
          disabled={!isButtonActive}
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
    paddingTop: responsive(24),
    alignItems: 'center' as any,
    flexGrow: 1,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: responsive(24),
    fontWeight: '700' as any,
    color: '#1e2939',
    marginBottom: responsive(24),
    textAlign: 'left',
  },
  timeButtonsContainer: {
    width: '100%',
    flexDirection: 'row' as any,
    flexWrap: 'wrap' as any,
    justifyContent: 'space-between' as any,
  },
  timeButton: {
    width: responsive(164),
    height: responsive(144),
    borderRadius: responsive(25),
    borderWidth: responsive(1),
    borderColor: '#ffcc02',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    marginBottom: responsive(24),
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
    fontSize: responsive(48),
    fontWeight: '700' as any,
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
  loadingContainer: {
    width: '100%',
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
    paddingVertical: responsive(40),
  },
  loadingText: {
    marginTop: responsive(12),
    fontSize: responsive(18),
    color: '#99a1af',
  },
});
