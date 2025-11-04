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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BedTimeEdit'>;

const timeOptions = [7, 8, 9, 10, 11, 12];

export default function BedTimeEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [utno, setUtno] = useState<number | null>(null); 


  useEffect(() => {
    loadBedTime();
  }, []);


  const loadBedTime = async () => {
    try {
      // TODO: 실제 API 호출로 대체



      setSelectedTime(9);
      setUtno(1); 
    } catch (error) {
      console.error('취침 복약 시간 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleTimeSelect = (hour: number) => {
    setSelectedTime(hour);
  };


  const isSubmitButtonActive = selectedTime !== null && utno !== null;


  const handleSubmit = async () => {
    if (!isSubmitButtonActive) return;

    try {
      //  AsyncStorage나 Context에서 토큰 가져오기

      const token = ''; // 실제 토큰으로 교체

      // PATCH /api/v1/users/me/medication-times/{utno}

      const API_BASE_URL = 'http://localhost:8080'; // 실제 API 서버 URL로 교체
      

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me/medication-times/${utno}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          type: 'bedtime',
          time: selectedTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '복약 시간 수정 실패');
      }

      const data = await response.json();
      console.log('복약 시간 수정 성공:', data);
      

      navigation.navigate('Home');
    } catch (error) {
      console.error('복약 시간 수정 실패:', error);
      // 에러 처리 (알림 표시 등)

      navigation.navigate('Home');
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

        {/* 수정 완료 버튼 */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitButtonActive ? styles.submitButtonActive : styles.submitButtonInactive,
          ]}
          onPress={handleSubmit}
          disabled={!isSubmitButtonActive}
        >
          <Text style={styles.submitButtonText}>수정 완료</Text>
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

