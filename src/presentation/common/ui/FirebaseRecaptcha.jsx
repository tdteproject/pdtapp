import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Modal, Pressable, Text, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';

import { auth } from '@/data/firebase/config';
import { firebaseConfig } from '@/data/firebase/config';
import { colors } from '@/presentation/themes/colors';
import { fontFamily } from '@/presentation/themes/typography';

/**
 * Firebase Phone Auth via WebView.
 * 
 * KEY INSIGHT: The Firebase JS SDK's signInWithPhoneNumber() requires a REAL
 * browser DOM to create a RecaptchaVerifier. React Native has no DOM.
 * 
 * Solution: We run the ENTIRE signInWithPhoneNumber call INSIDE a WebView
 * (which IS a real browser), and pass back just the verificationId so
 * React Native can complete the sign-in with PhoneAuthProvider.credential().
 */
const FirebaseRecaptcha = forwardRef((props, ref) => {
  const [showWebView, setShowWebView] = useState(false);
  const webViewRef = useRef(null);
  const resolverRef = useRef(null);
  const pendingPhoneRef = useRef(null);

  /**
   * Exposed API:
   * - sendOTPViaWebView(phoneNumber) → Promise<verificationId>
   * 
   * This replaces the old verify() approach entirely.
   */
  useImperativeHandle(ref, () => ({
    // Dummy verifier interface for test numbers (bypass mode)
    type: 'recaptcha',
    verify: () => Promise.resolve(''),
    render: () => Promise.resolve(0),
    _reset: () => {},
    _v: {},
    _node: {},
    clear: () => {},

    // Real flow: runs signInWithPhoneNumber inside the WebView
    sendOTPViaWebView: (phoneNumber) => {
      return new Promise((resolve, reject) => {
        resolverRef.current = { resolve, reject };
        pendingPhoneRef.current = phoneNumber;
        setShowWebView(true);
      });
    },
    close: () => {
      setShowWebView(false);
      resolverRef.current = null;
    }
  }));

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'verificationId') {
        // SUCCESS: We got a verificationId from inside the WebView
        console.log('[FirebaseRecaptcha] Got verificationId from WebView');
        if (resolverRef.current) {
          resolverRef.current.resolve(data.verificationId);
          resolverRef.current = null;
        }
        setShowWebView(false);
      } else if (data.type === 'error') {
        console.error('[FirebaseRecaptcha] WebView error:', data.message);
        if (resolverRef.current) {
          resolverRef.current.reject(new Error(data.message || 'Verification failed'));
          resolverRef.current = null;
        }
        setShowWebView(false);
      } else if (data.type === 'log') {
        console.log('[WebView]', data.message);
      }
    } catch (e) {
      console.error('[FirebaseRecaptcha] Message parse error:', e);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (resolverRef.current) {
      resolverRef.current.reject(new Error('Verification cancelled by user.'));
      resolverRef.current = null;
    }
    setShowWebView(false);
  }, []);

  // Build the HTML that runs Firebase Auth entirely in-browser
  const getHtml = () => {
    const phone = pendingPhoneRef.current || '';
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      color: #1e293b;
    }
    .status {
      text-align: center;
      margin-bottom: 16px;
    }
    .status h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .status p {
      font-size: 13px;
      color: #64748b;
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 16px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    #recaptcha-container { margin-top: 12px; }
    .error { color: #ef4444; font-size: 13px; margin-top: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="status">
    <h3 id="statusTitle">Verifying your device...</h3>
    <p id="statusText">This only takes a moment</p>
  </div>
  <div class="spinner" id="spinner"></div>
  <div id="recaptcha-container"></div>
  <div id="errorBox" class="error" style="display:none;"></div>

  <!-- Firebase JS SDK (compat for simplicity in a standalone page) -->
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
  <script>
    function log(msg) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', message: msg }));
    }
    function sendError(msg) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: msg }));
    }
    function sendSuccess(verificationId) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'verificationId', verificationId: verificationId }));
    }

    try {
      // Initialize Firebase inside the WebView
      const config = ${JSON.stringify(firebaseConfig)};
      const app = firebase.initializeApp(config);
      const auth = firebase.auth();

      log('Firebase initialized in WebView');

      // Create a REAL RecaptchaVerifier (this works because WebView has a real DOM)
      const recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
        callback: function(token) {
          log('reCAPTCHA solved automatically');
        },
        'expired-callback': function() {
          log('reCAPTCHA expired');
        }
      });

      // Now call signInWithPhoneNumber with the REAL verifier
      const phoneNumber = '${phone}';
      log('Sending OTP to ' + phoneNumber);

      auth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier)
        .then(function(confirmationResult) {
          log('OTP sent successfully! verificationId obtained.');
          sendSuccess(confirmationResult.verificationId);
        })
        .catch(function(error) {
          log('signInWithPhoneNumber error: ' + error.message);
          document.getElementById('spinner').style.display = 'none';
          document.getElementById('statusTitle').textContent = 'Verification Failed';
          document.getElementById('statusText').textContent = error.message;
          document.getElementById('errorBox').style.display = 'block';
          document.getElementById('errorBox').textContent = error.message;
          sendError(error.message);
        });

    } catch(e) {
      sendError('Init error: ' + e.message);
    }
  </script>
</body>
</html>`;
  };

  if (!showWebView) return null;

  return (
    <Modal
      visible={showWebView}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Verifying...</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <MaterialIcons name="close" size={22} color={colors.text.secondary} />
            </Pressable>
          </View>
          <View style={styles.webViewBox}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: getHtml(), baseUrl: `https://${firebaseConfig.authDomain}` }}
              onMessage={handleMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              style={styles.webView}
            />
          </View>
          <Text style={styles.footerText}>
            Securing your account. This will close automatically.
          </Text>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.text.primary,
  },
  webViewBox: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  webView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 12,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.text.muted,
  },
});

export default FirebaseRecaptcha;
