import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import * as SplashScreenExpo from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import * as Notifications from 'expo-notifications';
import { setupNotificationListeners, createNotificationChannel } from './src/services/notificationService';

// Import all screens
import SplashScreen from './src/screens/SplashScreen';
import { IncomingCallScreen, ActiveCallScreen } from './src/screens';
import IntakeAlarmQuizScreen from './src/screens/Intake/IntakeAlarmQuizScreen';
import IntakeRecordListScreen from './src/screens/Intake/IntakeRecordListScreen';
import IntakeProgressRecordScreen from './src/screens/Intake/IntakeProgressRecordScreen';
import IntakeRecordDetailsScreen from './src/screens/Intake/IntakeRecordDetailsScreen';
import IntakeSideEffectCheck from './src/screens/Intake/IntakeSideEffectCheck';
import PrescriptionCaptureScreen from './src/screens/Prescription/PrescriptionCaptureScreen';
import PrescriptionProcessingScreen from './src/screens/Prescription/PrescriptionProcessingScreen';
import PrescriptionIntakeTimeSelectScreen from './src/screens/Prescription/PrescriptionIntakeTimeSelectScreen';
import PrescriptionAnalysisResultScreen from './src/screens/Prescription/PrescriptionAnalysisResultScreen';
import PrescriptionDetailScreen from './src/screens/Prescription/PrescriptionDetailScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
import HomeScreenEmpty from './src/screens/Home/HomeScreenEmpty';
import HomeScreenList from './src/screens/Home/HomeScreenList';
import OnboardingWelcomeScreen from './src/screens/onboarding/OnboardingWelcomeScreen';
import OnboardingSignUp from './src/screens/onboarding/OnboardingSignUp';
import OnboardingAlarmGuide from './src/screens/onboarding/OnboardingAlarmGuide';
import OnboardingMorningTimeSet from './src/screens/onboarding/OnboardingMorningTimeSet';
import OnboardingLunchTimeSet from './src/screens/onboarding/OnboardingLunchTimeSet';
import OnboardingEveningTimeSet from './src/screens/onboarding/OnboardingEveningTimeSet';
import OnboardingBedTimeSet from './src/screens/onboarding/OnboardingBedTimeSet';
import EditInfoSelect from './src/screens/edit/EditInfoSelect';
import UserInfoEdit from './src/screens/edit/UserInfoEdit';
import MorningTimeEditScreen from './src/screens/edit/MorningTimeEditScreen';
import LunchTimeEditScreen from './src/screens/edit/LunchTimeEditScreen';
import EveningTimeEditScreen from './src/screens/edit/EveningTimeEditScreen';
import BedTimeEditScreen from './src/screens/edit/BedTimeEditScreen';

// 스플래시 화면을 자동으로 숨기지 않도록 설정
SplashScreenExpo.preventAutoHideAsync();

// 미리 로드할 모든 이미지
const imageAssets = [
  require('./assets/SplashScreen.png'),
  require('./assets/images/BedTimeIcon.png'),
  require('./assets/images/ConstipationUrinationDifficulty.png'),
  require('./assets/images/Dizziness.png'),
  require('./assets/images/DrowsinessSedation.png'),
  require('./assets/images/DryMouth.png'),
  require('./assets/images/EveningIcon.png'),
  require('./assets/images/Fatigue.png'),
  require('./assets/images/HomeScreenEmptyPill.png'),
  require('./assets/images/HomeScreenMyInfo.png'),
  require('./assets/images/HomeScreenPrescriptionBag.png'),
  require('./assets/images/HomeScreenPrescriptionRegistration.png'),
  require('./assets/images/icon.png'),
  require('./assets/images/IndigestionHeartburn.png'),
  require('./assets/images/LunchIcon.png'),
  require('./assets/images/MorningIcon.png'),
  require('./assets/images/PencilIcon.png'),
  require('./assets/images/PillImage.png'),
  require('./assets/images/PillImage2.png'),
  require('./assets/images/SwellingEdema.png'),
  require('./assets/images/VoiceWaveIcon.png'),
  require('./assets/images/Home/내정보수정아이콘.png'),
  require('./assets/images/Home/약봉투아이콘.png'),
  require('./assets/images/Home/약아이콘.png'),
  require('./assets/images/Home/처방전아이콘.png'),
];

// 이미지 캐싱 함수
function cacheImages(images: any[]) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Asset.fromURI(image).downloadAsync();
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

