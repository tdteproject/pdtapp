import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontWeight } from '@/presentation/themes/typography';

export default function CircularProgressCard({
    rings,
    size = 160,
    ringWidth = 10,
    centerScore,
    title = 'Daily Activity',
}) {
    const center = size / 2;
    const spacing = ringWidth + 6;
    const outerRadius = center - ringWidth / 2 - 2;
    const animValue = useRef(new Animated.Value(0)).current;
    const countAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Arcs animate from 0 to fill over 800ms ease-out
        Animated.timing(animValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();

        // Score count-up from 0 to value in 600ms
        if (centerScore !== undefined) {
            Animated.timing(countAnim, {
                toValue: centerScore,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }).start();
        }
    }, [centerScore]);

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.row}>
                {/* SVG Rings */}
                <View>
                    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        {rings.map((ring, idx) => {
                            const radius = outerRadius - idx * spacing;
                            if (radius <= 0) return null;
                            const circumference = 2 * Math.PI * radius;
                            const dashOffset = circumference - (Math.min(ring.progress, 100) / 100) * circumference;
                            return (
                                <G key={idx}>
                                    {/* Track */}
                                    <Circle
                                        cx={center}
                                        cy={center}
                                        r={radius}
                                        stroke={colors.surface}
                                        strokeWidth={ringWidth}
                                        fill="none"
                                    />
                                    {/* Progress */}
                                    <Circle
                                        cx={center}
                                        cy={center}
                                        r={radius}
                                        stroke={ring.color}
                                        strokeWidth={ringWidth}
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={dashOffset}
                                        fill="none"
                                        rotation="-90"
                                        origin={`${center}, ${center}`}
                                    />
                                </G>
                            );
                        })}
                    </Svg>
                    {/* Center overlay */}
                    <View style={[styles.centerOverlay, { width: size, height: size, top: 0 }]} pointerEvents="none">
                        {centerScore !== undefined && (
                            <View style={styles.centerContent}>
                                <Text style={styles.scoreValue}>{centerScore}</Text>
                                <Text style={styles.scoreLabel}>Score</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                    {rings.map((ring, idx) => (
                        <View key={idx} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: ring.color }]} />
                            <View>
                                <Text style={styles.legendValue}>
                                    {ring.value}
                                    <Text style={styles.legendUnit}> {ring.unit}</Text>
                                </Text>
                                <Text style={styles.legendLabel}>{ring.label}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
    },
    title: {
        fontSize: 18,
        fontWeight: fontWeight.bold,
        fontFamily: fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 24,
    },
    centerOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: fontWeight.extrabold,
        fontFamily: fontFamily.bold,
        color: colors.text.primary,
        letterSpacing: -1,
    },
    scoreLabel: {
        fontSize: 11,
        color: colors.text.muted,
        fontWeight: fontWeight.medium,
        fontFamily: fontFamily.medium,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    legend: {
        flex: 1,
        gap: 14,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendValue: {
        fontSize: 16,
        fontWeight: fontWeight.bold,
        fontFamily: fontFamily.bold,
        color: colors.text.primary,
    },
    legendUnit: {
        fontSize: 12,
        fontWeight: fontWeight.normal,
        color: colors.text.muted,
    },
    legendLabel: {
        fontSize: 12,
        fontFamily: fontFamily.regular,
        color: colors.text.secondary,
        marginTop: 1,
    },
});
