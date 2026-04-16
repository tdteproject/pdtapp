import React, { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '@/data/firebase/config';

/**
 * Web-Specific Firebase reCAPTCHA Verifier.
 * Uses the official Firebase Browser SDK for maximum stability on Web.
 */
const FirebaseRecaptcha = forwardRef(({ firebaseConfig }, ref) => {
  const recaptchaVerifier = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize the Web RecaptchaVerifier
    if (!recaptchaVerifier.current) {
      recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // Token generated successfully
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
        }
      });
    }

    return () => {
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
        recaptchaVerifier.current = null;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    type: 'recaptcha',
    verify: () => {
      // INSTANT BYPASS for Development / Testing numbers
      if (auth.settings.appVerificationDisabledForTesting) {
        console.log('[FirebaseRecaptcha.web] Bypassing reCAPTCHA for testing (Dev Mode)...');
        return Promise.resolve('');
      }

      if (!recaptchaVerifier.current) {
        return Promise.reject(new Error('RecaptchaVerifier not initialized on web'));
      }
      return recaptchaVerifier.current.verify();
    },
    render: () => {
      if (!recaptchaVerifier.current) return Promise.resolve(0);
      return recaptchaVerifier.current.render();
    },
    _reset: () => {
      // The Web SDK handles resets internally or via rendering
    },
    _v: {},
    _node: {},
    clear: () => {
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
      }
    }
  }));

  return (
    <View style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}>
      {/* Container for the hidden reCAPTCHA widget */}
      <div id="recaptcha-container" ref={containerRef} />
    </View>
  );
});

export default FirebaseRecaptcha;
