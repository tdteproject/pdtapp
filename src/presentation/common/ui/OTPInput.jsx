import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { colors } from '@/presentation/themes/colors';
import { fontFamily } from '@/presentation/themes/typography';

export default function OTPInput({ length, value, onChange }) {
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const inputRefs = useRef([]);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    // Individual scale animations for digit pop
    const scaleAnims = useRef(Array.from({ length }, () => new Animated.Value(1))).current;
    // Green flash animation
    const [allFilled, setAllFilled] = useState(false);
    const flashAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const filled = value.length === length && !value.includes('');
        if (filled && !allFilled) {
            setAllFilled(true);
            // Flash green border pulse
            Animated.sequence([
                Animated.timing(flashAnim, { toValue: 1, duration: 100, useNativeDriver: false }),
                Animated.timing(flashAnim, { toValue: 0, duration: 100, useNativeDriver: false }),
            ]).start(() => setAllFilled(false));
        }
    }, [value]);

    const handleChange = (text, index) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        const otpArr = value.split('');
        otpArr[index] = digit;
        while (otpArr.length < length) otpArr.push('');
        const newOtp = otpArr.join('');
        onChange(newOtp);

        // Digit pop animation: scale 1.3→1.0 in 150ms
        if (digit) {
            scaleAnims[index].setValue(1.3);
            Animated.spring(scaleAnims[index], {
                toValue: 1,
                friction: 5,
                tension: 100,
                useNativeDriver: true,
            }).start();
        }

        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key, index) => {
        if (key === 'Backspace') {
            const otpArr = value.split('');
            if (otpArr[index]) {
                otpArr[index] = '';
                onChange(otpArr.join(''));
            } else if (index > 0) {
                otpArr[index - 1] = '';
                onChange(otpArr.join(''));
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const isFilled = (index) => !!(value[index] && value[index] !== '');
    const isActive = (index) => focusedIndex === index;

    const flashBorderColor = flashAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.borderFilled, '#4ADE80'],
    });

    return (
        <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
            {Array.from({ length }).map((_, index) => {
                const borderColor = isFilled(index)
                    ? colors.borderFilled
                    : isActive(index)
                    ? colors.borderFocus
                    : colors.borderIdle;

                return (
                    <Animated.View
                        key={index}
                        style={[
                            styles.cell,
                            { borderColor },
                            isActive(index) && styles.cellActive,
                            isFilled(index) && styles.cellFilled,
                            { transform: [{ scale: isActive(index) ? 1.06 : scaleAnims[index] }] },
                        ]}
                    >
                        <TextInput
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            style={[
                                styles.input,
                                isFilled(index) && { color: colors.text.primary },
                                isActive(index) && { color: colors.primary.main },
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
                    </Animated.View>
                );
            })}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    cell: {
        width: 48,
        height: 56,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.borderIdle,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellActive: {
        borderColor: colors.borderFocus,
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    cellFilled: {
        borderColor: colors.borderFilled,
        backgroundColor: 'rgba(0, 200, 83, 0.05)',
    },
    input: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '700',
        fontFamily: fontFamily.bold,
        color: colors.text.primary,
    },
});
