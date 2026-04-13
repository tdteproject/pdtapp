import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize } from '@/presentation/themes/typography';

interface HealthCardProps {
  title: string;
  value: string;
  unit: string;
  icon: string;
  color?: string;
  progress?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export default function HealthCard({
  title,
  value,
  unit,
  icon,
  color = colors.primary.main,
  progress,
  trend = 'neutral',
  trendValue,
}: HealthCardProps) {
  const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.text.muted;
  const trendIcon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-flat';

  return (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <View style={[styles.iconBg, { backgroundColor: `${color}18` }]}>
        <MaterialIcons name={icon as any} size={16} color={color} />
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={[styles.unit, { color: colors.text.muted }]}>{unit}</Text> : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {trend !== 'neutral' && trendValue && (
          <View style={styles.trendBadge}>
            <MaterialIcons name={trendIcon as any} size={10} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor }]}>{trendValue}</Text>
          </View>
        )}
      </View>

      {progress !== undefined && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginBottom: 4,
  },
  value: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.text.primary,
  },
  unit: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    marginBottom: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    flex: 1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  trendText: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
  },
  progressTrack: {
    marginTop: 8,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});
