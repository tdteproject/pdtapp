import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, fontWeight, letterSpacing } from '@/presentation/themes/typography';

export default function Hero({ title, subtitle, pills, style }) {
  const breatheAnim = useRef(new Animated.Value(0.97)).current;
  const pillAnims = useRef(pills ? pills.map(() => new Animated.Value(0)) : []).current;

  useEffect(() => {
    // Breathing animation: scale 0.97↔1.0, 3s infinite
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.0,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0.97,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered pill fade-in with 120ms delay each
    if (pillAnims.length > 0) {
      pillAnims.forEach((anim, index) => {
        setTimeout(() => {
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, index * 120);
      });
    }
  }, []);

  return (
    <Animated.View style={[styles.hero, { transform: [{ scale: breatheAnim }] }, style]}>
      <Text style={styles.appName}>{title}</Text>
      {subtitle && <Text style={styles.tagline}>{subtitle}</Text>}
      {pills && pills.length > 0 && (
        <View style={styles.pillRow}>
          {pills.map((label, index) => (
            <Animated.View
              key={label}
              style={[styles.pill, { opacity: pillAnims[index] || 1 }]}
            >
              <Text style={styles.pillText}>{label}</Text>
            </Animated.View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 240,
  },
  appName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
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
    height: 32,
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#D0E4FF',
  },
  pillText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
});
