import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { firebaseConfig } from '@/data/firebase/config';
import { useAuthStore } from '@/presentation/state/useAuthStore';
import SafeAreaWrapper from '@/presentation/common/layout/SafeAreaWrapper';
import OTPInput from '@/presentation/common/ui/OTPInput';
import { validatePhone } from '@/core/utils/validators';
import { colors } from '@/presentation/themes/colors';
import { fontSize, fontWeight, fontFamily, letterSpacing } from '@/presentation/themes/typography';
import AuthBackgroundHUD from '@/presentation/common/ui/AuthBackgroundHUD';

const PhoneOTPAuthScreen = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [timer, setTimer] = useState(0);

  const otpAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Ref for the Firebase Recaptcha Modal (Native support)
  const recaptchaVerifier = useRef(null);

  const { sendOTP, verifyOTP, isLoading, error, clearError } = useAuthStore();

  // Entry animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const revealOTP = () => {
    setShowOTP(true);
    Animated.parallel([
      Animated.spring(otpAnim, {
        toValue: 1,
        tension: 55,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(heroAnim, {
        toValue: 0.9,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideOTP = () => {
    Animated.parallel([
      Animated.timing(otpAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowOTP(false);
      setOtp('');
    });
  };

  const handleSendOTP = async () => {
    if (!agreed) {
      Alert.alert('Terms Required', 'Please agree to the Terms & Privacy Policy to continue.');
      return;
    }
    const validation = validatePhone(phone);
    if (validation !== true) {
      Alert.alert('Invalid Number', validation as string);
      return;
    }
    clearError();
    await sendOTP(phone, recaptchaVerifier.current as any);
    revealOTP();
    setTimer(60);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    clearError();
    await verifyOTP(otp);
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setOtp('');
    clearError();
    await sendOTP(phone, recaptchaVerifier.current as any);
    setTimer(60);
  };

  const handleChangeNumber = () => {
    hideOTP();
    clearError();
    setTimer(0);
  };

  const otpTranslateY = otpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <SafeAreaWrapper>
      <AuthBackgroundHUD />
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={true}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[{ flex: 1, justifyContent: 'center' }, { opacity: fadeAnim }]}>
          {/* ─── Hero Section ─── */}
          <Animated.View
            style={[styles.hero, { transform: [{ scale: heroAnim }] }]}
          >
            <Text style={styles.appName}>Welcome</Text>
            <Text style={styles.tagline}>Train smarter. Live better.</Text>

            <View style={styles.pillRow}>
              {['AI-Powered', 'Real-time Tracking', 'Secure'].map((label) => (
                <View key={label} style={styles.pill}>
                  <Text style={styles.pillText}>{label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* ─── Auth Card ─── */}
          <View style={styles.card}>
            <View style={styles.cardAccent} />

            <Text style={styles.cardTitle}>
              {showOTP ? 'Verify Your Number' : 'Get Started'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {showOTP
                ? `OTP sent to +91 ${phone}`
                : 'Sign in or create your account in one step'}
            </Text>

            {/* ─── Phone Input Section ─── */}
            {!showOTP ? (
              <View style={styles.phoneSection}>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCode}>
                    <Text style={styles.flag}>🇮🇳</Text>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <View style={styles.divider} />
                  <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={(t) => {
                      setPhone(t.replace(/\D/g, '').slice(0, 10));
                      if (error) clearError();
                    }}
                    keyboardType="number-pad"
                    maxLength={10}
                    placeholder="98765 43210"
                    placeholderTextColor={colors.text.muted}
                    editable={!isLoading}
                  />
                  {phone.length === 10 && (
                    <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  )}
                </View>

                {/* Terms Checkbox */}
                <Pressable
                  style={styles.termsRow}
                  onPress={() => setAgreed(!agreed)}
                  hitSlop={{ top: 8, bottom: 8 }}
                >
                  <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                    {agreed && <MaterialIcons name="check" size={12} color="#fff" />}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the <Text style={styles.termsLink}>Terms</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </Pressable>

                {/* Error */}
                {error ? (
                  <View style={styles.errorBox}>
                    <MaterialIcons name="error-outline" size={14} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Get OTP Button */}
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
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <View style={styles.ctaInner}>
                      <Text style={styles.ctaText}>Get OTP</Text>
                      <View style={styles.ctaArrow}>
                        <MaterialIcons name="arrow-forward" size={16} color="#fff" />
                      </View>
                    </View>
                  )}
                </Pressable>
              </View>
            ) : (
              /* ─── OTP Section (slide in) ─── */
              <Animated.View
                style={[
                  styles.otpSection,
                  {
                    opacity: otpAnim,
                    transform: [{ translateY: otpTranslateY }],
                  },
                ]}
              >
                <OTPInput length={6} value={otp} onChange={setOtp} />

                <View style={styles.resendRow}>
                  {timer > 0 ? (
                    <Text style={styles.timerText}>
                      Resend code in <Text style={styles.timerCount}>{timer}s</Text>
                    </Text>
                  ) : (
                    <Pressable onPress={handleResend} disabled={isLoading}>
                      <Text style={styles.resendLink}>
                        Didn't receive it? <Text style={styles.resendAction}>Resend OTP</Text>
                      </Text>
                    </Pressable>
                  )}
                </View>

                {error ? (
                  <View style={styles.errorBox}>
                    <MaterialIcons name="error-outline" size={14} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

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
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <View style={styles.ctaInner}>
                      <Text style={styles.ctaText}>Verify & Continue</Text>
                    </View>
                  )}
                </Pressable>

                <Pressable onPress={handleChangeNumber} style={styles.changeRow}>
                  <Text style={styles.changeText}>Change number</Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default PhoneOTPAuthScreen;

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 240, // Pushed downward to make space for the upper 340px HUD graphic
  },
  appName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['4xl'],
    color: '#264653',
    letterSpacing: letterSpacing.tight,
    marginBottom: 6,
  },
  tagline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 2,
    backgroundColor: colors.primary.main,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text.primary,
    marginBottom: 4,
    marginTop: 4,
  },
  cardSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  phoneSection: {
    gap: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flag: {
    fontSize: 14,
  },
  countryCodeText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
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
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
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
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  termsLink: {
    color: colors.primary.main,
    fontFamily: fontFamily.medium,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 55, 95, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 55, 95, 0.2)',
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.error,
    flex: 1,
  },
  ctaButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  ctaButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  ctaButtonDisabled: {
    opacity: 0.4,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpSection: {
    gap: 0,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  timerText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  timerCount: {
    color: colors.primary.main,
    fontFamily: fontFamily.medium,
  },
  resendLink: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  resendAction: {
    color: colors.primary.main,
    fontFamily: fontFamily.medium,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  changeText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
});
