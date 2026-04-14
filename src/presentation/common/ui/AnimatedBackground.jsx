import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing, interpolate, } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle, Pattern, Polygon } from 'react-native-svg';
import { colors } from '@/presentation/themes/colors';
const { width, height } = Dimensions.get('window');
const AnimatedBackground = ({ type = 'rich' }) => {
    const float1 = useSharedValue(0);
    const float2 = useSharedValue(0);
    useEffect(() => {
        if (type === 'rich') {
            // Gentle floating animation for background tech elements
            float1.value = withRepeat(withSequence(withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.sin) })), -1, true);
            float2.value = withRepeat(withSequence(withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.sin) })), -1, true);
        }
    }, [type]);
    const animatedHex1 = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(float1.value, [0, 1], [-15, 15]) },
            { scale: interpolate(float1.value, [0, 1], [0.95, 1.05]) }
        ],
    }));
    const animatedHex2 = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(float2.value, [0, 1], [20, -20]) },
            { scale: interpolate(float2.value, [0, 1], [1.05, 0.95]) }
        ],
    }));
    return (<View style={styles.absoluteFill} pointerEvents="none">
      <View style={styles.backgroundGrad}/>

      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          {/* Subtle medical dot matrix pattern */}
          <Pattern id="dotGrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <Circle cx="2" cy="2" r="1" fill={colors.primary.main} opacity="0.08"/>
          </Pattern>

          <RadialGradient id="glowTopRight" cx="100%" cy="0%" rx="80%" ry="60%">
            <Stop offset="0%" stopColor={colors.primary.main} stopOpacity="0.06"/>
            <Stop offset="100%" stopColor={colors.primary.main} stopOpacity="0"/>
          </RadialGradient>
          
          <RadialGradient id="glowBottomLeft" cx="0%" cy="100%" rx="80%" ry="60%">
            <Stop offset="0%" stopColor={colors.accent.main} stopOpacity="0.05"/>
            <Stop offset="100%" stopColor={colors.accent.main} stopOpacity="0"/>
          </RadialGradient>
        </Defs>

        {/* Ambient Corner Glows (Always present) */}
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glowTopRight)"/>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glowBottomLeft)"/>

        {/* The Grid - Present in both for consistent texture, but much softer than Auth screen */}
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#dotGrid)"/>
      </Svg>

      {/* Floating Elements (Rich mode only to keep strict minimalist view on demanding screens) */}
      {type === 'rich' && (<>
          <Animated.View style={[styles.floatingElement, { top: height * 0.15, right: width * 0.1 }, animatedHex1]}>
            <Svg width="40" height="40" viewBox="0 0 40 40">
              <Polygon points="20,2 38,10 38,30 20,38 2,30 2,10" stroke={colors.primary.main} strokeWidth="1" fill="none" opacity="0.1"/>
              <Circle cx="20" cy="20" r="2" fill={colors.accent.main} opacity="0.2"/>
            </Svg>
          </Animated.View>

          <Animated.View style={[styles.floatingElement, { bottom: height * 0.2, left: width * 0.05 }, animatedHex2]}>
            <Svg width="60" height="60" viewBox="0 0 60 60">
              <Polygon points="30,5 55,18 55,42 30,55 5,42 5,18" stroke={colors.accent.main} strokeWidth="0.5" strokeDasharray="3 3" fill="none" opacity="0.1"/>
              <Circle cx="30" cy="5" r="1.5" fill={colors.primary.main} opacity="0.2"/>
              <Circle cx="30" cy="55" r="1.5" fill={colors.primary.main} opacity="0.2"/>
            </Svg>
          </Animated.View>
        </>)}
    </View>);
};
const styles = StyleSheet.create({
    absoluteFill: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
        overflow: 'hidden',
    },
    backgroundGrad: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FAFAFA', // Matches the exact Auth Hero background
    },
    floatingElement: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
export default AnimatedBackground;
