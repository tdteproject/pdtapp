import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Animated, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import FirebaseRecaptcha from '@/presentation/common/ui/FirebaseRecaptcha';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { firebaseConfig } from '@/data/firebase/config';
import { useAuthStore } from '@/presentation/state/useAuthStore';
import SafeAreaWrapper from '@/presentation/common/layout/SafeAreaWrapper';
import OTPInput from '@/presentation/common/ui/OTPInput';
import { colors } from '@/presentation/themes/colors';
import { fontSize, fontFamily, fontWeight } from '@/presentation/themes/typography';
import Error from '@/presentation/common/ui/Error';
import AuthBackgroundHUD from '@/presentation/common/ui/AuthBackgroundHUD';

const TIMER_DURATION = 60;
const ARC_SIZE = 40;
const ARC_RADIUS = 17;
const ARC_CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;

const OTPVerify = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const phone = route.params?.phone || '';

    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(TIMER_DURATION);
    const [verified, setVerified] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const cardSlideAnim = useRef(new Animated.Value(100)).current;
    const cardOpacityAnim = useRef(new Animated.Value(0)).current;
    const recaptchaVerifier = useRef(null);

    const { verifyOTP, sendOTP, isLoading, error, clearError } = useAuthStore();

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();

        // Card slides up from y+100 with spring
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

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((t) => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) return;
        clearError();
        await verifyOTP(otp);
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setOtp('');
        clearError();
        await sendOTP(phone, recaptchaVerifier.current);
        setTimer(TIMER_DURATION);
    };

    const handleChangeNumber = () => {
        clearError();
        navigation.goBack();
    };

    // Circular countdown arc
    const arcProgress = timer / TIMER_DURATION;
    const arcDashOffset = ARC_CIRCUMFERENCE * (1 - arcProgress);

    return (
    <SafeAreaWrapper>
      <AuthBackgroundHUD />
      <FirebaseRecaptcha ref={recaptchaVerifier} firebaseConfig={firebaseConfig} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={[{ flex: 1, justifyContent: 'center' }, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.card, { marginTop: 120, opacity: cardOpacityAnim, transform: [{ translateY: cardSlideAnim }] }]}>
            <View style={styles.cardAccent}/>
            <Text style={styles.cardTitle}>Verify Your Number</Text>
            <Text style={styles.cardSubtitle}>OTP sent to +91 {phone}</Text>

            <View style={styles.otpSection}>
                <OTPInput length={6} value={otp} onChange={setOtp}/>

                {/* Countdown with circular arc */}
                <View style={styles.resendRow}>
                {timer > 0 ? (
                    <View style={styles.countdownContainer}>
                        <View style={styles.arcWrapper}>
                            <Svg width={ARC_SIZE} height={ARC_SIZE} viewBox={`0 0 ${ARC_SIZE} ${ARC_SIZE}`}>
                                {/* Track */}
                                <Circle
                                    cx={ARC_SIZE / 2}
                                    cy={ARC_SIZE / 2}
                                    r={ARC_RADIUS}
                                    stroke={colors.border}
                                    strokeWidth={2}
                                    fill="none"
                                />
                                {/* Progress arc */}
                                <Circle
                                    cx={ARC_SIZE / 2}
                                    cy={ARC_SIZE / 2}
                                    r={ARC_RADIUS}
                                    stroke={colors.primary.main}
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeDasharray={ARC_CIRCUMFERENCE}
                                    strokeDashoffset={arcDashOffset}
                                    fill="none"
                                    rotation="-90"
                                    origin={`${ARC_SIZE / 2}, ${ARC_SIZE / 2}`}
                                />
                            </Svg>
                            <Text style={styles.arcTimerText}>{timer}s</Text>
                        </View>
                        <Text style={styles.timerLabel}>Resend available soon</Text>
                    </View>
                ) : (
                    <Pressable onPress={handleResend} disabled={isLoading} style={styles.resendBtn}>
                        <Text style={styles.resendLink}>
                            Didn't receive it? <Text style={styles.resendAction}>Resend OTP</Text>
                        </Text>
                    </Pressable>
                )}
                </View>

                <Error message={error} />

                <Pressable
                    style={({ pressed }) => [
                        styles.ctaButton,
                        pressed && styles.ctaButtonPressed,
                        (otp.length < 6 || isLoading) && styles.ctaButtonDisabled,
                    ]}
                    onPress={handleVerifyOTP}
                    disabled={otp.length < 6 || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small"/>
                    ) : (
                        <View style={styles.ctaInner}>
                            <Text style={styles.ctaText}>Verify & Continue</Text>
                        </View>
                    )}
                </Pressable>

                <Pressable onPress={handleChangeNumber} style={styles.changeRow}>
                    <Text style={styles.changeText}>Change number</Text>
                </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaWrapper>
    );
};
export default OTPVerify;

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
        fontSize: 22,
        fontWeight: fontWeight.medium,
        color: colors.text.primary,
        marginBottom: 4,
        marginTop: 8,
    },
    cardSubtitle: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.muted,
        marginBottom: 20,
    },
    otpSection: {
        gap: 0,
    },
    resendRow: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    countdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    arcWrapper: {
        width: ARC_SIZE,
        height: ARC_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arcTimerText: {
        position: 'absolute',
        fontFamily: fontFamily.bold,
        fontSize: 11,
        color: colors.primary.main,
    },
    timerLabel: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.muted,
    },
    resendBtn: {
        minHeight: 44,
        justifyContent: 'center',
    },
    resendLink: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.muted,
    },
    resendAction: {
        color: colors.primary.main,
        fontFamily: fontFamily.medium,
    },
    changeRow: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        minHeight: 44,
    },
    changeText: {
        fontFamily: fontFamily.regular,
        fontSize: 14,
        color: colors.text.subtle,
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
});
