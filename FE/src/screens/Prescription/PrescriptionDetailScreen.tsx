import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface Medicine {
  mdno: number;
  name: string;
  classification: string;
  image?: string;
  description?: string;
  information?: string;
  warning?: {
    title: string;
    items: string[];
  };
  materials?: Array<{
    mtno: number;
    name: string;
  }>;
}

interface PrescriptionData {
  uno: number;
  umno: number;
  hospital: string;
  category: string;
  taken: number; 
  combination?: string; 
  date?: string;
  medicines: Medicine[];
}

interface SimpleMedication {
  id: number;
  category: string;
  hospital: string;
  frequency: number;
  startDate: string;
}

interface PrescriptionDetailScreenProps {
  medication?: SimpleMedication;
  onGoHome?: () => void;
  onEditTime?: () => void;
}

export default function PrescriptionDetailScreen({ medication, onGoHome, onEditTime }: PrescriptionDetailScreenProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;

  // 전달받은 medication 데이터 사용, 없으면 기본값
  const [categoryText, setCategoryText] = useState(medication?.category || '복통약');

  // 임시 데이터 - 실제로는 API에서 받아옴
  // GET /api/v1/users/me/medications/{umno}
  const prescriptionData: PrescriptionData = {
    uno: medication?.id || 1,
    umno: medication?.id || 1,
    hospital: medication?.hospital || '가람병원',
    category: categoryText || medication?.category || '복통약',
    taken: medication?.frequency || 3,
    combination: 'breakfast,lunch,dinner',
    date: medication?.startDate,
    medicines: [
      {
        mdno: 1,
        name: '이부프로펜 200mg',
        classification: '소염진통제',
        description: '💊 두통, 복통, 설사가 나타날 수 있습니다',
        warning: {
          title: '병용 섭취 주의',
          items: ['녹차, 오미자'],
        },
      },
      {
        mdno: 2,
        name: '이부프로펜 200mg',
        classification: '소염진통제',
        description: '💊 두통, 복통, 설사가 나타날 수 있습니다',
        warning: {
          title: '병용 섭취 주의',
          items: ['녹차, 오미자'],
        },
      },
    ],
  };

  const handleGoHome = () => {
    console.log("홈으로 이동");
    onGoHome?.();
  };

  const handleEditTime = () => {
    console.log("시간 수정");
    onEditTime?.();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* Header - 고정 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>복약 상세 정보</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>
          {/* 카테고리 및 병원 정보 섹션 */}
          <View style={styles.infoSection}>
            <View style={styles.topRow}>
              {/* 카테고리 태그 */}
              <View style={styles.medicineTag}>
                <Text style={styles.medicineTagText}>{prescriptionData.category}</Text>
              </View>
              
              {/* 시간 수정 버튼 */}
              <TouchableOpacity onPress={handleEditTime} style={styles.editTimeButton}>
                <Image 
                  source={require('../../../assets/images/PencilIcon.png')}
                  style={styles.editTimeIcon}
                  resizeMode="contain"
                />
                <Text style={styles.editTimeText}>시간 수정</Text>
              </TouchableOpacity>
            </View>

            {/* 병원 정보 */}
            <Text style={styles.hospitalInfo}>
              {prescriptionData.hospital} - 1일 {prescriptionData.taken}회
            </Text>
          </View>

          {/* 약 카드 섹션 */}
          <View style={styles.medicationCard}>
            {prescriptionData.medicines.map((medicine, index) => (
              <View key={medicine.mdno} style={styles.medicationItemWrapper}>
                <View style={styles.medicationLeftBar} />
                <View style={styles.medicationContentWrapper}>
                  <View style={styles.medicationItem}>
                    <View style={styles.medicationContent}>
                      <View style={styles.medicationHeader}>
                        <Text style={styles.medicationNumber}>#{index + 1}</Text>
                        <View style={styles.medicationTypeTag}>
                          <Text style={styles.medicationTypeText}>{medicine.classification}</Text>
                        </View>
                      </View>
                      <Text style={styles.medicationName}>{medicine.name}</Text>
                    </View>
                  </View>
                  
                  {/* 약 설명 */}
                  {medicine.description && (
                    <View style={styles.descriptionSection}>
                      <Text style={styles.descriptionText}>{medicine.description}</Text>
                    </View>
                  )}
                  
                  {/* 병용 섭취 주의 */}
                  {medicine.warning && (
                    <View style={styles.warningSection}>
                      <View style={styles.warningHeader}>
                        <Image
                          source={require('../../../assets/images/PrescriptionAnalysisResultScreen/병용섭취주의.png')}
                          style={styles.warningIcon}
                        />
                        <Text style={styles.warningTitle}>{medicine.warning.title}</Text>
                      </View>
                      <Text style={styles.warningText}>{medicine.warning.items.join(', ')}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, { maxWidth: MAX_WIDTH }]}
          onPress={handleGoHome}
        >
          <Text style={styles.submitButtonText}>홈으로</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },
  header: {
    width: '100%',
    height: 56,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
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
    paddingTop: 24,
    paddingBottom: 120, // 하단 버튼 공간 확보
    alignItems: 'center' as any,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  infoSection: {
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
    fontWeight: '700' as any,
    fontSize: 24,
    color: '#545045',
    lineHeight: 28.8,
  },
  editTimeButton: {
    backgroundColor: '#FFCC02',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    height: 39,
  },
  editTimeIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  editTimeText: {
    fontSize: 17,
    fontWeight: '700' as any,
    color: '#60584d',
    lineHeight: 20.4,
  },
  hospitalInfo: {
    fontWeight: '700' as any,
    fontSize: 32,
    color: '#666666',
    lineHeight: 38.4,
    marginBottom: 4,
  },
  medicationCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  medicationItemWrapper: {
    flexDirection: 'row' as any,
    marginBottom: 12,
  },
  medicationLeftBar: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: '#60584D',
    marginRight: 14,
  },
  medicationContentWrapper: {
    flex: 1,
  },
  medicationItem: {
    paddingVertical: 14,
  },
  medicationContent: {
    flex: 1,
  },
  medicationHeader: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    marginBottom: 6,
  },
  medicationNumber: {
    fontWeight: '400' as any,
    fontSize: 20,
    color: '#99A1AF',
    lineHeight: 28,
    marginRight: 10,
  },
  medicationTypeTag: {
    backgroundColor: '#FFEDA5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  medicationTypeText: {
    fontWeight: '700' as any,
    fontSize: 16,
    color: '#60584D',
    lineHeight: 20.8,
  },
  medicationName: {
    fontWeight: '700' as any,
    fontSize: 20,
    color: '#364153',
    lineHeight: 24,
  },
  descriptionSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400' as any,
    color: '#364153',
    lineHeight: 20,
  },
  warningSection: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE5B4',
  },
  warningHeader: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    marginBottom: 8,
  },
  warningIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700' as any,
    color: '#D97706',
  },
  warningText: {
    fontSize: 14,
    fontWeight: '400' as any,
    color: '#92400E',
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
