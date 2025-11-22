import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import responsive from '../../utils/responsive';
import { getMedicationDetail, MedicationDetailResponse } from '../../api/medicationApi';

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
  umno: number; // 복약 정보 ID
  onGoHome?: () => void;
  onEditTime?: () => void;
}

export default function PrescriptionDetailScreen({ umno, onGoHome, onEditTime }: PrescriptionDetailScreenProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = responsive(isTablet ? 420 : 360);
  const insets = useSafeAreaInsets();

  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 복약 상세 정보 조회
  useEffect(() => {
    const loadMedicationDetail = async () => {
      try {
        setIsLoading(true);
        const response = await getMedicationDetail(umno);
        if (response.header?.resultCode === 1000 && response.body) {
          const data = response.body;
          setPrescriptionData({
            uno: 0, // 필요시 추가
            umno: data.umno,
            hospital: data.hospital,
            category: data.category,
            taken: data.taken,
            combination: data.comb,
            medicines: data.medicines.map((med) => ({
              mdno: med.mdno,
              name: med.name,
              classification: med.classification,
              image: med.image,
              description: med.description,
              information: med.information,
              materials: med.materials,
            })),
          });
        }
      } catch (error: any) {
        console.error('복약 상세 정보 조회 실패:', error);
        Alert.alert('오류', '복약 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    loadMedicationDetail();
  }, [umno]);

  const handleGoHome = () => {
    onGoHome?.();
  };

  const handleEditTime = () => {
    onEditTime?.();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar style="dark" />
      
      {/* Header - 고정 */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>복약 상세 정보</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60584d" />
          <Text style={styles.loadingText}>복약 정보 불러오는 중...</Text>
        </View>
      ) : prescriptionData ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + responsive(120) }]}
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
                          source={require('../../../assets/images/caution.png')}
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
      ) : null}

      {/* 하단 고정 버튼 */}
      <View style={[styles.buttonContainer, { bottom: insets.bottom + responsive(36) }]}>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: responsive(1),
    borderBottomColor: '#EAEAEA',
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
  infoSection: {
    width: '100%',
    marginBottom: responsive(15),
  },
  topRow: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    alignItems: 'center' as any,
    marginBottom: responsive(8),
  },
  medicineTag: {
    backgroundColor: '#FFF4C9',
    borderWidth: responsive(1),
    borderColor: '#545045',
    borderRadius: responsive(15),
    paddingHorizontal: responsive(16),
    paddingVertical: responsive(8),
  },
  medicineTagText: {
    fontWeight: '700' as any,
    fontSize: responsive(24),
    color: '#545045',
    lineHeight: responsive(28.8),
  },
  editTimeButton: {
    backgroundColor: '#FFCC02',
    borderRadius: responsive(10),
    paddingHorizontal: responsive(12),
    paddingVertical: responsive(8),
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    height: responsive(39),
  },
  editTimeIcon: {
    width: responsive(16),
    height: responsive(16),
    marginRight: responsive(4),
  },
  editTimeText: {
    fontSize: responsive(17),
    fontWeight: '700' as any,
    color: '#60584d',
    lineHeight: responsive(20.4),
  },
  hospitalInfo: {
    fontWeight: '700' as any,
    fontSize: responsive(32),
    color: '#666666',
    lineHeight: responsive(38.4),
    marginBottom: responsive(4),
  },
  medicationCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: responsive(11),
    paddingVertical: responsive(12),
    paddingHorizontal: responsive(18),
    marginBottom: responsive(8),
  },
  medicationItemWrapper: {
    flexDirection: 'row' as any,
    marginBottom: responsive(12),
  },
  medicationLeftBar: {
    width: responsive(3),
    alignSelf: 'stretch',
    backgroundColor: '#60584D',
    marginRight: responsive(14),
  },
  medicationContentWrapper: {
    flex: 1,
  },
  medicationItem: {
    paddingVertical: responsive(14),
  },
  medicationContent: {
    flex: 1,
  },
  medicationHeader: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    marginBottom: responsive(6),
  },
  medicationNumber: {
    fontWeight: '400' as any,
    fontSize: responsive(20),
    color: '#99A1AF',
    lineHeight: responsive(28),
    marginRight: responsive(10),
  },
  medicationTypeTag: {
    backgroundColor: '#FFEDA5',
    borderRadius: responsive(25),
    paddingHorizontal: responsive(16),
    paddingVertical: responsive(6),
  },
  medicationTypeText: {
    fontWeight: '700' as any,
    fontSize: responsive(16),
    color: '#60584D',
    lineHeight: responsive(20.8),
  },
  medicationName: {
    fontWeight: '700' as any,
    fontSize: responsive(20),
    color: '#364153',
    lineHeight: responsive(24),
  },
  descriptionSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: responsive(4),
    padding: responsive(8),
    marginBottom: responsive(8),
  },
  descriptionText: {
    fontSize: responsive(14),
    fontWeight: '400' as any,
    color: '#364153',
    lineHeight: responsive(20),
  },
  warningSection: {
    backgroundColor: '#FFF9E6',
    borderRadius: responsive(12),
    padding: responsive(12),
    borderWidth: responsive(1),
    borderColor: '#FFE5B4',
  },
  warningHeader: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    marginBottom: responsive(8),
  },
  warningIcon: {
    width: responsive(20),
    height: responsive(20),
    marginRight: responsive(8),
  },
  warningTitle: {
    fontSize: responsive(16),
    fontWeight: '700' as any,
    color: '#D97706',
  },
  warningText: {
    fontSize: responsive(14),
    fontWeight: '400' as any,
    color: '#92400E',
  },
  buttonContainer: {
    position: 'absolute' as any,
    left: responsive(16),
    right: responsive(16),
    alignItems: 'center' as any,
  },
  submitButton: {
    width: '100%',
    height: responsive(66),
    backgroundColor: '#60584d',
    borderRadius: responsive(200),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  submitButtonText: {
    fontSize: responsive(27),
    fontWeight: '700' as any,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
    paddingVertical: responsive(40),
  },
  loadingText: {
    marginTop: responsive(12),
    fontSize: responsive(18),
    color: '#99a1af',
  },
});
