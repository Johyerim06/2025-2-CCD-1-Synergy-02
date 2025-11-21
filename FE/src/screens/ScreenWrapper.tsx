import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ScreenWrapperProps {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
}

// Navigation이 필요한 화면들을 독립적으로 실행할 수 있도록 하는 래퍼
export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, title, onBack }) => {
  return (
    <View style={styles.container}>
      {children}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← 메뉴로</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 1000,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as any,
  },
});

// Mock Navigation Hook
export const useMockNavigation = (onBack?: () => void) => ({
  navigate: (screen: string, params?: any) => {
    console.log('Mock Navigation:', screen, params);
    if (onBack) {
      setTimeout(() => {
        alert(`네비게이션: ${screen}\n(실제로는 해당 화면으로 이동합니다)`);
      }, 100);
    }
  },
  goBack: () => {
    console.log('Mock Navigation: Go Back');
    if (onBack) onBack();
  },
  canGoBack: () => true,
  setOptions: () => {},
  addListener: () => () => {},
  removeListener: () => {},
  reset: () => {},
  isFocused: () => true,
  getId: () => 'mock-screen',
  getState: () => ({}),
  getParent: () => null,
  dispatch: () => {},
});

