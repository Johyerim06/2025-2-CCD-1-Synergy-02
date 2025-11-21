import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  InteractionManager,
} from 'react-native';
import { Image } from 'expo-image';

interface IntakeAlarmQuizScreenProps {
  onMedicationTaken?: () => void;
  onThreeTimesWrong?: () => void;
  initialWrongCount?: number; // 전화에서 돌아왔을 때 3번 틀린 상태 유지
}

const IntakeAlarmQuizScreen = React.memo(({ onMedicationTaken, onThreeTimesWrong, initialWrongCount = 0 }: IntakeAlarmQuizScreenProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState(initialWrongCount >= 3);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongCount, setWrongCount] = useState(initialWrongCount);
  const [isInteractionComplete, setIsInteractionComplete] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;

  const correctAnswerId = '1'; // 정답: 감기약

  const answers = [
    { id: '1', text: '감기약' },
    { id: '2', text: '해열제' },
    { id: '3', text: '혈압약' },
    { id: '4', text: '복통약' },
  ];

  // 화면 전환 애니메이션 이후에 실행
  useEffect(() => {
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      setIsInteractionComplete(true);
      console.log('IntakeAlarmQuizScreen: Interactions complete');
    });

    return () => interactionPromise.cancel();
  }, []);

  const handleSelectAnswer = useCallback((answerId: string) => {
    setSelectedAnswer(answerId);
    
    // 정답 체크
    if (answerId !== correctAnswerId) {
      // 오답인 경우
      const newWrongCount = wrongCount + 1;
      setWrongCount(newWrongCount);
      setIsWrong(true);
      setIsCorrect(false);
      
      // 3번 연속 오답이 아닌 경우만 3초 후 퀴즈로 돌아감
      if (newWrongCount < 3) {
        setTimeout(() => {
          setIsWrong(false);
          setSelectedAnswer(null); // 선택 초기화
        }, 3000);
      } else {
        // 3번 연속 오답인 경우 바로 전화 화면으로 이동
        onThreeTimesWrong?.();
      }
    } else {
      // 정답인 경우
      setIsWrong(false);
      setIsCorrect(true);
    }
  }, [wrongCount, onThreeTimesWrong]);

  const handleSubmit = useCallback(() => {
    console.log('약 먹었어요 버튼 클릭');
    console.log('선택된 답변:', selectedAnswer);
    console.log('오답 여부:', isWrong);
    onMedicationTaken?.();
  }, [selectedAnswer, isWrong, onMedicationTaken]);

  const isButtonActive = isCorrect || wrongCount >= 3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>
          {/* 상단 약 정보 카드 */}
          <View style={styles.medicineCard}>
            <Image
              source={require('../../../assets/images/PillImage.png')}
              style={styles.pillImage}
              contentFit="contain"
              cachePolicy="disk"
              priority="high"
              transition={150}
            />
            <View style={styles.medicineTextContainer}>
              <Text style={styles.hospitalText}>가람병원</Text>
              <Text style={styles.medicineNameText}>감기약</Text>
            </View>
          </View>

          {/* 퀴즈 제목 */}
          <View style={styles.quizTitleContainer}>
            <Text style={styles.quizTitleMain}>오늘의 복약 퀴즈!</Text>
            <Text style={styles.quizTitleSub}>정답을 맞춰보세요</Text>
          </View>

            {/* 오답인 경우 오답 UI 표시 */}
            {isWrong && wrongCount >= 3 ? (
              /* 3번 연속 오답인 경우 정답 공개 */
              <View style={styles.threeTimesWrongBox}>
                <View style={styles.threeTimesWrongTextContainer}>
                  <Text style={styles.threeTimesWrongMainText}>오답</Text>
                  <Text style={styles.threeTimesWrongSubText}>
                    정답은{'\n'}
                    {answers.find(a => a.id === correctAnswerId)?.text}이예요.
                  </Text>
                </View>
              </View>
            ) : isWrong ? (
              /* 1~2번 오답인 경우 */
              <View style={styles.wrongAnswerBox}>
                <View style={styles.wrongTextContainer}>
                  <Text style={styles.wrongMainText}>오답</Text>
                  <Text style={styles.wrongSubText}>다시 풀어주세요</Text>
                </View>
              </View>
            ) : isCorrect ? (
              /* 정답인 경우 정답 UI 표시 */
              <View style={styles.correctAnswerBox}>
                <View style={styles.correctTextContainer}>
                  <Text style={styles.correctMainText}>정답</Text>
                  <Text style={styles.correctSubText}>
                    정답은{'\n'}
                    {answers.find(a => a.id === selectedAnswer)?.text}이예요.
                  </Text>
                </View>
              </View>
            ) : (
              /* 퀴즈 컨테이너 - 오답/정답이 아닐 때만 표시 */
              <View style={styles.quizQuestionBox}>
                <Text style={styles.quizQuestionText}>오늘 섭취할 약은 무엇일까요?</Text>

                {/* 답변 버튼들 */}
                <View style={styles.answersContainer}>
                  {answers.map((answer) => (
                    <TouchableOpacity
                      key={answer.id}
                      style={[
                        styles.answerButton,
                        selectedAnswer === answer.id && styles.answerButtonSelected,
                      ]}
                      onPress={() => handleSelectAnswer(answer.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.answerButtonText,
                          selectedAnswer === answer.id && styles.answerButtonTextSelected,
                        ]}
                      >
                        {answer.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.submitButton,
            isButtonActive ? styles.submitButtonActive : styles.submitButtonInactive
          ]}
          onPress={handleSubmit}
          disabled={!isButtonActive}
        >
          <Text style={styles.submitButtonText}>약 먹었어요</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

IntakeAlarmQuizScreen.displayName = 'IntakeAlarmQuizScreen';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    alignItems: 'center' as any,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 64,
  },
  medicineCard: {
    width: '100%',
    maxWidth: 300,
    height: 170,
    backgroundColor: '#5E5B50',
    borderRadius: 26,
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    justifyContent: 'flex-start' as any,
    paddingLeft: 10,
    paddingRight: 28,
    marginBottom: 41,
    alignSelf: 'center',
  },
  pillImage: {
    width: 100,
    height: 100,
    marginRight: 2,
  },
  medicineTextContainer: {
    alignItems: 'flex-end' as any,
    justifyContent: 'center' as any,
  },
  hospitalText: {
    fontWeight: '700' as '700',
    fontSize: 24,
    color: '#EEEEEE',
    lineHeight: 28.8,
    marginBottom: 3,
  },
  medicineNameText: {
    fontWeight: '700' as '700',
    fontSize: 48,
    color: '#FFFFFF',
    lineHeight: 57.6,
  },
  quizTitleContainer: {
    marginBottom: 6,
  },
  quizTitleMain: {
    fontWeight: '400' as '400',
    fontSize: 24,
    color: '#60584D',
    lineHeight: 29.05,
    marginBottom: 0,
  },
  quizTitleSub: {
    fontWeight: '700' as '700',
    fontSize: 24,
    color: '#60584D',
    lineHeight: 28.8,
  },
  wrongAnswerBox: {
    width: '100%',
    backgroundColor: '#FFCC02',
    borderRadius: 21,
    paddingHorizontal: 13,
    paddingTop: 62,
    paddingBottom: 76,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
    marginBottom: 24,
  },
  wrongTextContainer: {
    alignItems: 'center' as any,
  },
  wrongMainText: {
    fontWeight: '700' as '700',
    fontSize: 48,
    color: '#545045',
    lineHeight: 48,
    marginBottom: 16,
    textAlign: 'center',
  },
  wrongSubText: {
    fontWeight: '700' as '700',
    fontSize: 28,
    color: '#545045',
    lineHeight: 30,
    textAlign: 'center',
  },
  quizQuestionBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    paddingHorizontal: 13,
    paddingTop: 20,
    paddingBottom: 25,
  },
  quizQuestionText: {
    fontWeight: '700' as '700',
    fontSize: 24,
    color: '#60584D',
    lineHeight: 28.8,
    marginBottom: 32,
  },
  answersContainer: {
    width: '100%',
    flexDirection: 'row' as any,
    flexWrap: 'wrap' as any,
    justifyContent: 'space-between' as any,
    rowGap: 24,
  },
  answerButton: {
    width: '48%',
    height: 56,
    backgroundColor: '#FFCC02',
    borderRadius: 108,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  answerButtonSelected: {
    backgroundColor: '#60584D',
  },
  answerButtonText: {
    fontWeight: '700' as '700',
    fontSize: 24,
    color: '#5E5B50',
    lineHeight: 28.8,
  },
  answerButtonTextSelected: {
    color: '#FFFFFF',
  },
  submitButtonContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 36,
    alignItems: 'center' as any,
  },
  submitButton: {
    width: '100%',
    maxWidth: 360,
    height: 66,
    borderRadius: 200,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
  },
  submitButtonActive: {
    backgroundColor: '#60584d',
  },
  submitButtonInactive: {
    backgroundColor: '#C4BCB1',
  },
  submitButtonText: {
    fontWeight: '700' as '700',
    fontSize: 27,
    color: '#FFFFFF',
    lineHeight: 32.4,
  },
  // 정답 UI 스타일
  correctAnswerBox: {
    width: '100%',
    backgroundColor: '#FFCC02',
    borderRadius: 21,
    paddingHorizontal: 13,
    paddingTop: 43,
    paddingBottom: 57,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
  },
  correctTextContainer: {
    alignItems: 'center' as any,
  },
  correctMainText: {
    fontWeight: '700' as '700',
    fontSize: 48,
    color: '#545045',
    lineHeight: 57.6,
    marginBottom: 11,
    textAlign: 'center' as any,
  },
  correctSubText: {
    fontWeight: '700' as '700',
    fontSize: 27,
    color: '#545045',
    lineHeight: 32.4,
    textAlign: 'center' as any,
  },
  // 3번 연속 오답 UI 스타일
  threeTimesWrongBox: {
    width: '100%',
    backgroundColor: '#FFCC02',
    borderRadius: 21,
    paddingHorizontal: 13,
    paddingTop: 43,
    paddingBottom: 57,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
  },
  threeTimesWrongTextContainer: {
    alignItems: 'center' as any,
  },
  threeTimesWrongMainText: {
    fontWeight: '700' as '700',
    fontSize: 48,
    color: '#545045',
    lineHeight: 57.6,
    marginBottom: 11,
    textAlign: 'center' as any,
  },
  threeTimesWrongSubText: {
    fontWeight: '700' as '700',
    fontSize: 27,
    color: '#545045',
    lineHeight: 32.4,
    textAlign: 'center' as any,
  },
});

export default IntakeAlarmQuizScreen;
