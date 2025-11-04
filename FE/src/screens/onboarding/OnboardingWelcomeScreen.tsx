import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Router';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingWelcome'>;

export default function OnboardingWelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleStartPress = () => {
    navigation.navigate('OnboardingSignUp');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.contentContainer}>
        <Image 
          source={require('../../../assets/images/main_icon/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.introText}>복약 자립{'\n'}복자와 함께</Text>
        <TouchableOpacity style={styles.button} onPress={handleStartPress}>
          <Text style={styles.buttonText}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  logo: {
    width: 232,
    height: 232,
    marginBottom: 42,
  },
  introText: {
    fontFamily: 'NotoSansKR',
    fontSize: 24,
    fontWeight: '700',
    color: '#090a0a',
    textAlign: 'center',
    lineHeight: 28.8,
    marginBottom: 60,
  },
  button: {
    width: 320,
    height: 66,
    borderRadius: 200,
    backgroundColor: '#60584d',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    fontFamily: 'NotoSansKR',
    fontSize: 27,
    fontWeight: '700',
    color: '#ffffff',
  },
});
