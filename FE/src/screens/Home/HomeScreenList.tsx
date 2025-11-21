import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

// 임시 데이터 - 나중에 API로 대체
interface Medication {
  id: number;
  category: string;
  hospital: string;
  frequency: number;
  startDate: string;
}

const sampleMedications: Medication[] = [
  {
    id: 1,
    category: '감기약',
    hospital: '가람병원',
    frequency: 2,
    startDate: '2025년 10월 5일',
  },
  {
    id: 2,
    category: '소화제',
    hospital: '서울병원',
    frequency: 3,
    startDate: '2025년 10월 10일',
  },
  {
    id: 3,
    category: '두통약',
    hospital: '중앙병원',
    frequency: 2,
    startDate: '2025년 10월 12일',
  },
  {
    id: 4,
    category: '비타민',
    hospital: '건강의원',
    frequency: 1,
    startDate: '2025년 10월 15일',
  },
];

export default function HomeScreenList() {
  const handleMedicationPress = (id: number) => {
    console.log('약 상세 페이지로 이동:', id);
    // TODO: 네비게이션 연결
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headingContainer}>
            <Text style={styles.dateText}>10월 10일 (금)</Text>
            <Text style={styles.greetingText}>오늘도 건강한 하루 되세요</Text>
          </View>
          {/* 복약 기록 버튼 */}
          <TouchableOpacity style={styles.recordButton} activeOpacity={0.8}>
            <Text style={styles.recordButtonText}>복약 기록</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons Grid */}
        <View style={styles.actionButtonsContainer}>
          {/* Prescription Button */}
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <LinearGradient
              colors={['#6b6558', '#5a5347']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <View style={styles.iconContainer}>
                <Image 
                  source={require('../../../assets/images/HomeScreenPrescriptionRegistration.png')} 
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.actionButtonText}>처방전 등록</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Pill Envelope Button */}
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <LinearGradient
              colors={['#6b6558', '#5a5347']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <View style={styles.iconContainer}>
                <Image 
                  source={require('../../../assets/images/HomeScreenPrescriptionBag.png')} 
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.actionButtonText}>약봉투 등록</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Edit Info Button */}
        <TouchableOpacity style={styles.editInfoButton} activeOpacity={0.8}>
          <LinearGradient
            colors={['#6b6558', '#5a5347']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.editInfoGradient}
          >
            <View style={styles.editIconContainer}>
              <Image 
                source={require('../../../assets/images/HomeScreenMyInfo.png')} 
                style={styles.editIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.editInfoButtonText}>내 정보 수정</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 복용 중인 약 섹션 */}
        <View style={styles.medicationListSection}>
          <Text style={styles.sectionTitle}>복용 중인 약</Text>
          
          {/* 약 목록 */}
          {sampleMedications.map((medication) => (
            <TouchableOpacity 
              key={medication.id}
              style={styles.medicationCard}
              activeOpacity={0.8}
              onPress={() => handleMedicationPress(medication.id)}
            >
              <View style={styles.medicationCardContent}>
                {/* 왼쪽 정보 */}
                <View style={styles.medicationInfo}>
                  {/* 카테고리 태그 */}
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{medication.category}</Text>
                  </View>
                  {/* 병원 정보 */}
                  <Text style={styles.hospitalText}>
                    {medication.hospital} - 1일 {medication.frequency}회
                  </Text>
                  {/* 날짜 */}
                  <Text style={styles.dateInfoText}>{medication.startDate}</Text>
                </View>
                
                {/* 오른쪽 화살표 아이콘 */}
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrowText}>›</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 57, // 81 - 24 (status bar height)
    paddingBottom: 40,
    alignItems: 'center' as any,
  },
  headerSection: {
    width: '100%',
    maxWidth: 368,
    marginBottom: 24,
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    alignItems: 'flex-start' as any,
  },
  headingContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 27,
    fontWeight: '700' as any,
    color: '#1e2939',
    lineHeight: 32.4,
    marginBottom: 5,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '400' as any,
    color: '#6a7282',
    lineHeight: 24,
  },
  recordButton: {
    backgroundColor: '#FFCC02',
    borderRadius: 14,
    paddingHorizontal: 19,
    paddingVertical: 10,
    height: 40,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  recordButtonText: {
    fontSize: 17,
    fontWeight: '700' as any,
    color: '#545045',
    lineHeight: 20.4,
  },
  actionButtonsContainer: {
    width: '100%',
    maxWidth: 368,
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    marginBottom: 24,
  },
  actionButton: {
    width: '49%',
    maxWidth: 155,
    aspectRatio: 1,
    minHeight: 155,
    borderRadius: 16,
    overflow: 'hidden' as any,
  },
  actionButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end' as any,
    alignItems: 'center' as any,
    paddingBottom: 21,
  },
  iconContainer: {
    width: 63.36,
    height: 63.36,
    borderRadius: 31.68,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 18,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  actionButtonText: {
    fontSize: 24,
    fontWeight: '700' as any,
    color: '#ffffff',
    lineHeight: 28.8,
    textAlign: 'center' as any,
  },
  editInfoButton: {
    width: '100%',
    maxWidth: 368,
    height: 80.15,
    borderRadius: 16,
    overflow: 'hidden' as any,
    marginBottom: 24,
  },
  editInfoGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row' as any,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    paddingHorizontal: 20,
  },
  editIconContainer: {
    width: 44.15,
    height: 44.15,
    borderRadius: 22.075,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 18,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  editIconImage: {
    width: 22.09,
    height: 22.09,
  },
  editInfoButtonText: {
    fontSize: 24,
    fontWeight: '700' as any,
    color: '#ffffff',
    lineHeight: 28.8,
    textAlign: 'left' as any,
  },
  medicationListSection: {
    width: '100%',
    maxWidth: 368,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as any,
    color: '#1e2939',
    lineHeight: 28,
    marginBottom: 8,
  },
  medicationCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: 11,
    paddingVertical: 11,
    marginBottom: 8,
  },
  medicationCardContent: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    alignItems: 'center' as any,
  },
  medicationInfo: {
    flex: 1,
  },
  categoryTag: {
    backgroundColor: '#FFCC02',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 14,
    fontWeight: '700' as any,
    color: '#364153',
    lineHeight: 20,
  },
  hospitalText: {
    fontSize: 16,
    fontWeight: '700' as any,
    color: '#1e2939',
    lineHeight: 24,
    marginBottom: 4,
  },
  dateInfoText: {
    fontSize: 14,
    fontWeight: '400' as any,
    color: '#99a1af',
    lineHeight: 20,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: '400' as any,
    color: '#99a1af',
  },
});

