import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Image } from 'expo-image';

const SplashScreen = React.memo(() => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#60584d" />
      <Image
        source={require('../../assets/SplashScreen.png')}
        style={styles.splashImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        priority="high"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#60584d',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;

