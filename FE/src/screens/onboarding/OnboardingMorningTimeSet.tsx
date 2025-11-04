import React, { useState } from 'react';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingMorningTimeSet'>;

const timeOptions = [6, 7, 8, 9, 10, 11];

export default function OnboardingMorningTimeSet() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const isNextButtonActive = selectedTime !== null;

  const handleTimeSelect = (hour: number) => {
    setSelectedTime(hour);
  };

  const handleNext = () => {
    if (isNextButtonActive) {
      console.log('선택된 아침 약 시간:', selectedTime);
      navigation.navigate('OnboardingLunchTimeSet');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerText}>복약 시간 설정</Text>
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
    textAlign: 'center',
    marginBottom: 30,
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  timeButton: {
    width: 148,
    height: 128,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginHorizontal: 12,
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