type ScreenName = 
  | 'SplashScreen'
  | 'Menu'
  | 'IncomingCallScreen'
  | 'ActiveCallScreen'
  | 'IntakeAlarmQuizScreen'
  | 'IntakeRecordListScreen'
  | 'IntakeProgressRecordScreen'
  | 'IntakeRecordDetailsScreen'
  | 'IntakeSideEffectCheck'
  | 'PrescriptionCaptureScreen'
  | 'PrescriptionProcessingScreen'
  | 'PrescriptionIntakeTimeSelectScreen'
  | 'PrescriptionAnalysisResultScreen'
  | 'PrescriptionDetailScreen'
  | 'Home'
  | 'HomeScreenEmpty'
  | 'HomeScreenList'
  | 'OnboardingWelcomeScreen'
  | 'OnboardingSignUp'
  | 'OnboardingAlarmGuide'
  | 'OnboardingMorningTimeSet'
  | 'OnboardingLunchTimeSet'
  | 'OnboardingEveningTimeSet'
  | 'OnboardingBedTimeSet'
  | 'EditInfoSelect'
  | 'UserInfoEdit'
  | 'MorningTimeEditScreen'
  | 'LunchTimeEditScreen'
  | 'EveningTimeEditScreen'
  | 'BedTimeEditScreen';

// 처방전 데이터 타입
interface Medication {
  id: number;
  category: string;
  hospital: string;
  frequency: number;
  startDate: string;
}

type TimePeriod = 'breakfast' | 'lunch' | 'dinner' | 'bedtime';

// 복약 기록 데이터
interface RecordItem {
  id: string;
  title: string;
  dateRange: string;
}

