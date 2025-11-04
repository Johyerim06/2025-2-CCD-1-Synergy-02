import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Router';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UserInfoEdit'>;

export default function UserInfoEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      // 실제 API 호출로 대체
      // GET /api/v1/users/me


      // 예시 데이터
      setName('홍길동');
      setBirthDate('1960-01-01');
      setPhone('010-1234-1234');
    } catch (error) {
      console.error('사용자 정보 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const formatPhoneNumber = (text: string) => {

    const numbers = text.replace(/[^0-9]/g, '');
    
    const limitedNumbers = numbers.slice(0, 11);
    

    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
    }
  };


  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };


  const formatBirthDate = (text: string) => {
    // 숫자만 추출
    const numbers = text.replace(/[^0-9]/g, '');

    const limitedNumbers = numbers.slice(0, 8);

    if (limitedNumbers.length <= 4) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 6) {
      return `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4)}`;
    } else {
      return `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4, 6)}-${limitedNumbers.slice(6)}`;
    }
  };

  const handleBirthDateChange = (text: string) => {
    const formatted = formatBirthDate(text);
    setBirthDate(formatted);
  };

  const isAllFieldsFilled = () => {
    return name.trim() !== '' && 
           birthDate.trim() !== '' && 
           birthDate.length === 10 &&
           phone.trim() !== '' && 
           phone.length === 13;
  };


  const buttonStyle = isAllFieldsFilled() 
    ? styles.buttonActive 
    : styles.buttonInactive;

  const buttonTextStyle = isAllFieldsFilled()
    ? styles.buttonTextActive
    : styles.buttonTextInactive;


  const handleSubmit = async () => {
    if (!isAllFieldsFilled()) return;

    try {
      // 실제 API 호출로 대체
      // PATCH /api/v1/users/me

      navigation.navigate('Home');
    } catch (error) {
      console.error('정보 수정 실패:', error);
      // 에러 처리 (알림 표시 등)
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerText}>기본 정보 입력</Text>
      </View>

      <View style={styles.content}>
        {/* 성함 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>성함을 입력해주세요.</Text>
          <TextInput
            style={styles.input}
            placeholder="이름 입력"
            placeholderTextColor="#99a1af"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* 생년월일 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>생년월일을 입력해주세요.</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#99a1af"
              value={birthDate}
              onChangeText={handleBirthDateChange}
              keyboardType="numeric"
              maxLength={10}
            />
            <TouchableOpacity style={styles.calendarButton}>
              <View style={styles.calendarIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 전화번호 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>전화번호를 입력해주세요.</Text>
          <TextInput
            style={styles.input}
            placeholder="010-0000-0000"
            placeholderTextColor="#99a1af"
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={13}
          />
        </View>

        {/* 수정 완료 버튼 */}
        <TouchableOpacity
          style={[styles.button, buttonStyle]}
          onPress={handleSubmit}
          disabled={!isAllFieldsFilled()}
        >
          <Text style={[styles.buttonText, buttonTextStyle]}>수정 완료</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'NotoSansKR',
    fontSize: 16,
    fontWeight: '400',
    color: '#6a7282',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  headerText: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  inputGroup: {
    marginBottom: 30,
  },
  label: {
    fontFamily: 'NotoSansKR',
    fontSize: 24,
    fontWeight: '700',
    color: '#1e2939',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    height: 70,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'NotoSansKR',
    color: '#000000',
    textAlign: 'center',
  },
  dateInputContainer: {
    position: 'relative',
  },
  calendarButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -17.5 }],
    width: 35,
    height: 35,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarIcon: {
    width: 19,
    height: 20,
    backgroundColor: '#99a1af',
    borderRadius: 2,
  },
  button: {
    width: 320,
    height: 66,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 40,
  },
  buttonActive: {
    backgroundColor: '#60584d',
  },
  buttonInactive: {
    backgroundColor: '#c4bcb1',
  },
  buttonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
  },
  buttonTextActive: {
    color: '#ffffff',
  },
  buttonTextInactive: {
    color: '#ffffff',
  },
});

