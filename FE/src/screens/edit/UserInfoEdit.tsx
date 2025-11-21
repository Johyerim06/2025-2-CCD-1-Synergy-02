import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useWindowDimensions,
  Modal,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Rect } from 'react-native-svg';

interface UserInfoEditProps {
  onComplete?: () => void;
}

export default function UserInfoEdit({ onComplete }: UserInfoEditProps) {
  // 초기 데이터 - API에서 받아온 사용자 정보로 설정
  const [name, setName] = useState('홍길동');
  const [phone, setPhone] = useState('010-1234-5678');
  const [birthdate, setBirthdate] = useState('1960-01-01');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(1960);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;

  // 연도 목록 생성 (현재 년도부터 100년 전까지)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // 월 목록 (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 선택된 년/월에 따른 일 수 계산
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) },
    (_, i) => i + 1
  );

  const handleSubmit = () => {
    console.log('수정 완료 버튼 클릭');
    console.log({ name, phone, birthdate });
    onComplete?.();
  };

  const handleDatePickerPress = () => {
    setShowDatePicker(true);
  };

  const handleCloseDatePicker = () => {
    setShowDatePicker(false);
  };

  const handleConfirmDate = () => {
    const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    setBirthdate(formattedDate);
    setShowDatePicker(false);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    const maxDay = getDaysInMonth(year, selectedMonth);
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    const maxDay = getDaysInMonth(selectedYear, month);
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>기본 정보 수정</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>

          {/* Name Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.headingContainer}>
              <Text style={styles.headingText}>성함을 입력해주세요.</Text>
            </View>
            <View style={styles.textInputFull}>
              <TextInput
                style={styles.inputText}
                placeholder="이름 입력"
                placeholderTextColor="#99a1af"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Birthdate Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.headingContainer}>
              <Text style={styles.headingText}>생년월일을 입력해주세요.</Text>
            </View>
            <View style={styles.birthdateInputContainer}>
              <TouchableOpacity
                style={styles.textInput}
                onPress={handleDatePickerPress}
                activeOpacity={0.7}
              >
                <TextInput
                  style={styles.inputText}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#99a1af"
                  value={birthdate}
                  onChangeText={setBirthdate}
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.calendarButton}
                onPress={handleDatePickerPress}
                activeOpacity={0.8}
              >
                <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="6" width="18" height="15" rx="2" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
                  <Path d="M3 10H21" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M7 3V6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M17 3V6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M8 14H8.01" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M12 14H12.01" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M16 14H16.01" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M8 18H8.01" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M12 18H12.01" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone Number Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.headingContainer}>
              <Text style={styles.headingText}>전화번호를 입력해주세요.</Text>
            </View>
            <View style={styles.textInputFull}>
              <TextInput
                style={styles.inputText}
                placeholder="010-0000-0000"
                placeholderTextColor="#99a1af"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button - 항상 활성화 */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, styles.submitButtonActive, { maxWidth: MAX_WIDTH }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>수정 완료</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          transparent={true}
          visible={showDatePicker}
          animationType="slide"
          onRequestClose={handleCloseDatePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>날짜 선택</Text>
                <TouchableOpacity onPress={handleCloseDatePicker}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.pickerContainer}>
                {/* Year Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>년</Text>
                  <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                    {years.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.pickerItem,
                          selectedYear === year && styles.pickerItemSelected,
                        ]}
                        onPress={() => handleYearSelect(year)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedYear === year && styles.pickerItemTextSelected,
                          ]}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Month Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>월</Text>
                  <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                    {months.map((month) => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.pickerItem,
                          selectedMonth === month && styles.pickerItemSelected,
                        ]}
                        onPress={() => handleMonthSelect(month)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedMonth === month && styles.pickerItemTextSelected,
                          ]}
                        >
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Day Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>일</Text>
                  <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                    {days.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.pickerItem,
                          selectedDay === day && styles.pickerItemSelected,
                        ]}
                        onPress={() => handleDaySelect(day)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedDay === day && styles.pickerItemTextSelected,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmDate}>
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  headerTitle: {
    fontWeight: '700' as any,
    fontSize: 27,
    color: '#1A1A1A',
    lineHeight: 32.4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 100,
    alignItems: 'center' as any,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  inputSection: {
    width: '100%',
    marginBottom: 24,
  },
  headingContainer: {
    width: '100%',
    height: 30,
    marginBottom: 6,
  },
  headingText: {
    fontSize: 24,
    fontWeight: '700' as any,
    color: '#1e2939',
    lineHeight: 28.8,
    textAlign: 'left',
  },
  textInputFull: {
    width: '100%',
    height: 70,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  textInput: {
    flex: 1,
    height: 70,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  inputText: {
    fontSize: 24,
    fontWeight: '700' as any,
    color: '#99a1af',
    lineHeight: 28.8,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  birthdateInputContainer: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    gap: 12,
  },
  calendarButton: {
    width: 70,
    height: 70,
    backgroundColor: '#60584d',
    borderRadius: 14,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonContainer: {
    position: 'absolute' as any,
    left: 16,
    right: 16,
    bottom: 36,
    alignItems: 'center' as any,
  },
  submitButton: {
    width: '100%',
    height: 66,
    borderRadius: 200,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  submitButtonActive: {
    backgroundColor: '#60584d',
  },
  submitButtonText: {
    fontSize: 27,
    fontWeight: '700' as any,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    alignItems: 'center' as any,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as any,
    color: '#1e2939',
  },
  closeButton: {
    fontSize: 28,
    color: '#6a7282',
  },
  pickerContainer: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center' as any,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600' as any,
    color: '#1e2939',
    marginBottom: 10,
  },
  picker: {
    height: 200,
    width: '100%',
  },
  pickerItem: {
    paddingVertical: 10,
    alignItems: 'center' as any,
  },
  pickerItemSelected: {
    backgroundColor: '#FFCC02',
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 18,
    color: '#6a7282',
  },
  pickerItemTextSelected: {
    color: '#1e2939',
    fontWeight: '700' as any,
  },
  confirmButton: {
    backgroundColor: '#60584d',
    borderRadius: 200,
    height: 56,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  confirmButtonText: {
    fontSize: 20,
    fontWeight: '700' as any,
    color: '#FFFFFF',
  },
});

