import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path, Defs, LinearGradient, Stop, Polygon, Rect, Ellipse } from 'react-native-svg';
import { colors } from '@/presentation/themes/colors';

const { width } = Dimensions.get('window');

const DoctorIllustration = () => (
  <Svg width={140} height={140} viewBox="0 0 140 140">
    <Defs>
      <LinearGradient id="scrubsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#90C2FF" />
        <Stop offset="100%" stopColor="#64A0FA" />
      </LinearGradient>
      <LinearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FFC8A2" />
        <Stop offset="100%" stopColor="#E6A881" />
      </LinearGradient>
    </Defs>
    
    <Circle cx="70" cy="70" r="70" fill="#E8F1FC" />
    
    {/* Body / Scrubs Base */}
    <Path d="M30 140 C 30 100, 50 85, 70 85 C 90 85, 110 100, 110 140 Z" fill="url(#scrubsGrad)" />
    
    {/* Neck */}
    <Path d="M60 70 L60 90 L80 90 L80 70 Z" fill="url(#skinGrad)" />
    
    {/* Head / Face */}
    <Circle cx="70" cy="55" r="22" fill="url(#skinGrad)" />
    
    {/* Hair (Nurse/Bun Style) */}
    <Path d="M48 55 C48 30, 92 30, 92 55 C92 40, 48 40, 48 55" fill="#3B2E2A" />
    <Circle cx="70" cy="28" r="10" fill="#3B2E2A" />
    <Path d="M45 50 Q 70 20 95 50" fill="#3B2E2A" />
    
    {/* Crossed Arms */}
    <Path d="M30 115 Q 70 140 110 115" stroke="#4B86D4" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.6"/>
    <Path d="M110 120 C 80 135, 60 115, 30 130" stroke="#7BAEFA" strokeWidth="10" strokeLinecap="round" fill="none" />
    
    {/* Stethoscope */}
    <Path d="M55 85 C 55 120, 85 120, 85 85" stroke="#4A5568" strokeWidth="3" fill="none" />
    <Circle cx="55" cy="85" r="2" fill="#E2E8F0" />
    <Circle cx="85" cy="85" r="2" fill="#E2E8F0" />
    <Path d="M70 118 L70 130" stroke="#4A5568" strokeWidth="3" />
    <Circle cx="70" cy="132" r="4" fill="#A0AEC0" />
  </Svg>
);

