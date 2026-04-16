import { PhoneAuthProvider, signInWithCredential, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./config";

/**
 * TEST NUMBERS: List your Firebase Console test numbers here.
 * These bypass reCAPTCHA entirely.
 */
const TEST_NUMBERS = ['+919999999999'];

/**
 * Sends a verification code to the given phone number.
 * 
 * For TEST numbers: Uses the standard signInWithPhoneNumber with bypass.
 * For REAL numbers: The caller (useAuthStore) uses the WebView approach.
 * 
 * @param {string} phoneNumber - The phone number (e.g., +919876543210).
 * @param {object} recaptchaVerifier - Unused for real numbers (handled by WebView).
 * @returns {Promise<object>} confirmationResult for test numbers.
 */
export const sendPhoneOTPReal = async (phoneNumber, recaptchaVerifier) => {
    try {
        console.log(`[Firebase Auth] Sending OTP to ${phoneNumber}`);
        
        const isTestNumber = TEST_NUMBERS.includes(phoneNumber);
        auth.settings.appVerificationDisabledForTesting = isTestNumber;
        
        if (isTestNumber) {
            // Test numbers can use the dummy verifier with bypass enabled
            console.log('[Firebase Auth] Test number detected, using bypass.');
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
            return confirmationResult;
        } else {
            // Real numbers: this should NOT be called directly.
            // useAuthStore will use the WebView flow instead.
            throw new Error('REAL_NUMBER_USE_WEBVIEW');
        }
    } catch (error) {
        console.error('[Firebase Auth] sendPhoneOTPReal Error:', error);
        throw error;
    }
};

/**
 * Confirms the OTP code using a verificationId (from WebView) + user-entered code.
 * Works for BOTH test and real numbers.
 * 
 * @param {string} verificationId - The verification ID from signInWithPhoneNumber.
 * @param {string} otp - The 6-digit verification code.
 * @returns {Promise<object>} userCredential
 */
export const confirmOTPWithId = async (verificationId, otp) => {
    try {
        console.log(`[Firebase Auth] Verifying OTP with verificationId`);
        const credential = PhoneAuthProvider.credential(verificationId, otp);
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential;
    } catch (error) {
        console.error('[Firebase Auth] confirmOTPWithId Error:', error);
        throw error;
    }
};

/**
 * Confirms the OTP code using a confirmationResult object (legacy, for test numbers).
 * @param {object} confirmationResult - The result object returned from sendPhoneOTPReal.
 * @param {string} otp - The 6-digit verification code.
 * @returns {Promise<object>} userCredential
 */
export const confirmOTPReal = async (confirmationResult, otp) => {
    try {
        console.log(`[Firebase Auth] Verifying OTP: ${otp}`);
        const userCredential = await confirmationResult.confirm(otp);
        return userCredential;
    } catch (error) {
        console.error('[Firebase Auth] confirmOTPReal Error:', error);
        throw error;
    }
};
