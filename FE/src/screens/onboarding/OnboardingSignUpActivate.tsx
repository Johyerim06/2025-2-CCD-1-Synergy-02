import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Router';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingSignUpActivate'>;

export default function OnboardingSignUpActivate() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('OnboardingMorningTimeSet');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <Image 
          source={require('../../../assets/images/OnboardingSignUpActivate/복자 로고 2.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>알림 희망 시간을{'\n'}입력해주세요.</Text>
        <Text style={styles.subtitle}>
          건강한 약 복용을 위해{'\n'}원하는 시간에 알림을 드릴게요.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffcc02',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    width: 300,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 105,
    height: 105,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'NotoSansKR',
    fontSize: 24,
    fontWeight: '700',
    color: '#60584d',
    textAlign: 'center',
    lineHeight: 34.75,
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '600',
    color: '#b5a288',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});

