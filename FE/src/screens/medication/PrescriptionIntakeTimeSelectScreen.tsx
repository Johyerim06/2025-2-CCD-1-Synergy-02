import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp as RNRouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Router';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrescriptionIntakeTimeSelect'>;
type PrescriptionIntakeTimeSelectRouteProp = RNRouteProp<RootStackParamList, 'PrescriptionIntakeTimeSelect'>;

type TimePeriod = 'breakfast' | 'lunch' | 'dinner' | 'bedtime';

interface TimeOption {
  id: TimePeriod;
  label: string;
  icon: any;
}

const timeOptions: TimeOption[] = [
  { id: 'breakfast', label: '아침', icon: require('../../../assets/images/PrescriptionIntakeTimeSelectScreen/아침.png') },
  { id: 'lunch', label: '점심', icon: require('../../../assets/images/PrescriptionIntakeTimeSelectScreen/점심.png') },
  { id: 'dinner', label: '저녁', icon: require('../../../assets/images/PrescriptionIntakeTimeSelectScreen/저녁.png') },
  { id: 'bedtime', label: '취침 전', icon: require('../../../assets/images/PrescriptionIntakeTimeSelectScreen/취침전.png') },
];

export default function PrescriptionIntakeTimeSelectScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PrescriptionIntakeTimeSelectRouteProp>();
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod | null>('breakfast');
  
  const source = route.params?.source || 'prescription';

  const isStartButtonActive = selectedTimePeriod !== null;

  const handleTimePeriodSelect = (period: TimePeriod) => {
    setSelectedTimePeriod(period);
  };

  const handleStart = () => {
    if (isStartButtonActive) {
      // 선택된 시간대를 API로 전송
      // PUT /api/v1/users/me/medications/{umno}/combination
      // 또는 POST /api/v1/users/me/medications/{umno}/times
      
      console.log('선택된 복용 시간대:', selectedTimePeriod);

      navigation.navigate('PrescriptionAnalysisResult', { source });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerText}>복약 시간대 설정</Text>
      </View>

      <View style={styles.content}>
        {/* 시간대 버튼 목록 */}
        <View style={styles.timeButtonsContainer}>
          {timeOptions.map((option) => {
            const isSelected = selectedTimePeriod === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.timeButton,
                  isSelected ? styles.timeButtonSelected : styles.timeButtonUnselected,
                ]}
                onPress={() => handleTimePeriodSelect(option.id)}
              >
                {/* 아이콘 영역 */}
                <View style={styles.iconContainer}>
                  <Image 
                    source={option.icon}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                </View>
                
                <Text
                  style={[
                    styles.timeButtonText,
                    isSelected ? styles.timeButtonTextSelected : styles.timeButtonTextUnselected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 시작하기 버튼 */}
        <TouchableOpacity
          style={[
            styles.startButton,
            isStartButtonActive ? styles.startButtonActive : styles.startButtonInactive,
          ]}
          onPress={handleStart}
          disabled={!isStartButtonActive}
        >
          <Text style={styles.startButtonText}>시작하기</Text>
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
  timeButtonsContainer: {
    marginBottom: 40,
  },
  timeButton: {
    width: 320,
    height: 110,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    alignSelf: 'center',
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
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 32,
    height: 32,
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
  startButton: {
    width: 320,
    height: 66,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  startButtonActive: {
    backgroundColor: '#60584d',
  },
  startButtonInactive: {
    backgroundColor: '#c4bcb1',
  },
  startButtonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
    color: '#ffffff',
  },
});

