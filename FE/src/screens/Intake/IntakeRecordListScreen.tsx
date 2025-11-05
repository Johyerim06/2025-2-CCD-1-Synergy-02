import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  InteractionManager,
} from 'react-native';

interface RecordItem {
  id: string;
  title: string;
  dateRange: string;
}

interface IntakeRecordListScreenProps {
  onRecordPress?: (recordId: string) => void;
  onExit?: () => void;
}

const IntakeRecordListScreen = React.memo(({ onRecordPress, onExit }: IntakeRecordListScreenProps) => {
  const [isInteractionComplete, setIsInteractionComplete] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;

  // 샘플 데이터 (스크롤 테스트용으로 여러 개 추가)
  const records: RecordItem[] = [
    {
      id: '1',
      title: '가람병원(소화불량)',
      dateRange: '2025년 10월 14일 - 2025년 10월 25일',
    },
    {
      id: '2',
      title: '서울병원(두통)',
      dateRange: '2025년 10월 10일 - 2025년 10월 20일',
    },
    {
      id: '3',
      title: '강남병원(감기)',
      dateRange: '2025년 9월 14일 - 2025년 9월 25일',
    },
    {
      id: '4',
      title: '연세병원(고혈압)',
      dateRange: '2025년 9월 1일 - 2025년 9월 30일',
    },
    {
      id: '5',
      title: '삼성병원(당뇨)',
      dateRange: '2025년 8월 14일 - 2025년 8월 25일',
    },
    {
      id: '6',
      title: '서울대병원(알레르기)',
      dateRange: '2025년 8월 1일 - 2025년 8월 10일',
    },
    {
      id: '7',
      title: '가톨릭병원(복통)',
      dateRange: '2025년 7월 14일 - 2025년 7월 25일',
    },
    {
      id: '8',
      title: '세브란스병원(피부질환)',
      dateRange: '2025년 7월 1일 - 2025년 7월 15일',
    },
  ];

  // 화면 전환 애니메이션 이후에 실행
  useEffect(() => {
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      setIsInteractionComplete(true);
      console.log('IntakeRecordListScreen: Interactions complete');
    });

    return () => interactionPromise.cancel();
  }, []);

  const handleRecordPress = useCallback((recordId: string) => {
    console.log('기록 선택:', recordId);
    onRecordPress?.(recordId);
  }, [onRecordPress]);

  const handleExit = useCallback(() => {
    console.log('나가기 버튼 클릭');
    onExit?.();
  }, [onExit]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>복약 기록</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>
          {/* 기록 리스트 */}
          {records.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.recordCard}
              onPress={() => handleRecordPress(record.id)}
            >
              <View style={styles.recordContainer}>
                <View style={styles.recordTextContainer}>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  <Text style={styles.recordDate}>{record.dateRange}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.exitButtonContainer}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Text style={styles.exitButtonText}>나가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  headerTitle: {
    fontWeight: '700' as '700',
    fontSize: 27,
    color: '#1A1A1A',
    lineHeight: 32.4,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 100,
    alignItems: 'center' as any,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  recordCard: {
    width: '100%',
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    paddingHorizontal: 21,
    justifyContent: 'center' as any,
  },
  recordContainer: {
    width: '100%',
  },
  recordTextContainer: {
    width: '100%',
  },
  recordTitle: {
    fontWeight: '700' as '700',
    fontSize: 24,
    color: '#101828',
    lineHeight: 28.8,
    marginBottom: 4,
  },
  recordDate: {
    fontWeight: '400' as '400',
    fontSize: 14,
    color: '#6A7282',
    lineHeight: 16.8,
  },
  exitButtonContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 36,
    alignItems: 'center' as any,
  },
  exitButton: {
    width: '100%',
    maxWidth: 360,
    height: 66,
    backgroundColor: '#60584D',
    borderRadius: 200,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  exitButtonText: {
    fontWeight: '700' as '700',
    fontSize: 27,
    color: '#FFFFFF',
    lineHeight: 32.4,
  },
});

export default IntakeRecordListScreen;

