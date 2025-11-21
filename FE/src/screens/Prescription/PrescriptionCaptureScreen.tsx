import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

interface PrescriptionCaptureScreenProps {
  mode?: 'prescription' | 'envelope';
  onCapture?: () => void; // 촬영 즉시 Processing으로 이동
  showRetakeMessage?: boolean; // 실패 시 다시 돌아왔을 때 메시지 표시
}

export default function PrescriptionCaptureScreen({ mode = 'prescription', onCapture, showRetakeMessage: initialShowRetake = false }: PrescriptionCaptureScreenProps) {
  const [showRetakeMessage, setShowRetakeMessage] = useState(initialShowRetake);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    // 권한 요청
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // 재촬영 메시지가 전달되면 3초간 표시
  useEffect(() => {
    if (initialShowRetake) {
      setShowRetakeMessage(true);
      const timer = setTimeout(() => {
        setShowRetakeMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [initialShowRetake]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    
    try {
      // 카메라로 사진 촬영
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });
      
      console.log('촬영된 사진:', photo.uri);
      
      // 촬영 즉시 Processing 화면으로 이동
      // Processing 화면에서 API 호출 및 결과 처리
      onCapture?.();
      
      // TODO: 실제 구현 시
      // 1. 촬영 즉시 Processing 화면으로 이동
      // 2. Processing 화면에서 API 호출
      // 3. 성공 시 IntakeTimeSelect로 이동
      // 4. 실패 시 다시 Capture로 복귀 + showRetakeMessage=true
      
    } catch (error) {
      console.error('촬영 오류:', error);
      setShowRetakeMessage(true);
      setTimeout(() => {
        setShowRetakeMessage(false);
      }, 3000);
    }
  };

  // 권한이 없는 경우
  if (!permission) {
    return <View style={styles.container}><Text style={styles.permissionText}>카메라 권한 확인 중...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>카메라 권한이 필요합니다</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* 카메라 뷰 */}
      <CameraView 
        style={styles.camera} 
        facing="back"
        ref={cameraRef}
      />
      
      {/* 오버레이 레이어 */}
      <View style={styles.overlay}>
        {/* 상단 안내 텍스트 */}
        <View style={styles.guideTextContainer}>
          <Text style={styles.guideText}>
            {mode === 'envelope' ? '약봉투를 틀 안에 맞춰주세요' : '처방전을 틀 안에 맞춰주세요'}
          </Text>
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
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600' as any,
    color: '#ffffff',
  },
  guideTextContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  guideText: {
    
    fontSize: 16,
    fontWeight: '700' as '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  guideFrame: {
    width: 360,
    height: 560,
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
    top: '50%',
    left: '50%',
    transform: [{ translateX: -130 }, { translateY: -69 }],
    width: 260,
    height: 138,
    backgroundColor: '#d9d9d9',
    borderRadius: 20,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  retakeMessageText: {
    fontSize: 27,
    fontWeight: '700' as '700',
    color: '#000000',
    textAlign: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
});

