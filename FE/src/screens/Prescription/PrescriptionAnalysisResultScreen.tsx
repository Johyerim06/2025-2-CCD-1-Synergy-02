import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import responsive from '../../utils/responsive';
import { getMedicationDetail, updateMedicationCategory, MedicationDetailResponse } from '../../api/medicationApi';
import { RootStackParamList } from '../../navigation/Router';

type PrescriptionAnalysisResultScreenRouteProp = RouteProp<RootStackParamList, 'PrescriptionAnalysisResult'>;
type PrescriptionAnalysisResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrescriptionAnalysisResult'>;


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
  medicines: Medicine[];
}

interface PrescriptionAnalysisResultScreenProps {
  umno?: number; // 복약 정보 ID (App.tsx에서 사용 시 선택적)
  source?: 'prescription' | 'medicationEnvelope';
  onGoHome?: () => void;
}

export default function PrescriptionAnalysisResultScreen({ 
  umno: propUmno, 
  source: propSource = 'prescription',
  onGoHome 
}: PrescriptionAnalysisResultScreenProps) {
  const navigation = useNavigation<PrescriptionAnalysisResultScreenNavigationProp>();
  const route = useRoute<PrescriptionAnalysisResultScreenRouteProp>();
  
  // route.params에서 umno와 source를 가져오거나 props를 사용
  const umno = route.params?.umno || propUmno;
  const source = route.params?.source || propSource;
  
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = responsive(isTablet ? 420 : 360);
  const insets = useSafeAreaInsets();

  const headerText = source === 'medicationEnvelope' ? '약봉투 분석 완료' : '처방전 분석 완료';

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryText, setCategoryText] = useState('');
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // 복약 상세 정보 조회
  useEffect(() => {
    const loadMedicationDetail = async () => {
      try {
        setIsLoading(true);
        const response = await getMedicationDetail(umno);
        if (response.header?.resultCode === 1000 && response.body) {
          const data = response.body;
          setCategoryText(data.category);
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


  const handleCategoryEditPress = async () => {
    if (isEditingCategory) {
      // 편집 완료 - API 호출하여 카테고리 저장
      if (!categoryText.trim()) {
        Alert.alert('입력 오류', '카테고리를 입력해주세요.');
        return;
      }

      setIsSavingCategory(true);
      try {
        const response = await updateMedicationCategory(umno, categoryText.trim());
        if (response.header?.resultCode === 1000) {
          if (prescriptionData) {
            setPrescriptionData({
              ...prescriptionData,
              category: categoryText.trim(),
            });
          }
          setIsEditingCategory(false);
        } else {
          throw new Error(response.header?.resultMsg || '카테고리 수정에 실패했습니다.');
        }
      } catch (error: any) {
        console.error('카테고리 수정 실패:', error);
        Alert.alert(
          '수정 실패',
          error.response?.data?.header?.resultMsg || error.response?.data?.message || error.message || '카테고리 수정 중 오류가 발생했습니다.'
        );
      } finally {
        setIsSavingCategory(false);
      }
    } else {
      // 편집 시작
      setIsEditingCategory(true);
    }
  };


  const getCombinationText = (combination?: string) => {
    if (!combination) return '';
    const timeMap: { [key: string]: string } = {
      breakfast: '아침',
      lunch: '점심',
      dinner: '저녁',
      bedtime: '취침 전',
    };
    return combination
      .split(',')
      .map((time) => timeMap[time] || time)
      .join(', ');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar style="dark" />
      
      {/* Header - 고정 */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{headerText}</Text>
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
            {/* 약 정보 섹션 */}
            <View style={styles.medicineInfoSection}>
              {/* 카테고리 태그와 수정 버튼 */}
              <View style={styles.categoryRow}>
                {isEditingCategory ? (
                  <View style={styles.medicineTag}>
                    <TextInput
                      style={styles.medicineTagInput}
                      value={categoryText}
                      onChangeText={setCategoryText}
                      autoFocus={true}
                      onSubmitEditing={handleCategoryEditPress}
                      onBlur={handleCategoryEditPress}
                      editable={!isSavingCategory}
                    />
                  </View>
                ) : (
                  <>
                    <View style={styles.medicineTag}>
                      <Text style={styles.medicineTagText}>{prescriptionData.category}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={handleCategoryEditPress} 
                      style={styles.editButtonContainer}
                      disabled={isSavingCategory}
                    >
                      <View style={styles.editButtonBackground}>
                        {isSavingCategory ? (
                          <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                          <Image 
                            source={require('../../../assets/images/PencilIcon.png')}
                            style={styles.editIcon}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  </>
                )}
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
  medicineInfoSection: {
    width: '100%',
    marginBottom: responsive(15),
  },
  categoryRow: {
    flexDirection: 'row' as any,
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
    marginRight: responsive(8),
  },
  medicineTagText: {
    fontWeight: '700' as any,
    fontSize: responsive(24),
    color: '#545045',
    lineHeight: responsive(28.8),
  },
  medicineTagInput: {
    fontWeight: '700' as any,
    fontSize: responsive(24),
    color: '#545045',
    lineHeight: responsive(28.8),
    minWidth: responsive(100),
  },
  editButtonContainer: {
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  editButtonBackground: {
    width: responsive(44),
    height: responsive(43),
    backgroundColor: '#60584d',
    borderRadius: responsive(200),
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  editIcon: {
    width: responsive(25),
    height: responsive(25),
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
