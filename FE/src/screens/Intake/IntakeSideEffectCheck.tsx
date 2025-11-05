import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface SideEffect {
  id: string;
  name: string;
  icon: any;
}

const sideEffects: SideEffect[] = [
  { id: 'indigestion', name: '소화불량, 속쓰림', icon: require('../../../assets/images/IndigestionHeartburn.png') },
  { id: 'constipation', name: '변비, 소변불편', icon: require('../../../assets/images/ConstipationUrinationDifficulty.png') },
  { id: 'drowsiness', name: '졸림, 진정작용', icon: require('../../../assets/images/DrowsinessSedation.png') },
  { id: 'fatigue', name: '피로감', icon: require('../../../assets/images/Fatigue.png') },
  { id: 'dizziness', name: '어지러움', icon: require('../../../assets/images/Dizziness.png') },
  { id: 'swelling', name: '부종', icon: require('../../../assets/images/SwellingEdema.png') },
  { id: 'dryMouth', name: '입마름', icon: require('../../../assets/images/DryMouth.png') },
  { id: 'none', name: '부작용\n없음', icon: null },
];

export default function IntakeSideEffectCheck() {
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;

  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);

  const isNextButtonActive = selectedEffects.length > 0;

  const handleEffectSelect = (id: string) => {
    if (id === 'none') {
      // "부작용 없음" 선택 시 다른 모든 선택 해제
      if (selectedEffects.includes('none')) {
        setSelectedEffects([]);
      } else {
        setSelectedEffects(['none']);
      }
    } else {
      // 다른 부작용 선택 시
      if (selectedEffects.includes(id)) {
        // 이미 선택된 경우 해제
        setSelectedEffects(selectedEffects.filter(effect => effect !== id));
      } else {
        // 선택되지 않은 경우 추가 (부작용 없음은 제거)
        setSelectedEffects([...selectedEffects.filter(effect => effect !== 'none'), id]);
      }
    }
  };

  const handleNext = () => {
    if (isNextButtonActive) {
      console.log('선택된 부작용:', selectedEffects);
      // TODO: 네비게이션 연결
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerText}>부작용 체크</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>
          {/* 부작용 버튼 그리드 */}
          <View style={styles.effectButtonsContainer}>
            {sideEffects.map((effect) => {
              const isSelected = selectedEffects.includes(effect.id);
              return (
                <TouchableOpacity
                  key={effect.id}
                  style={[
                    styles.effectButton,
                    isSelected ? styles.effectButtonSelected : styles.effectButtonUnselected,
                  ]}
                  onPress={() => handleEffectSelect(effect.id)}
                  activeOpacity={0.8}
                >
                  {/* 아이콘 영역 */}
                  {effect.icon && (
                    <View style={styles.iconCircle}>
                      <Image 
                        source={effect.icon}
                        style={styles.iconImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                  
                  {/* 부작용 없음은 아이콘 없이 텍스트만 */}
                  {!effect.icon && (
                    <View style={styles.noEffectTextContainer}>
                      <Text style={[
                        styles.noEffectText,
                        isSelected && styles.effectButtonTextSelected,
                      ]}>{effect.name}</Text>
                    </View>
                  )}
                  
                  {/* 텍스트 (아이콘 있는 경우) */}
                  {effect.icon && (
                    <Text style={[
                      styles.effectButtonText,
                      isSelected && styles.effectButtonTextSelected,
                    ]}>{effect.name}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* 선택 완료 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            isNextButtonActive ? styles.nextButtonActive : styles.nextButtonInactive,
          ]}
          onPress={handleNext}
          disabled={!isNextButtonActive}
        >
          <Text
            style={[
              styles.nextButtonText,
              isNextButtonActive ? styles.nextButtonTextActive : styles.nextButtonTextInactive,
            ]}
          >
            선택 완료
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    width: '100%',
    height: 56,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  headerText: {
    fontSize: 27,
    fontWeight: '700' as any,
    color: '#1A1A1A',
    lineHeight: 32.4,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 100,
    alignItems: 'center' as any,
    flexGrow: 1,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  effectButtonsContainer: {
    width: '100%',
    flexDirection: 'row' as any,
    flexWrap: 'wrap' as any,
    justifyContent: 'space-between' as any,
  },
  effectButton: {
    width: 164,
    height: 144,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ffcc02',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    marginBottom: 24,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  effectButtonSelected: {
    backgroundColor: '#60584d',
    borderColor: '#60584d',
  },
  effectButtonUnselected: {
    backgroundColor: '#ffffff',
    borderColor: '#ffcc02',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    marginBottom: 8,
    overflow: 'hidden' as any,
  },
  iconImage: {
    width: 70,
    height: 70,
  },
  noEffectTextContainer: {
    flex: 1,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  effectButtonText: {
    fontSize: 18,
    fontWeight: '500' as any,
    color: '#5e5b50',
    lineHeight: 20,
    textAlign: 'center',
  },
  noEffectText: {
    fontSize: 27,
    fontWeight: '700' as any,
    color: '#60584d',
    lineHeight: 32.4,
    textAlign: 'center',
  },
  effectButtonTextSelected: {
    color: '#ffffff',
  },
  buttonContainer: {
    position: 'absolute' as any,
    left: 16,
    right: 16,
    bottom: 36,
    alignItems: 'center' as any,
  },
  nextButton: {
    width: '100%',
    maxWidth: 360,
    height: 66,
    borderRadius: 200,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  nextButtonActive: {
    backgroundColor: '#60584d',
  },
  nextButtonInactive: {
    backgroundColor: '#c4bcb1',
  },
  nextButtonText: {
    fontSize: 27,
    fontWeight: '700' as any,
    lineHeight: 32.4,
  },
  nextButtonTextActive: {
    color: '#ffffff',
  },
  nextButtonTextInactive: {
    color: '#ffffff',
  },
});