const AuthBackgroundHUD = () => {
  const rotation = useSharedValue(0);
  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);

  useEffect(() => {
    // Very slow continuous rotation for the HUD rings
    rotation.value = withRepeat(
      withTiming(360, { duration: 40000, easing: Easing.linear }),
      -1,
      false
    );

    // Drifting motion for left nodes
    drift1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Drifting motion for right nodes (Offset timing)
    drift2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const hudAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const driftLeftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(drift1.value, [0, 1], [-8, 8]) }],
  }));

  const driftRightStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(drift2.value, [0, 1], [8, -8]) }],
  }));

  return (
    <View style={styles.absoluteFill} pointerEvents="none">
      <View style={styles.backgroundGrad} />

      {/* Central HUD Tech Rings */}
      <View style={styles.hudCenter}>
        <Animated.View style={[{ width: 340, height: 340, justifyContent: 'center', alignItems: 'center' }, hudAnimatedStyle]}>
          <Svg width={340} height={340} viewBox="0 0 340 340">
            {/* Outer dotted ring */}
            <Circle cx="170" cy="170" r="160" stroke={colors.primary.main} strokeWidth="1" strokeDasharray="4 12" fill="none" opacity="0.1" />
            {/* Secondary dashed ring */}
            <Circle cx="170" cy="170" r="130" stroke={colors.primary.main} strokeWidth="1" strokeDasharray="1 6" fill="none" opacity="0.15" />
            {/* Inner solid ring */}
            <Circle cx="170" cy="170" r="105" stroke={colors.accent.main} strokeWidth="0.5" fill="none" opacity="0.2" />
            {/* Geometric accents on orbits */}
            <Circle cx="10" cy="170" r="2" fill={colors.primary.main} opacity="0.3" />
            <Circle cx="330" cy="170" r="2" fill={colors.accent.main} opacity="0.3" />
            <Polygon points="170,5 173,10 167,10" fill={colors.primary.main} opacity="0.3" />
            <Polygon points="170,335 173,330 167,330" fill={colors.primary.main} opacity="0.3" />
          </Svg>
        </Animated.View>

        {/* Scattered Background Micro-Particles */}
        <Svg style={StyleSheet.absoluteFill} width="100%" height={400}>
           {/* Hexagons */}
           <Polygon points="50,60 55,68 50,76 40,76 35,68 40,60" stroke={colors.primary.main} strokeWidth="0.5" fill="none" opacity="0.2"/>
           <Polygon points="300,280 305,288 300,296 290,296 285,288 290,280" stroke={colors.accent.main} strokeWidth="0.5" fill="none" opacity="0.2"/>
           {/* Connection Lines */}
           <Path d="M45,68 L80,100" stroke={colors.primary.main} strokeWidth="0.5" opacity="0.1" />
           <Path d="M295,288 L260,250" stroke={colors.primary.main} strokeWidth="0.5" opacity="0.1" />
           {/* Dots */}
           <Circle cx="80" cy="100" r="1.5" fill={colors.primary.main} opacity="0.2" />
           <Circle cx="260" cy="250" r="1.5" fill={colors.primary.main} opacity="0.2" />
        </Svg>

        <View style={styles.doctorWrapper}>
          <DoctorIllustration />
        </View>
      </View>

      {/* FLOATING MEDICAL ICONS */}
      
      {/* LEFT ORBIT */}
      <Animated.View style={[styles.iconOrbitLeft, driftLeftStyle]}>
        
        {/* Cloud Sync Icon */}
        <View style={styles.floatingIconBox}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.primary.main} strokeWidth="1.5">
            <Path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            <Path d="M12 11v5" />
            <Path d="M10 14l2 2 2-2" />
          </Svg>
        </View>

        {/* Shield IoT Icon */}
        <View style={[styles.floatingIconBox, { marginLeft: -30 }]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.primary.main} strokeWidth="1.5">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <Circle cx="12" cy="11" r="3" />
          </Svg>
        </View>

        {/* Cross / Tech Icon */}
        <View style={styles.floatingIconBox}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.primary.main} strokeWidth="1.5">
            <Rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
            <Path d="M9 12h6" />
            <Path d="M12 9v6" />
          </Svg>
        </View>

      </Animated.View>

      {/* RIGHT ORBIT */}
      <Animated.View style={[styles.iconOrbitRight, driftRightStyle]}>
        
        {/* Heart Rate ECG */}
        <View style={styles.floatingIconBox}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.accent.main} strokeWidth="1.5" strokeLinejoin="round">
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            <Path d="M7 12h3l2-3 2 6 2-3h3" />
          </Svg>
        </View>

        {/* Lungs (Abstract) */}
        <View style={[styles.floatingIconBox, { marginRight: -30 }]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.primary.main} strokeWidth="1.5">
            <Path d="M12 4v16" strokeDasharray="2 2" opacity="0.5" />
            <Path d="M11 6c-2-2-5-2-7 0s-2 5 0 10 4 6 8 6" />
            <Path d="M13 6c2-2 5-2 7 0s2 5 0 10-4 6-8 6" />
          </Svg>
        </View>

        {/* Kidneys/Organs (Abstract) */}
        <View style={styles.floatingIconBox}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.accent.main} strokeWidth="1.5">
            <Path d="M14 10a4 4 0 0 1-8 0 4 4 0 0 1 8 0z" />
            <Path d="M10 14a4 4 0 0 1 8 0 4 4 0 0 1-8 0z" />
          </Svg>
        </View>

      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0, 
    overflow: 'hidden',
  },
  backgroundGrad: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAFAFA', // The exact matched clean off-white
  },
  hudCenter: {
    position: 'absolute',
    top: 50,
    left: width / 2 - 170, // center horizontally given 340px HUD width
    width: 340,
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorWrapper: {
    position: 'absolute',
    top: 100, // exact center
    left: 100,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  iconOrbitLeft: {
    position: 'absolute',
    top: 80,
    left: 20,
    height: 280,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  iconOrbitRight: {
    position: 'absolute',
    top: 80,
    right: 20,
    height: 280,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  floatingIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0,102,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default AuthBackgroundHUD;
