import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { colors } from '@/presentation/themes/colors';

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (otp: string) => void;
  shake?: boolean;
}

export default function OTPInput({ length, value, onChange }: OTPInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const otpArr = value.split('');
    otpArr[index] = digit;
    // Pad to full length
    while (otpArr.length < length) otpArr.push('');
    const newOtp = otpArr.join('');
    onChange(newOtp);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      const otpArr = value.split('');
      if (otpArr[index]) {
        // Clear current cell
        otpArr[index] = '';
        onChange(otpArr.join(''));
      } else if (index > 0) {
        // Move to previous cell and clear it
        otpArr[index - 1] = '';
        onChange(otpArr.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const isFilled = (index: number) => !!(value[index] && value[index] !== '');

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.cell,
            focusedIndex === index && styles.cellFocused,
            isFilled(index) && styles.cellFilled,
          ]}
        >
          <TextInput
            ref={(ref) => { inputRefs.current[index] = ref; }}
            style={[
              styles.input,
              focusedIndex === index && styles.inputFocused,
              isFilled(index) && styles.inputFilled,
            ]}
            value={value[index] || ''}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            keyboardType="number-pad"
            maxLength={1}
            autoCorrect={false}
            selectTextOnFocus
            caretHidden
            placeholderTextColor={colors.text.muted}
          />
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cell: {
    flex: 1,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellFocused: {
    borderColor: colors.primary.main,
    backgroundColor: colors.cardAlt,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  cellFilled: {
    borderColor: colors.primary.light,
    backgroundColor: colors.primary.subtle,
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  inputFocused: {
    color: colors.primary.main,
  },
  inputFilled: {
    color: colors.primary.light,
  },
});
