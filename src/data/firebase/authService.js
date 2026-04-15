import { signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./config";

/**
 * Enable app verification bypass for testing in development mode.
 * Essential for testing with "Phone numbers for testing" in Firebase Console.
 */
if (__DEV__) {
    auth.settings.appVerificationDisabledForTesting = true;
    console.log('[Auth] Dev mode: appVerificationDisabledForTesting enabled.');
}

/**
 * Sends a verification code to the given phone number.
 * @param {string} phoneNumber - The phone number to verify (e.g., +919876543210).
 * @param {object} recaptchaVerifier - The RecaptchaVerifier instance (usually from expo-firebase-recaptcha).
 * @returns {Promise<object>} confirmationResult - The result object for verification.
 */
export const sendPhoneOTPReal = async (phoneNumber, recaptchaVerifier) => {
    try {
        console.log(`[Firebase Auth] Sending OTP to ${phoneNumber}`);
        if (!recaptchaVerifier) {
            console.warn('[Firebase Auth] Warning: no recaptchaVerifier provided to sendPhoneOTPReal');
        }
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
        return confirmationResult;
    } catch (error) {
        console.error('[Firebase Auth] sendPhoneOTPReal Error:', error);
        throw error;
    }
};

/**
 * Confirms the OTP code.
 * @param {object} confirmationResult - The result object returned from sendPhoneOTPReal.
 * @param {string} otp - The 6-digit verification code.
 * @returns {Promise<object>} userCredential - The Firebase user credential.
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
