import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, fontWeight } from '@/presentation/themes/typography';

// Mini sparkline for heart rate card
const Sparkline = ({ data, color, width = 80, height = 24 }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    const points = data
        .map((val, i) => `${i * step},${height - ((val - min) / range) * height}`)
        .join(' ');
    return (
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <Polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export default function HealthCard({
    title,
    value,
    unit,
    icon,
    color = colors.primary.main,
    trend = 'neutral',
    trendValue,
    sparklineData,
}) {
    const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.text.muted;
    const trendIcon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-flat';

    return (
        <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
            <View style={[styles.iconBg, { backgroundColor: `${color}15` }]}>
                <MaterialIcons name={icon} size={24} color={color} />
            </View>

            <View style={styles.valueRow}>
                <Text style={styles.value}>{value}</Text>
                {unit && <Text style={styles.unit}>{unit}</Text>}
            </View>

            {sparklineData && (
                <View style={styles.sparklineWrapper}>
                    <Sparkline data={sparklineData} color={color} />
                </View>
            )}

            <View style={styles.footer}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {trend !== 'neutral' && trendValue && (
                    <View style={styles.trendBadge}>
                        <MaterialIcons name={trendIcon} size={11} color={trendColor} />
                        <Text style={[styles.trendText, { color: trendColor }]}>{trendValue}</Text>
                    </View>
                )}
            </View>

            {/* Colored indicator bar at bottom (brand stripe) */}
            <View style={[styles.indicatorBar, { backgroundColor: color }]} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        borderWidth: 0.5,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    cardPressed: {
        transform: [{ scale: 0.97 }],
    },
    iconBg: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 3,
        marginBottom: 4,
    },
    value: {
        fontFamily: fontFamily.bold,
        fontSize: 28,
        fontWeight: fontWeight.medium,
        color: colors.text.primary,
    },
    unit: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.text.muted,
        marginBottom: 4,
    },
    sparklineWrapper: {
        marginBottom: 6,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.muted,
        flex: 1,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    trendText: {
        fontFamily: fontFamily.bold,
        fontSize: 10,
    },
    indicatorBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
});
