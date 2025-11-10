import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
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
  medicines: Medicine[];
}

interface PrescriptionAnalysisResultScreenProps {
  onGoHome?: () => void;
}

export default function PrescriptionAnalysisResultScreen({ onGoHome }: PrescriptionAnalysisResultScreenProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;

  // TODO: navigation과 route params는 나중에 연결
  const source = 'prescription' as 'prescription' | 'medicationEnvelope'; // 기본값
  const headerText = source === 'medicationEnvelope' ? '약봉투 분석 완료' : '처방전 분석 완료';
  

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryText, setCategoryText] = useState('복통약'); // 초기값: API에서 받아온 데이터

  // 실제 API에서 받아온 데이터로 교체
  // GET /api/v1/users/me/medications/{umno}
  const prescriptionData: PrescriptionData = {
    uno: 1,
    umno: 1,
    hospital: '가람병원',
    category: categoryText || '복통약',
    taken: 3,
    combination: 'breakfast,lunch,dinner',
    medicines: [
      {
        mdno: 1,
        name: '이부프로펜 200mg',
        classification: '소염진통제',
        warning: {
          title: '병용 섭취 주의',
          items: ['녹차, 오미자'],
        },
      },
      {
        mdno: 2,
        name: '이부프로펜 200mg',
        classification: '소염진통제',
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


  const handleCategoryEditPress = () => {
    if (isEditingCategory) {
      // 편집 완료 - API 호출하여 카테고리 저장
      // PUT /api/v1/users/me/medications/{umno}/category
      console.log('카테고리 수정 완료:', categoryText);
      setIsEditingCategory(false);
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* Header - 고정 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{headerText}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
                  />
                </View>
              ) : (
                <>
                  <View style={styles.medicineTag}>
                    <Text style={styles.medicineTagText}>{prescriptionData.category}</Text>
                  </View>
                  <TouchableOpacity onPress={handleCategoryEditPress} style={styles.editButtonContainer}>
                    <View style={styles.editButtonBackground}>
                      <Image 
                        source={require('../../../assets/images/PencilIcon.png')}
                        style={styles.editIcon}
                        resizeMode="contain"
                      />
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
  medicineInfoSection: {
    width: '100%',
    marginBottom: 15,
  },
  categoryRow: {
    flexDirection: 'row' as any,
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
    marginRight: 8,
  },
  medicineTagText: {
    fontWeight: '700' as any,
    fontSize: 24,
    color: '#545045',
    lineHeight: 28.8,
  },
  medicineTagInput: {
    fontWeight: '700' as any,
    fontSize: 24,
    color: '#545045',
    lineHeight: 28.8,
    minWidth: 100,
  },
  editButtonContainer: {
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  editButtonBackground: {
    width: 44,
    height: 43,
    backgroundColor: '#60584d',
    borderRadius: 200,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  editIcon: {
    width: 25,
    height: 25,
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
