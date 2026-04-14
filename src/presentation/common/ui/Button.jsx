import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, letterSpacing } from '@/presentation/themes/typography';
export default function Button({ title, onPress, loading, disabled, variant = 'primary', icon, fullWidth = true, }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 50,
            bounciness: 0,
        }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 30,
            bounciness: 4,
        }).start();
    };
    const isDisabled = disabled || loading;
    const getButtonStyle = () => {
        switch (variant) {
            case 'secondary':
                return styles.secondaryButton;
            case 'ghost':
                return styles.ghostButton;
            case 'danger':
                return styles.dangerButton;
            default:
                return styles.primaryButton;
        }
    };
    const getTextStyle = () => {
        switch (variant) {
            case 'secondary':
                return [styles.buttonText, { color: colors.primary.main }];
            case 'ghost':
                return [styles.buttonText, { color: colors.text.secondary }];
            default:
                return [styles.buttonText, { color: '#FFFFFF' }];
        }
    };
    return (<Animated.View style={[
            fullWidth && styles.fullWidth,
            { transform: [{ scale: scaleAnim }] },
            isDisabled && styles.disabledWrapper,
        ]}>
      <Pressable style={[styles.base, getButtonStyle()]} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={isDisabled} android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: false }}>
        {loading ? (<ActivityIndicator color={variant === 'secondary' ? colors.primary.main : '#FFFFFF'} size="small"/>) : (<>
            <Text style={getTextStyle()}>{title}</Text>
            {icon && (<MaterialIcons name={icon} size={16} color={variant === 'primary' ? '#FFFFFF' : colors.primary.main} style={{ marginLeft: 6 }}/>)}
          </>)}
      </Pressable>
    </Animated.View>);
}
const styles = StyleSheet.create({
    fullWidth: {
        width: '100%',
    },
    disabledWrapper: {
        opacity: 0.45,
    },
    base: {
        flexDirection: 'row',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 46,
    },
    primaryButton: {
        backgroundColor: colors.primary.main,
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButton: {
        backgroundColor: colors.primary.subtle,
        borderWidth: 1,
        borderColor: colors.borderAccent,
    },
    ghostButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    dangerButton: {
        backgroundColor: 'rgba(255, 55, 95, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255, 55, 95, 0.3)',
    },
    buttonText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.base,
        letterSpacing: letterSpacing.wide,
    },
});
