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
import { Calendar, LocaleConfig } from 'react-native-calendars';

// 한글 로케일 설정
LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'kr';

interface RecordData {
  id: string;
  title: string;
  dateRange: string;
}

interface IntakeProgressRecordScreenProps {
  recordData?: RecordData;
  onExit?: () => void;
  onDetailRecord?: () => void;
}

const IntakeProgressRecordScreen = React.memo(({ recordData, onExit, onDetailRecord }: IntakeProgressRecordScreenProps) => {
  const [isInteractionComplete, setIsInteractionComplete] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;

  // 복용 기록 데이터 (날짜별 상태)
  const markedDates = {
    // 10월 데이터 - 흰색 원 제거, 3가지 색상만 사용
    '2025-10-02': { selected: true, selectedColor: '#A0DB87' }, // 모두 복용
    '2025-10-03': { selected: true, selectedColor: '#DD7C7C' }, // 미복용
    '2025-10-14': { selected: true, selectedColor: '#A0DB87' }, // 모두 복용
    '2025-10-15': { selected: true, selectedColor: '#FFEA4C' }, // 일부 복용
    '2025-10-16': { selected: true, selectedColor: '#DD7C7C' }, // 미복용
    '2025-10-17': { selected: true, selectedColor: '#A0DB87' }, // 모두 복용
    '2025-10-18': { selected: true, selectedColor: '#A0DB87' }, // 모두 복용
    '2025-10-20': { selected: true, selectedColor: '#FFEA4C' }, // 일부 복용
    '2025-10-22': { selected: true, selectedColor: '#DD7C7C' }, // 미복용
    '2025-10-25': { selected: true, selectedColor: '#A0DB87' }, // 모두 복용
    
    // 11월 데이터
    '2025-11-01': { selected: true, selectedColor: '#A0DB87' }, // 모두 복용
    '2025-11-02': { selected: true, selectedColor: '#FFEA4C' }, // 일부 복용
    '2025-11-03': { selected: true, selectedColor: '#A0DB87' }, // 모두 복용
    '2025-11-04': { selected: true, selectedColor: '#DD7C7C' }, // 미복용
    '2025-11-05': { selected: true, selectedColor: '#A0DB87' }, // 모두 복용
  };

  // 화면 전환 애니메이션 이후에 실행
  useEffect(() => {
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      setIsInteractionComplete(true);
      console.log('IntakeProgressRecordScreen: Interactions complete');
    });

    return () => interactionPromise.cancel();
  }, []);

  const handleDetailRecord = useCallback(() => {
    console.log('상세 기록 버튼 클릭');
    onDetailRecord?.();
  }, [onDetailRecord]);

  const handleExit = useCallback(() => {
    console.log('나가기 버튼 클릭');
    onExit?.();
  }, [onExit]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* 상단 헤더 - IntakeRecordListScreen과 동일 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>복약 진행 기록</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>
          {/* 약 정보 섹션 */}
          <View style={styles.medicineInfoSection}>
            {/* 상단 행: 약 태그와 상세 기록 버튼 */}
            <View style={styles.topRow}>
              {/* 약 태그 */}
              <View style={styles.medicineTag}>
                <Text style={styles.medicineTagText}>{recordData?.title.split('(')[1]?.replace(')', '') || '복통약'}</Text>
              </View>
              
              {/* 상세 기록 버튼 */}
              <TouchableOpacity style={styles.detailButton} onPress={handleDetailRecord}>
                <Text style={styles.detailButtonText}>상세 기록</Text>
              </TouchableOpacity>
            </View>

            {/* 병원 정보 */}
            <Text style={styles.hospitalInfo}>{recordData?.title.split('(')[0] || '가람병원'} - 1일 3회</Text>
            
            {/* 날짜 정보 */}
            <Text style={styles.dateText}>{recordData?.dateRange || '2025년 10월 14일 - 2025년 10월 25일'}</Text>
          </View>

          {/* 복용 상태 범례 */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendCircle, styles.legendAll]} />
              <Text style={styles.legendText}>모두 복용</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendCircle, styles.legendPartial]} />
              <Text style={styles.legendText}>일부 복용</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendCircle, styles.legendNone]} />
              <Text style={styles.legendText}>미복용</Text>
            </View>
          </View>

          {/* 캘린더 컨테이너 */}
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeaderSection}>
              <View>
                <Text style={styles.calendarTitle}>복용 캘린더</Text>
                <Text style={styles.calendarMonth}>10월</Text>
              </View>
            </View>

            {/* 실제 캘린더 */}
            <Calendar
              current={'2025-10-04'}
              markedDates={markedDates}
              monthFormat={'M월'}
              hideExtraDays={true}
              disableMonthChange={false}
              firstDay={0}
              hideDayNames={false}
              onPressArrowLeft={subtractMonth => subtractMonth()}
              onPressArrowRight={addMonth => addMonth()}
              disableArrowLeft={false}
              disableArrowRight={false}
              enableSwipeMonths={true}
              theme={{
                backgroundColor: '#EAEAEA',
                calendarBackground: '#EAEAEA',
                textSectionTitleColor: '#000000',
                selectedDayBackgroundColor: '#A0DB87',
                selectedDayTextColor: '#000000',
                todayTextColor: '#0088FF',
                dayTextColor: '#000000',
                textDisabledColor: '#D9D9D9',
                dotColor: '#00adf5',
                selectedDotColor: '#ffffff',
                arrowColor: '#000000',
                monthTextColor: '#364153',
                indicatorColor: 'blue',
                textDayFontFamily: 'SF Pro',
                textMonthFontFamily: 'Noto Sans KR',
                textDayHeaderFontFamily: 'SF Pro',
                textDayFontWeight: '400',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 24,
                textDayHeaderFontSize: 14,
              }}
              style={styles.calendar}
            />
          </View>
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
    paddingTop: 13,
    paddingBottom: 100,
    alignItems: 'center' as any,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  medicineInfoSection: {
    width: '100%',
    marginBottom: 15,
  },
  topRow: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    alignItems: 'center' as any,
    marginBottom: 8,
  },
  medicineTag: {
    backgroundColor: '#FFF4C9',
    borderWidth: 1,
    borderColor: '#545045',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  medicineTagText: {
    fontWeight: '700' as '700',
    fontSize: 24,
    color: '#545045',
    lineHeight: 28.8,
  },
  hospitalInfo: {
    fontWeight: '700' as '700',
    fontSize: 32,
    color: '#666666',
    lineHeight: 38.4,
    marginBottom: 4,
  },
  dateText: {
    fontWeight: '400' as '400',
    fontSize: 14,
    color: '#6A7282',
    lineHeight: 16.8,
  },
  detailButton: {
    backgroundColor: '#FFCC02',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  detailButtonText: {
    fontWeight: '700' as '700',
    fontSize: 17,
    color: '#60584D',
    lineHeight: 20.4,
  },
  legendContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    marginBottom: 15,
  },
  legendItem: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    gap: 8,
  },
  legendCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  legendAll: {
    backgroundColor: '#A0DB87',
  },
  legendPartial: {
    backgroundColor: '#FFEA4C',
  },
  legendNone: {
    backgroundColor: '#DD7C7C',
  },
  legendText: {
    fontWeight: '700' as '700',
    fontSize: 17,
    color: '#000000',
    lineHeight: 20.4,
  },
  calendarContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
  },
  calendarHeaderSection: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    alignItems: 'center' as any,
    marginBottom: 10,
  },
  calendarTitle: {
    fontWeight: '700' as '700',
    fontSize: 20,
    color: '#364153',
    lineHeight: 24,
    marginBottom: 8,
  },
  calendarMonth: {
    fontWeight: '700' as '700',
    fontSize: 24,
    color: '#364153',
    lineHeight: 28.8,
  },
  calendar: {
    backgroundColor: '#EAEAEA',
    borderRadius: 18,
    paddingVertical: 10,
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

export default IntakeProgressRecordScreen;

