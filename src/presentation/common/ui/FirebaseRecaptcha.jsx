import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

import { auth } from '@/data/firebase/config';

/**
 * Seamless Invisible Firebase reCAPTCHA Verifier for Expo SDK 51.
 * Handles verification in the background without any visible UI.
 */
const FirebaseRecaptcha = forwardRef(({ firebaseConfig }, ref) => {
  const resolverRef = useRef(null);
  const webViewRef = useRef(null);

  // Implement the RecaptchaVerifier interface for Firebase JS SDK
  useImperativeHandle(ref, () => ({
    type: 'recaptcha',
    verify: () => {
      // INSTANT BYPASS for Development / Testing numbers
      if (auth.settings.appVerificationDisabledForTesting) {
        console.log('[FirebaseRecaptcha] Bypassing reCAPTCHA for testing (Dev Mode)...');
        return Promise.resolve('manual-bypass-token');
      }

      return new Promise((resolve, reject) => {
        resolverRef.current = { resolve, reject };
        if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({ type: 'execute' }));
        } else {
          reject(new Error('Recaptcha WebView not initialized'));
        }
      });
    },
    render: () => Promise.resolve(0),
    _reset: () => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({ type: 'reset' }));
      }
    },
    _v: {},
    _node: {},
    clear: () => {
      resolverRef.current = null;
    }
  }));

  const getHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit" async defer></script>
          <script>
            function onloadCallback() {
              window.recaptchaWidgetId = grecaptcha.render('recaptcha-cont', {
                'sitekey': '6LcM_0UoAAAAAF99999999999999999999999999',
                'callback': function(token) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'verify', token }));
                },
                'expired-callback': function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'expired' }));
                },
                'error-callback': function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error' }));
                },
                'size': 'invisible'
              });
            }

            window.addEventListener('message', (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data.type === 'execute') {
                  grecaptcha.execute(window.recaptchaWidgetId);
                } else if (data.type === 'reset') {
                  grecaptcha.reset(window.recaptchaWidgetId);
                }
              } catch (e) {}
            });
          </script>
        </head>
        <body style="margin:0; padding:0; background:transparent;">
          <div id="recaptcha-cont"></div>
        </body>
      </html>
    `;
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'verify') {
        if (resolverRef.current) {
          resolverRef.current.resolve(data.token);
          resolverRef.current = null;
        }
      } else if (data.type === 'expired' || data.type === 'error') {
        if (resolverRef.current) {
          resolverRef.current.reject(new Error('Background verification failed.'));
          resolverRef.current = null;
        }
      }
    } catch (e) {
      console.error('[FirebaseRecaptcha] Message Parse Error:', e);
    }
  };

  return (
    <View style={styles.hidden}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: getHtml(), baseUrl: `https://${firebaseConfig.authDomain}` }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        transparent={true}
        style={styles.webView}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0.01,
    overflow: 'hidden',
  },
  webView: {
    width: 1,
    height: 1,
    backgroundColor: 'transparent',
  }
});

export default FirebaseRecaptcha;
