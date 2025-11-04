import React from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditInfoSelect'>;

export default function EditInfoSelectScreen() {
  const navigation = useNavigation<NavigationProp>();


  const handleGoHome = () => {
    navigation.navigate('Home');
  };


  const handleBasicInfoPress = () => {
    navigation.navigate('UserInfoEdit');
  };


  const handleMedicationTimePress = () => {
    navigation.navigate('MorningTimeEdit');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerText}>내 정보 수정</Text>
      </View>

      {/* 제목과 버튼 중앙 정렬 영역 */}
      <View style={styles.content}>
        <View style={styles.centerSection}>
          {/* 제목 */}
          <Text style={styles.title}>수정할 항목을 선택하세요</Text>

          {/* 버튼 카드 그리드 */}
          <View style={styles.buttonGrid}>
            {/* 기본 정보 버튼 영역 */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cardButton}
                onPress={handleBasicInfoPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ffcc02', '#ffcc02']}
                  style={styles.cardButtonGradient}
                >
                  <Text style={styles.cardButtonText}>기본 정보</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* 복약 시간 버튼 영역 */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cardButton}
                onPress={handleMedicationTimePress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ffcc02', '#ffcc02']}
                  style={styles.cardButtonGradient}
                >
                  <Text style={styles.cardButtonText}>복약 시간</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* 나가기 버튼 - 아래 고정 */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.exitButton} onPress={handleGoHome}>
          <Text style={styles.exitButtonText}>나가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSection: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 38,
    lineHeight: 32.4,
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 20,
    alignItems: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  buttonContainer: {
    width: 148,
    height: 148,
  },
  cardButton: {
    width: 148,
    height: 148,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardButtonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
    color: '#5a5347',
    lineHeight: 32.4,
  },
  exitButton: {
    width: 320,
    height: 66,
    borderRadius: 200,
    backgroundColor: '#60584d',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  exitButtonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
    color: '#ffffff',
  },
});

