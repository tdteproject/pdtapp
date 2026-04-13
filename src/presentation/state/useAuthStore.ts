import { create } from 'zustand';
import { sendPhoneOTPReal, confirmOTPReal } from '@/data/firebase/authService';
import { ApplicationVerifier } from 'firebase/auth';

interface AuthState {
  isAuthenticated: boolean;
  userPhone: string | null;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
  otpSent: boolean;
  sendOTP: (phone: string, verifier: ApplicationVerifier) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  clearError: () => void;
  logout: () => void;
}

/**
 * Global confirmation result ref for Firebase Auth verify step.
 */
let confirmationResultRef: any = null;

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userPhone: null,
  userId: null,
  isLoading: false,
  error: null,
  otpSent: false,

  sendOTP: async (phone: string, verifier: ApplicationVerifier) => {
    set({ isLoading: true, error: null });
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    try {
      // Direct Realtime Firebase Auth call bypassing local mocked DOM dependencies
      confirmationResultRef = await sendPhoneOTPReal(formattedPhone, verifier);
      set({ 
          isLoading: false, 
          userPhone: formattedPhone, 
          otpSent: true,
          error: null 
      });
    } catch (realErr: any) {
      console.error('Firebase Auth Error:', realErr);
      set({ 
          isLoading: false, 
          error: realErr.message || 'Failed to send OTP. Please check your connection or Firebase config.',
          otpSent: false 
      });
    }
  },

  verifyOTP: async (otp: string) => {
    set({ isLoading: true, error: null });

    try {
      if (!confirmationResultRef) {
        throw new Error('Verification session expired. Please request a new OTP.');
      }
      
      // Real Firebase OTP verification
      const result = await confirmOTPReal(confirmationResultRef, otp);
      set({
        isAuthenticated: true,
        isLoading: false,
        userId: result.user.uid,
        error: null,
      });
    } catch (err: any) {
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
    set({
      isAuthenticated: false,
      userPhone: null,
      userId: null,
      error: null,
      otpSent: false,
    });
  },
}));
