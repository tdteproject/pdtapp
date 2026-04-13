import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '@/presentation/themes/colors';

interface RingData {
  color: string;
  progress: number; // 0-100
  label: string;
  value: string;
  unit: string;
}

interface CircularProgressCardProps {
  rings: RingData[];
  size?: number;
  ringWidth?: number;
  centerScore?: number; // Overall 0-100
  title?: string;
}

export default function CircularProgressCard({
  rings,
  size = 200,
  ringWidth = 14,
  centerScore,
  title = 'Daily Activity',
}: CircularProgressCardProps) {
  const center = size / 2;
  const spacing = ringWidth + 6;
  const outerRadius = center - ringWidth / 2 - 2;

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

            {/* Center Score */}
          </Svg>

          {/* Center overlay (absolute positioned) */}
          <View
            style={[
              styles.centerOverlay,
              { width: size, height: size, top: 0 },
            ]}
            pointerEvents="none"
          >
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
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '500',
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
    fontWeight: '700',
    color: colors.text.primary,
  },
  legendUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.text.muted,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 1,
  },
});
