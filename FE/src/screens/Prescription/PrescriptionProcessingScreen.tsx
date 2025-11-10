import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface PrescriptionProcessingScreenProps {
  onSuccess?: () => void; // OCR 성공 시
  onFailure?: () => void; // OCR 실패 시
  mode?: 'prescription' | 'envelope'; // 촬영 모드
}

export default function PrescriptionProcessingScreen({ onSuccess, onFailure, mode = 'prescription' }: PrescriptionProcessingScreenProps) {
  useEffect(() => {
    // OCR API 호출 시뮬레이션
    const processOCR = async () => {
      try {
        // TODO: 실제 API 호출
        // const response = await fetch('POST /api/v1/medications', {
        //   method: 'POST',
        //   body: formData,
        // });
        
        // API 호출 시뮬레이션 (3초 대기)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // TODO: API 응답에 따라 성공/실패 결정
        const isSuccess = true; // 테스트용: true면 성공, false면 실패
        
        if (isSuccess) {
          console.log("OCR 분석 성공 - IntakeTimeSelect로 이동");
          onSuccess?.();
        } else {
          console.log("OCR 분석 실패 - Capture로 복귀");
          onFailure?.();
        }
      } catch (error) {
        console.error('OCR 처리 오류:', error);
        onFailure?.();
      }
    };

    processOCR();
  }, [onSuccess, onFailure]);

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
        <Text style={styles.loadingText}>
          {mode === 'envelope' ? '약봉투를 분석 중입니다' : '처방전을 분석 중입니다'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  loadingContainer: {
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
  },
  loader: {
    width: 68,
    height: 68,
    marginBottom: 12,
  },
  loadingText: {
    
    fontSize: 24,
    fontWeight: '700' as '700',
    color: '#101828',
    lineHeight: 28.8,
  },
});

