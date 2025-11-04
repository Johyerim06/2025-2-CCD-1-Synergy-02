import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../screens/Home';
import OnboardingWelcomeScreen from '../screens/onboarding/OnboardingWelcomeScreen';
import OnboardingSignUp from '../screens/onboarding/OnboardingSignUp';
import OnboardingSignUpActivate from '../screens/onboarding/OnboardingSignUpActivate';
import OnboardingMorningTimeSet from '../screens/onboarding/OnboardingMorningTimeSet';
import OnboardingLunchTimeSet from '../screens/onboarding/OnboardingLunchTimeSet';
import OnboardingEveningTimeSet from '../screens/onboarding/OnboardingEveningTimeSet';
import OnboardingBedTimeSet from '../screens/onboarding/OnboardingBedTimeSet';
import PrescriptionCaptureScreen from '../screens/medication/PrescriptionCaptureScreen';
import PrescriptionProcessingScreen from '../screens/medication/PrescriptionProcessingScreen';
import PrescriptionIntakeTimeSelectScreen from '../screens/medication/PrescriptionIntakeTimeSelectScreen';
import PrescriptionAnalysisResultScreen from '../screens/medication/PrescriptionAnalysisResultScreen';
import MedicationEnvelopeCaptureScreen from '../screens/medication/MedicationEnvelopeCaptureScreen';
import MedicationEnvelopeProcessingScreen from '../screens/medication/MedicationEnvelopeProcessingScreen';
import EditInfoSelectScreen from '../screens/edit/EditInfoSelectScreen';
import UserInfoEditScreen from '../screens/edit/UserInfoEditScreen';
import MorningTimeEditScreen from '../screens/edit/MorningTimeEditScreen';
import LunchTimeEditScreen from '../screens/edit/LunchTimeEditScreen';
import EveningTimeEditScreen from '../screens/edit/EveningTimeEditScreen';
import BedTimeEditScreen from '../screens/edit/BedTimeEditScreen';
import PrescriptionDetailScreen from '../screens/medication/PrescriptionDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  OnboardingWelcome: undefined;
  OnboardingSignUp: undefined;
  OnboardingSignUpActivate: undefined;
  OnboardingMorningTimeSet: undefined;
  OnboardingLunchTimeSet: undefined;
  OnboardingEveningTimeSet: undefined;
  OnboardingBedTimeSet: undefined;
  PrescriptionCapture: undefined;
  PrescriptionProcessing: undefined;
  PrescriptionIntakeTimeSelect: { source?: 'prescription' | 'medicationEnvelope' } | undefined;
  PrescriptionAnalysisResult: { source?: 'prescription' | 'medicationEnvelope' } | undefined;
  PrescriptionDetail: { umno: number } | undefined;
  MedicationEnvelopeCapture: undefined;
  MedicationEnvelopeProcessing: undefined;
  EditInfoSelect: undefined;
  UserInfoEdit: undefined;
  MorningTimeEdit: undefined;
  LunchTimeEdit: undefined;
  EveningTimeEdit: undefined;
  BedTimeEdit: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Router() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} {...({} as any)} initialRouteName="OnboardingWelcome">
        <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
        <Stack.Screen name="OnboardingSignUp" component={OnboardingSignUp} />
        <Stack.Screen name="OnboardingSignUpActivate" component={OnboardingSignUpActivate} />
        <Stack.Screen name="OnboardingMorningTimeSet" component={OnboardingMorningTimeSet} />
        <Stack.Screen name="OnboardingLunchTimeSet" component={OnboardingLunchTimeSet} />
        <Stack.Screen name="OnboardingEveningTimeSet" component={OnboardingEveningTimeSet} />
        <Stack.Screen name="OnboardingBedTimeSet" component={OnboardingBedTimeSet} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="PrescriptionCapture" component={PrescriptionCaptureScreen} />
        <Stack.Screen name="PrescriptionProcessing" component={PrescriptionProcessingScreen} />
        <Stack.Screen name="PrescriptionIntakeTimeSelect" component={PrescriptionIntakeTimeSelectScreen} />
        <Stack.Screen name="PrescriptionAnalysisResult" component={PrescriptionAnalysisResultScreen} />
        <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
        <Stack.Screen name="MedicationEnvelopeCapture" component={MedicationEnvelopeCaptureScreen} />
        <Stack.Screen name="MedicationEnvelopeProcessing" component={MedicationEnvelopeProcessingScreen} />
        <Stack.Screen name="EditInfoSelect" component={EditInfoSelectScreen} />
        <Stack.Screen name="UserInfoEdit" component={UserInfoEditScreen} />
        <Stack.Screen name="MorningTimeEdit" component={MorningTimeEditScreen} />
        <Stack.Screen name="LunchTimeEdit" component={LunchTimeEditScreen} />
        <Stack.Screen name="EveningTimeEdit" component={EveningTimeEditScreen} />
        <Stack.Screen name="BedTimeEdit" component={BedTimeEditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
