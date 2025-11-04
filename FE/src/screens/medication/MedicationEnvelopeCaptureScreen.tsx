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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MedicationEnvelopeCapture'>;

export default function MedicationEnvelopeCaptureScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [showRetakeMessage, setShowRetakeMessage] = useState(false);


  const handleCapture = async () => {
    // 실제 카메라로 촬영 구현
    // 이미지를 API로 업로드
    // POST /api/v1/medication-envelopes

    
    try {

      
      // 인식 실패 시뮬레이션
      const isRecognitionFailed = false; // API 응답에 따라 결정
      
      if (isRecognitionFailed) {
        // 인식 실패 시 "다시 촬영해주세요" 메시지 표시
        setShowRetakeMessage(true);
        
        // 3초 후 메시지 숨김
        setTimeout(() => {
          setShowRetakeMessage(false);
        }, 3000);
      } else {
        navigation.navigate('MedicationEnvelopeProcessing');
      }
    } catch (error) {
      setShowRetakeMessage(true);
      setTimeout(() => {
        setShowRetakeMessage(false);
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* 상단 안내 텍스트 */}
      <View style={styles.guideTextContainer}>
        <Text style={styles.guideText}>약봉투를 가이드 안에 맞춰주세요</Text>
      </View>

      {/* 가이드 프레임 */}
      <View style={styles.guideFrame}>
        {/* 가이드 모서리 표시 */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
        
        {/* 재촬영 메시지 (인식 실패 시 3초간 표시) */}
        {showRetakeMessage && (
          <View style={styles.retakeMessageContainer}>
            <Text style={styles.retakeMessageText}>다시 촬영해주세요</Text>
          </View>
        )}
      </View>

      {/* 촬영 버튼 */}
      <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
        {/* 촬영 버튼 원형 아이콘 */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101828',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  guideTextContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  guideText: {
    fontFamily: 'NotoSansKR',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
  },
  guideFrame: {
    width: 320,
    height: 500,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    position: 'relative',
    marginBottom: 40,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 10,
  },
  retakeMessageContainer: {
    position: 'absolute',
    top: 181, // (500 - 138) / 2 = 181
    left: 30, // (320 - 260) / 2 = 30
    width: 260,
    height: 138,
    backgroundColor: '#d9d9d9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeMessageText: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5dc',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

