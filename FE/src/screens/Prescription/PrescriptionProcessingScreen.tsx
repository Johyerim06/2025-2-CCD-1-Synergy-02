import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import responsive from '../../utils/responsive';
import { uploadMedication } from '../../api/medicationApi';
import { RootStackParamList } from '../../navigation/Router';

type PrescriptionProcessingScreenRouteProp = RouteProp<RootStackParamList, 'PrescriptionProcessing'>;
type PrescriptionProcessingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrescriptionProcessing'>;

interface PrescriptionProcessingScreenProps {
  onSuccess?: (umno?: number) => void; // OCR 성공 시 (umno 전달)
  onFailure?: () => void; // OCR 실패 시
  mode?: 'prescription' | 'envelope'; // 촬영 모드
  imageUri?: string; // 촬영된 이미지 URI
}

export default function PrescriptionProcessingScreen({ 
  onSuccess, 
  onFailure, 
  mode: propMode,
  imageUri: propImageUri
}: PrescriptionProcessingScreenProps) {
  // 네비게이션 사용 시도 (NavigationContainer 안에 있을 때만 사용 가능)
  // App.tsx에서 직접 사용되는 경우를 대비해 안전하게 처리
  let navigation: PrescriptionProcessingScreenNavigationProp | null = null;
  let route: PrescriptionProcessingScreenRouteProp | null = null;
  
  // useNavigation과 useRoute는 Hook이므로 항상 호출해야 하지만, NavigationContainer 밖에서는 에러 발생 가능
  try {
    navigation = useNavigation<PrescriptionProcessingScreenNavigationProp>();
    route = useRoute<PrescriptionProcessingScreenRouteProp>();
  } catch (error: any) {
    // NavigationContainer 밖에서 렌더링되는 경우 (예: App.tsx에서 직접 사용)
    // 이 경우 onSuccess/onFailure 콜백을 통해 화면 전환 처리
    navigation = null;
    route = null;
  }
  
  // route.params에서 imageUri와 mode를 가져오거나 props를 사용
  const imageUri = route?.params?.imageUri || propImageUri;
  const mode = route?.params?.mode || propMode || 'prescription';
  
  useEffect(() => {
    // OCR API 호출
    const processOCR = async () => {
      if (!imageUri) {
        // 실패 시 Capture 화면으로 돌아가기
        if (onFailure) {
          onFailure();
        } else if (navigation) {
          navigation.goBack();
        }
        return;
      }

      try {
        // 백엔드 모드: "1" (처방전), "2" (약봉투)
        const backendMode = mode === 'prescription' ? '1' : '2';
        
        const response = await uploadMedication(backendMode as '1' | '2', imageUri);
        
        if (response.header?.resultCode === 1000) {
          // 응답에서 umno 추출
          const umno = response.body?.umno;
          
          if (umno) {
            // umno가 있으면 분석 결과 화면으로 이동
            if (navigation) {
              // NavigationContainer 안에 있을 때는 네비게이션 사용
              const source = mode === 'envelope' ? 'medicationEnvelope' : 'prescription';
              navigation.navigate('PrescriptionAnalysisResult', {
                umno: umno,
                source: source,
              });
            } else {
              // App.tsx에서 사용되는 경우 콜백에 umno 전달
              onSuccess?.(umno);
            }
          } else {
            // umno가 없으면 콜백 호출
            onSuccess?.();
          }
        } else {
          const errorMsg = response.header?.resultMsg || '처방전 분석에 실패했습니다.';
          throw new Error(errorMsg);
        }
      } catch (error: any) {
        console.error('OCR 처리 오류:', error);
        
        Alert.alert(
          '분석 실패',
          error.response?.data?.header?.resultMsg || error.response?.data?.message || error.message || '처방전 분석 중 오류가 발생했습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                // 실패 시 Capture 화면으로 돌아가기
                if (onFailure) {
                  onFailure();
                } else if (navigation) {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      }
    };

    processOCR();
  }, [onSuccess, onFailure, mode, imageUri]);

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
    width: responsive(68),
    height: responsive(68),
    marginBottom: responsive(12),
  },
  loadingText: {
    
    fontSize: responsive(24),
    fontWeight: '700' as '700',
    color: '#101828',
    lineHeight: responsive(28.8),
  },
});

