import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Router';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MedicationEnvelopeProcessing'>;

export default function MedicationEnvelopeProcessingScreen() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // 실제 API 호출로 대체
    // 약봉투 정보를 읽어오는 API 호출

    
    // 시3초 후 다음 화면으로 이동
    const timer = setTimeout(() => {
      // 약봉투 복용 시간 선택 화면으로 이동 (약봉투 source 전달)
      navigation.navigate('PrescriptionIntakeTimeSelect', { source: 'medicationEnvelope' });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 로딩 컨테이너 */}
      <View style={styles.loadingContainer}>
        {/* 로딩 인디케이터 (아이콘) */}
        <ActivityIndicator 
          size="large" 
          color="#101828" 
          style={styles.loader}
        />
        
        {/* 로딩 텍스트 */}
        <Text style={styles.loadingText}>약봉투를 분석 중입니다</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    width: 68,
    height: 68,
    marginBottom: 12,
  },
  loadingText: {
    fontFamily: 'NotoSansKR',
    fontSize: 24,
    fontWeight: '700',
    color: '#101828',
    lineHeight: 28.8,
  },
});

