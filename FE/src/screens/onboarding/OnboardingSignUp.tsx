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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Rect } from 'react-native-svg';
import { scale } from '../../utils/scale';

interface OnboardingSignUpProps {
  onSignUpComplete?: () => void;
}

export default function OnboardingSignUp({ onSignUpComplete }: OnboardingSignUpProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = scale(isTablet ? 420 : 360);
  const insets = useSafeAreaInsets();

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
    console.log('회원가입 버튼 클릭');
    console.log({ name, phone, birthdate });
    onSignUpComplete?.();
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

  // 세 가지 항목이 모두 입력되었는지 확인
  const isFormValid = name.trim() !== '' && birthdate.trim() !== '' && phone.trim() !== '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>기본 정보 입력</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + scale(80) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>

          {/* Name Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.headingContainer}>
              <Text style={styles.headingText}>성함을 입력해주세요.</Text>
            </View>
            <View style={styles.textInput}>
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
                <Svg width={scale(28)} height={scale(28)} viewBox="0 0 24 24" fill="none">
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

          {/* Phone Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.headingContainer}>
              <Text style={styles.headingText}>전화번호를 입력해주세요.</Text>
            </View>
            <View style={styles.textInput}>
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

      {/* Submit Button - 모든 항목 입력 시 활성화 */}
      <View style={[styles.submitButtonContainer, { bottom: insets.bottom + scale(16) }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isFormValid ? styles.submitButtonActive : styles.submitButtonDeactive
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!isFormValid}
        >
          <Text style={[
            styles.submitButtonText,
            isFormValid ? styles.submitButtonTextActive : styles.submitButtonTextDeactive
          ]}>
            회원가입
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseDatePicker}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseDatePicker}
        >
          <TouchableOpacity
            style={styles.datePickerContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>생년월일 선택</Text>
              <TouchableOpacity onPress={handleCloseDatePicker}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContent}>
              <View style={styles.pickerRow}>
                {/* Year Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>년</Text>
                  <ScrollView
                    style={styles.pickerScroll}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.pickerScrollContent}
                  >
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
                  <ScrollView
                    style={styles.pickerScroll}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.pickerScrollContent}
                  >
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
                  <ScrollView
                    style={styles.pickerScroll}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.pickerScrollContent}
                  >
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

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmDate}
              >
                <Text style={styles.confirmButtonText}>선택 완료</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    width: '100%',
    borderBottomWidth: scale(1),
    borderBottomColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    minHeight: scale(56),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  headerTitle: {
    fontWeight: '700' as any,
    fontSize: scale(27),
    color: '#1A1A1A',
    lineHeight: scale(32.4),
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: scale(24),
    alignItems: 'center' as any,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  inputSection: {
    width: '100%',
    marginBottom: scale(24),
  },
  headingContainer: {
    width: '100%',
    height: scale(30),
    marginBottom: scale(6),
  },
  headingText: {
    fontSize: scale(24),
    fontWeight: '700' as any,
    color: '#1e2939',
    lineHeight: scale(28.8),
    textAlign: 'left',
  },
  birthdateInputContainer: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    gap: scale(12),
  },
  textInput: {
    flex: 1,
    height: scale(70),
    backgroundColor: '#ffffff',
    borderWidth: scale(1),
    borderColor: '#e5e7eb',
    borderRadius: scale(14),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  inputText: {
    fontSize: scale(24),
    fontWeight: '700' as any,
    color: '#99a1af',
    lineHeight: scale(28.8),
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: scale(16),
  },
  calendarButton: {
    width: scale(70),
    height: scale(70),
    backgroundColor: '#60584d',
    borderRadius: scale(14),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  datePickerContainer: {
    width: '92%',
    maxWidth: scale(400),
    backgroundColor: '#ffffff',
    borderRadius: scale(24),
    paddingVertical: scale(24),
    paddingHorizontal: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: scale(12),
    elevation: 8,
  },
  datePickerHeader: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    alignItems: 'center' as any,
    marginBottom: scale(20),
  },
  datePickerTitle: {
    fontSize: scale(22),
    fontWeight: '700' as any,
    color: '#1e2939',
    letterSpacing: scale(-0.5),
  },
  closeButton: {
    fontSize: scale(24),
    color: '#99a1af',
    fontWeight: '400' as any,
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
  },
  datePickerContent: {
    width: '100%',
  },
  pickerRow: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    gap: scale(8),
    marginBottom: scale(20),
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: scale(15),
    fontWeight: '700' as any,
    color: '#1e2939',
    textAlign: 'center' as any,
    marginBottom: scale(10),
  },
  pickerScroll: {
    maxHeight: scale(280),
    borderWidth: scale(1),
    borderColor: '#e5e7eb',
    borderRadius: scale(14),
    backgroundColor: '#f9fafb',
  },
  pickerScrollContent: {
    paddingVertical: scale(4),
  },
  pickerItem: {
    paddingVertical: scale(14),
    paddingHorizontal: scale(12),
    borderBottomWidth: scale(1),
    borderBottomColor: '#f0f0f0',
  },
  pickerItemSelected: {
    backgroundColor: '#ffcc02',
  },
  pickerItemText: {
    fontSize: scale(16),
    color: '#1e2939',
    textAlign: 'center' as any,
    fontWeight: '500' as any,
  },
  pickerItemTextSelected: {
    color: '#545045',
    fontWeight: '700' as any,
  },
  confirmButton: {
    width: '100%',
    height: scale(52),
    backgroundColor: '#60584d',
    borderRadius: scale(14),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  confirmButtonText: {
    fontSize: scale(18),
    fontWeight: '700' as any,
    color: '#ffffff',
  },
  submitButtonContainer: {
    position: 'absolute' as any,
    left: scale(16),
    right: scale(16),
    alignItems: 'center' as any,
  },
  submitButton: {
    width: '100%',
    maxWidth: scale(360),
    height: scale(66),
    borderRadius: scale(200),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  submitButtonActive: {
    backgroundColor: '#60584d',
  },
  submitButtonDeactive: {
    backgroundColor: '#c4bcb1',
  },
  submitButtonText: {
    fontWeight: '700' as any,
    fontSize: scale(27),
    lineHeight: scale(32.4),
  },
  submitButtonTextActive: {
    color: '#ffffff',
  },
  submitButtonTextDeactive: {
    color: '#ffffff',
  },
});
