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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingBedTimeSet'>;

const timeOptions = [7, 8, 9, 10, 11, 12];

export default function OnboardingBedTimeSet() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const isSubmitButtonActive = selectedTime !== null;

  const handleTimeSelect = (hour: number) => {
    setSelectedTime(hour);
  };

  const handleSubmit = () => {
    if (isSubmitButtonActive) {
      // 다음 화면으로 이동 (현재는 Home으로 설정)
      console.log('선택된 취침 시간:', selectedTime);
      navigation.navigate('Home');
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

        {/* 입력 완료 버튼 */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitButtonActive ? styles.submitButtonActive : styles.submitButtonInactive,
          ]}
          onPress={handleSubmit}
          disabled={!isSubmitButtonActive}
        >
          <Text style={styles.submitButtonText}>입력 완료</Text>
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
  submitButton: {
    width: 320,
    height: 66,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  submitButtonActive: {
    backgroundColor: '#60584d',
  },
  submitButtonInactive: {
    backgroundColor: '#c4bcb1',
  },
  submitButtonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
    color: '#ffffff',
  },
});

