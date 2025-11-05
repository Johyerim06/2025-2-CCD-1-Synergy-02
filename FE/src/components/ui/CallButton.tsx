import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';

interface CallButtonProps extends TouchableOpacityProps {
  type: 'accept' | 'decline';
  size?: number;
}

export function CallButton({
  type,
  size = 80,
  style,
  ...props
}: CallButtonProps) {
  const buttonColor = type === 'accept' ? '#00c950' : '#fb2c36';
  const iconEmoji = type === 'accept' ? '📞' : '📵';
  const fontSize = size * 0.5;
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: buttonColor,
        },
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={{ fontSize }}>{iconEmoji}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