// 샘플 복약 기록 데이터
const sampleRecords: RecordItem[] = [
  {
    id: '1',
    title: '가람병원(소화불량)',
    dateRange: '2025년 10월 14일 - 2025년 10월 25일',
  },
  {
    id: '2',
    title: '서울병원(두통)',
    dateRange: '2025년 10월 10일 - 2025년 10월 20일',
  },
  {
    id: '3',
    title: '강남병원(감기)',
    dateRange: '2025년 9월 14일 - 2025년 9월 25일',
  },
  {
    id: '4',
    title: '연세병원(고혈압)',
    dateRange: '2025년 9월 1일 - 2025년 9월 30일',
  },
  {
    id: '5',
    title: '삼성병원(당뇨)',
    dateRange: '2025년 8월 14일 - 2025년 8월 25일',
  },
  {
    id: '6',
    title: '서울대병원(알레르기)',
    dateRange: '2025년 8월 1일 - 2025년 8월 10일',
  },
  {
    id: '7',
    title: '가톨릭병원(복통)',
    dateRange: '2025년 7월 14일 - 2025년 7월 25일',
  },
  {
    id: '8',
    title: '세브란스병원(피부질환)',
    dateRange: '2025년 7월 1일 - 2025년 7월 15일',
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('SplashScreen');
  const [appIsReady, setAppIsReady] = useState(false);
  const [captureMode, setCaptureMode] = useState<'prescription' | 'envelope'>('prescription');
  const [medications, setMedications] = useState<Medication[]>([]); // 처방전 데이터
  const [showRetakeMessage, setShowRetakeMessage] = useState(false); // 재촬영 메시지 표시 여부
  const [selectedMedicationId, setSelectedMedicationId] = useState<number | null>(null); // 선택된 약 ID
  const [selectedTimePeriods, setSelectedTimePeriods] = useState<TimePeriod[]>([]); // 선택된 복약 시간대
  const [currentTimeEditIndex, setCurrentTimeEditIndex] = useState(0); // 현재 수정 중인 시간대 인덱스
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null); // 선택된 복약 기록 ID
  const [isEditingFromPrescription, setIsEditingFromPrescription] = useState(false); // 처방전 상세에서 시간 수정 중인지 여부

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // 모든 이미지 미리 로드
        const imageAssetPromises = cacheImages(imageAssets);
        await Promise.all([...imageAssetPromises]);
        
        // 알림 채널 설정 (Android)
        await createNotificationChannel();
        
        console.log('All assets loaded successfully');
      } catch (e) {
        console.warn('Error loading assets:', e);
      } finally {
        // 모든 리소스 로딩 완료
        setAppIsReady(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  // 알림 수신 리스너 설정
  useEffect(() => {
    const cleanup = setupNotificationListeners(
      // 포그라운드에서 알림 받을 때
      (notification) => {
        console.log('알림 수신:', notification);
        // 알림 데이터에서 이벤트 타입 확인
        const data = notification.request.content.data;
        if (data?.type === 'incoming_call' || data?.type === 'event') {
          // IncomingCallScreen으로 이동
          setCurrentScreen('IncomingCallScreen');
        }
      },
      // 알림 클릭 시 (백그라운드/포그라운드 모두)
      (response) => {
        console.log('알림 클릭:', response);
        const data = response.notification.request.content.data;
        if (data?.type === 'incoming_call' || data?.type === 'event') {
          // IncomingCallScreen으로 이동
          setCurrentScreen('IncomingCallScreen');
        }
      }
    );

    return cleanup;
  }, []);

  // 스플래시 화면 표시 후 2초 뒤에 OnboardingWelcomeScreen으로 전환
  useEffect(() => {
    if (appIsReady && currentScreen === 'SplashScreen') {
      const timer = setTimeout(() => {
        setCurrentScreen('OnboardingWelcomeScreen');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [appIsReady, currentScreen]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // 스플래시 화면 숨기기
      await SplashScreenExpo.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // 로딩 중에는 네이티브 스플래시 화면 표시
  }

  const screens = [
    { category: 'Splash', items: [
      { name: 'SplashScreen', label: '🎨 스플래시 화면' },
    ]},
    { category: 'Call', items: [
      { name: 'IncomingCallScreen', label: '📞 전화 수신' },
      { name: 'ActiveCallScreen', label: '📞 통화 중' },
    ]},
    { category: 'Intake', items: [
      { name: 'IntakeAlarmQuizScreen', label: '💊 복약 퀴즈' },
      { name: 'IntakeRecordListScreen', label: '📋 복약 기록 목록' },
      { name: 'IntakeProgressRecordScreen', label: '📊 복약 진행 기록' },
      { name: 'IntakeRecordDetailsScreen', label: '📋 복약 기록 상세' },
      { name: 'IntakeSideEffectCheck', label: '⚠️ 부작용 체크' },
    ]},
    { category: 'Prescription', items: [
      { name: 'PrescriptionCaptureScreen', label: '📷 처방전 촬영' },
      { name: 'PrescriptionProcessingScreen', label: '⏳ 처방전 처리중' },
      { name: 'PrescriptionIntakeTimeSelectScreen', label: '⏰ 복약 시간 선택' },
      { name: 'PrescriptionAnalysisResultScreen', label: '📄 처방전 분석 결과' },
      { name: 'PrescriptionDetailScreen', label: '📄 처방전 상세' },
    ]},
    { category: 'Home', items: [
      { name: 'Home', label: '🏠 홈 (통합)' },
      { name: 'HomeScreenEmpty', label: '🏠 홈 (비어있음 - 레거시)' },
      { name: 'HomeScreenList', label: '🏠 홈 (목록 - 레거시)' },
    ]},
    { category: 'Onboarding', items: [
      { name: 'OnboardingWelcomeScreen', label: '👋 온보딩 시작' },
      { name: 'OnboardingSignUp', label: '✍️ 회원가입' },
      { name: 'OnboardingAlarmGuide', label: '🔔 알람 가이드' },
      { name: 'OnboardingMorningTimeSet', label: '🌅 아침 시간 설정' },
      { name: 'OnboardingLunchTimeSet', label: '☀️ 점심 시간 설정' },
      { name: 'OnboardingEveningTimeSet', label: '🌆 저녁 시간 설정' },
      { name: 'OnboardingBedTimeSet', label: '🌙 취침 시간 설정' },
    ]},
    { category: 'Edit', items: [
      { name: 'EditInfoSelect', label: '⚙️ 정보 수정 선택' },
      { name: 'UserInfoEdit', label: '👤 사용자 정보 수정' },
      { name: 'MorningTimeEditScreen', label: '🌅 아침 시간 수정' },
      { name: 'LunchTimeEditScreen', label: '☀️ 점심 시간 수정' },
      { name: 'EveningTimeEditScreen', label: '🌆 저녁 시간 수정' },
      { name: 'BedTimeEditScreen', label: '🌙 취침 시간 수정' },
    ]},
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SplashScreen': return <SplashScreen />;
      case 'IncomingCallScreen': return <IncomingCallScreen />;
      case 'ActiveCallScreen': return <ActiveCallScreen />;
      case 'IntakeAlarmQuizScreen': return <IntakeAlarmQuizScreen />;
      case 'IntakeRecordListScreen': return <IntakeRecordListScreen 
        onRecordPress={(recordId) => {
          console.log('선택된 기록:', recordId);
          setSelectedRecordId(recordId);
          setCurrentScreen('IntakeProgressRecordScreen');
        }}
        onExit={() => setCurrentScreen('Home')}
      />;
      case 'IntakeProgressRecordScreen': return <IntakeProgressRecordScreen 
        recordData={sampleRecords.find(r => r.id === selectedRecordId)}
        onExit={() => setCurrentScreen('IntakeRecordListScreen')}
        onDetailRecord={() => setCurrentScreen('IntakeRecordDetailsScreen')}
      />;
      case 'IntakeRecordDetailsScreen': return <IntakeRecordDetailsScreen onExit={() => setCurrentScreen('IntakeProgressRecordScreen')} />;
      case 'IntakeSideEffectCheck': return <IntakeSideEffectCheck />;
      case 'PrescriptionCaptureScreen': return <PrescriptionCaptureScreen 
        mode={captureMode}
        showRetakeMessage={showRetakeMessage}
        onCapture={() => {
          // 촬영 즉시 Processing 화면으로 이동
          setShowRetakeMessage(false);
          setCurrentScreen('PrescriptionProcessingScreen');
        }}
      />;
      case 'PrescriptionProcessingScreen': return <PrescriptionProcessingScreen 
        onSuccess={() => {
          // OCR 성공 - 약 데이터 추가 후 IntakeTimeSelect로 이동
          setMedications([
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
          ]);
          setCurrentScreen('PrescriptionIntakeTimeSelectScreen');
        }}
        onFailure={() => {
          // OCR 실패 - Capture로 복귀 + 재촬영 메시지
          setShowRetakeMessage(true);
          setCurrentScreen('PrescriptionCaptureScreen');
        }}
      />;
      case 'PrescriptionIntakeTimeSelectScreen': return <PrescriptionIntakeTimeSelectScreen 
        onNext={(timePeriods) => {
          setSelectedTimePeriods(timePeriods);
          setCurrentScreen('PrescriptionAnalysisResultScreen');
        }} 
      />;
      case 'PrescriptionAnalysisResultScreen': return <PrescriptionAnalysisResultScreen onGoHome={() => setCurrentScreen('Home')} />;
      case 'PrescriptionDetailScreen': return <PrescriptionDetailScreen 
        medication={medications.find(m => m.id === selectedMedicationId)}
        onGoHome={() => setCurrentScreen('Home')}
        onEditTime={() => {
          // 시간 수정 시작 - 처방전에서 선택한 시간대만
          setIsEditingFromPrescription(true);
          setCurrentTimeEditIndex(0);
          if (selectedTimePeriods.length > 0) {
            const firstPeriod = selectedTimePeriods[0];
            if (firstPeriod === 'breakfast') setCurrentScreen('MorningTimeEditScreen');
            else if (firstPeriod === 'lunch') setCurrentScreen('LunchTimeEditScreen');
            else if (firstPeriod === 'dinner') setCurrentScreen('EveningTimeEditScreen');
            else if (firstPeriod === 'bedtime') setCurrentScreen('BedTimeEditScreen');
          }
        }}
      />;
      case 'Home': return <HomeScreen 
        medications={medications}
        onPrescriptionRegister={() => {
          setCaptureMode('prescription');
          setCurrentScreen('PrescriptionCaptureScreen');
        }} 
        onPillEnvelopeRegister={() => {
          setCaptureMode('envelope');
          setCurrentScreen('PrescriptionCaptureScreen');
        }}
        onEditInfo={() => setCurrentScreen('EditInfoSelect')}
        onMedicationRecord={() => setCurrentScreen('IntakeRecordListScreen')}
        onMedicationPress={(id) => {
          console.log('약 상세:', id);
          setSelectedMedicationId(id);
          setCurrentScreen('PrescriptionDetailScreen');
        }}
      />;
      case 'HomeScreenEmpty': return <HomeScreenEmpty 
        onPrescriptionRegister={() => {
          setCaptureMode('prescription');
          setCurrentScreen('PrescriptionCaptureScreen');
        }} 
        onPillEnvelopeRegister={() => {
          setCaptureMode('envelope');
          setCurrentScreen('PrescriptionCaptureScreen');
        }}
        onEditInfo={() => setCurrentScreen('EditInfoSelect')}
      />;
      case 'HomeScreenList': return <HomeScreenList />;
      case 'OnboardingWelcomeScreen': return <OnboardingWelcomeScreen onStartPress={() => setCurrentScreen('OnboardingSignUp')} />;
      case 'OnboardingSignUp': return <OnboardingSignUp onSignUpComplete={() => setCurrentScreen('OnboardingAlarmGuide')} />;
      case 'OnboardingAlarmGuide': return <OnboardingAlarmGuide onComplete={() => setCurrentScreen('OnboardingMorningTimeSet')} />;
      case 'OnboardingMorningTimeSet': return <OnboardingMorningTimeSet onNext={() => setCurrentScreen('OnboardingLunchTimeSet')} />;
      case 'OnboardingLunchTimeSet': return <OnboardingLunchTimeSet onNext={() => setCurrentScreen('OnboardingEveningTimeSet')} />;
      case 'OnboardingEveningTimeSet': return <OnboardingEveningTimeSet onNext={() => setCurrentScreen('OnboardingBedTimeSet')} />;
      case 'OnboardingBedTimeSet': return <OnboardingBedTimeSet onComplete={() => setCurrentScreen('Home')} />;
      case 'EditInfoSelect': return <EditInfoSelect 
        onBasicInfo={() => setCurrentScreen('UserInfoEdit')}
        onMedicationTime={() => {
          // 온보딩처럼 모든 시간대 수정 (아침 → 점심 → 저녁 → 취침)
          setIsEditingFromPrescription(false);
          setSelectedTimePeriods(['breakfast', 'lunch', 'dinner', 'bedtime']);
          setCurrentTimeEditIndex(0);
          setCurrentScreen('MorningTimeEditScreen');
        }}
        onExit={() => setCurrentScreen('Home')}
      />;
      case 'UserInfoEdit': return <UserInfoEdit onComplete={() => setCurrentScreen('EditInfoSelect')} />;
      case 'MorningTimeEditScreen': return <MorningTimeEditScreen onNext={() => {
        // 다음 시간대로 이동
        const nextIndex = currentTimeEditIndex + 1;
        if (nextIndex < selectedTimePeriods.length) {
          setCurrentTimeEditIndex(nextIndex);
          const nextPeriod = selectedTimePeriods[nextIndex];
          if (nextPeriod === 'lunch') setCurrentScreen('LunchTimeEditScreen');
          else if (nextPeriod === 'dinner') setCurrentScreen('EveningTimeEditScreen');
          else if (nextPeriod === 'bedtime') setCurrentScreen('BedTimeEditScreen');
        } else {
          // 마지막 시간대
          setCurrentScreen(isEditingFromPrescription ? 'PrescriptionDetailScreen' : 'EditInfoSelect');
        }
      }} />;
      case 'LunchTimeEditScreen': return <LunchTimeEditScreen onNext={() => {
        const nextIndex = currentTimeEditIndex + 1;
        if (nextIndex < selectedTimePeriods.length) {
          setCurrentTimeEditIndex(nextIndex);
          const nextPeriod = selectedTimePeriods[nextIndex];
          if (nextPeriod === 'dinner') setCurrentScreen('EveningTimeEditScreen');
          else if (nextPeriod === 'bedtime') setCurrentScreen('BedTimeEditScreen');
        } else {
          setCurrentScreen(isEditingFromPrescription ? 'PrescriptionDetailScreen' : 'EditInfoSelect');
        }
      }} />;
      case 'EveningTimeEditScreen': return <EveningTimeEditScreen onNext={() => {
        const nextIndex = currentTimeEditIndex + 1;
        if (nextIndex < selectedTimePeriods.length) {
          setCurrentTimeEditIndex(nextIndex);
          const nextPeriod = selectedTimePeriods[nextIndex];
          if (nextPeriod === 'bedtime') setCurrentScreen('BedTimeEditScreen');
        } else {
          setCurrentScreen(isEditingFromPrescription ? 'PrescriptionDetailScreen' : 'EditInfoSelect');
        }
      }} />;
      case 'BedTimeEditScreen': return <BedTimeEditScreen onComplete={() => {
        // 마지막 시간대 - 어디서 시작했는지에 따라 복귀
        setCurrentScreen(isEditingFromPrescription ? 'PrescriptionDetailScreen' : 'EditInfoSelect');
      }} />;
      default: return null;
    }
  };

  if (currentScreen !== 'Menu') {
    return (
      <View style={styles.container} onLayout={onLayoutRootView}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentScreen('Menu')}
        >
          <Text style={styles.backButtonText}>← 메뉴로 돌아가기</Text>
        </TouchableOpacity>
        {renderScreen()}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.menuContainer} onLayout={onLayoutRootView}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuTitle}>🎨 화면 선택 메뉴</Text>
        <Text style={styles.menuSubtitle}>보고 싶은 화면을 선택하세요</Text>
      </View>
      <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
        {screens.map((section) => (
          <View key={section.category} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.category}</Text>
            {section.items.map((screen) => (
              <TouchableOpacity
                key={screen.name}
                style={styles.menuButton}
                onPress={() => setCurrentScreen(screen.name as ScreenName)}
              >
                <Text style={styles.menuButtonText}>{screen.label}</Text>
            </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  menuHeader: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  menuSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  menuScroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  menuButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuButtonText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
});