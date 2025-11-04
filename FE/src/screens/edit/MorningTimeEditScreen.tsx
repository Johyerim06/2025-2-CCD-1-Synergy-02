import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Router';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MorningTimeEdit'>;

const timeOptions = [6, 7, 8, 9, 10, 11];

export default function MorningTimeEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMorningTime();
  }, []);

  // 기존 아침 복약 시간 불러오기
  const loadMorningTime = async () => {
    try {
      // API 호출로 대체
      // GET /api/v1/users/me/medication-times?type=breakfast


      // 예시 데이터 (7시)
      setSelectedTime(7);
    } catch (error) {
      console.error('아침 복약 시간 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSelect = (hour: number) => {
    setSelectedTime(hour);
  };

  const isNextButtonActive = selectedTime !== null;

  const handleNext = () => {
    if (isNextButtonActive) {
      // 선택된 아침 복약 시간을 저장하거나 전달
      navigation.navigate('LunchTimeEdit');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerText}>복약 시간 수정</Text>
      </View>

      <View style={styles.content}>
        {/* 제목 */}
        <Text style={styles.title}>아침 약 시간을 선택하세요.</Text>

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

        {/* 다음으로 버튼 */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'NotoSansKR',
    fontSize: 16,
    fontWeight: '400',
    color: '#6a7282',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  headerText: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontFamily: 'NotoSansKR',
    fontSize: 24,
    fontWeight: '700',
    color: '#1e2939',
    marginBottom: 30,
    lineHeight: 28.8,
    textAlign: 'center',
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 16,
  },
  timeButton: {
    width: '48%',
    maxWidth: 148,
    height: 128,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  timeButtonSelected: {
    backgroundColor: '#60584d',
  },
  timeButtonUnselected: {
    backgroundColor: '#ffcc02',
  },
  timeButtonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 57.6,
  },
  timeButtonTextSelected: {
    color: '#ffffff',
  },
  timeButtonTextUnselected: {
    color: '#545045',
  },
  nextButton: {
    width: 320,
    height: 66,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  nextButtonActive: {
    backgroundColor: '#60584d',
  },
  nextButtonInactive: {
    backgroundColor: '#c4bcb1',
  },
  nextButtonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
    color: '#ffffff',
  },
});

