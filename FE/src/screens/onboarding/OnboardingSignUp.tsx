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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Rect } from 'react-native-svg';
import responsive from '../../utils/responsive';
import { getFcmToken } from '../../utils/fcmToken';
import { signUp, login } from '../../api/authApi';

interface OnboardingSignUpProps {
  onSignUpComplete?: (isLogin?: boolean) => void; // isLogin: true면 로그인, false면 회원가입
}

export default function OnboardingSignUp({ onSignUpComplete }: OnboardingSignUpProps) {
  // App.tsx에서 직접 사용되는 경우를 대비해 onSignUpComplete 콜백만 사용
  // NavigationContainer 안에서 사용되는 경우에도 콜백을 통해 화면 전환 처리
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = responsive(isTablet ? 420 : 360);
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

  const handleSubmit = async () => {
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    try {
      console.log('회원가입 시작...');
      
      // 1. FCM 토큰 받아오기 (없어도 회원가입 진행)
      // PlatformConstants 에러 방지를 위해 FCM 토큰 기능 일시적으로 비활성화
      // TODO: New Architecture 문제 해결 후 재활성화
      console.log('FCM 토큰 요청 중...');
      let fcmToken: string | null = null;
      
      try {
        // 런타임이 완전히 준비될 때까지 충분히 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
        fcmToken = await getFcmToken();
        
        if (!fcmToken) {
          console.warn('FCM 토큰을 받지 못했습니다. 알림이 제한될 수 있습니다.');
          // FCM 토큰이 없어도 회원가입은 진행합니다
        } else {
          console.log('FCM 토큰 받기 성공:', fcmToken);
        }
      } catch (error) {
        console.warn('FCM 토큰 가져오기 실패 (회원가입은 계속 진행):', error);
        // 에러가 발생해도 회원가입은 진행합니다
        fcmToken = null;
      }

      // 2. 회원가입 API 호출
      console.log('회원가입 API 호출 중...');
      console.log('회원가입 데이터:', { name: name.trim(), phone: phone.trim(), birth: birthdate.trim() });
      
      // 백엔드는 "birth" 필드명을 사용하고 LocalDate 타입을 받습니다 (YYYY-MM-DD 형식)
      // FCM 토큰이 없으면 빈 문자열로 전송 (백엔드에서 nullable로 처리)
      const signUpData = {
        name: name.trim(),
        phone: phone.trim(),
        birth: birthdate.trim(), // 백엔드 필드명에 맞춤
        fcmToken: fcmToken || '', // FCM 토큰이 없으면 빈 문자열
      };

      const response = await signUp(signUpData);
      
      console.log('회원가입 응답:', response);
      
      // 백엔드 응답 형식: { header: { resultCode: 1000, resultMsg: "회원가입 성공" }, body: { uno: ... } }
      if (response.header?.resultCode === 1000 && response.body) {
        console.log('회원가입 성공:', response);
        // JWT 토큰은 응답 헤더의 Authorization에 포함됩니다
        // 성공 시 알림 없이 바로 다음 화면으로 이동
        setIsLoading(false);
        onSignUpComplete?.(false); // false = 회원가입 성공
      } else {
        // 응답은 받았지만 resultCode가 1000이 아닌 경우
        console.warn('회원가입 응답 코드가 1000이 아님:', response);
        throw new Error(response.header?.resultMsg || '회원가입에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      console.error('에러 상세:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      // 409 Conflict 에러 처리 (이미 가입한 사용자) - 팝업 없이 자동 로그인
      if (error.response?.status === 409 || error.response?.data?.header?.resultCode === 2001) {
        console.log('이미 가입된 사용자 감지, 자동 로그인 시도...');
        
        try {
          // 자동 로그인 시도
          const loginData = {
            name: name.trim(),
            phone: phone.trim(),
            birth: birthdate.trim(),
          };
          
          const loginResponse = await login(loginData);
          
          if (loginResponse.header?.resultCode === 1000) {
            console.log('자동 로그인 성공:', loginResponse);
            // 로그인 성공 시 복약 시간 설정 건너뛰고 홈 화면으로 이동
            setIsLoading(false);
            // 콜백에 로그인 여부 전달 (true = 로그인 성공)
            onSignUpComplete?.(true);
          } else {
            throw new Error(loginResponse.header?.resultMsg || '로그인에 실패했습니다.');
          }
        } catch (loginError: any) {
          console.error('자동 로그인 실패:', loginError);
          Alert.alert(
            '로그인 실패',
            loginError.response?.data?.header?.resultMsg || loginError.response?.data?.message || loginError.message || '로그인 중 오류가 발생했습니다.',
            [{ text: '확인', onPress: () => setIsLoading(false) }]
          );
        }
      } else {
        // 기타 에러 처리
        const errorMessage = error.response?.data?.header?.resultMsg 
          || error.response?.data?.message 
          || error.message 
          || `회원가입 중 오류가 발생했습니다. (상태 코드: ${error.response?.status || '알 수 없음'})`;
        
        console.error('회원가입 실패 상세:', {
          status: error.response?.status,
          code: error.response?.data?.header?.resultCode,
          message: errorMessage,
        });
        
        Alert.alert(
          '회원가입 실패',
          errorMessage + '\n\n다시 시도해주세요.',
          [{ text: '확인', onPress: () => setIsLoading(false) }]
        );
      }
    }
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
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>기본 정보 입력</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + responsive(80) }]}
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
                <Svg width={responsive(28)} height={responsive(28)} viewBox="0 0 24 24" fill="none">
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
      <View style={[styles.submitButtonContainer, { bottom: insets.bottom + responsive(16) }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isFormValid && !isLoading ? styles.submitButtonActive : styles.submitButtonDeactive
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={[
              styles.submitButtonText,
              isFormValid && !isLoading ? styles.submitButtonTextActive : styles.submitButtonTextDeactive
            ]}>
              회원가입
            </Text>
          )}
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
    borderBottomWidth: responsive(1),
    borderBottomColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    minHeight: responsive(56),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  headerTitle: {
    fontWeight: '700' as any,
    fontSize: responsive(27),
    color: '#1A1A1A',
    lineHeight: responsive(32.4),
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: responsive(16),
    paddingTop: responsive(24),
    alignItems: 'center' as any,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  inputSection: {
    width: '100%',
    marginBottom: responsive(24),
  },
  headingContainer: {
    width: '100%',
    height: responsive(30),
    marginBottom: responsive(6),
  },
  headingText: {
    fontSize: responsive(24),
    fontWeight: '700' as any,
    color: '#1e2939',
    lineHeight: responsive(28.8),
    textAlign: 'left',
  },
  birthdateInputContainer: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    gap: responsive(12),
  },
  textInput: {
    flex: 1,
    height: responsive(70),
    backgroundColor: '#ffffff',
    borderWidth: responsive(1),
    borderColor: '#e5e7eb',
    borderRadius: responsive(14),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  inputText: {
    fontSize: responsive(24),
    fontWeight: '700' as any,
    color: '#99a1af',
    lineHeight: responsive(28.8),
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: responsive(16),
  },
  calendarButton: {
    width: responsive(70),
    height: responsive(70),
    backgroundColor: '#60584d',
    borderRadius: responsive(14),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsive(2) },
    shadowOpacity: 0.1,
    shadowRadius: responsive(4),
    elevation: responsive(3),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  datePickerContainer: {
    width: '92%',
    maxWidth: responsive(400),
    backgroundColor: '#ffffff',
    borderRadius: responsive(24),
    paddingVertical: responsive(24),
    paddingHorizontal: responsive(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsive(4) },
    shadowOpacity: 0.15,
    shadowRadius: responsive(12),
    elevation: responsive(8),
  },
  datePickerHeader: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    alignItems: 'center' as any,
    marginBottom: responsive(20),
  },
  datePickerTitle: {
    fontSize: responsive(22),
    fontWeight: '700' as any,
    color: '#1e2939',
    letterSpacing: responsive(-0.5),
  },
  closeButton: {
    fontSize: responsive(24),
    color: '#99a1af',
    fontWeight: '400' as any,
    paddingHorizontal: responsive(8),
    paddingVertical: responsive(4),
  },
  datePickerContent: {
    width: '100%',
  },
  pickerRow: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    gap: responsive(8),
    marginBottom: responsive(20),
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: responsive(15),
    fontWeight: '700' as any,
    color: '#1e2939',
    textAlign: 'center' as any,
    marginBottom: responsive(10),
  },
  pickerScroll: {
    maxHeight: responsive(280),
    borderWidth: responsive(1),
    borderColor: '#e5e7eb',
    borderRadius: responsive(14),
    backgroundColor: '#f9fafb',
  },
  pickerScrollContent: {
    paddingVertical: responsive(4),
  },
  pickerItem: {
    paddingVertical: responsive(14),
    paddingHorizontal: responsive(12),
    borderBottomWidth: responsive(1),
    borderBottomColor: '#f0f0f0',
  },
  pickerItemSelected: {
    backgroundColor: '#ffcc02',
  },
  pickerItemText: {
    fontSize: responsive(16),
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
    height: responsive(52),
    backgroundColor: '#60584d',
    borderRadius: responsive(14),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  confirmButtonText: {
    fontSize: responsive(18),
    fontWeight: '700' as any,
    color: '#ffffff',
  },
  submitButtonContainer: {
    position: 'absolute' as any,
    left: responsive(16),
    right: responsive(16),
    alignItems: 'center' as any,
  },
  submitButton: {
    width: '100%',
    maxWidth: responsive(360),
    height: responsive(66),
    borderRadius: responsive(200),
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
    fontSize: responsive(27),
    lineHeight: responsive(32.4),
  },
  submitButtonTextActive: {
    color: '#ffffff',
  },
  submitButtonTextDeactive: {
    color: '#ffffff',
  },
});
