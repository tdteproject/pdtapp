import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from '@/presentation/navigation/AppNavigator';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, letterSpacing } from '@/presentation/themes/typography';

function SplashScreen({ onReady }: { onReady: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const exitAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hold, then fade out and signal ready
      setTimeout(() => {
        Animated.timing(exitAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => onReady());
      }, 1000);
    });
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity: exitAnim }]}>
      <Animated.View
        style={[
          styles.splashContent,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.splashLogo}>
          <Text style={styles.splashEmoji}>⚡</Text>
        </View>
        <Text style={styles.splashName}>PDT</Text>
        <Text style={styles.splashTagline}>Train smarter. Live better.</Text>
      </Animated.View>

      {/* Bottom version label */}
      <Text style={styles.splashVersion}>v1.0.0</Text>
    </Animated.View>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="dark" backgroundColor={colors.background} />
        {isReady ? (
          <AppNavigator />
        ) : (
          <SplashScreen onReady={() => setIsReady(true)} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  splashLogo: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  splashEmoji: {
    fontSize: 40,
  },
  splashName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['4xl'],
    color: colors.text.primary,
    letterSpacing: letterSpacing.tight,
    marginBottom: 4,
  },
  splashTagline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.text.secondary,
    letterSpacing: letterSpacing.wide,
  },
  splashVersion: {
    position: 'absolute',
    bottom: 48,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.text.muted,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase',
  },
});
