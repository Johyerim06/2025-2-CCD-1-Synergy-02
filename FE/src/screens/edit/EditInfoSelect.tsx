import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

interface EditInfoSelectProps {
  onBasicInfo?: () => void;
  onMedicationTime?: () => void;
  onExit?: () => void;
}

export default function EditInfoSelect({ onBasicInfo, onMedicationTime, onExit }: EditInfoSelectProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;

  const handleBasicInfo = () => {
    console.log('기본 정보 수정');
    onBasicInfo?.();
  };

  const handleMedicationTime = () => {
    console.log('복약 시간 수정');
    onMedicationTime?.();
  };

  const handleExit = () => {
    console.log('나가기');
    onExit?.();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerText}>내 정보 수정</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>
          {/* 제목 */}
          <Text style={styles.title}>수정할 항목을 선택하세요</Text>

          {/* 버튼 그리드 */}
          <View style={styles.buttonGrid}>
            {/* 기본 정보 버튼 */}
            <TouchableOpacity
              onPress={handleBasicInfo}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFCC02', '#FFCC02']}
                style={styles.optionButton}
              >
                <Text style={styles.optionButtonText}>기본 정보</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 복약 시간 버튼 */}
            <TouchableOpacity
              onPress={handleMedicationTime}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFCC02', '#FFCC02']}
                style={styles.optionButton}
              >
                <Text style={styles.optionButtonText}>복약 시간</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 나가기 버튼 */}
      <View style={styles.buttonContainer}>
        <View style={[styles.buttonWrapper, { maxWidth: MAX_WIDTH }]}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleExit}
          >
            <Text style={styles.submitButtonText}>나가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    width: '100%',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    fontWeight: '700' as any,
    fontSize: 27,
    color: '#1A1A1A',
    lineHeight: 32.4,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 27,
    fontWeight: '700' as any,
    color: '#000000',
    lineHeight: 32.4,
    marginBottom: 24,
  },
  buttonGrid: {
    width: '100%',
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
  },
  optionButton: {
    width: 148,
    height: 148,
    borderRadius: 16,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  optionButtonText: {
    fontSize: 27,
    fontWeight: '700' as any,
    color: '#5A5347',
    lineHeight: 32.4,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute' as any,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 36,
    alignItems: 'center' as any,
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center' as any,
  },
  submitButton: {
    width: 320,
    height: 66,
    backgroundColor: '#60584d',
    borderRadius: 200,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  submitButtonText: {
    fontSize: 27,
    fontWeight: '700' as any,
    color: '#FFFFFF',
  },
});
