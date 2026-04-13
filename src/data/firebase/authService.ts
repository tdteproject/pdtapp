import { signInWithPhoneNumber, ConfirmationResult, ApplicationVerifier } from 'firebase/auth';
import { auth } from './config';

export const sendPhoneOTPReal = async (
  phone: string,
  verifier: ApplicationVerifier
): Promise<ConfirmationResult> => {
  if (!verifier) {
    throw new Error('ApplicationVerifier is missing. Cannot send OTP.');
  }
  // Ensure the prefix matches Firebase expectations
  const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
  return await signInWithPhoneNumber(auth, formattedPhone, verifier);
};

export const confirmOTPReal = async (
  confirmationResult: ConfirmationResult,
  code: string
): Promise<{ user: { uid: string; phoneNumber?: string | null } }> => {
  const result = await confirmationResult.confirm(code);
  return {
    user: {
      uid: result.user.uid,
      phoneNumber: result.user.phoneNumber,
    },
  };
};
