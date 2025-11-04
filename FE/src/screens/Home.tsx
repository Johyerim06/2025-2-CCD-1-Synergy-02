import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/Router';
import { LinearGradient } from 'expo-linear-gradient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Medicine {
  id: string;
  umno: number;
  name: string;
  hospital: string;
  frequency: string;
  date: string;
}

export default function Home() {
  const navigation = useNavigation<NavigationProp>();
  
  // 실제 데이터로 교체 (API 호출 등)
  const [medicines, setMedicines] = useState<Medicine[]>([
    // 예시 데이터 - 나중에 빈 배열로 변경하면 HomeScreenEmpty가 표시됨
    // { id: '1', umno: 1, name: '감기약', hospital: '가람병원', frequency: '1일 2회', date: '2025년 10월 5일' },
  ]);

  const getTodayDate = () => {
    const today = new Date();
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = months[today.getMonth()];
    const date = today.getDate();
    const day = days[today.getDay()];
    return `${month} ${date}일 (${day})`;
  };

  const hasMedicines = medicines.length > 0;

  const handlePrescriptionPress = () => {
    navigation.navigate('PrescriptionCapture');
  };

  const handleMedicationEnvelopePress = () => {
    navigation.navigate('MedicationEnvelopeCapture');
  };

  const handleEditInfoPress = () => {
    navigation.navigate('EditInfoSelect');
  };

  const handleMedicinePress = (medicine: Medicine) => {
    navigation.navigate('PrescriptionDetail', { umno: medicine.umno });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 - 날짜 및 복약 기록 버튼 */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.dateText}>{getTodayDate()}</Text>
              <Text style={styles.greetingText}>오늘도 건강한 하루 되세요</Text>
            </View>
            {hasMedicines && (
              <TouchableOpacity style={styles.recordButton}>
                <Text style={styles.recordButtonText}>복약 기록</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.actionButtonsWrapper}>
          <View style={styles.actionButtonsContainer}>
            {/* 처방전 등록 버튼 영역 */}
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handlePrescriptionPress}>
                <View style={styles.actionButtonIcon}>
                  <Image 
                    source={require('../../assets/images/Home/처방전아이콘.png')}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.actionButtonText}>처방전 등록</Text>
              </TouchableOpacity>
            </View>
            
            {/* 약봉투 등록 버튼 영역 */}
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleMedicationEnvelopePress}
              >
                <View style={styles.actionButtonIcon}>
                  <Image 
                    source={require('../../assets/images/Home/약봉투아이콘.png')}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.actionButtonText}>약봉투 등록</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 내 정보 수정 버튼 */}
        <View style={styles.infoButtonWrapper}>
          <TouchableOpacity style={styles.infoButton} onPress={handleEditInfoPress}>
            <View style={styles.infoButtonIcon}>
              <Image 
                source={require('../../assets/images/Home/내정보수정아이콘.png')}
                style={styles.infoIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.infoButtonText}>내 정보 수정</Text>
          </TouchableOpacity>
        </View>

        {/* 빈 상태 또는 약 리스트 */}
        {hasMedicines ? (
          <View style={styles.medicinesContainer}>
            <Text style={styles.sectionTitle}>복용 중인 약</Text>
            {medicines.map((medicine) => (
              <TouchableOpacity 
                key={medicine.id} 
                style={styles.medicineCard}
                onPress={() => handleMedicinePress(medicine)}
                activeOpacity={0.7}
              >
                <View style={styles.medicineHeader}>
                  <View style={styles.medicineTag}>
                    <Text style={styles.medicineTagText}>{medicine.name}</Text>
                  </View>
                </View>
                <Text style={styles.medicineInfo}>{medicine.hospital} - {medicine.frequency}</Text>
                <Text style={styles.medicineDate}>{medicine.date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#f3f4f6', '#f9fafb']}
              style={styles.emptyIcon}
            >
              <Image 
                source={require('../../assets/images/Home/약아이콘.png')}
                style={styles.emptyIconImage}
                resizeMode="contain"
              />
            </LinearGradient>
            <Text style={styles.emptyTitle}>등록된 약이 없습니다</Text>
            <Text style={styles.emptySubtitle}>처방전을 등록해주세요</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '80%',
    maxWidth: '80%',
  },
  headerLeft: {
    flex: 1,
  },
  dateText: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
    color: '#1e2939',
    marginBottom: 5,
  },
  greetingText: {
    fontFamily: 'NotoSansKR',
    fontSize: 16,
    fontWeight: '400',
    color: '#6a7282',
  },
  recordButton: {
    backgroundColor: '#ffcc02',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 39,
  },
  recordButtonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 16,
    fontWeight: '700',
    color: '#545045',
  },
  actionButtonsWrapper: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    width: '80%',
    maxWidth: '80%',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 0,
  },
  actionButton: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#60584d',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  actionButtonIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
  },
  actionButtonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoButtonWrapper: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#60584d',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: '80%',
    maxWidth: '80%',
  },
  infoButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    width: 24,
    height: 24,
  },
  infoButtonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  medicinesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Segoe UI Variable',
    fontSize: 20,
    fontWeight: '700',
    color: '#1e2939',
    marginBottom: 16,
  },
  medicineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 16,
    marginBottom: 12,
  },
  medicineHeader: {
    marginBottom: 10,
  },
  medicineTag: {
    backgroundColor: '#ffcc02',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  medicineTagText: {
    fontFamily: 'Segoe UI Variable',
    fontSize: 14,
    fontWeight: '700',
    color: '#364153',
  },
  medicineInfo: {
    fontFamily: 'Segoe UI Variable',
    fontSize: 16,
    fontWeight: '700',
    color: '#1e2939',
    marginBottom: 4,
  },
  medicineDate: {
    fontFamily: 'Segoe UI Variable',
    fontSize: 14,
    fontWeight: '400',
    color: '#99a1af',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    width: 112,
    height: 112,
    borderRadius: 56,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconImage: {
    width: 64,
    height: 64,
  },
  emptyTitle: {
    fontFamily: 'Segoe UI Variable',
    fontSize: 20,
    fontWeight: '700',
    color: '#4a5565',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Segoe UI Variable',
    fontSize: 18,
    fontWeight: '400',
    color: '#99a1af',
  },
});
