import { create } from 'zustand';
import { sendPhoneOTPReal, confirmOTPReal, confirmOTPWithId } from '@/data/firebase/authService';

/**
 * Global refs for Firebase Auth verification.
 */
let confirmationResultRef = null;
let verificationIdRef = null;

/**
 * Test numbers that bypass WebView reCAPTCHA.
 */
const TEST_NUMBERS = ['+919999999999'];

export const useAuthStore = create((set) => ({
    isAuthenticated: false,
    userPhone: null,
    userId: null,
    isLoading: false,
    error: null,
    otpSent: false,

    /**
     * sendOTP handles two flows:
     * 
     * 1. TEST numbers → Direct call with dummy verifier (instant bypass)
     * 2. REAL numbers → Uses the WebView ref to run signInWithPhoneNumber 
     *    inside a real browser DOM where RecaptchaVerifier works.
     * 
     * @param {string} phone - The phone number
     * @param {object} verifier - The dummy verifier ref (for test numbers)
     * @param {object} webViewRef - The FirebaseRecaptcha ref (for real numbers)
     */
    sendOTP: async (phone, verifier, webViewRef) => {
        set({ isLoading: true, error: null });
        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
        
        try {
            const isTestNumber = TEST_NUMBERS.includes(formattedPhone);
            
            if (isTestNumber) {
                // PATH A: Test number — use old bypass flow
                console.log('[AuthStore] Using test number bypass flow');
                confirmationResultRef = await sendPhoneOTPReal(formattedPhone, verifier);
                verificationIdRef = null;
                set({
                    isLoading: false,
                    userPhone: formattedPhone,
                    otpSent: true,
                    error: null,
                });
            } else {
                // PATH B: Real number — use WebView flow
                console.log('[AuthStore] Using WebView reCAPTCHA flow for real number');
                if (!webViewRef || !webViewRef.sendOTPViaWebView) {
                    throw new Error('WebView verifier not ready. Please try again.');
                }
                const vId = await webViewRef.sendOTPViaWebView(formattedPhone);
                verificationIdRef = vId;
                confirmationResultRef = null;
                set({
                    isLoading: false,
                    userPhone: formattedPhone,
                    otpSent: true,
                    error: null,
                });
            }
        } catch (err) {
            console.error('Firebase Auth Error:', err);
            set({
                isLoading: false,
                error: err.message || 'Failed to send OTP. Please try again.',
                otpSent: false,
            });
        }
    },

    verifyOTP: async (otp) => {
        set({ isLoading: true, error: null });
        try {
            let result;
            
            if (verificationIdRef) {
                // Real number flow: use verificationId + credential
                result = await confirmOTPWithId(verificationIdRef, otp);
            } else if (confirmationResultRef) {
                // Test number flow: use confirmationResult.confirm()
                result = await confirmOTPReal(confirmationResultRef, otp);
            } else {
                throw new Error('Verification session expired. Please request a new OTP.');
            }
            
            set({
                isAuthenticated: true,
                isLoading: false,
                userId: result.user.uid,
                error: null,
            });
        } catch (err) {
            console.error('OTP Verification Error:', err);
            set({
                isLoading: false,
                error: err.message || 'Invalid OTP. Please try again.',
            });
        }
    },

    clearError: () => set({ error: null }),
    
    logout: () => {
        confirmationResultRef = null;
        verificationIdRef = null;
        set({
            isAuthenticated: false,
            userPhone: null,
            userId: null,
            error: null,
            otpSent: false,
        });
    },
}));
