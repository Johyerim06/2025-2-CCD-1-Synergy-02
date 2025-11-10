import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  InteractionManager,
} from 'react-native';
import { Image } from 'expo-image';
import { CallButton } from '../../components/CallButtons';

interface IncomingCallScreenProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export const IncomingCallScreen = React.memo(({
  onAccept,
  onDecline,
}: IncomingCallScreenProps) => {
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const MAX_WIDTH = isTablet ? 420 : 360;
  const [isInteractionComplete, setIsInteractionComplete] = useState(false);

  useEffect(() => {
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      setIsInteractionComplete(true);
      console.log('IncomingCallScreen: Interactions complete');
    });

    return () => interactionPromise.cancel();
  }, []);

  const handleAccept = useCallback(() => {
    console.log('통화 수락');
    onAccept?.();
  }, [onAccept]);

  const handleDecline = useCallback(() => {
    console.log('통화 거절');
    onDecline?.();
  }, [onDecline]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#60584d" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageWrapper, { maxWidth: MAX_WIDTH }]}>
          {/* App Logo - 232x232 */}
          <Image
            source={require('../../../assets/images/icon.png')}
            style={styles.appLogo}
            contentFit="contain"
            cachePolicy="disk"
            priority="high"
            transition={150}
          />
        </View>
      </ScrollView>
      
      {/* 하단 고정 버튼 */}
      <View style={styles.callActionContainer}>
        {/* Accept Button (초록색) - 왼쪽 */}
        <CallButton type="accept" onPress={handleAccept} />
        
        {/* Decline Button (빨간색) - 오른쪽 */}
        <CallButton type="decline" onPress={handleDecline} />
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#60584d',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 120,
    alignItems: 'center' as any,
    flexGrow: 1,
  },
  pageWrapper: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center' as any,
  },
  appLogo: {
    width: 232,
    height: 232,
    marginTop: 100,
  },
  callActionContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 86,
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
    height: 80,
    gap: 116,
  },
});

