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
              style={styles.optionButton}
              onPress={handleBasicInfo}
              activeOpacity={0.8}
            >
              <Text style={styles.optionButtonText}>기본 정보</Text>
            </TouchableOpacity>

            {/* 복약 시간 버튼 */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleMedicationTime}
              activeOpacity={0.8}
            >
              <Text style={styles.optionButtonText}>복약 시간</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 나가기 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, { maxWidth: MAX_WIDTH }]}
          onPress={handleExit}
        >
          <Text style={styles.submitButtonText}>나가기</Text>
        </TouchableOpacity>
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
    width: 172,
    height: 172,
    backgroundColor: '#FFCC02',
    borderRadius: 16,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    paddingHorizontal: 16,
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
    left: 16,
    right: 16,
    bottom: 36,
    alignItems: 'center' as any,
  },
  submitButton: {
    width: '100%',
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
