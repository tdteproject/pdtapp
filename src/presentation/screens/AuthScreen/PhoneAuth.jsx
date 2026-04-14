import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Animated, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { useNavigation } from '@react-navigation/native';
import { firebaseConfig } from '@/data/firebase/config';
import { useAuthStore } from '@/presentation/state/useAuthStore';
import SafeAreaWrapper from '@/presentation/common/layout/SafeAreaWrapper';
import { validatePhone } from '@/core/utils/validators';
import { colors } from '@/presentation/themes/colors';
import { fontSize, fontFamily, fontWeight, letterSpacing } from '@/presentation/themes/typography';
import AuthBackgroundHUD from '@/presentation/common/ui/AuthBackgroundHUD';
import Hero from '@/presentation/common/ui/Hero';
import Error from '@/presentation/common/ui/Error';

const PhoneAuth = () => {
    const navigation = useNavigation();
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const cardSlideAnim = useRef(new Animated.Value(80)).current;
    const cardOpacityAnim = useRef(new Animated.Value(0)).current;
    const checkScaleAnim = useRef(new Animated.Value(0)).current;
    const checkboxScaleAnim = useRef(new Animated.Value(1)).current;
    const recaptchaVerifier = useRef(null);
    const { sendOTP, isLoading, error, clearError } = useAuthStore();

    useEffect(() => {
        // Fade in the hero
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        // Card spring entry: translateY(80px)→0, spring 400ms
        Animated.parallel([
            Animated.spring(cardSlideAnim, {
                toValue: 0,
                tension: 65,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.timing(cardOpacityAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Animated green checkmark on valid 10-digit input
    useEffect(() => {
        if (phone.length === 10) {
            Animated.spring(checkScaleAnim, {
                toValue: 1,
                tension: 80,
                friction: 6,
                useNativeDriver: true,
            }).start();
        } else {
            checkScaleAnim.setValue(0);
        }
    }, [phone]);

    const handleCheckboxPress = () => {
        // Spring scale on checkbox tap
        Animated.sequence([
            Animated.timing(checkboxScaleAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
            Animated.spring(checkboxScaleAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
        ]).start();
        setAgreed(!agreed);
    };

    const handleSendOTP = async () => {
        if (!agreed) {
            Alert.alert('Terms Required', 'Please agree to the Terms & Privacy Policy to continue.');
            return;
        }
        const validation = validatePhone(phone);
        if (validation !== true) {
            Alert.alert('Invalid Number', validation);
            return;
        }
        clearError();
        await sendOTP(phone, recaptchaVerifier.current);
        navigation.navigate('OTPVerify', { phone });
    };

    return (
    <SafeAreaWrapper>
      <AuthBackgroundHUD />
      <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={firebaseConfig} attemptInvisibleVerification={true}/>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={[{ flex: 1, justifyContent: 'center' }, { opacity: fadeAnim }]}>
          <Hero title="Welcome" subtitle="Train smarter. Live better." pills={['AI-Powered', 'Real-time Tracking', 'Secure']} />

          <Animated.View style={[styles.card, { opacity: cardOpacityAnim, transform: [{ translateY: cardSlideAnim }] }]}>
            <View style={styles.cardAccent}/>
            <Text style={styles.cardTitle}>Get Started</Text>
            <Text style={styles.cardSubtitle}>Sign in or create your account in one step</Text>

            <View style={styles.phoneSection}>
              <View style={[styles.phoneRow, inputFocused && styles.phoneRowFocused]}>
                <Pressable style={styles.countryCode}>
                  <Text style={styles.flag}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                </Pressable>
                <View style={styles.divider}/>
                <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={(t) => {
                      setPhone(t.replace(/\D/g, '').slice(0, 10));
                      if (error) clearError();
                    }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    keyboardType="number-pad"
                    maxLength={10}
                    placeholder="98765 43210"
                    placeholderTextColor={colors.text.muted}
                    editable={!isLoading}
                />
                {phone.length === 10 && (
                  <Animated.View style={{ transform: [{ scale: checkScaleAnim }] }}>
                    <MaterialIcons name="check-circle" size={20} color={colors.success}/>
                  </Animated.View>
                )}
              </View>

              <Pressable style={styles.termsRow} onPress={handleCheckboxPress} hitSlop={{ top: 8, bottom: 8 }}>
                <Animated.View style={[styles.checkbox, agreed && styles.checkboxChecked, { transform: [{ scale: checkboxScaleAnim }] }]}>
                  {agreed && <MaterialIcons name="check" size={12} color="#fff"/>}
                </Animated.View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </Pressable>

              <Error message={error} />

              <Pressable
                style={({ pressed }) => [
                  styles.ctaButton,
                  pressed && styles.ctaButtonPressed,
                  (phone.length < 10 || isLoading) && styles.ctaButtonDisabled,
                ]}
                onPress={handleSendOTP}
                disabled={phone.length < 10 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small"/>
                ) : (
                  <View style={styles.ctaInner}>
                    <Text style={styles.ctaText}>Get OTP</Text>
                    <View style={styles.ctaArrow}>
                      <MaterialIcons name="arrow-forward" size={16} color="#fff"/>
                    </View>
                  </View>
                )}
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaWrapper>
    );
};
export default PhoneAuth;

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        padding: 20,
        borderWidth: 0.5,
        borderColor: colors.border,
    },
    cardAccent: {
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 3,
        backgroundColor: colors.primary.main,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    cardTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.medium,
        color: colors.text.primary,
        marginBottom: 4,
        marginTop: 8,
    },
    cardSubtitle: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginBottom: 20,
    },
    phoneSection: {
        gap: 4,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderIdle,
        paddingHorizontal: 14,
        height: 56,
        marginBottom: 12,
        gap: 10,
    },
    phoneRowFocused: {
        borderColor: colors.borderFocus,
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    flag: {
        fontSize: 16,
    },
    countryCodeText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.base,
        color: colors.text.primary,
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: colors.borderIdle,
    },
    phoneInput: {
        flex: 1,
        fontFamily: fontFamily.medium,
        fontSize: fontSize.base,
        color: colors.text.primary,
        letterSpacing: letterSpacing.wide,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: colors.borderIdle,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 1,
    },
    checkboxChecked: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    termsText: {
        flex: 1,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        lineHeight: 18,
    },
    termsLink: {
        color: colors.primary.main,
        fontFamily: fontFamily.medium,
        textDecorationLine: 'underline',
    },
    ctaButton: {
        backgroundColor: colors.primary.main,
        borderRadius: 16,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaButtonPressed: {
        transform: [{ scale: 0.97 }],
    },
    ctaButtonDisabled: {
        backgroundColor: colors.primary.disabled,
    },
    ctaInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ctaText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.base,
        color: '#FFFFFF',
    },
    ctaArrow: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
