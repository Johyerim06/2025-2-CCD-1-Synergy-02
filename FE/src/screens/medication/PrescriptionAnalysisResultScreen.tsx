import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp as RNRouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Router';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrescriptionAnalysisResult'>;
type PrescriptionAnalysisResultRouteProp = RNRouteProp<RootStackParamList, 'PrescriptionAnalysisResult'>;


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

export default function PrescriptionAnalysisResultScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PrescriptionAnalysisResultRouteProp>();
  

  const source = route.params?.source || 'prescription';
  

  const headerText = source === 'medicationEnvelope' ? '약봉투 분석 완료' : '처방전 분석 완료';
  

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryText, setCategoryText] = useState('복통약'); // 초기값: API에서 받아온 데이터

  // T실제 API에서 받아온 데이터로 교체
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
    navigation.navigate('Home');
  };


  const handleCategoryEditPress = () => {
    if (isEditingCategory) {
      // API 호출
      // PUT /api/v1/users/me/medications/{umno}/category

      setIsEditingCategory(false);
    } else {

      setCategoryText(prescriptionData.category);
      setIsEditingCategory(true);
    }
  };


  const getCombinationText = (combination?: string) => {
    if (!combination) return '';
    const timeMap: { [key: string]: string } = {
      breakfast: '아침',
      lunch: '점심',
      dinner: '저녁',
    };
    return combination
      .split(',')
      .map((time) => timeMap[time] || time)
      .join(', ');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerText}>{headerText}</Text>
        </View>

        <View style={styles.content}>
          {/* 카테고리 태그와 버튼 */}
          <View style={styles.categoryContainer}>
            <View style={styles.categoryTagContainer}>
              {isEditingCategory ? (
                <TextInput
                  style={styles.categoryTagInput}
                  value={categoryText}
                  onChangeText={setCategoryText}
                  autoFocus={true}
                  onSubmitEditing={handleCategoryEditPress}
                  onBlur={handleCategoryEditPress}
                />
              ) : (
                <Text style={styles.categoryTagText}>{prescriptionData.category}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={handleCategoryEditPress}
            >
              <Image 
                source={require('../../../assets/images/PrescriptionAnalysisResultScreen/수정.png')}
                style={styles.categoryButtonIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* 병원명 및 복용 횟수 */}
          <Text style={styles.hospitalInfo}>
            {prescriptionData.hospital} - 1일 {prescriptionData.taken}회
          </Text>

          {/* 약품 목록 */}
          <View style={styles.medicinesContainer}>
            <View style={styles.medicineCard}>
              {prescriptionData.medicines.map((medicine, index) => (
                <View 
                  key={medicine.mdno} 
                  style={[
                    styles.medicineItem,
                    index === prescriptionData.medicines.length - 1 && styles.medicineItemLast
                  ]}
                >
                  {/* 왼쪽 세로선 */}
                  <View style={styles.medicineVerticalLine} />
                  
                  <View style={styles.medicineContent}>
                    {/* 약품 번호 및 분류 */}
                    <View style={styles.medicineHeader}>
                      <View style={styles.medicineNumberContainer}>
                        <Text style={styles.medicineNumber}>#{index + 1}</Text>
                        <View style={styles.classificationTag}>
                          <Text style={styles.classificationText}>{medicine.classification}</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.imageButton}>
                        <Text style={styles.imageButtonText}>이미지</Text>
                      </TouchableOpacity>
                    </View>

                    {/* 약품 이름 */}
                    <Text style={styles.medicineName}>{medicine.name}</Text>

                    {/* 병용 섭취 주의 경고 */}
                    {medicine.warning && (
                      <View style={styles.warningBox}>
                        <View style={styles.warningHeader}>
                          <Image 
                            source={require('../../../assets/images/PrescriptionAnalysisResultScreen/병용섭취주의.png')}
                            style={styles.warningIcon}
                            resizeMode="contain"
                          />
                          <View style={styles.warningTextContainer}>
                            <Text style={styles.warningTitle}>{medicine.warning.title}</Text>
                            <Text style={styles.warningText}>
                              {medicine.warning.items.join(', ')}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 홈으로 버튼 */}
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Text style={styles.homeButtonText}>홈으로</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryTagContainer: {
    backgroundColor: '#fff4c9',
    borderWidth: 1,
    borderColor: '#545045',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 43,
    justifyContent: 'center',
  },
  categoryTagText: {
    fontFamily: 'NotoSansKR',
    fontSize: 20,
    fontWeight: '600',
    color: '#545045',
    lineHeight: 42,
  },
  categoryTagInput: {
    fontFamily: 'NotoSansKR',
    fontSize: 20,
    fontWeight: '600',
    color: '#545045',
    lineHeight: 42,
    padding: 0,
    margin: 0,
    textAlign: 'center',
    minWidth: 100,
  },
  categoryButton: {
    width: 44,
    height: 43,
    borderRadius: 200,
    backgroundColor: '#60584d',
    marginLeft: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryButtonIcon: {
    width: 25,
    height: 25,
  },
  hospitalInfo: {
    fontFamily: 'NotoSansKR',
    fontSize: 28,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 42,
    marginBottom: 16,
  },
  medicinesContainer: {
    marginBottom: 24,
  },
  medicineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  medicineItem: {
    position: 'relative',
    marginBottom: 32,
  },
  medicineItemLast: {
    marginBottom: 0,
  },
  medicineVerticalLine: {
    position: 'absolute',
    left: 14,
    top: 0,
    width: 2,
    height: 140,
    backgroundColor: '#60584d',
  },
  medicineContent: {
    paddingLeft: 27,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicineNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicineNumber: {
    fontFamily: 'NotoSansKR',
    fontSize: 18,
    fontWeight: '400',
    color: '#99a1af',
    marginRight: 8,
    lineHeight: 27,
  },
  classificationTag: {
    backgroundColor: '#ffeda5',
    borderRadius: 200,
    paddingHorizontal: 12,
    paddingVertical: 4,
    height: 32,
    justifyContent: 'center',
  },
  classificationText: {
    fontFamily: 'NotoSansKR',
    fontSize: 16,
    fontWeight: '700',
    color: '#60584d',
    lineHeight: 24,
  },
  imageButton: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#d7d7d7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 16,
    fontWeight: '400',
    color: '#60584d',
    lineHeight: 24,
  },
  medicineName: {
    fontFamily: 'NotoSansKR',
    fontSize: 24,
    fontWeight: '700',
    color: '#60584d',
    lineHeight: 36,
    marginBottom: 16,
  },
  warningBox: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffebee',
    borderRadius: 10,
    padding: 18,
    marginTop: 8,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    marginTop: 2,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontFamily: 'NotoSansKR',
    fontSize: 14,
    fontWeight: '700',
    color: '#d32f2f',
    lineHeight: 21,
    marginBottom: 8,
  },
  warningText: {
    fontFamily: 'NotoSansKR',
    fontSize: 14,
    fontWeight: '400',
    color: '#c10007',
    lineHeight: 24,
    letterSpacing: -0.31,
  },
  homeButton: {
    width: 320,
    height: 66,
    borderRadius: 200,
    backgroundColor: '#60584d',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  homeButtonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
    color: '#ffffff',
  },
});

